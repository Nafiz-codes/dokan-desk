"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { markPaid } from "@/lib/store";
import { Card } from "@/components/ui/card";

type Result = { paid?: boolean; orderId?: string; amount?: number; currency?: string; error?: string };

export default function PaidPage() {
  const [r, setR] = useState<Result | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session_id");
    if (!id) return setR({ error: "Missing session_id" });
    fetch(`/api/checkout?session_id=${encodeURIComponent(id)}`)
      .then((x) => x.json())
      .then((d: Result) => {
        if (d.paid && d.orderId) markPaid(d.orderId);
        setR(d);
      })
      .catch((e) => setR({ error: String(e) }));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid p-6">
      <Card className="w-full max-w-md p-8 text-center">
        {!r ? (
          <><Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-700" /><p className="mt-3 text-stone-600">Verifying payment with Stripe…</p></>
        ) : r.paid ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
            <h1 className="mt-3 text-2xl font-bold text-emerald-950">Payment received</h1>
            <p className="mt-1 text-stone-600">Order <b>#{r.orderId}</b> is marked <b>Paid</b>{r.amount ? ` · ${r.currency?.toUpperCase()} ${r.amount.toLocaleString()}` : ""}.</p>
            <p className="mt-1 text-sm text-stone-500">ধন্যবাদ! আপনার পেমেন্ট সফল হয়েছে।</p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-3 text-xl font-bold">Payment not completed</h1>
            <p className="mt-1 text-sm text-stone-600">{r.error ?? "The session is not paid yet."}</p>
          </>
        )}
        <Link href="/?tab=dashboard" className="mt-6 inline-flex h-10 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900">Open dashboard</Link>
      </Card>
    </div>
  );
}
