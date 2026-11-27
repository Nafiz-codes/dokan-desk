"use client";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { CheckCircle2, CreditCard, Printer, ReceiptText, Truck, Loader2, Lock } from "lucide-react";
import type { ParsedOrder } from "@/lib/schema";
import { couriers, courierFee } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, taka } from "@/lib/utils";

export function invoiceTotals(order: ParsedOrder, courierId: string) {
  const subtotal = order.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const { fee, eta, courier } = courierFee(courierId, order.insideDhaka);
  const codCharge = order.paymentMethod === "cod" ? Math.round(subtotal * courier.codCharge) : 0;
  return { subtotal, fee, eta, courier, codCharge, total: subtotal + fee + codCharge };
}

export function InvoiceCard(props: {
  order: ParsedOrder;
  orderId: string;
  courierId: string;
  setCourierId: (id: string) => void;
  saved: boolean;
  paid: boolean;
  onConfirm: () => void;
  onPay: () => void;
  paying: boolean;
  stripeEnabled: boolean | null;
}) {
  const { order, orderId, courierId, setCourierId, saved, paid, onConfirm, onPay, paying, stripeEnabled } = props;
  const ref = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({ contentRef: ref, documentTitle: `Invoice-${orderId}` });
  const t = invoiceTotals(order, courierId);
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Card className="animate-fade-up [animation-delay:120ms]">
      <CardHeader>
        <CardTitle>
          <ReceiptText className="h-4 w-4 text-emerald-700" /> Invoice & courier
        </CardTitle>
        <div className="flex items-center gap-2">
          {paid ? <Badge variant="low"><CheckCircle2 className="h-3.5 w-3.5" /> PAID</Badge> : saved ? <Badge variant="muted">Confirmed</Badge> : <Badge variant="medium">Draft</Badge>}
          <Button variant="ghost" size="sm" onClick={() => print()}>
            <Printer className="h-4 w-4" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-stone-500">
            <Truck className="h-3.5 w-3.5" /> Courier {order.insideDhaka ? "(inside Dhaka)" : "(outside Dhaka)"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {couriers.map((c) => {
              const f = courierFee(c.id, order.insideDhaka);
              const active = c.id === courierId;
              return (
                <button
                  key={c.id}
                  onClick={() => setCourierId(c.id)}
                  className={cn(
                    "relative cursor-pointer rounded-xl border px-3 py-2 text-left transition-all",
                    active ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20" : "border-stone-200 hover:border-stone-300"
                  )}
                >
                  {order.suggestedCourier === c.id && <span className="absolute -top-2 right-2 rounded-full bg-emerald-700 px-1.5 text-[10px] font-semibold text-white">AI pick</span>}
                  <div className="flex items-center gap-1.5 text-sm font-semibold"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name.replace(" Courier", "")}</div>
                  <div className="text-xs text-stone-600">{taka(f.fee)} · {f.eta}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={ref} className="rounded-xl border border-dashed border-stone-300 bg-[#fffdf8] p-4 print:m-8 print:border-solid">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold text-emerald-900">দোকান · Nafiz Fashion House</div>
              <div className="text-xs text-stone-500">facebook.com/nafizfashion · 01700-000000</div>
            </div>
            <div className="text-right text-xs text-stone-600">
              <div className="font-semibold text-stone-900">INVOICE #{orderId}</div>
              <div>{today}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-stone-500">Bill to:</span> <span className="font-medium">{order.customerName ?? "—"}</span><br /><span className="text-stone-500">Phone:</span> {order.phone ?? "—"}</div>
            <div><span className="text-stone-500">Ship to:</span> {order.address ?? order.area ?? "—"}<br /><span className="text-stone-500">Via:</span> {t.courier.name} ({t.eta})</div>
          </div>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-b border-stone-200/70">
                  <td className="py-1.5">{it.name} <span className="text-xs text-stone-500">{[it.color, it.size].filter(Boolean).join(" / ")}</span></td>
                  <td className="py-1.5 text-center text-stone-600">{it.qty} × {taka(it.unitPrice)}</td>
                  <td className="py-1.5 text-right tabular-nums">{taka(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 ml-auto w-56 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span className="tabular-nums">{taka(t.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Delivery</span><span className="tabular-nums">{taka(t.fee)}</span></div>
            {t.codCharge > 0 && <div className="flex justify-between"><span className="text-stone-500">COD charge (1%)</span><span className="tabular-nums">{taka(t.codCharge)}</span></div>}
            <div className="flex justify-between border-t border-stone-300 pt-1 text-base font-bold text-emerald-900"><span>Total</span><span className="tabular-nums">{taka(t.total)}</span></div>
          </div>
          {paid && <div className="mt-2 inline-block -rotate-6 rounded border-2 border-emerald-700 px-2 text-sm font-bold text-emerald-700">PAID · STRIPE</div>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onConfirm} disabled={saved}>
            <CheckCircle2 className="h-4 w-4" /> {saved ? "Saved to dashboard" : "Confirm order"}
          </Button>
          <Button variant="stripe" onClick={onPay} disabled={!stripeEnabled || paying || paid || t.total <= 0} className="flex-1">
            {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : stripeEnabled ? <CreditCard className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {paid ? "Paid" : `Create Stripe pay link · ${taka(t.total)}`}
          </Button>
        </div>
        {stripeEnabled === false && (
          <p className="text-xs text-stone-500">💡 Add <code className="rounded bg-stone-100 px-1">STRIPE_SECRET_KEY</code> (test key, sk_test_…) to <code className="rounded bg-stone-100 px-1">.env.local</code> to enable Pay now.</p>
        )}
      </CardContent>
    </Card>
  );
}
