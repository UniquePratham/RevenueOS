# RevenueOS — The Autonomous Merchant Revenue Engine

RevenueOS is an autonomous fintech control plane combining **Agentic Commerce**, **Defensive Risk Management**, **Autonomous Revenue Recovery**, and **AI Finance Controller & 3-Way Reconciliation** into an always-on digital revenue twin for modern merchants.

Bounded by strict merchant autonomy policies and human-in-the-loop governance.

---

## 🌟 Core Autonomous Engines

1. **AI Growth & Agentic Commerce (`/api/ai/*`)**
   - Autonomous product catalog discovery, machine-negotiated bundle incentives.
   - Guardrailed discount policy ceiling (max 10% autonomous discount).
   - Razorpay payment intent integration.

2. **Defensive Risk Center & Anomaly Detection (`/api/risk/*`)**
   - Sub-50ms transaction scoring (`0–100`) across device velocity, ticket size anomalies, and network fingerprints.
   - Autonomous blocking of card-testing botnets and velocity traps before gateway capture.
   - Signal-level explainability with glassbox telemetry.

3. **Autonomous Revenue Recovery (`/api/recovery/*`)**
   - Deterministic 6-step recovery ladder: `DETECT → DIAGNOSE → DECIDE → ACT → VERIFY → STOP`.
   - Dynamic channel selection (WhatsApp smart links, instant UPI intents, card retries).
   - Anti-fatigue policy bounded at maximum 3 attempts.

4. **Finance Controller & 3-Way Reconciliation (`/api/dashboard`)**
   - Continuous 3-way match across internal merchant order ledger, Razorpay settlement batches, and bank nodal account credits.
   - Dynamic MDR fee audit flagging rate discrepancies.
   - 30-day Monte Carlo cash flow forecasting with P10/P90 confidence bands.

5. **Governance, Approvals & "Why?" Engine (`/api/approvals`, `/api/audit/*`)**
   - Append-only immutable audit trail recording every autonomous action.
   - Human-in-the-loop approval center for policy boundary breaches.
   - 1-click explainability breakdown explaining the underlying business rationale.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x
- npm / pnpm / yarn

### Installation
```bash
git clone <repository-url>
cd RevenueOS
npm install
```

### Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optional: add your Razorpay Test API keys in `.env` to execute live test mode payments)*

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Production Build
```bash
npm run build
npm run start
```

### Run Test Suite
```bash
npm test
```

---

## 🏗️ Architecture & Stack

- **Framework:** Next.js 14 (App Router, Server Components & Dynamic API Handlers)
- **UI & Styling:** Tailwind CSS, Glassmorphism, Bloomberg Terminal fintech palette
- **Visualizations:** Recharts (Cash Flow Forecasting, Settlement Horizons)
- **Icons:** Lucide React
- **Data Model:** In-memory Digital Revenue Graph hydrated from deterministic PRNG seed (`421337`)
- **Payment Gateway:** Razorpay Test Mode API integration with idempotent webhook deduplication
- **Test Framework:** Vitest (15 unit & integration tests across 3 suites)

---

## 🧪 Interactive Scenarios & Adversarial Testing

The dashboard contains a dedicated **Demo & Failures** center with 1-click executions for:
1. **Scenario 1:** AI Buyer Autonomous Purchase
2. **Scenario 2:** Intelligent Upsell & Bundle Offer
3. **Scenario 3:** Failed Payment Recovery Ladder
4. **Scenario 4:** Defensive Fraud Spike & Velocity Gating
5. **Scenario 5:** 3-Way Reconciliation & Discrepancy Gate
6. **Failure Injection 1:** Duplicate Webhook Replay (Idempotency verification)
7. **Failure Injection 2:** High-Risk Fraud Anomaly (`₹48,999` order from fresh IP)
8. **Failure Injection 3:** Policy Autonomy Boundary Violation (`₹7,500` refund attempt)
9. **Failure Injection 4:** Upstream Gateway 504 Timeout & Circuit Breaker Fallback

---

## 📄 License
MIT
