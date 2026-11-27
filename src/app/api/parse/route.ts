import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import { orderSchema, type ParsedOrder, type ParseResponse } from "@/lib/schema";
import { products, customers, couriers } from "@/lib/data";
import { mockParse } from "@/lib/mock";

export const maxDuration = 60;

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-6.1-terra";
const XAI_MODEL = process.env.XAI_MODEL || "grok-4.7";

// Provider order: OpenAI (OPENAI_API_KEY) -> xAI (XAI_API_KEY, optional) -> offline mock
function pickProvider() {
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return {
      source: "openai" as const,
      modelId: OPENAI_MODEL,
      model: openai.responses(OPENAI_MODEL),
      providerOptions: { openai: { reasoningEffort: process.env.OPENAI_REASONING || "low", strictJsonSchema: true } },
    };
  }
  if (process.env.XAI_API_KEY) {
    const xai = createXai({ apiKey: process.env.XAI_API_KEY });
    return {
      source: "xai" as const,
      modelId: XAI_MODEL,
      model: xai.responses(XAI_MODEL),
      providerOptions: { xai: { reasoningEffort: (process.env.XAI_REASONING as "low") || "low" } },
    };
  }
  return null;
}

const SYSTEM = `You are Dokan Desk, the order desk for a small Facebook/WhatsApp clothing shop in Bangladesh.
Customers write messy DMs in Bangla script, English or Banglish (Bangla in Latin letters), sometimes as screenshots.
Turn the message into a structured order.

Rules:
- Match items to the product catalog below; use the catalog id and price (BDT). "tshirt/gengi" = T-shirt, "3 piece" = three-piece, etc.
- Convert Bangla digits (০-৯) to Latin. Normalise phone numbers to 01XXXXXXXXX.
- If the customer says "same as before", "ager moto", "আগের ঠিকানা" etc., look up their phone or name in CUSTOMER HISTORY and fill in the saved address. If you cannot find them, mark address missing.
- missingFields: list everything needed to ship that is missing (name, phone, full address with house/road, size, color).
- Risk check: low / medium / high with ONE short reason line. Consider: new vs known number (history), past returns, cash-on-delivery value (>৳5,000 COD from an unknown number is high), vague address, outside Dhaka.
- suggestedCourier: pick from couriers below (cheapest/fastest for the area; RedX or Steadfast for outside Dhaka).
- replyBn and replyEn: a warm, short seller reply (use "ভাইয়া/আপু" style), confirm items + total, ask for any missing info, and if not COD mention they can pay via the link below. Keep it under 60 words. If the customer wrote Bangla or Banglish, replyBn is the primary.

PRODUCT CATALOG: ${JSON.stringify(products.map(({ id, name, bn, price, colors, sizes }) => ({ id, name, bn, price, colors, sizes })))}
CUSTOMER HISTORY: ${JSON.stringify(customers)}
COURIERS: ${JSON.stringify(couriers.map(({ id, insideDhaka, outsideDhaka, etaInside, etaOutside }) => ({ id, insideDhaka, outsideDhaka, etaInside, etaOutside })))}`;

function fixPrices(order: ParsedOrder): ParsedOrder {
  return {
    ...order,
    items: order.items.map((i) => {
      const pr = products.find((p) => p.id === i.productId);
      return pr ? { ...i, unitPrice: pr.price } : i;
    }),
  };
}

export async function POST(req: Request) {
  const t0 = Date.now();
  const { text = "", image } = (await req.json()) as { text?: string; image?: string };
  if (!text.trim() && !image) return NextResponse.json({ error: "Paste a DM or drop a screenshot" }, { status: 400 });

  const provider = pickProvider();
  if (!provider) {
    await new Promise((r) => setTimeout(r, 900));
    const order = image && !text.trim() ? mockParse("আসসালামু আলাইকুম, ২টা সাদা পাঞ্জাবি 42 সাইজ আর ১টা black hijab চাই। নাম রাকিব, 01712345678, মিরপুর ১০। কবে পাবো?") : mockParse(text);
    const res: ParseResponse = {
      order: fixPrices(order),
      source: "mock",
      ms: Date.now() - t0,
      warning: image && !text.trim() ? "Demo mode: screenshot reading needs OPENAI_API_KEY, showing a sample parse." : undefined,
    };
    return NextResponse.json(res);
  }

  try {
    const content: Array<{ type: "text"; text: string } | { type: "file"; data: string; mediaType: string }> = [];
    if (image) {
      const m = image.match(/^data:(.+?);base64,(.*)$/);
      if (m) content.push({ type: "file", mediaType: m[1], data: m[2] });
      content.push({ type: "text", text: "This is a screenshot of a customer chat. Read the customer's messages and extract the order." });
    }
    if (text.trim()) content.push({ type: "text", text: `Customer DM:\n"""${text}"""` });

    const { object } = await generateObject({
      model: provider.model,
      schema: orderSchema,
      system: SYSTEM,
      messages: [{ role: "user", content }],
      providerOptions: provider.providerOptions as unknown as Parameters<typeof generateObject>[0]["providerOptions"],
    });
    const res: ParseResponse = { order: fixPrices(object), source: provider.source, model: provider.modelId, ms: Date.now() - t0 };
    return NextResponse.json(res);
  } catch (err) {
    console.error("[parse] LLM failed, falling back to mock:", err);
    const res: ParseResponse = {
      order: fixPrices(mockParse(text)),
      source: "mock",
      ms: Date.now() - t0,
      warning: `AI call failed (${(err as Error).message?.slice(0, 120)}). Showing offline parse.`,
    };
    return NextResponse.json(res);
  }
}
