import { NextRequest, NextResponse } from "next/server";
import { approvalManager } from "@/lib/policies/approval-manager";
import { policyEngine } from "@/lib/policies/policy-engine";

export async function GET() {
  return NextResponse.json({
    pending: approvalManager.getPendingRequests(),
    all: approvalManager.getAllRequests(),
    policy: policyEngine.getPolicy(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, reason, edited_value, policy_updates } = body;

    if (action === "APPROVE") {
      if (!id) return NextResponse.json({ error: "Missing approval ID" }, { status: 400 });
      const request = approvalManager.approve(id);
      return NextResponse.json({ success: true, request });
    }

    if (action === "REJECT") {
      if (!id) return NextResponse.json({ error: "Missing approval ID" }, { status: 400 });
      const request = approvalManager.reject(id, reason);
      return NextResponse.json({ success: true, request });
    }

    if (action === "EDIT") {
      if (!id) return NextResponse.json({ error: "Missing approval ID" }, { status: 400 });
      const request = approvalManager.edit(id, edited_value);
      return NextResponse.json({ success: true, request });
    }

    if (action === "UPDATE_POLICY") {
      if (!policy_updates) return NextResponse.json({ error: "Missing policy_updates" }, { status: 400 });
      const updatedPolicy = policyEngine.updatePolicy(policy_updates);
      return NextResponse.json({ success: true, policy: updatedPolicy });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
