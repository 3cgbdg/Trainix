import { Apple, Camera, ChartSpline, Dumbbell, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/LinkButton";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Adaptive AI Fitness Coaching",
  description: "Trainix combines AI body analysis, adaptive workouts, personalized nutrition, and progress tracking in one coaching dashboard.",
};

const SHOWCASE = [
  {
    title: "Your adaptive week, already organized",
    description: "See every workout, recovery day, duration, and completion state in one plan that stays connected to your goal.",
    image: "/images/app-workout-plan.png",
  },
  {
    title: "Computer vision that changes the plan",
    description: "Each scan turns body metrics and visible progress into clear training, nutrition, and recovery adjustments.",
    image: "/images/app-ai-analysis.png",
  },
] as const;

const STEPS = [
  { title: "Create your baseline", description: "Add your goal and one clear body photo so the AI can understand where you are starting." },
  { title: "Get an adaptive plan", description: "Trainix connects your scan, fitness level, target, workouts, and nutrition into one practical week." },
  { title: "Train, check in, adapt", description: "Complete the plan, track progress, and let every new check-in sharpen what comes next." },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-1.5 text-green ${className}`}>
      <Logo size={32} />
      <span className="relative top-0.5 font-outfit text-2xl font-bold leading-none">Trainix</span>
    </Link>
  );
}

function AppFrame({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-strong/10 ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-4 py-2.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-border-strong" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-border-strong" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-border-strong" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 1024px) 90vw, 640px"
        className="h-auto w-full"
      />
    </div>
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
        <section className="_container relative overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-20">
          <div aria-hidden="true" className="absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-none lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
                <Sparkles size={14} /> Adaptive AI fitness coaching
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-strong sm:text-5xl">
                One AI coach for your body, training, and nutrition
              </h1>
              <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
                Trainix turns body scans and daily progress into workouts, nutrition, and next-step coaching that keeps adapting with you. No disconnected trackers or generic templates.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <LinkButton href="/auth/signup" size="lg" leadingIcon={<Sparkles size={18} />}>Start free</LinkButton>
                <LinkButton href="/auth/login" variant="secondary" size="lg">Login</LinkButton>
              </div>
              <p className="mt-4 text-xs text-subtle">Free to start · no credit card required</p>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
              <div aria-hidden="true" className="absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2rem] bg-brand/5 blur-2xl" />
              <AppFrame
                src="/images/app-workout-plan.png"
                alt=""
                width={1280}
                height={900}
                className="absolute -right-4 -top-6 hidden w-[85%] rotate-2 opacity-90 sm:block lg:-right-8 lg:-top-8"
              />
              <AppFrame
                src="/images/app-dashboard.png"
                alt="The Trainix dashboard showing today's workout, nutrition progress, and weight trend"
                width={1280}
                height={900}
                priority
                className="relative -rotate-1"
              />
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section className="border-y border-border bg-surface-muted/60 py-16 sm:py-20">
          <div className="_container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-strong sm:text-3xl">This is the actual app</h2>
              <p className="mt-3 text-muted">Not a mockup — the same workout and nutrition screens you land in after signing up.</p>
            </div>
            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-8">
              {SHOWCASE.map((item) => (
                <div key={item.title}>
                  <AppFrame src={item.image} alt="" width={1280} height={800} />
                  <h3 className="mt-5 text-lg font-bold text-strong">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="_container py-16 sm:py-20">
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
        </section>

        {/* Trust row */}
        <section className="_container pb-16 pt-2 sm:pb-20">
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
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-strong sm:text-3xl">Start with a scan. Keep adapting.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Build your first personalized week today, then let every workout and check-in make the next one smarter.</p>
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
