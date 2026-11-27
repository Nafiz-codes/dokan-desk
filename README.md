# Dokan Desk · দোকান ডেস্ক

> Every small seller in Bangladesh is drowning in DMs. **Dokan Desk turns a messy chat into a finished order in seconds.**

Paste a messy Bangla / English / Banglish DM (or drop a chat screenshot) and Dokan Desk runs:

**Parser → Risk check → Invoice + courier → Reply**

- **Parser**: an OpenAI model reads the DM (or screenshot) and returns a structured order (Zod schema via `generateObject`). It matches the product catalog, fixes Bangla digits, and resolves "same as before" addresses from customer history.
- **Risk check**: low/medium/high with a one-line reason (new number, high-value COD, vague address, outside Dhaka).
- **Invoice + courier**: printable HTML invoice (PDF via `react-to-print`), plus mock Pathao / Steadfast / RedX fees and ETAs, with the AI's courier pick.
- **Stripe Pay now**: creates a Stripe Checkout Session in BDT (falls back to USD if needed). The link goes into the reply; when the customer comes back, `/paid` checks the session on the server and marks the order **Paid**.
- **Reply**: a follow-up in Bangla and English, with a copy button. "Ask customer" writes a message asking for the missing fields.
- **Dashboard**: today's orders, pending COD, paid, and follow-ups (stored in localStorage).

## Run (Windows / macOS / Linux)

Requires Node.js 20+.

```bash
npm install
copy .env.example .env.local     # Windows (macOS/Linux: cp .env.example .env.local)
npm run dev
```

Open http://localhost:3000.

Then fill in `.env.local`:

- `OPENAI_API_KEY`: your OpenAI key. **Without it the app runs in demo mode** with built-in parses for the 4 sample DMs, plus a simple offline parser for anything else.
- `OPENAI_MODEL`: defaults to `gpt-6.1-terra` (fast, vision + structured outputs). `OPENAI_REASONING` defaults to `low`.
- Optional: if there's no OpenAI key but `XAI_API_KEY` is set, Grok (`XAI_MODEL`, default `grok-4.7`) is used instead.
- `STRIPE_SECRET_KEY`: a Stripe **test** key (`sk_test_...`). Without it the Pay button stays disabled with a hint. Test card: `4242 4242 4242 4242`, any future date, any CVC.

Restart `npm run dev` after editing `.env.local`.

## Stack
Next.js (App Router) · TypeScript · Tailwind v4 · shadcn-style UI (Radix) · Vercel AI SDK + `@ai-sdk/openai` (optional `@ai-sdk/xai`) · Zod · Stripe Checkout · Hind Siliguri font. No database: mock JSON lives in `src/data/`.

## Key files
- `src/app/api/parse/route.ts`: the AI call (OpenAI, optional xAI), the prompt, and the mock fallback
- `src/lib/schema.ts`: the order + risk + reply schema
- `src/app/api/checkout/route.ts`: creates and verifies Stripe Checkout sessions
- `src/app/api/webhook/route.ts`: optional Stripe webhook
- `src/components/*`: pipeline, order, invoice, reply, dashboard
