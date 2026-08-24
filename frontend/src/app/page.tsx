import { Apple, Camera, ChartSpline, Dumbbell, ScanLine, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/LinkButton";
import { Logo } from "@/components/ui/Logo";
import { Surface } from "@/components/ui/Surface";

export const metadata: Metadata = {
  title: "AI Fitness & Nutrition Coaching",
  description: "Upload one photo and Trainix builds your personalized workout plan, nutrition plan, and progress tracking — powered by AI.",
};

const FEATURES = [
  {
    title: "AI body scan",
    description: "Upload one photo and Trainix estimates your body composition — the baseline everything else is built from.",
    icon: ScanLine,
  },
  {
    title: "Personalized workouts",
    description: "A 28-day plan built around your level, goal, and schedule — not a generic template everyone gets.",
    image: "/images/workout.jpg",
  },
  {
    title: "Smart nutrition",
    description: "Daily meals and macros matched to your plan, with water and calorie tracking built in.",
    image: "/images/nutrition.jpg",
  },
  {
    title: "Real progress tracking",
    description: "Streaks, trends, and check-in photos over time, so you can see the direction — not just today.",
    image: "/images/progress.jpg",
  },
] as const;

const STEPS = [
  { title: "Upload a photo", description: "One clear, full-body photo is all the AI needs for your baseline." },
  { title: "Get your plan", description: "A workout and nutrition plan built around your body, goal, and level — ready in under a minute." },
  { title: "Train, eat, track", description: "Follow your daily plan and watch your streak, weight, and body composition move." },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-1.5 text-green ${className}`}>
      <Logo size={32} />
      <span className="relative top-0.5 font-outfit text-2xl font-bold leading-none">Trainix</span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-canvas/85 backdrop-blur">
        <div className="_container flex h-16 items-center justify-between">
          <Wordmark />
          <nav className="flex items-center gap-2">
            <LinkButton href="/auth/login" variant="ghost" size="sm">Login</LinkButton>
            <LinkButton href="/auth/signup" variant="primary" size="sm">Sign up free</LinkButton>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="_container relative overflow-hidden pb-16 pt-14 sm:pb-24 sm:pt-20">
          <div aria-hidden="true" className="absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
              <Sparkles size={14} /> AI-powered fitness coaching
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-strong sm:text-5xl">
              Your body, your plan — built from one photo
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
              Trainix turns a single photo into a personalized workout and nutrition plan, then keeps it honest with real progress tracking. No generic templates.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="/auth/signup" size="lg" leadingIcon={<Sparkles size={18} />}>Start free</LinkButton>
              <LinkButton href="/auth/login" variant="secondary" size="lg">Login</LinkButton>
            </div>
            <p className="mt-4 text-xs text-subtle">Free to start · no credit card required</p>
          </div>
        </section>

        {/* Features */}
        <section className="_container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-strong sm:text-3xl">Everything you need, tailored to you</h2>
            <p className="mt-3 text-muted">Four pieces that work together instead of four separate apps to juggle.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Surface key={feature.title} padding="none" className="overflow-hidden">
                {"image" in feature ? (
                  <div className="relative h-40 w-full">
                    <Image src={feature.image} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-brand-soft">
                    <feature.icon size={40} className="text-brand-strong" strokeWidth={1.5} />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-strong">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{feature.description}</p>
                </div>
              </Surface>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-surface-muted/60 py-16 sm:py-20">
          <div className="_container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-strong sm:text-3xl">Three steps, not thirty</h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="rounded-card border border-border bg-surface p-6">
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">{index + 1}</span>
                  <h3 className="mt-4 text-base font-bold text-strong">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust row */}
        <section className="_container py-16 sm:py-20">
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <Camera size={22} className="text-brand-strong" />
              <p className="text-sm text-muted">Your check-in photos stay private — never shown publicly.</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Dumbbell size={22} className="text-brand-strong" />
              <p className="text-sm text-muted">Plans adjust to your fitness level, not the other way around.</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <ChartSpline size={22} className="text-brand-strong" />
              <p className="text-sm text-muted">One dashboard for workouts, meals, and progress — no app-switching.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="_container pb-20">
          <div className="mx-auto max-w-3xl rounded-card border border-brand/20 bg-brand-soft px-6 py-12 text-center sm:px-12">
            <Apple size={28} className="mx-auto text-brand-strong" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-strong sm:text-3xl">Ready to see your plan?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">It takes one photo and about a minute. Free to start.</p>
            <div className="mt-6">
              <LinkButton href="/auth/signup" size="lg" leadingIcon={<Sparkles size={18} />}>Start free</LinkButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="_container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Wordmark />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/terms" className="hover:text-strong">Terms</Link>
            <Link href="/privacy" className="hover:text-strong">Privacy</Link>
            <Link href="/auth/login" className="hover:text-strong">Login</Link>
          </div>
          <p className="text-xs text-subtle">© {new Date().getFullYear()} Trainix</p>
        </div>
      </footer>
    </div>
  );
}
