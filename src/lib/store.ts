"use client";
import type { SavedOrder } from "./schema";

const KEY = "dokan-desk-orders-v1";

const seed = (): SavedOrder[] => {
  const today = new Date();
  const t = (h: number, m: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m).toISOString();
  return [
    { id: "DD-7Q2K", createdAt: t(9, 14), customerName: "Farhana Akter", phone: "01611223344", area: "Uttara", items: [{ productId: "TP-3PC", name: "Three-piece (Lawn)", size: "M", color: "peach", qty: 2, unitPrice: 1650 }], subtotal: 3300, deliveryFee: 60, total: 3360, courier: "steadfast", paymentMethod: "cod", status: "shipped", risk: { level: "low", reason: "Repeat customer" } },
    { id: "DD-8M4P", createdAt: t(10, 2), customerName: "Sabbir Rahman", phone: "01755443322", area: "Badda", items: [{ productId: "SN-SNK", name: "Canvas Sneakers", size: "42", color: "white", qty: 1, unitPrice: 1450 }], subtotal: 1450, deliveryFee: 70, total: 1520, courier: "pathao", paymentMethod: "card", status: "paid", risk: { level: "low", reason: "Prepaid" } },
    { id: "DD-9X1L", createdAt: t(11, 40), customerName: null, phone: "01300998877", area: "Sylhet", items: [{ productId: "PJ-PANJ", name: "Eid Panjabi (Cotton)", size: "44", color: "olive", qty: 3, unitPrice: 1850 }], subtotal: 5550, deliveryFee: 120, total: 5670, courier: "steadfast", paymentMethod: "cod", status: "needs_info", risk: { level: "high", reason: "New number, high-value COD, no address" } },
  ];
};

export function loadOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOrders(orders: SavedOrder[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("dokan-orders"));
}

export function upsertOrder(o: SavedOrder) {
  const all = loadOrders();
  const i = all.findIndex((x) => x.id === o.id);
  if (i >= 0) all[i] = { ...all[i], ...o };
  else all.unshift(o);
  saveOrders(all);
}

export function markPaid(id: string) {
  const all = loadOrders();
  const o = all.find((x) => x.id === id);
  if (o) {
    o.status = "paid";
    saveOrders(all);
  }
  return o;
}

export function resetOrders() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("dokan-orders"));
}
