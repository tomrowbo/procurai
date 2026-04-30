import { PhoneDemo } from "@/components/PhoneDemo";
import { ShoppingBag, ArrowRight, Infinity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Nav />
      <Hero />
      <SectionProblem />
      <SectionEnterSourcey />
      <SectionWhyNow />
      <SectionMarket />
      <SectionDefensibility />
      <SectionStack />
      <SectionBet />
    </div>
  );
}

function Nav() {
  return (
    <header className="px-6 pt-6 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Sourcy</span>
        </a>
        <Link
          href="/try"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-deep"
        >
          Try Sourcy
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="px-6 pb-24 pt-16 md:px-12 md:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <Image
            src="/sourcy-mascot.png"
            alt="Sourcy mascot"
            width={220}
            height={220}
            className="mb-6 h-44 w-44 object-contain md:h-52 md:w-52"
            priority
          />
          <h1 className="font-display text-balance text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Hey, I&apos;m Sourcy,
            <br />
            <span className="text-primary">The AI Procurement Agent.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Tell me what you need. I&apos;ll source it, negotiate it, and pay for it.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/try"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground shadow-sm transition hover:bg-primary-deep"
            >
              Try Sourcy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              I&apos;ve bought for teams at
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-12 gap-y-4 text-2xl font-display font-semibold text-muted-foreground/60">
              <span>YC</span>
              <span className="tracking-tighter">a16z</span>
              <span>Stripe</span>
              <span>Ramp</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:col-span-5 md:justify-end">
          <PhoneDemo />
        </div>
      </div>
    </section>
  );
}

/* ── Slide label component ── */
function SlideLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px w-6 bg-primary" />
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">{text}</span>
    </div>
  );
}

/* ── 1. THE PROBLEM ── */
function SectionProblem() {
  return (
    <section className="border-t border-border px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-start">
        <div>
          <SlideLabel text="The Problem" />
          <h2 className="font-display text-5xl md:text-6xl font-black leading-[1.0] tracking-tight text-foreground">
            The right supplier at the right price can transform a P&amp;L.
          </h2>
          <p className="mt-8 text-lg text-muted-foreground max-w-sm">
            Yet finance &amp; ops teams burn weeks on it: RFQs, supplier vetting, quote chasing, PO matching, invoice approvals, payment runs.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/40 mb-6">By the numbers</p>
          <div className="grid grid-cols-2 gap-px bg-border">
            {[
              { stat: "73%", label: "of buying time spent chasing quotes" },
              { stat: "21d", label: "average invoice cycle" },
              { stat: "$1.4T", label: "SMB indirect spend, p.a." },
              { stat: "60%+", label: "of buyers' day on paperwork" },
            ].map(({ stat, label }) => (
              <div key={stat} className="bg-background p-8">
                <p className="font-display text-5xl font-black text-primary">{stat}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-foreground/50">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base text-muted-foreground">
            Every team is at the bottom of someone else&apos;s sales funnel — and procurement is becoming exhausting.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── 2. ENTER SOURCY ── */
function SectionEnterSourcey() {
  const cards = [
    {
      tag: "RFQ",
      quote: '"Find me 3 quotes for 50,000 corrugated boxes, EU-shippable, by Friday."',
      detail: "→ shortlists vetted suppliers · runs RFQ · returns ranked bids",
    },
    {
      tag: "Renew",
      quote: '"Renegotiate our SaaS stack; cut 15% without losing seats."',
      detail: "→ benchmarks · drafts emails · routes for sign-off",
    },
    {
      tag: "Pay",
      quote: '"Pay all approved invoices under £10k tonight, FX-hedged."',
      detail: "→ matches PO · runs ACH/SWIFT · books the journal",
    },
    {
      tag: "Vet",
      quote: '"Onboard this new supplier — KYB, insurance, references."',
      detail: "→ pulls registries · flags risk · files the dossier",
    },
  ];

  return (
    <section className="border-t border-border px-6 py-24 md:px-12 bg-background">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-start">
        <div>
          <SlideLabel text="Enter Sourcy" />
          <h2 className="font-display text-5xl md:text-6xl font-black leading-[1.0] tracking-tight">
            Your buying team&apos;s smartest{" "}
            <span className="text-primary">colleague.</span>
          </h2>
          <p className="mt-8 text-lg text-muted-foreground max-w-sm">
            Tell Sourcy what you need. He sources, negotiates and pays — keeping you in the loop where it matters.
          </p>
          <div className="mt-10">
            <Image
              src="/sourcy-agent-v2.png"
              alt="Sourcy agent"
              width={200}
              height={200}
              className="w-40 rounded-full object-cover border-4 border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border">
          {cards.map((c) => (
            <div key={c.tag} className="bg-background p-6 border-l-2 border-primary">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">{c.tag}</p>
              <p className="font-display text-base font-bold text-foreground leading-snug mb-4">{c.quote}</p>
              <div className="h-px bg-border mb-4" />
              <p className="font-mono text-[10px] text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 3. WHY NOW — dark section ── */
function SectionWhyNow() {
  return (
    <section className="bg-[oklch(0.12_0.04_270)] text-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-6 bg-primary" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Why Now</span>
        </div>

        <h2 className="font-display text-5xl md:text-7xl font-black leading-[1.0] tracking-tight mb-8">
          <span className="text-primary">Agentic</span> Singularity, 2026.
        </h2>

        <p className="max-w-2xl text-lg text-white/60 mb-16">
          When an agent runs a procurement cycle better than most humans — and intelligence becomes a commodity —{" "}
          <span className="text-white font-medium">trusted rails</span> become the only thing that matters. Sourcy is an accountable agent: he acts on your behalf with audited, reversible authority over your spend.
        </p>

        <div className="grid grid-cols-3 gap-px bg-white/10">
          {[
            { stat: "∞", label: "Suppliers, every language" },
            { stat: "24/7", label: "Parallel negotiations" },
            { stat: "100%", label: "Audit-ready trail" },
          ].map(({ stat, label }) => (
            <div key={label} className="pt-8 pr-8">
              <div className="h-px bg-white/20 mb-6" />
              <p className="font-display text-5xl font-black text-white mb-2">{stat}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 4. THE MARKET ── */
function SectionMarket() {
  const competitors = [
    { name: "LevelPath", category: "Sourcing", desc: "AI-native procurement platform — assistant for intake & supplier management." },
    { name: "Coupa", category: "Spend Mgmt", desc: "AI Spend Classification — standardises & enriches data for predictive insight." },
    { name: "Ivalua", category: "Source-to-Pay", desc: "Generative-AI suite — Intelligent Virtual Assistant across the S2P cycle." },
    { name: "GEP", category: "S2P + Supply Chain", desc: "GEP SMART — end-to-end procurement with embedded GenAI." },
    { name: "Zycus", category: "Cognitive", desc: "Merlin AI Suite — automating strategic tasks; Merlin Assist conversational AI." },
    { name: "Globality", category: "Autonomous Sourcing", desc: '"Glo" bots — autonomous sourcing for marketing & services categories.' },
    { name: "Pactum AI", category: "Negotiation", desc: "Autonomous chatbots that negotiate contracts — long-tail supplier focus." },
    { name: "Exiger", category: "Risk", desc: "Maps complex supplier ecosystems; automates compliance at scale." },
    { name: "SAP Ariba", category: "Enterprise Network", desc: "Predictive analytics, guided buying, supplier-risk detection on the Ariba network." },
    { name: "Oro Labs", category: "Orchestration", desc: "Intelligent workflow orchestration for supplier onboarding & intake." },
  ];

  return (
    <section className="border-t border-border px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SlideLabel text="The Market Is Already Moving" />

        <div className="grid md:grid-cols-2 gap-12 items-end mb-12">
          <div>
            <h2 className="font-display text-5xl md:text-6xl font-black leading-[1.0] tracking-tight">
              The category is real.
            </h2>
            <p className="mt-4 text-xl font-semibold text-foreground/70">
              Incumbents have proven the demand — none have shipped what we have.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { stat: "$9.5B", label: "Procurement-software TAM" },
              { stat: "10+", label: "Funded AI-procurement players" },
              { stat: "$1B+", label: "Venture into the space, '23–'25" },
            ].map(({ stat, label }) => (
              <div key={stat}>
                <div className="h-px bg-border mb-4" />
                <p className="font-display text-3xl font-black text-primary">{stat}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/50">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border mb-10">
          {competitors.map((c) => (
            <div key={c.name} className="bg-background p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">{c.name}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-primary ml-2 text-right">{c.category}</p>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground max-w-3xl">
          Each one validates a slice — sourcing, classification, negotiation, risk, orchestration.{" "}
          <strong className="text-foreground">Sourcy is the first agent that ties all five into a single accountable loop, ending in payment.</strong>
        </p>
      </div>
    </section>
  );
}

/* ── 5. DEFENSIBILITY ── */
function SectionDefensibility() {
  const moats = [
    {
      num: "01",
      tag: "Negotiation IQ",
      title: "Better deals.",
      desc: "Every quote, term sheet and counter-offer trains the next negotiation. Win-rates climb with volume.",
    },
    {
      num: "02",
      tag: "Supplier graph",
      title: "Better matches.",
      desc: "Each onboarded supplier — verified, scored, instrumented — makes the next sourcing run faster and cheaper.",
    },
    {
      num: "03",
      tag: "Settlement rails",
      title: "Better economics.",
      desc: "As payment volume grows, Sourcy unlocks FX, factoring and dynamic-discount margin no SaaS tool can.",
    },
  ];

  return (
    <section className="border-t border-border px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SlideLabel text="A Compounding Moat" />
        <h2 className="font-display text-5xl md:text-6xl font-black leading-[1.0] tracking-tight mb-12">
          Sourcy&apos;s value compounds in{" "}
          <span className="text-primary">three</span> ways.
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-border mb-10">
          {moats.map((m) => (
            <div key={m.num} className="bg-background p-8 border-t-2 border-primary">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4">
                {m.num} / {m.tag}
              </p>
              <h3 className="font-display text-3xl font-black text-foreground mb-4">{m.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-base text-muted-foreground">
          Every transaction makes the next one cheaper, faster and safer — for the buyer <strong className="text-foreground">and</strong> the supplier.
        </p>
      </div>
    </section>
  );
}

/* ── 6. THE STACK ── */
function SectionStack() {
  const rails = [
    { num: "01", name: "Twilio", desc: "Interface · WhatsApp", tag: "Channel", highlight: false },
    { num: "02", name: "Vercel", desc: "Edge runtime & hosting", tag: "Platform", highlight: false },
    { num: "03", name: "Cursor", desc: "Build & ship velocity", tag: "Dev", highlight: false },
    { num: "04", name: "Anthropic · Claude Sonnet 4.6", desc: "Reasoning, tool use, negotiation", tag: "Brain", highlight: true },
    { num: "05", name: "Amazon", desc: "Supplier discovery & catalog", tag: "Source", highlight: false },
    { num: "06", name: "Visa", desc: "Card rails & corporate spend", tag: "Pay (fiat)", highlight: false },
    { num: "07", name: "Crossmint", desc: "Stablecoin checkout & wallets", tag: "Pay (crypto)", highlight: false },
    { num: "08", name: "USDC", desc: "Programmable settlement currency", tag: "Asset", highlight: false },
    { num: "09", name: "Base", desc: "Onchain settlement & audit trail", tag: "Settle", highlight: false },
  ];

  const chatMsgs = [
    { from: "user", text: "Need 50k corrugated boxes, EU-ship, by Fri." },
    { from: "agent", text: "On it. Pulling 14 vetted suppliers — ranking by lead time + price..." },
    { from: "agent", text: "Top 3: Smurfit €0.42 · DS Smith €0.39 · Mondi €0.41. Counter Mondi at €0.36?" },
    { from: "user", text: "Yes. Pay on delivery via USDC." },
    { from: "agent", text: "Done. PO #4827 sent. Escrow funded on Base. ✅" },
  ];

  return (
    <section className="border-t border-border px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-start">

        {/* Left */}
        <div>
          <SlideLabel text="The Stack" />
          <h2 className="font-display text-5xl md:text-6xl font-black leading-[1.0] tracking-tight mb-8">
            A <span className="text-primary">WhatsApp</span> message,<br />a global<br />procurement loop.
          </h2>
          <p className="text-lg text-muted-foreground max-w-sm mb-12">
            Buyers talk to Sourcy like a colleague. Sourcy reasons, sources, pays and reconciles — across nine best-in-class rails.
          </p>

          {/* Mini phone */}
          <div className="relative w-[240px]">
            <div className="rounded-[36px] border-[8px] border-neutral-800 bg-neutral-800 shadow-2xl">
              {/* Screen */}
              <div className="rounded-[28px] overflow-hidden bg-[#ece5dd]">
                {/* WA header */}
                <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Sourcy</p>
                    <p className="text-[9px] text-white/60">online · typing...</p>
                  </div>
                </div>
                {/* Messages */}
                <div className="px-3 py-3 space-y-2 bg-[#ece5dd]">
                  {chatMsgs.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[10px] leading-snug shadow-sm ${
                        m.from === "user" ? "bg-[#dcf8c6] text-neutral-800 rounded-tr-sm" : "bg-white text-neutral-800 rounded-tl-sm"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Input bar */}
                <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 rounded-full bg-white px-3 py-1.5 text-[9px] text-neutral-400">Message Sourcy...</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — rails list */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-6">
            From WhatsApp to settled USDC — nine rails, one agent
          </p>
          <div className="space-y-px">
            {rails.map((r) => (
              <div
                key={r.num}
                className={`flex items-center gap-4 px-4 py-3.5 border ${
                  r.highlight
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                <span className="font-mono text-[10px] text-foreground/30 w-6 shrink-0">{r.num}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${r.highlight ? "text-primary" : "text-foreground"}`}>{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded shrink-0 ${
                  r.highlight ? "bg-primary text-white" : "text-foreground/40"
                }`}>
                  {r.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 7. THE BET ── */
function SectionBet() {
  const predictions = [
    "AI agents handle the majority of B2B procurement decisions.",
    "Autonomous agents transact, settle and reconcile spend on behalf of their owners.",
    "Suppliers prefer selling to agents — predictable, fast-paying, well-specified.",
    "Pricing becomes dynamic and personalised at the contract level, not the SKU.",
    "A handful of agentic spend networks intermediate most B2B cash flow.",
    { text: "Sourcy is one of them.", bold: true },
  ];

  return (
    <section className="border-t border-border px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-start">
        <div>
          <SlideLabel text="Why You'll Want to Invest" />
          <h2 className="font-display text-5xl md:text-6xl font-black leading-[1.0] tracking-tight">
            Over the next{" "}
            <span className="text-primary">5–10</span> years...
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            An <span className="text-primary font-semibold">autonomous spend network</span> for the global economy.
          </p>

          <div className="mt-12">
            <Link
              href="/try"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground shadow-sm transition hover:bg-primary-deep"
            >
              Try Sourcy now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          {predictions.map((p, i) => {
            const text = typeof p === "string" ? p : p.text;
            const bold = typeof p === "object" && p.bold;
            return (
              <div key={i} className="flex gap-8 py-5 border-t border-border">
                <span className="font-display text-2xl font-black text-foreground/20 shrink-0 w-6">{i + 1}</span>
                <p className={`text-base leading-relaxed ${bold ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                  {text}
                </p>
              </div>
            );
          })}
          <div className="border-t border-border" />
          <p className="mt-8 text-xs font-mono uppercase tracking-widest text-foreground/30">
            Honest risks: buyer trust is hard-won, network density compounds past 20k suppliers, and pricing model is still in test.
          </p>
        </div>
      </div>
    </section>
  );
}
