import { NextResponse } from "next/server";
import { recoveryAgent } from "@/lib/agents/recovery-agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const candidateId = body.candidate_id || body.recovery_id || body.id;
    if (!candidateId) {
      return NextResponse.json(
        { error: "candidate_id or recovery_id is required" },
        { status: 400 }
      );
    }

    const result = await recoveryAgent.executeRecoveryStep(candidateId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
