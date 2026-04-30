# Sourcy - Hackathon Submission

Track: `Money Movement`

Sourcy is a WhatsApp-native procurement agent focused on one core job: move money safely for real-world purchases through automated payment execution and strict guardrails.

![Sourcy mascot](./Sourcy-Transparent.jpeg)

Built for Cursor x Briefcase London 2026: [Hackathon Page](https://cusor-hack-london-2026-1.vercel.app/).

## Money Movement scope

This project is intentionally scoped to the `Money Movement` stream:

- Executes real purchase payments (Crossmint order + wallet transaction approval).
- Applies hard rails before money moves (single-transaction and daily limits).
- Supports single and batch payment flows.
- Returns explicit success/failure outcomes for each purchase attempt.

## What the money agent does

- Accepts inbound WhatsApp messages via Twilio webhook.
- Uses an LLM orchestration layer to manage purchase confirmation flow.
- Supports image-aware commerce UX:
  - user can ask for product images
  - bot responds with WhatsApp media attachments for suggested products
- Runs deterministic trust controls before payment:
  - max transaction amount (configurable)
  - daily spending cap
- Creates and pays Crossmint orders from a user-linked wallet.

## Why this is Money Movement

The hackathon track asks for agents that directly move money with clear risk boundaries. Sourcy demonstrates that directly:

- `Payment execution`: order payment is executed through wallet transaction approval.
- `Risk rails`: purchases above threshold are blocked before funds move.
- `Escalation behavior`: blocked transactions return clear reasons and stop automation.
- `Operational clarity`: each payment attempt returns a deterministic status (`paid`, blocked, or failed).

## Architecture at a glance

- `POST /api/whatsapp`
  - Main runtime entrypoint.
  - Parses Twilio message payload, gets session state, invokes agent, runs trust checks, executes purchase flow, and returns TwiML.
- `GET /api/test-payment?step=<step>`
  - Integration harness for wallet, funding, trust checks, and order execution.

Core modules:

- `lib/agent.ts` - conversation intelligence and state transitions.
- `lib/trust.ts` - policy rails for transaction and daily limits.
- `lib/wallet.ts` - wallet provisioning and transaction approval signing.
- `lib/checkout.ts` - order creation and payment execution.
- `lib/conversation.ts` - per-user session/history memory.

See `PROJECT_STRUCTURE.md` for the detailed repository map.

## Demo script (2-3 minutes)

1. User sends a buying request in WhatsApp.
2. Agent returns product options.
3. User asks for images -> bot returns product media attachments.
4. User confirms purchase.
5. Agent executes payment and returns completion message.
6. Trigger a blocked scenario (over threshold) to show guardrails stopping money movement.

## Local setup

Installation, environment variables, scripts, and local run instructions live in `README.pre-hackathon.md`.
