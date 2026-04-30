# ProcurAI WhatsApp Procurement Agent

ProcurAI is a Next.js app that lets users search and buy Amazon products through WhatsApp, with crypto-based checkout using Crossmint wallets.

## What this app does

- Receives WhatsApp messages via Twilio webhook.
- Uses an AI agent to guide the user through product search and selection.
- Enforces trust checks (single transaction + daily spending limits).
- Creates and pays Crossmint orders from a user-linked wallet.

## Tech stack

- Next.js App Router (`next@16`)
- TypeScript
- Twilio (WhatsApp webhook + TwiML response)
- Anthropic SDK (conversation agent)
- Crossmint APIs (wallet + order payment)
- `viem` (server-side message signing for wallet approvals)

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Create/update `.env.local` with required variables:

- `ANTHROPIC_API_KEY`
- `CROSSMINT_API_KEY`
- `CROSSMINT_ENVIRONMENT` (`staging` or production value)
- `WALLET_SIGNER_KEY` (server signer private key)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `SPECTER_API_KEY` (optional)
- `MAX_TRANSACTION_AMOUNT` (optional, defaults to `50`)
- `FUNDED_WALLET_ADDRESS` (optional for testing)
- Shipping defaults (optional):
  - `RECIPIENT_EMAIL`
  - `RECIPIENT_NAME`
  - `RECIPIENT_ADDRESS_LINE1`
  - `RECIPIENT_ADDRESS_CITY`
  - `RECIPIENT_ADDRESS_STATE`
  - `RECIPIENT_ADDRESS_ZIP`
  - `RECIPIENT_ADDRESS_COUNTRY`

3. Run the app:

```bash
pnpm dev
```

4. Configure your Twilio WhatsApp webhook to:

`POST /api/whatsapp`

## Scripts

- `pnpm dev` - run local dev server
- `pnpm build` - build production bundle
- `pnpm start` - run production server
- `pnpm lint` - run ESLint

## Key API routes

- `POST /api/whatsapp`
  - Main webhook entry point.
  - Parses Twilio form data, processes conversation state, runs trust checks, creates orders, and replies with TwiML.
- `GET /api/test-payment?step=<step>`
  - Payment/wallet test harness.
  - Supported steps: `wallet`, `fund`, `balance`, `trust`, `order`, `full`.

## Architecture docs

See `PROJECT_STRUCTURE.md` for the folder-level map and runtime flow.
