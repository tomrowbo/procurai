"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShieldCheck, Wallet, ArrowRight } from "lucide-react";

type Step = {
  id: string;
  label: string;
  detail: string;
  amount?: string;
  status: "pending" | "running" | "done";
};

const SCRIPT: Step[] = [
  { id: "1", label: "Parsing requirements", detail: "Hackathon for 80 builders · 12hrs · NYC", status: "pending" },
  { id: "2", label: "Sourcing vendors", detail: "Shortlisted 6 suppliers across catering, swag, prizes", status: "pending" },
  { id: "3", label: "Negotiating quotes", detail: "Counter-offered Insomnia Cookies → 14% discount", amount: "$640.00", status: "pending" },
  { id: "4", label: "Verifying budget envelope", detail: "Within $8,500 allocation · CFO policy OK", status: "pending" },
  { id: "5", label: "Authorizing payment", detail: "Virtual card · single-use · merchant-locked", amount: "$3,284.50", status: "pending" },
  { id: "6", label: "Executing purchase", detail: "Order #HX-22841 confirmed · ETA Sat 9:00 AM", status: "pending" },
];

const TRANSCRIPT = [
  { who: "Operator", text: "Stand up procurement for Hack the Harbor — 80 attendees, Saturday." },
  { who: "Agent", text: "On it. I'll handle catering, swag, and prizes within your $8.5k envelope." },
  { who: "Agent", text: "Three quotes in. Approving the bundle now." },
];

export function AgentConsole() {
  const [steps, setSteps] = useState<Step[]>(SCRIPT);
  const [transcriptIdx, setTranscriptIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const run = (i: number) => {
      if (i >= SCRIPT.length) {
        timers.current.push(setTimeout(() => {
          setSteps(SCRIPT.map(s => ({ ...s, status: "pending" })));
          setTranscriptIdx(0);
          setTyped("");
          run(0);
        }, 4000));
        return;
      }
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "running" } : s));
      timers.current.push(setTimeout(() => {
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "done" } : s));
        run(i + 1);
      }, 1400));
    };
    run(0);
    return () => { timers.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (transcriptIdx >= TRANSCRIPT.length) return;
    const full = TRANSCRIPT[transcriptIdx].text;
    let i = 0;
    setTyped("");
    const tick = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(tick);
        setTimeout(() => setTranscriptIdx(v => v + 1), 1100);
      }
    }, 22);
    return () => clearInterval(tick);
  }, [transcriptIdx]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-[0_24px_60px_-24px_oklch(0.24_0.09_258/0.25)] overflow-hidden">
      {/* Console header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-steel" />
            <span className="h-2.5 w-2.5 rounded-full bg-steel" />
            <span className="h-2.5 w-2.5 rounded-full bg-steel" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">procure.agent · session 0xA41F</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-success/60 pulse-ring" />
            <span className="relative h-2 w-2 rounded-full bg-success" />
          </span>
          live
        </div>
      </div>

      <div className="grid md:grid-cols-5">
        {/* Steps */}
        <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Autonomous workflow</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              run · live
            </span>
          </div>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors data-[state=running]:border-primary/40 data-[state=running]:bg-primary/[0.03] data-[state=done]:border-success/30"
                data-state={s.status}
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                  {s.status === "done" ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : s.status === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <span className="font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    {s.amount && (
                      <span className="font-mono text-xs text-primary-deep">{s.amount}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Transcript + receipt */}
        <div className="md:col-span-2 flex flex-col">
          <div className="flex-1 border-b border-border p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Transcript</h3>
            <div className="space-y-3">
              {TRANSCRIPT.slice(0, transcriptIdx).map((m, i) => (
                <Bubble key={i} who={m.who} text={m.text} />
              ))}
              {transcriptIdx < TRANSCRIPT.length && (
                <Bubble who={TRANSCRIPT[transcriptIdx].who} text={typed} typing />
              )}
            </div>
          </div>
          <div className="bg-secondary/50 p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              <span className="font-mono uppercase tracking-widest">Treasury</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl text-foreground">$5,215.50</p>
                <p className="text-xs text-muted-foreground">remaining of $8,500.00</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <ShieldCheck className="h-3 w-3" />
                policy clear
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary" style={{ width: "38.6%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-background px-5 py-3 text-xs text-muted-foreground">
        <span className="font-mono">audit trail · cryptographically signed</span>
        <a className="inline-flex items-center gap-1 text-primary hover:text-primary-deep" href="#">
          view ledger <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function Bubble({ who, text, typing }: { who: string; text: string; typing?: boolean }) {
  const isAgent = who === "Agent";
  return (
    <div className={`flex ${isAgent ? "" : "justify-end"}`}>
      <div className={`max-w-[88%] rounded-lg px-3 py-2 text-sm ${
        isAgent ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground border border-border"
      }`}>
        <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest opacity-70">{who}</p>
        <p className={typing ? "typewriter" : ""}>{text}</p>
      </div>
    </div>
  );
}
