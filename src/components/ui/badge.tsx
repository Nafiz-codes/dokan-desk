import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
      low: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300",
      medium: "bg-amber-50 text-amber-800 ring-1 ring-amber-300",
      high: "bg-red-50 text-red-700 ring-1 ring-red-300",
      muted: "bg-stone-100 text-stone-700",
      stripe: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...p} />;
}
