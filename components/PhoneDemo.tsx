"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, ShoppingBag } from "lucide-react";

type Msg = {
  from: "user" | "agent";
  text: string;
};

export function PhoneDemo() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `demo-${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Something went wrong";
      setMessages((prev) => [...prev, { from: "agent", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { from: "agent", text: "Connection error. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px] float">
      {/* Phone frame */}
      <div className="relative rounded-[44px] border-[10px] border-neutral-900 bg-neutral-900 shadow-[0_30px_70px_-20px_oklch(0.38_0.14_272/0.35)]">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-900" />
        {/* Screen */}
        <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[34px] bg-gradient-to-b from-[oklch(0.22_0.04_275)] to-[oklch(0.16_0.03_270)] text-white">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-medium tracking-wide">
            <span>9:41</span>
            <span className="opacity-80">5G</span>
          </div>

          {/* Header */}
          <div className="mt-3 flex flex-col items-center px-4 pb-3">
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-neutral-900 bg-green-500" />
            </div>
            <p className="mt-2 text-xs font-semibold">ProcurAI</p>
            <p className="text-[10px] text-white/50">shopping agent</p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pb-2">
            <div className="flex flex-col gap-2">
              {messages.length === 0 && (
                <div className="mt-8 text-center text-[11px] text-white/30">
                  Try: &quot;I need a phone charger&quot;
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-snug whitespace-pre-wrap ${
                      m.from === "user"
                        ? "rounded-br-md bg-white/10 text-white/90"
                        : "rounded-bl-md bg-primary px-3 py-2 text-primary-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="rounded-2xl rounded-bl-md bg-primary/60 px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-foreground/70" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 pb-4 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                disabled={loading}
                className="flex-1 bg-transparent text-[12px] text-white placeholder-white/30 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-30"
              >
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
