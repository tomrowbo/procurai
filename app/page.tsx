import { PhoneDemo } from "@/components/PhoneDemo";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
    </div>
  );
}

function Nav() {
  return (
    <header className="px-6 pt-6 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="h-4.5 w-4.5" strokeWidth={2.2} />
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
