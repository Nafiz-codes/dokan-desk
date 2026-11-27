import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";


// Optional: Stripe webhook (the app does not depend on it; /paid verifies the session directly).
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ received: false, reason: "webhook not configured" });
  const sig = req.headers.get("stripe-signature") ?? "";
  try {
    const event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      console.log(`[webhook] order ${s.metadata?.orderId} paid: ${(s.amount_total ?? 0) / 100} ${s.currency}`);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
