import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-hind" });

export const metadata: Metadata = {
  title: "Dokan Desk — AI back office for F-commerce sellers",
  description: "Every small seller in Bangladesh is drowning in DMs. Dokan Desk turns a messy chat into a finished order in seconds.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${hind.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
