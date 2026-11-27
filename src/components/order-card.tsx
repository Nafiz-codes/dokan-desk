"use client";
import { AlertTriangle, MessageCircleQuestion, Package, ShieldCheck, ShieldAlert, ShieldX, User, Phone, MapPin, Wallet } from "lucide-react";
import type { ParsedOrder } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, taka } from "@/lib/utils";

const PAY: Record<ParsedOrder["paymentMethod"], string> = { cod: "Cash on delivery", bkash: "bKash", card: "Card / online", unknown: "Not specified" };
const LANG: Record<ParsedOrder["language"], string> = { bn: "বাংলা", banglish: "Banglish", en: "English" };

export function RiskBadge({ risk, big }: { risk: ParsedOrder["risk"]; big?: boolean }) {
  const Icon = risk.level === "low" ? ShieldCheck : risk.level === "medium" ? ShieldAlert : ShieldX;
  return (
    <Badge variant={risk.level} className={cn(big && "px-3 py-1 text-[13px]")}>
      <Icon className={big ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {risk.level.toUpperCase()} RISK
    </Badge>
  );
}

function Field({ icon: Icon, label, value, missing }: { icon: React.ElementType; label: string; value: string | null; missing?: boolean }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2.5 transition-colors", missing ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-stone-50/60")}>
      <div className={cn("flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide", missing ? "text-amber-700" : "text-stone-500")}>
        <Icon className="h-3.5 w-3.5" /> {label}
        {missing && <AlertTriangle className="ml-auto h-3.5 w-3.5" />}
      </div>
      <div className={cn("mt-0.5 text-sm font-medium", missing ? "text-amber-900" : "text-stone-900")}>{value || (missing ? "Missing — ask customer" : "—")}</div>
    </div>
  );
}

export function OrderCard({ order, onAsk }: { order: ParsedOrder; onAsk: () => void }) {
  const miss = new Set(order.missingFields);
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>
          <Package className="h-4 w-4 text-emerald-700" /> Order
          <Badge variant="muted" className="font-medium">{LANG[order.language]}</Badge>
        </CardTitle>
        <RiskBadge risk={order.risk} big />
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex items-start gap-2 rounded-xl px-3 py-2 text-sm",
            order.risk.level === "high" ? "bg-red-50 text-red-800" : order.risk.level === "medium" ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"
          )}
        >
          <span className="font-semibold">Risk:</span> {order.risk.reason}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field icon={User} label="Customer" value={order.customerName} missing={miss.has("customerName")} />
          <Field icon={Phone} label="Phone" value={order.phone} missing={miss.has("phone")} />
          <div className="col-span-2">
            <Field icon={MapPin} label="Address" value={order.address ?? order.area} missing={miss.has("address")} />
          </div>
          <Field icon={Wallet} label="Payment" value={PAY[order.paymentMethod]} />
          <Field icon={MapPin} label="Zone" value={`${order.area ?? "?"} · ${order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"}`} />
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-[11px] uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Variant</th>
                <th className="px-3 py-2 text-center font-medium">Qty</th>
                <th className="px-3 py-2 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.length === 0 && (
                <tr><td colSpan={4} className="bg-amber-50 px-3 py-3 text-amber-900">No product recognised — ask the customer which item.</td></tr>
              )}
              {order.items.map((it, i) => (
                <tr key={i} className="border-t border-stone-100">
                  <td className="px-3 py-2 font-medium text-stone-900">{it.name}</td>
                  <td className="px-3 py-2">
                    <span className="flex flex-wrap gap-1">
                      {it.color ? <Badge variant="muted" className="capitalize">{it.color}</Badge> : <Badge variant="medium">color?</Badge>}
                      {it.size ? <Badge variant="muted">{it.size}</Badge> : <Badge variant="medium">size?</Badge>}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">{it.qty}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{it.unitPrice ? taka(it.unitPrice * it.qty) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.notes && <p className="text-sm text-stone-600">📝 {order.notes}</p>}

        {order.missingFields.length > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5">
            <div className="text-sm text-amber-900">
              <span className="font-semibold">{order.missingFields.length} missing:</span> {order.missingFields.join(", ")}
            </div>
            <Button variant="amber" size="sm" onClick={onAsk}>
              <MessageCircleQuestion className="h-4 w-4" /> Ask customer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
