import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";


type Body = {
  orderId: string;
  customerPhone?: string | null;
  items: { name: string; size?: string | null; color?: string | null; qty: number; unitPrice: number }[];
  deliveryFee: number;
  courier: string;
};

// USD fallback rate if an account can't charge BDT
const BDT_PER_USD = Number(process.env.BDT_PER_USD || 122);

// GET /api/checkout            -> { enabled }
// GET /api/checkout?session_id -> verify payment
export async function GET(req: Request) {
  const stripe = getStripe();
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ enabled: !!stripe });
  if (!stripe) return NextResponse.json({ error: "Add STRIPE_SECRET_KEY" }, { status: 400 });
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      paid: s.payment_status === "paid",
      status: s.payment_status,
      orderId: s.metadata?.orderId ?? s.client_reference_id,
      amount: (s.amount_total ?? 0) / 100,
      currency: s.currency,
      email: s.customer_details?.email ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Add STRIPE_SECRET_KEY to .env.local to enable payments" }, { status: 400 });
  const body = (await req.json()) as Body;
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  const build = (currency: "bdt" | "usd") => {
    const amt = (bdt: number) => (currency === "bdt" ? Math.round(bdt * 100) : Math.max(1, Math.round((bdt / BDT_PER_USD) * 100)));
    const line_items = body.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency,
        unit_amount: amt(i.unitPrice),
        product_data: { name: [i.name, i.color, i.size].filter(Boolean).join(" · ") },
      },
    }));
    if (body.deliveryFee > 0)
      line_items.push({ quantity: 1, price_data: { currency, unit_amount: amt(body.deliveryFee), product_data: { name: `Delivery (${body.courier})` } } });
    return stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      client_reference_id: body.orderId,
      metadata: { orderId: body.orderId, phone: body.customerPhone ?? "", courier: body.courier },
      success_url: `${origin}/paid?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cancelled=${body.orderId}`,
    });
  };

  try {
    let session;
    let currency: "bdt" | "usd" = "bdt";
    try {
      session = await build("bdt");
    } catch (e) {
      console.warn("[checkout] BDT failed, retrying in USD:", (e as Error).message);
      currency = "usd";
      session = await build("usd");
    }
    return NextResponse.json({ url: session.url, id: session.id, currency });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
