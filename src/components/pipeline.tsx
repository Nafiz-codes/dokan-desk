"use client";
import { Check, Loader2, MessageSquareText, ShieldAlert, ReceiptText, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState = "idle" | "running" | "done";
export const STEPS = [
  { id: "parser", label: "Parser", sub: "DM → order", icon: MessageSquareText },
  { id: "risk", label: "Risk check", sub: "fraud & COD", icon: ShieldAlert },
  { id: "invoice", label: "Invoice", sub: "+ courier", icon: ReceiptText },
  { id: "reply", label: "Reply", sub: "in their language", icon: Send },
] as const;

export function Pipeline({ states, ms }: { states: StepState[]; ms?: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const st = states[i];
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                    st === "idle" && "border-stone-200 bg-stone-50 text-stone-400",
                    st === "running" && "border-emerald-500 bg-emerald-50 text-emerald-700",
                    st === "done" && "border-emerald-700 bg-emerald-700 text-white scale-105"
                  )}
                >
                  {st === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : st === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                  {st === "running" && <span className="absolute inset-0 animate-ping rounded-full border-2 border-emerald-400 opacity-40" />}
                </div>
                <div className="hidden leading-tight sm:block">
                  <div className={cn("text-sm font-semibold", st === "idle" ? "text-stone-400" : "text-stone-900")}>{s.label}</div>
                  <div className="text-[11px] text-stone-500">{s.sub}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-3 h-1 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <div className={cn("h-full rounded-full bg-emerald-600 transition-all duration-500", states[i] === "done" ? "w-full" : states[i] === "running" ? "w-1/2 animate-pulse" : "w-0")} />
                </div>
              )}
            </div>
          );
        })}
        {ms !== undefined && states.every((s) => s === "done") && (
          <div className="ml-4 hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 md:block">
            ⚡ {(ms / 1000).toFixed(1)}s
          </div>
        )}
      </div>
    </div>
  );
}
