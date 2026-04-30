"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, ShoppingBag } from "lucide-react";

type ScriptMsg =
  | { from: "user"; text: string }
  | { from: "agent"; text: string }
  | { from: "action"; text: string; amount?: string };

type VisibleMsg =
  | { from: "user"; text: string }
  | { from: "agent"; text: string }
  | { from: "action"; text: string; amount?: string; status: "running" | "done" };

const SCRIPT: ScriptMsg[] = [
  { from: "user", text: "Order branded socks for 200 hackathon attendees + pay all suppliers. Budget $6k." },
  { from: "agent", text: "On it — socks, supplier payments, all of it. Getting quotes now." },
  { from: "action", text: "Sourcing sock vendors" },
  { from: "action", text: "Printful · 200 branded socks · −11%", amount: "$1,140" },
  { from: "agent", text: "Best bundle secured. Paying suppliers now." },
  { from: "action", text: "Virtual card issued · merchant-locked" },
  { from: "action", text: "Order #HC-4821 confirmed · socks + suppliers", amount: "paid" },
  { from: "agent", text: "All paid. Socks ship Monday. You're good for the hackathon 🎉" },
];

export function PhoneDemo() {
  const [visible, setVisible] = useState<VisibleMsg[]>([]);

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const flipLastRunning = () => {
      setVisible(v => {
        const idx = v.map((m, i) => ({ m, i })).reverse().find(({ m }) => m.from === "action" && m.status === "running")?.i;
        if (idx === undefined) return v;
        return v.map((m, j) => j === idx ? { ...m, status: "done" as const } : m);
      });
    };

    const tick = () => {
      if (cancelled) return;
      if (i >= SCRIPT.length) {
        timers.push(setTimeout(() => {
          if (cancelled) return;
          i = 0;
          setVisible([]);
          timers.push(setTimeout(tick, 800));
        }, 3500));
        return;
      }
      const script = SCRIPT[i];
      i++;

      if (script.from === "action") {
        const msg: VisibleMsg = { ...script, status: "running" };
        setVisible(v => [...v, msg]);
        timers.push(setTimeout(flipLastRunning, 900));
      } else {
        setVisible(v => [...v, script]);
      }

      timers.push(setTimeout(tick, 1500));
    };

    tick();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px] float">
      {/* Phone frame */}
      <div className="relative rounded-[44px] border-[10px] border-neutral-900 bg-neutral-900 shadow-[0_30px_70px_-20px_oklch(0.38_0.14_272/0.35)]">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-900" />
        {/* Screen */}
        <div className="relative h-[560px] overflow-hidden rounded-[34px] bg-gradient-to-b from-[oklch(0.22_0.04_275)] to-[oklch(0.16_0.03_270)] text-white">
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
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-neutral-900 bg-success" />
            </div>
            <p className="mt-2 text-xs font-semibold">Sourcy</p>
            <p className="text-[10px] text-white/50">procurement agent · live</p>
          </div>

          {/* Messages */}
          <div className="flex h-[420px] flex-col justify-end gap-2 overflow-hidden px-3 pb-5">
            {visible.slice(-6).map((m, idx) => (
              <MsgBubble key={`${visible.length}-${idx}`} m={m} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating chip */}
      <div className="absolute -left-6 top-24 hidden rotate-[-6deg] rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg sm:block">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">paid</p>
        <p className="font-display text-sm font-semibold text-foreground">$1,140</p>
      </div>
      <div className="absolute -right-4 bottom-32 hidden rotate-[5deg] rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg sm:block">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">vendor</p>
        <p className="font-display text-sm font-semibold text-foreground">Printful · −11%</p>
      </div>
    </div>
  );
}

function MsgBubble({ m }: { m: VisibleMsg }) {
  if (m.from === "user") {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white/10 px-3 py-2 text-[11px] leading-snug text-white/90">
          {m.text}
        </div>
      </div>
    );
  }
  if (m.from === "agent") {
    return (
      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-primary px-3 py-2 text-[11px] leading-snug text-primary-foreground">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/80">
        {m.status === "done" ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Loader2 className="h-3 w-3 animate-spin text-primary-soft" />
        )}
        <span>{m.text}</span>
        {m.amount && <span className="font-mono text-primary-soft">· {m.amount}</span>}
      </div>
    </div>
  );
}
