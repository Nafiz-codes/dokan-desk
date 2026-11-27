"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Sparkles, X, Wand2, ExternalLink, Inbox } from "lucide-react";
import type { ParseResponse, ParsedOrder } from "@/lib/schema";
import { samples } from "@/lib/data";
import { upsertOrder, loadOrders } from "@/lib/store";
import { Pipeline, type StepState } from "@/components/pipeline";
import { OrderCard } from "@/components/order-card";
import { InvoiceCard, invoiceTotals } from "@/components/invoice-card";
import { ReplyCard } from "@/components/reply-card";
import { Button } from "@/components/ui/button";
import { cn, uid } from "@/lib/utils";

const FIELD_BN: Record<string, string> = { customerName: "আপনার নাম", phone: "ফোন নম্বর", address: "পুরো ঠিকানা (বাসা/রোড নং)", size: "সাইজ", color: "কালার", quantity: "কয়টা লাগবে", product: "কোন প্রোডাক্টটা" };
const FIELD_EN: Record<string, string> = { customerName: "your name", phone: "phone number", address: "full address (house/road no.)", size: "size", color: "color", quantity: "quantity", product: "which product" };

function askMessages(o: ParsedOrder) {
  const bn = o.missingFields.map((f) => FIELD_BN[f]).join(", ");
  const en = o.missingFields.map((f) => FIELD_EN[f]).join(", ");
  return {
    bn: `ধন্যবাদ অর্ডারের জন্য! 😊 অর্ডারটা কনফার্ম করতে আর একটু তথ্য লাগবে: ${bn}। দিলেই আজকে পাঠিয়ে দিচ্ছি!`,
    en: `Thanks for your order! 😊 To confirm it we just need: ${en}. Send these and we'll ship today!`,
  };
}

type Msg = { text: string; image?: string };

export function Desk() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [thread, setThread] = useState<Msg[]>([]);
  const [states, setStates] = useState<StepState[]>(["idle", "idle", "idle", "idle"]);
  const [res, setRes] = useState<ParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [courierId, setCourierId] = useState("pathao");
  const [saved, setSaved] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payUrl, setPayUrl] = useState<string>();
  const [paying, setPaying] = useState(false);
  const [mode, setMode] = useState<"reply" | "ask">("reply");
  const [stripeEnabled, setStripeEnabled] = useState<boolean | null>(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/checkout").then((r) => r.json()).then((d) => setStripeEnabled(!!d.enabled)).catch(() => setStripeEnabled(false));
  }, []);

  // keep paid state in sync if payment completed in another tab
  useEffect(() => {
    const sync = () => {
      if (!orderId) return;
      const o = loadOrders().find((x) => x.id === orderId);
      if (o?.status === "paid") setPaid(true);
    };
    window.addEventListener("storage", sync);
    window.addEventListener("dokan-orders", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("dokan-orders", sync);
    };
  }, [orderId]);

  const readFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const run = useCallback(
    async (t: string, img?: string) => {
      if (!t.trim() && !img) return;
      setBusy(true);
      setError(null);
      setRes(null);
      setSaved(false);
      setPaid(false);
      setPayUrl(undefined);
      setMode("reply");
      setThread((th) => [...th, { text: t, image: img }]);
      setText("");
      setImage(undefined);
      setStates(["running", "idle", "idle", "idle"]);
      try {
        const r = await fetch("/api/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t, image: img }) });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Parse failed");
        const wait = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
        setStates(["done", "running", "idle", "idle"]);
        await wait(450);
        setRes(data);
        setOrderId(uid());
        setCourierId(data.order.suggestedCourier);
        setStates(["done", "done", "running", "idle"]);
        await wait(450);
        setStates(["done", "done", "done", "running"]);
        await wait(450);
        setStates(["done", "done", "done", "done"]);
      } catch (e) {
        setError((e as Error).message);
        setStates(["idle", "idle", "idle", "idle"]);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const save = (extra?: Partial<{ status: "paid" | "confirmed" | "needs_info"; payUrl: string }>) => {
    if (!res) return;
    const o = res.order;
    const t = invoiceTotals(o, courierId);
    upsertOrder({
      id: orderId,
      createdAt: new Date().toISOString(),
      customerName: o.customerName,
      phone: o.phone,
      area: o.area,
      items: o.items,
      subtotal: t.subtotal,
      deliveryFee: t.fee,
      total: t.total,
      courier: courierId,
      paymentMethod: o.paymentMethod,
      status: o.missingFields.length ? "needs_info" : "confirmed",
      risk: o.risk,
      ...extra,
    });
    setSaved(true);
  };

  const pay = async () => {
    if (!res) return;
    setPaying(true);
    setError(null);
    try {
      const t = invoiceTotals(res.order, courierId);
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, customerPhone: res.order.phone, items: res.order.items, deliveryFee: t.fee + t.codCharge, courier: t.courier.name }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPayUrl(d.url);
      save({ payUrl: d.url });
      setMode("reply");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPaying(false);
    }
  };

  const ask = res ? askMessages(res.order) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* LEFT: inbox */}
      <div className="flex flex-col gap-4">
        <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-bold text-white">C</div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Customer DM</div>
              <div className="text-xs text-stone-500">Messenger · WhatsApp · Instagram</div>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live</div>
          </div>

          <div
            className={cn("relative flex-1 space-y-3 overflow-y-auto bg-grid p-4 transition-colors", drag && "bg-emerald-50")}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) readFile(f); }}
          >
            {thread.length === 0 && (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center text-stone-500">
                <Inbox className="mb-2 h-10 w-10 text-stone-300" />
                <div className="text-sm font-medium text-stone-600">Paste a messy DM or drop a chat screenshot</div>
                <div className="text-xs">Bangla · English · Banglish — or try a sample below</div>
              </div>
            )}
            {thread.map((m, i) => (
              <div key={i} className="flex animate-fade-up justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-stone-100 px-4 py-2.5 text-[15px] leading-relaxed text-stone-900">
                  {m.image && <img src={m.image} alt="screenshot" className="mb-2 max-h-48 rounded-lg" />}
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-stone-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Dokan Desk is reading…</div>
            )}
            {drag && <div className="absolute inset-3 flex items-center justify-center rounded-xl border-2 border-dashed border-emerald-500 text-sm font-semibold text-emerald-800">Drop screenshot</div>}
          </div>

          <div className="border-t border-stone-100 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {samples.map((s) => (
                <button
                  key={s.id}
                  disabled={busy}
                  onClick={() => run(s.text)}
                  className="group cursor-pointer rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 transition-all hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-900 disabled:opacity-50"
                  title={s.text}
                >
                  <Wand2 className="mr-1 inline h-3 w-3 text-emerald-600" />{s.label}
                  <span className="ml-1 text-stone-400 group-hover:text-emerald-700">· {s.hint}</span>
                </button>
              ))}
            </div>
            {image && (
              <div className="relative mb-2 inline-block">
                <img src={image} alt="attachment" className="h-16 rounded-lg border border-stone-200" />
                <button onClick={() => setImage(undefined)} className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-stone-800 p-0.5 text-white"><X className="h-3 w-3" /></button>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15">
              <button onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-lg p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-800" title="Attach screenshot">
                <ImagePlus className="h-5 w-5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onPaste={(e) => { const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/")); if (f) { e.preventDefault(); readFile(f); } }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(text, image); } }}
                rows={2}
                placeholder='e.g. "bhai 2ta blue tshirt M size, Mirpur"'
                className="max-h-40 flex-1 resize-none bg-transparent px-1 py-1.5 text-[15px] outline-none placeholder:text-stone-400"
              />
              <Button onClick={() => run(text, image)} disabled={busy || (!text.trim() && !image)}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Process
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: output */}
      <div className="flex flex-col gap-4">
        <Pipeline states={states} ms={res?.ms} />
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">⚠️ {error}</div>}
        {res?.warning && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">{res.warning}</div>}

        {!res && !busy && (
          <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center">
            <div className="mb-3 rounded-2xl bg-emerald-50 p-4"><Sparkles className="h-8 w-8 text-emerald-700" /></div>
            <h2 className="text-xl font-semibold text-stone-900">From messy DM to finished order</h2>
            <p className="mt-1 max-w-md text-sm text-stone-600">Dokan Desk reads the chat, fills the order, flags risky COD, prepares the invoice and courier, and writes the reply — in the customer&apos;s language.</p>
          </div>
        )}
        {busy && !res && (
          <div className="space-y-4">
            {[180, 260, 140].map((h, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-stone-200 bg-white" style={{ height: h }} />
            ))}
          </div>
        )}

        {res && states[1] === "done" && (
          <OrderCard
            order={res.order}
            onAsk={() => {
              setMode("ask");
              setTimeout(() => document.getElementById("reply-card")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
            }}
          />
        )}
        {res && states[2] === "done" && (
          <>
            <InvoiceCard
              order={res.order}
              orderId={orderId}
              courierId={courierId}
              setCourierId={setCourierId}
              saved={saved}
              paid={paid}
              onConfirm={() => save()}
              onPay={pay}
              paying={paying}
              stripeEnabled={stripeEnabled}
            />
            {payUrl && !paid && (
              <div className="flex animate-fade-up items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm text-indigo-900">
                <span className="truncate">Stripe Checkout link ready (test mode) — added to the reply below.</span>
                <a href={payUrl} className="inline-flex shrink-0 items-center gap-1 font-semibold underline">Open checkout <ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
            )}
          </>
        )}
        {res && states[3] === "done" && (
          <ReplyCard
            key={`${orderId}-${mode}`}
            mode={mode}
            bn={mode === "ask" && ask ? ask.bn : res.order.replyBn}
            en={mode === "ask" && ask ? ask.en : res.order.replyEn}
            payUrl={mode === "reply" ? payUrl : undefined}
            defaultTab={res.order.language === "en" ? "en" : "bn"}
          />
        )}
        {res && (
          <div className="text-right text-xs text-stone-400">
            {res.source !== "mock" ? `Parsed by ${res.source === "openai" ? "OpenAI" : "Grok"} (${res.model})` : "Demo mode · offline parser (add OPENAI_API_KEY for AI parsing)"} · order #{orderId}
          </div>
        )}
      </div>
    </div>
  );
}
