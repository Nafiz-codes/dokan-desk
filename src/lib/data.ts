import products from "@/data/products.json";
import couriers from "@/data/couriers.json";
import customers from "@/data/customers.json";

export type Product = (typeof products)[number];
export type Courier = (typeof couriers)[number];
export type Customer = (typeof customers)[number];

export { products, couriers, customers };

export const samples = [
  {
    id: "missing-phone",
    label: "No phone number",
    hint: "Banglish, missing phone",
    text: "bhai 2ta blue tshirt M size lagbe, ar 1ta black L. Mirpur 10 e pathaben. cash on delivery hobe to?",
  },
  {
    id: "same-as-before",
    label: "\"Same as before\"",
    hint: "Repeat customer",
    text: "Apu ami Nusrat, 01898765432. ager bar er moto same address e 1ta pink three piece L size dien. bkash e pay korbo",
  },
  {
    id: "bangla-script",
    label: "বাংলা মেসেজ",
    hint: "Mixed Bangla script",
    text: "আসসালামু আলাইকুম, ২টা সাদা পাঞ্জাবি 42 সাইজ আর ১টা black hijab চাই। নাম রাকিব, 01712345678, মিরপুর ১০। কবে পাবো?",
  },
  {
    id: "high-value-cod",
    label: "High-value COD",
    hint: "New number, ৳13k COD",
    text: "2 ta jamdani saree red color urgent lagbe. Chittagong er dike. COD only. number 01999888777",
  },
] as const;

export function courierFee(courierId: string, insideDhaka: boolean) {
  const c = couriers.find((x) => x.id === courierId) ?? couriers[0];
  return { courier: c, fee: insideDhaka ? c.insideDhaka : c.outsideDhaka, eta: insideDhaka ? c.etaInside : c.etaOutside };
}
