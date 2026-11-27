import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-emerald-800 text-white shadow-sm hover:bg-emerald-900",
        outline: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50",
        ghost: "text-stone-700 hover:bg-stone-100",
        amber: "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200",
        stripe: "bg-[#635bff] text-white shadow-sm hover:bg-[#5249e0]",
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3 text-xs", lg: "h-12 px-6 text-base", icon: "h-9 w-9" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
