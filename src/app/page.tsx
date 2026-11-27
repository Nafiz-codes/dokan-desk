"use client";
import { useEffect, useState } from "react";
import { LayoutDashboard, MessagesSquare, Store } from "lucide-react";
import { Desk } from "@/components/desk";
import { Dashboard } from "@/components/dashboard";
import { cn } from "@/lib/utils";

export default function Home() {
  const [tab, setTab] = useState<"desk" | "dashboard">("desk");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "dashboard") setTab("dashboard");
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f6f5f1]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-sm"><Store className="h-5 w-5" /></div>
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight text-emerald-950">Dokan Desk <span className="font-semibold text-emerald-700">· দোকান ডেস্ক</span></div>
              <div className="text-xs text-stone-500">AI back office for Facebook & WhatsApp sellers</div>
            </div>
          </div>
          <nav className="ml-auto flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-stone-200">
            {([
              ["desk", "Order desk", MessagesSquare],
              ["dashboard", "Dashboard", LayoutDashboard],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all", tab === id ? "bg-emerald-800 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100")}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {tab === "desk" ? (
          <>
            <p className="mb-5 text-[15px] text-stone-600">
              Every small seller in Bangladesh is drowning in DMs. <span className="font-semibold text-emerald-900">Dokan Desk turns a messy chat into a finished order in seconds.</span>
            </p>
            <Desk />
          </>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}
