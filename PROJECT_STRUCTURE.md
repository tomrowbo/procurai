# Project Structure

This document maps the core repository structure for `procurai` (excluding `twilio-test` and `node_modules`).

## Top-level overview

- `app/` - Next.js App Router UI and API routes.
- `lib/` - Core business logic (agent, trust checks, wallets, checkout, sessions).
- `types/` - Shared TypeScript interfaces for messages, products, and conversation state.
- `public/` - Static assets.
- `README.md` - Setup and runtime usage documentation.
- `AGENTS.md`, `CLAUDE.md` - repository agent/rule guidance.
- Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `pnpm-workspace.yaml`.

## Runtime entry points

### `app/api/whatsapp/route.ts`

Primary Twilio webhook handler:

1. Reads incoming WhatsApp message payload from form data.
2. Loads current per-phone session state.
3. Calls the AI conversation engine in `lib/agent.ts`.
4. If purchase is requested, runs trust checks from `lib/trust.ts`.
5. Creates and pays order via `lib/checkout.ts`.
6. Persists updated conversation state in `lib/conversation.ts`.
7. Returns TwiML response text for WhatsApp.

### `app/api/test-payment/route.ts`

Debug/test endpoint for payment pipeline with `step` query parameter:

- `wallet` - create or fetch wallet
- `fund` - fund wallet (staging faucet path)
- `balance` - read token balance
- `trust` - validate trust policy behavior
- `order` - place a test order
- `full` - run end-to-end sequence

## Directory details

### `app/`

- `layout.tsx` - root layout and app metadata.
- `page.tsx` - home page.
- `globals.css` - global styles.
- `api/whatsapp/route.ts` - WhatsApp webhook route.
- `api/test-payment/route.ts` - payment test route.

### `lib/`

- `agent.ts` - Anthropic message orchestration and state transition parsing.
- `conversation.ts` - in-memory session/history store keyed by phone number.
- `trust.ts` - transaction gating rules:
  - max single transaction amount (`MAX_TRANSACTION_AMOUNT`, default 50)
  - fixed daily cap (200)
- `wallet.ts` - Crossmint wallet lifecycle and transaction approval:
  - wallet creation/retrieval
  - optional funding (staging)
  - balance checks
  - signed transaction approval using server key
- `checkout.ts` - Crossmint order creation and payment submission workflow.
- `specter.ts` - optional vendor intelligence lookup via Specter API.

### `types/`

- `index.ts`:
  - `WhatsAppMessage`
  - `ConversationState`
  - `Product`

### `public/`

Default SVG assets used by the Next.js starter UI shell.

## High-level request flow

1. User sends WhatsApp message to Twilio.
2. Twilio forwards webhook request to `/api/whatsapp`.
3. AI agent returns next reply + conversation state.
4. If purchasing is requested:
   - trust checks run
   - order is created and paid
5. Response is returned as TwiML to Twilio.
6. Twilio delivers message back to the user.

## Notes for contributors

- Session and spending state are currently in-memory maps; they reset when the server restarts.
- Test route is useful for validating Crossmint integration without a live WhatsApp conversation.
- `SPECTER_API_KEY` is optional and the app degrades gracefully when it is not set.
