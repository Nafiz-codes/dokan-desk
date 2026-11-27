"use client";
import { useState } from "react";
import { Check, Copy, CreditCard, Send, MessageCircleQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ReplyCard({ bn, en, payUrl, mode, defaultTab }: { bn: string; en: string; payUrl?: string; mode: "reply" | "ask"; defaultTab: "bn" | "en" }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<string>(defaultTab);
  const withLink = (t: string, lang: "bn" | "en") => (payUrl ? `${t}\n\n${lang === "bn" ? "💳 পেমেন্ট লিংক" : "💳 Pay here"}: ${payUrl}` : t);
  const current = withLink(tab === "bn" ? bn : en, tab as "bn" | "en");

  const copy = async () => {
    await navigator.clipboard.writeText(current);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card id="reply-card" className="animate-fade-up [animation-delay:240ms]">
      <Tabs value={tab} onValueChange={setTab}>
        <CardHeader>
          <CardTitle>
            {mode === "ask" ? <MessageCircleQuestion className="h-4 w-4 text-amber-600" /> : <Send className="h-4 w-4 text-emerald-700" />}
            {mode === "ask" ? "Ask for missing info" : "Reply to customer"}
            {payUrl && <Badge variant="stripe"><CreditCard className="h-3 w-3" /> pay link added</Badge>}
          </CardTitle>
          <TabsList>
            <TabsTrigger value="bn">বাংলা</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["bn", "en"] as const).map((l) => (
            <TabsContent key={l} value={l}>
              <div className="flex justify-end">
                <div className="max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-emerald-700 px-4 py-3 text-[15px] leading-relaxed text-white shadow-sm">
                  {withLink(l === "bn" ? bn : en, l)}
                </div>
              </div>
            </TabsContent>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Paste into Messenger / WhatsApp</span>
            <Button size="sm" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy reply"}
            </Button>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
}
