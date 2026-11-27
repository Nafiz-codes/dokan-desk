import type { ParsedOrder } from "./schema";
import { products, customers, samples } from "./data";

const p = (id: string) => products.find((x) => x.id === id)!;

const MOCKS: Record<string, ParsedOrder> = {
  "missing-phone": {
    customerName: null,
    phone: null,
    address: "Mirpur 10, Dhaka",
    area: "Mirpur",
    insideDhaka: true,
    items: [
      { productId: "TS-BAS", name: "Basic Cotton T-shirt", size: "M", color: "blue", qty: 2, unitPrice: p("TS-BAS").price },
      { productId: "TS-BAS", name: "Basic Cotton T-shirt", size: "L", color: "black", qty: 1, unitPrice: p("TS-BAS").price },
    ],
    paymentMethod: "cod",
    language: "banglish",
    missingFields: ["phone", "customerName", "address"],
    notes: "Address only says 'Mirpur 10' — need house/road number for the rider.",
    risk: { level: "medium", reason: "No phone number, vague address, COD" },
    suggestedCourier: "pathao",
    replyBn:
      "ধন্যবাদ ভাইয়া! 😊 আপনার অর্ডার: ২টা নীল টি-শার্ট (M) আর ১টা কালো টি-শার্ট (L)। ক্যাশ অন ডেলিভারি অবশ্যই পাবেন। ডেলিভারির জন্য আপনার নাম, ফোন নম্বর আর মিরপুর ১০-এর পুরো ঠিকানা (বাসা/রোড নং) একটু দিবেন?",
    replyEn:
      "Thanks bhai! 😊 Your order: 2 blue T-shirts (M) and 1 black T-shirt (L). Cash on delivery is available. Could you share your name, phone number and full Mirpur 10 address (house/road no.) for delivery?",
  },
  "same-as-before": {
    customerName: "Nusrat Jahan",
    phone: "01898765432",
    address: "Flat 3B, 27 Satmasjid Road, Dhanmondi, Dhaka",
    area: "Dhanmondi",
    insideDhaka: true,
    items: [{ productId: "TP-3PC", name: "Three-piece (Lawn)", size: "L", color: "pink", qty: 1, unitPrice: p("TP-3PC").price }],
    paymentMethod: "bkash",
    language: "banglish",
    missingFields: [],
    notes: "Repeat customer (7 orders). 'Same address as before' resolved from order history.",
    risk: { level: "low", reason: "Repeat customer, 7 orders, 0 returns, prepaid" },
    suggestedCourier: "steadfast",
    replyBn:
      "আপু, আবার অর্ডার করার জন্য অনেক ধন্যবাদ! 💚 ১টা গোলাপি থ্রি-পিস (L) আগের ঠিকানায় (ধানমন্ডি, সাতমসজিদ রোড) পাঠানো হবে। নিচের লিংকে পেমেন্ট করলেই আজই পাঠিয়ে দিচ্ছি।",
    replyEn:
      "Thank you for ordering again, apu! 💚 1 pink three-piece (L) will go to your previous address (Satmasjid Road, Dhanmondi). Pay with the link below and we'll dispatch today.",
  },
  "bangla-script": {
    customerName: "Rakib Hasan",
    phone: "01712345678",
    address: "House 12, Road 5, Block C, Mirpur 10, Dhaka",
    area: "Mirpur",
    insideDhaka: true,
    items: [
      { productId: "PJ-PANJ", name: "Eid Panjabi (Cotton)", size: "42", color: "white", qty: 2, unitPrice: p("PJ-PANJ").price },
      { productId: "HJ-HIJ", name: "Georgette Hijab", size: "Free", color: "black", qty: 1, unitPrice: p("HJ-HIJ").price },
    ],
    paymentMethod: "unknown",
    language: "bn",
    missingFields: [],
    notes: "Known customer — full address filled from history. Asked about delivery date.",
    risk: { level: "low", reason: "Known number, 4 past orders, address on file" },
    suggestedCourier: "pathao",
    replyBn:
      "ওয়ালাইকুম আসসালাম রাকিব ভাই! আপনার অর্ডার কনফার্ম: ২টা সাদা পাঞ্জাবি (42) আর ১টা কালো হিজাব। মিরপুর ১০-এ ২৪ ঘণ্টার মধ্যে পৌঁছে যাবে ইনশাআল্লাহ। ক্যাশ অন ডেলিভারি নাকি অনলাইনে পেমেন্ট করবেন?",
    replyEn:
      "Walaikum assalam Rakib bhai! Order confirmed: 2 white Panjabis (42) and 1 black hijab. It will reach Mirpur 10 within 24 hours, insha'Allah. Will you pay cash on delivery or online?",
  },
  "high-value-cod": {
    customerName: null,
    phone: "01999888777",
    address: null,
    area: "Chattogram",
    insideDhaka: false,
    items: [{ productId: "SR-JAM", name: "Jamdani Saree", size: "Free", color: "red", qty: 2, unitPrice: p("SR-JAM").price }],
    paymentMethod: "cod",
    language: "banglish",
    missingFields: ["customerName", "address"],
    notes: "৳13,000 COD to outside Dhaka from a number with no history. Ask for advance delivery charge or partial prepayment.",
    risk: { level: "high", reason: "New number, high-value COD (৳13k), vague address, outside Dhaka" },
    suggestedCourier: "redx",
    replyBn:
      "আপনার আগ্রহের জন্য ধন্যবাদ! ২টা লাল জামদানি শাড়ি (মোট ৳১৩,০০০) স্টকে আছে। চট্টগ্রামে পাঠাতে আপনার নাম আর পুরো ঠিকানা দিন। দামি পণ্য হওয়ায় ডেলিভারি চার্জ অগ্রিম নিচের লিংকে পরিশোধ করলে আজই পাঠিয়ে দিচ্ছি।",
    replyEn:
      "Thanks for your interest! 2 red Jamdani sarees (total ৳13,000) are in stock. Please share your name and full address in Chattogram. As it's a high-value item, please pay the delivery charge in advance via the link below and we'll ship today.",
  },
};

export function mockParse(text: string): ParsedOrder {
  const sample = samples.find((s) => s.text.trim() === text.trim());
  if (sample) return MOCKS[sample.id];
  return heuristicParse(text);
}

const bnDigits = "০১২৩৪৫৬৭৮৯";
const toLatin = (s: string) => s.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));

function heuristicParse(raw: string): ParsedOrder {
  const text = toLatin(raw);
  const lower = text.toLowerCase();
  const phone = text.replace(/[\s-]/g, "").match(/(?:\+?88)?(01[3-9]\d{8})/)?.[1] ?? null;
  const known = customers.find((c) => c.phone === phone);
  const kw: Record<string, string[]> = {
    "TS-BAS": ["tshirt", "t-shirt", "t shirt", "টি-শার্ট", "টিশার্ট", "gengi"],
    "PL-POLO": ["polo", "পোলো"],
    "PJ-PANJ": ["panjabi", "punjabi", "পাঞ্জাবি"],
    "SR-JAM": ["saree", "sari", "shari", "শাড়ি", "jamdani"],
    "TP-3PC": ["three piece", "3 piece", "3pc", "থ্রি"],
    "HJ-HIJ": ["hijab", "হিজাব"],
    "SN-SNK": ["sneaker", "shoe", "juta", "জুতা"],
  };
  const items = products
    .filter((pr) => kw[pr.id]?.some((k) => lower.includes(k)))
    .map((pr) => {
      const qty = Number(lower.match(/(\d+)\s*(?:ta|ti|টা|pcs|pc)/)?.[1] ?? 1) || 1;
      const color = pr.colors.find((c) => lower.includes(c)) ?? null;
      const size = pr.sizes.find((s) => new RegExp(`\\b${s.toLowerCase()}\\b`).test(lower)) ?? null;
      return { productId: pr.id, name: pr.name, size, color, qty, unitPrice: pr.price };
    });
  const areas = ["mirpur", "dhanmondi", "uttara", "gulshan", "banani", "mohammadpur", "badda", "chittagong", "chattogram", "sylhet", "khulna", "rajshahi", "মিরপুর", "উত্তরা"];
  const areaHit = areas.find((a) => lower.includes(a)) ?? null;
  const outside = ["chittagong", "chattogram", "sylhet", "khulna", "rajshahi"].includes(areaHit ?? "");
  const cod = /cod|cash on|ক্যাশ/.test(lower);
  const bkash = /bkash|বিকাশ/.test(lower);
  const missing: ParsedOrder["missingFields"] = [];
  if (!phone) missing.push("phone");
  if (!known) missing.push("customerName");
  if (!known && !/(house|road|flat|block|বাসা|রোড)/.test(lower)) missing.push("address");
  if (!items.length) missing.push("product");
  if (items.some((i) => !i.size)) missing.push("size");
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const level = (!known && cod && subtotal > 5000) || (!phone && subtotal > 5000) ? "high" : missing.length > 1 ? "medium" : "low";
  const reasons = [!known ? "new number" : "known customer", cod ? (subtotal > 5000 ? "high-value COD" : "COD") : "prepaid", missing.includes("address") ? "vague address" : null].filter(Boolean);
  const isBn = /[\u0980-\u09FF]/.test(raw);
  return {
    customerName: known?.name ?? null,
    phone,
    address: known?.address ?? (areaHit ? areaHit[0].toUpperCase() + areaHit.slice(1) : null),
    area: known?.area ?? areaHit,
    insideDhaka: !outside,
    items,
    paymentMethod: cod ? "cod" : bkash ? "bkash" : "unknown",
    language: isBn ? "bn" : /(bhai|apu|lagbe|dien|chai|hobe|korbo)/.test(lower) ? "banglish" : "en",
    missingFields: missing,
    notes: "Offline demo parse (no OPENAI_API_KEY) — add your key for full AI parsing.",
    risk: { level, reason: reasons.join(", ") },
    suggestedCourier: outside ? "redx" : "pathao",
    replyBn: `ধন্যবাদ! আপনার অর্ডার পেয়েছি: ${items.map((i) => `${i.qty}টা ${i.name}`).join(", ") || "পণ্য"}।${missing.length ? " ডেলিভারির জন্য আপনার নাম, ফোন নম্বর ও পুরো ঠিকানা দিবেন প্লিজ?" : " শিগগিরই পাঠিয়ে দিচ্ছি।"}`,
    replyEn: `Thanks! We got your order: ${items.map((i) => `${i.qty}× ${i.name}`).join(", ") || "item"}.${missing.length ? " Please share your name, phone number and full address for delivery." : " We'll ship it shortly."}`,
  };
}
