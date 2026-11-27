import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function taka(n: number) {
  return "৳" + Math.round(n).toLocaleString("en-IN");
}

export function uid(prefix = "DD") {
  return `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
}
