"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, Phone, Video, ChevronLeft, Check } from "lucide-react";

type FormData = {
  phone: string;
  request: string;
  budget: string;
};

type ChatMsg =
  | { from: "sourcy"; text: string }
  | { from: "user"; text: string }
  | { from: "action"; text: string; done: boolean };

const PROCUREMENT_SCRIPT: ChatMsg[] = [
  { from: "sourcy", text: "On it! Sourcing socks and lining up your hackathon suppliers 🚀" },
  { from: "action", text: "Finding sock vendors...", done: false },
  { from: "action", text: "Printful · 200 branded socks · −11% · $1,140", done: false },
  { from: "sourcy", text: "Best quote locked in. Paying suppliers now." },
  { from: "action", text: "Paying catering & venue suppliers...", done: false },
  { from: "sourcy", text: "Negotiated an extra 8% off catering 💪" },
  { from: "action", text: "Virtual card issued · merchant-locked", done: false },
  { from: "action", text: "All orders confirmed · receipts sent", done: false },
  { from: "sourcy", text: "Done! Socks ship Monday. All suppliers paid. Check WhatsApp for receipts 🎉" },
];

export default function TryPage() {
  const [form, setForm] = useState<FormData>({ phone: "", request: "Order 200 branded socks for hackathon giveaways + pay catering and venue suppliers for Saturday", budget: "$6,000" });
  const [submitted, setSubmitted] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone || !form.request) return;
    setSubmitted(true);

    const userMsg: ChatMsg = {
      from: "user",
      text: `${form.request}${form.budget ? ` — Budget: ${form.budget}` : ""}`,
    };
    setChat([userMsg]);

    const flipLastRunning = () => {
      setChat(c => {
        const idx = c.map((m, i) => ({ m, i })).reverse().find(({ m }) => m.from === "action" && !m.done)?.i;
        if (idx === undefined) return c;
        return c.map((m, j) => j === idx && m.from === "action" ? { ...m, done: true } : m);
      });
    };

    let delay = 800;
    PROCUREMENT_SCRIPT.forEach((msg, i) => {
      const isLast = i === PROCUREMENT_SCRIPT.length - 1;
      if (msg.from === "sourcy") {
        setTimeout(() => setTyping(true), delay);
        delay += 1200;
        setTimeout(() => {
          setTyping(false);
          setChat((c) => [...c, msg]);
        }, delay);
        delay += isLast ? 0 : 600;
      } else {
        setTimeout(() => setChat((c) => [...c, { ...msg, done: false }]), delay);
        delay += 800;
        setTimeout(flipLastRunning, delay);
        delay += 700;
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="px-6 pt-6 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Sourcy</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 md:px-12 md:pt-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left copy */}
          <div>
            <Image
              src="/sourcy-agent-v2.png"
              alt="Sourcy agent"
              width={320}
              height={320}
              className="w-48 md:w-56 object-contain mb-4"
            />

            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Tell Sourcy what
              <br />
              <span className="text-primary">you need.</span>
            </h1>

            <p className="mt-5 text-base text-muted-foreground max-w-md">
              Drop your phone number and procurement request. Sourcy will message you on WhatsApp, source vendors, negotiate prices, and pay — all autonomously.
            </p>
          </div>

          {/* Right — iPhone + WhatsApp UI */}
          <div className="flex justify-center md:justify-end">
            <IPhoneFrame submitted={submitted} form={form} setForm={setForm} onSubmit={handleSubmit} chat={chat} typing={typing} />
          </div>
        </div>
      </main>
    </div>
  );
}

function IPhoneFrame({
  submitted,
  form,
  setForm,
  onSubmit,
  chat,
  typing,
}: {
  submitted: boolean;
  form: FormData;
  setForm: (f: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  chat: ChatMsg[];
  typing: boolean;
}) {
  return (
    <div className="relative w-[320px] sm:w-[360px]">
      {/* Glow */}
      <div className="absolute inset-0 -z-10 rounded-[52px] blur-3xl opacity-20 bg-primary scale-95" />

      {/* Phone shell */}
      <div className="relative rounded-[52px] border-[11px] border-neutral-900 bg-neutral-900 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-2.5 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />

        {/* Side buttons (decorative) */}
        <div className="absolute -left-[13px] top-24 h-8 w-[3px] rounded-full bg-neutral-700" />
        <div className="absolute -left-[13px] top-36 h-12 w-[3px] rounded-full bg-neutral-700" />
        <div className="absolute -left-[13px] top-52 h-12 w-[3px] rounded-full bg-neutral-700" />
        <div className="absolute -right-[13px] top-36 h-16 w-[3px] rounded-full bg-neutral-700" />

        {/* Screen */}
        <div className="relative h-[640px] overflow-hidden rounded-[42px] bg-[#111b21] flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pt-3.5 pb-1 text-[11px] font-semibold text-white">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 16 12" className="h-3 w-4 fill-white"><rect x="0" y="4" width="3" height="8" rx="1"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1"/><rect x="9" y="1" width="3" height="11" rx="1"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" fillOpacity="0.4"/></svg>
              <span className="text-[10px]">5G</span>
              <svg viewBox="0 0 25 12" className="h-3 w-6 fill-white"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="white" strokeOpacity="0.35" fill="none"/><rect x="2" y="2" width="17" height="8" rx="2" fillOpacity="0.9"/><path d="M23.5 4v4a2 2 0 0 0 0-4z" fillOpacity="0.4"/></svg>
            </div>
          </div>

          {/* WhatsApp header */}
          <div className="flex items-center gap-3 px-3 py-2 bg-[#1f2c34] border-b border-white/5">
            <button className="flex items-center gap-1 text-[#25d366]">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-xs font-medium">192</span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shrink-0">
              <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">Sourcy</p>
              <p className="text-[10px] text-white/50">procurement agent · online</p>
            </div>
            <div className="flex items-center gap-4 text-white/70">
              <Video className="h-4 w-4" />
              <Phone className="h-4 w-4" />
            </div>
          </div>

          {/* Chat area */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
            style={{ background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23111b21'/%3E%3C/svg%3E\")" }}
          >
            {/* Sourcy's opening message */}
            <div className="flex justify-start">
              <div className="max-w-[82%] rounded-2xl rounded-tl-none bg-[#202c33] px-3.5 py-2.5 text-sm text-white shadow-sm">
                <p className="text-[11px] font-medium text-[#25d366] mb-0.5">Sourcy</p>
                {submitted
                  ? "On it! Here's what I'm doing for you 👇"
                  : "Hey! Drop your details below and I'll start sourcing for you right away."}
                <p className="text-right text-[10px] text-white/40 mt-1">9:41 AM ✓✓</p>
              </div>
            </div>

            {/* Dynamic chat messages after submit */}
            {chat.map((msg, i) => {
              if (msg.from === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[82%] rounded-2xl rounded-tr-none bg-[#005c4b] px-3.5 py-2.5 text-sm text-white shadow-sm">
                      {msg.text}
                      <p className="text-right text-[10px] text-white/50 mt-1">9:41 AM ✓✓</p>
                    </div>
                  </div>
                );
              }
              if (msg.from === "sourcy") {
                return (
                  <div key={i} className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="max-w-[82%] rounded-2xl rounded-tl-none bg-[#202c33] px-3.5 py-2.5 text-sm text-white shadow-sm">
                      <p className="text-[11px] font-medium text-[#25d366] mb-0.5">Sourcy</p>
                      {msg.text}
                      <p className="text-right text-[10px] text-white/40 mt-1">9:41 AM ✓✓</p>
                    </div>
                  </div>
                );
              }
              // action
              return (
                <div key={i} className="flex justify-center animate-in fade-in duration-300">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-white/60">
                    {msg.done
                      ? <Check className="h-3 w-3 text-[#25d366]" />
                      : <span className="h-2 w-2 rounded-full bg-[#25d366] animate-pulse" />}
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="rounded-2xl rounded-tl-none bg-[#202c33] px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-white/40 animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form or input bar */}
          {!submitted ? (
            <form onSubmit={onSubmit} className="bg-[#1f2c34] px-3 py-3 space-y-2 border-t border-white/5">
              <input
                type="tel"
                placeholder="Phone number (e.g. +44 7700 900000)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full rounded-xl bg-[#2a3942] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#25d366]/50"
              />
              <textarea
                placeholder="What do you need? (e.g. Catering for 80 people Saturday)"
                value={form.request}
                onChange={(e) => setForm({ ...form, request: e.target.value })}
                required
                rows={2}
                className="w-full rounded-xl bg-[#2a3942] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#25d366]/50 resize-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Budget (optional)"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="flex-1 rounded-xl bg-[#2a3942] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#25d366]/50"
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white shadow-md transition hover:bg-[#20b957] active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white rotate-45 -translate-x-px">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#1f2c34] px-4 py-3 border-t border-white/5 flex items-center gap-3">
              <div className="flex-1 rounded-xl bg-[#2a3942] px-3 py-2.5 text-sm text-white/30">
                Sourcy is handling it...
              </div>
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#2a3942] flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-[#25d366] animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
