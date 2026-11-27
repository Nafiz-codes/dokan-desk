import { z } from "zod";

export const itemSchema = z.object({
  productId: z.string().nullable().describe("Catalog product id if it matches, else null"),
  name: z.string().describe("Short product name in English"),
  size: z.string().nullable(),
  color: z.string().nullable(),
  qty: z.number().describe("Quantity as a whole number, at least 1"),
  unitPrice: z.number().describe("Unit price in BDT from the catalog; 0 if unknown"),
});

export const orderSchema = z.object({
  customerName: z.string().nullable(),
  phone: z.string().nullable().describe("Bangladeshi mobile number normalised to 01XXXXXXXXX, or null"),
  address: z.string().nullable().describe("Full delivery address as best understood, or null"),
  area: z.string().nullable().describe("Area / thana / district, e.g. Mirpur, Dhanmondi, Chattogram"),
  insideDhaka: z.boolean().describe("true if the delivery area is inside Dhaka city"),
  items: z.array(itemSchema),
  paymentMethod: z.enum(["cod", "bkash", "card", "unknown"]),
  language: z.enum(["bn", "banglish", "en"]).describe("Language the customer wrote in"),
  missingFields: z
    .array(z.enum(["customerName", "phone", "address", "size", "color", "quantity", "product"]))
    .describe("Fields needed to ship that the customer did not give"),
  notes: z.string().nullable().describe("Anything else the seller should know, in English"),
  risk: z.object({
    level: z.enum(["low", "medium", "high"]),
    reason: z.string().describe("One short line, e.g. 'new number, high-value COD, vague address'"),
  }),
  suggestedCourier: z.enum(["pathao", "steadfast", "redx"]),
  replyBn: z.string().describe("Warm follow-up reply to the customer in Bangla script confirming the order and asking for any missing info"),
  replyEn: z.string().describe("Same reply in simple English"),
});

export type ParsedOrder = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof itemSchema>;

export type ParseResponse = {
  order: ParsedOrder;
  source: "openai" | "xai" | "mock";
  model?: string;
  ms: number;
  warning?: string;
};

export type SavedOrder = {
  id: string;
  createdAt: string;
  customerName: string | null;
  phone: string | null;
  area: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  courier: string;
  paymentMethod: ParsedOrder["paymentMethod"];
  status: "needs_info" | "confirmed" | "paid" | "shipped";
  risk: ParsedOrder["risk"];
  payUrl?: string;
};
