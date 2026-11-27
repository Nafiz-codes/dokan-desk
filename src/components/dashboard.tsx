"use client";
import { useEffect, useState } from "react";
import { BadgeCheck, Clock, MessageCircleQuestion, PackageCheck, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import type { SavedOrder } from "@/lib/schema";
import { loadOrders, resetOrders, upsertOrder } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/order-card";
import { taka } from "@/lib/utils";

const STATUS: Record<SavedOrder["status"], { label: string; v: "low" | "medium" | "high" | "muted" | "stripe" }> = {
  needs_info: { label: "Needs info", v: "medium" },
  confirmed: { label: "Confirmed", v: "muted" },
  paid: { label: "Paid", v: "low" },
  shipped: { label: "Shipped", v: "stripe" },
};

export function Dashboard() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  useEffect(() => {
    const load = () => setOrders(loadOrders());
    load();
    window.addEventListener("dokan-orders", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("dokan-orders", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const today = new Date().toDateString();
  const todays = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const pendingCod = orders.filter((o) => o.paymentMethod === "cod" && o.status !== "paid");
  const paid = orders.filter((o) => o.status === "paid");
  const follow = orders.filter((o) => o.status === "needs_info");

  const stats = [
    { label: "Today's orders", value: String(todays.length), sub: taka(todays.reduce((s, o) => s + o.total, 0)) + " sales", icon: ShoppingBag, tone: "text-emerald-800 bg-emerald-50" },
    { label: "Pending COD", value: taka(pendingCod.reduce((s, o) => s + o.total, 0)), sub: `${pendingCod.length} orders to collect`, icon: Clock, tone: "text-amber-800 bg-amber-50" },
    { label: "Paid online", value: taka(paid.reduce((s, o) => s + o.total, 0)), sub: `${paid.length} via Stripe / bKash`, icon: BadgeCheck, tone: "text-indigo-700 bg-indigo-50" },
    { label: "Follow-ups", value: String(follow.length), sub: "waiting on customer", icon: MessageCircleQuestion, tone: "text-red-700 bg-red-50" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-600">{s.label}</span>
              <span className={`rounded-lg p-2 ${s.tone}`}><s.icon className="h-4 w-4" /></span>
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-stone-900">{s.value}</div>
            <div className="text-xs text-stone-500">{s.sub}</div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle><PackageCheck className="h-4 w-4 text-emerald-700" /> Orders</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetOrders}><RotateCcw className="h-3.5 w-3.5" /> Reset demo</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-[11px] uppercase tracking-wide text-stone-500">
                <tr>
                  {["Order", "Customer", "Items", "Courier", "Payment", "Risk", "Total", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold">#{o.id}</div>
                      <div className="text-xs text-stone-500">{new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customerName ?? <span className="text-amber-700">Unknown</span>}</div>
                      <div className="text-xs text-stone-500">{o.phone ?? "no phone"} · {o.area ?? "?"}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                    <td className="px-4 py-3 capitalize">{o.courier}</td>
                    <td className="px-4 py-3 uppercase text-xs font-semibold text-stone-600">{o.paymentMethod}</td>
                    <td className="px-4 py-3"><RiskBadge risk={o.risk} /></td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{taka(o.total)}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS[o.status].v}>{STATUS[o.status].label}</Badge></td>
                    <td className="px-4 py-3">
                      {(o.status === "paid" || o.status === "confirmed") && (
                        <Button size="sm" variant="outline" onClick={() => upsertOrder({ ...o, status: "shipped" })}><Truck className="h-3.5 w-3.5" /> Ship</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
