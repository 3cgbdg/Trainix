import {
  Activity,
  Apple,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Dumbbell,
  Flame,
  Gauge,
  LayoutDashboard,
  ScanLine,
  Sparkles,
  Target,
  TrendingDown,
  Utensils,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

export const trainixScreens = ["dashboard", "analysis", "plan"] as const;
export type TrainixScreen = (typeof trainixScreens)[number];

const navigation = [
  { label: "Today", icon: LayoutDashboard, screen: "dashboard" },
  { label: "Plan", icon: Dumbbell, screen: "plan" },
  { label: "Body Scan", icon: Camera, screen: "analysis" },
  { label: "Progress", icon: Activity, screen: "progress" },
  { label: "Profile", icon: CircleUserRound, screen: "profile" },
] as const;

function Shell({ screen, children }: { screen: TrainixScreen; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-muted">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-surface px-4 py-5">
        <div className="flex items-center gap-2 px-2 text-strong">
          <Logo size={36} />
          <span className="font-outfit text-xl font-bold tracking-tight">Trainix</span>
          <span className="ml-auto rounded-full bg-brand-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-strong">AI</span>
        </div>
        <nav className="mt-10 space-y-1.5">
          {navigation.map((item) => {
            const active = item.screen === screen;
            const Icon = item.icon;
            return (
              <div key={item.label} className={cn("flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold", active ? "bg-brand-soft text-brand-strong" : "text-muted")}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </div>
            );
          })}
        </nav>
        <div className="mt-auto rounded-card border border-brand/15 bg-brand-soft/60 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-strong"><Sparkles size={16} className="text-brand" /> AI coach active</div>
          <p className="mt-2 text-xs leading-5 text-muted">Your plan adapts after every check-in.</p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-brand-strong"><span className="size-2 rounded-full bg-brand" /> Synced 2 min ago</div>
        </div>
      </aside>
      <main className="ml-64 min-h-screen px-8 py-7"><div className="mx-auto max-w-[1180px]">{children}</div></main>
    </div>
  );
}

function ScreenHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="mb-7 flex items-end justify-between gap-6">
      <div>
        <p className="flex items-center gap-2 text-sm font-bold text-brand-strong"><Sparkles size={16} /> {eyebrow}</p>
        <h1 className="mt-1 font-outfit text-4xl font-bold tracking-tight text-strong">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </header>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = "green" }: { label: string; value: string; detail: string; icon: typeof Activity; tone?: "green" | "amber" }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-strong">{value}</p><p className="mt-1 text-xs text-subtle">{detail}</p></div>
        <span className={cn("flex size-10 items-center justify-center rounded-full", tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-brand-soft text-brand-strong")}><Icon size={19} /></span>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <ScreenHeader
        eyebrow="AI performance overview"
        title="Good morning, Jordan"
        description="Your plan has been tuned from your latest body scan, recovery, and goal progress."
        action={<div className="rounded-control border border-border bg-surface px-4 py-3 text-sm font-semibold text-strong">Monday, Aug 24</div>}
      />
      <section className="grid gap-4 lg:grid-cols-[1.5fr_.72fr]">
        <div className="relative overflow-hidden rounded-card border border-brand/20 bg-brand-soft p-7">
          <div className="absolute -right-8 -top-16 size-72 rounded-full bg-brand/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-strong"><span className="flex size-8 items-center justify-center rounded-full bg-surface"><Zap size={17} /></span> AI-adjusted workout</div>
            <h2 className="mt-5 font-outfit text-3xl font-bold text-strong">Upper Body Strength</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">6 exercises · 42 minutes · moderate intensity. Shoulder volume reduced after your latest mobility check.</p>
            <div className="mt-5 flex gap-3">
              <div className="rounded-control bg-brand px-5 py-3 text-sm font-bold text-on-brand">Start workout</div>
              <div className="rounded-control border border-border bg-surface px-5 py-3 text-sm font-bold text-strong">View AI rationale</div>
            </div>
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-6">
          <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-muted">Daily nutrition</p><p className="mt-2 text-2xl font-bold text-strong">1,840 <span className="text-sm font-medium text-subtle">/ 2,350 kcal</span></p></div><span className="flex size-11 items-center justify-center rounded-full bg-amber-50 text-amber-700"><Apple size={20} /></span></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-strong"><div className="h-full w-[78%] rounded-full bg-brand" /></div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div><p className="font-bold text-strong">132g</p><p className="text-[11px] text-subtle">Protein</p></div><div><p className="font-bold text-strong">188g</p><p className="text-[11px] text-subtle">Carbs</p></div><div><p className="font-bold text-strong">54g</p><p className="text-[11px] text-subtle">Fats</p></div></div>
        </div>
      </section>
      <section className="mt-4 grid grid-cols-4 gap-3">
        <Stat label="Current weight" value="78.4 kg" detail="−1.8 kg this month" icon={TrendingDown} />
        <Stat label="Body fat" value="18.6%" detail="−1.2% from baseline" icon={Gauge} />
        <Stat label="Training streak" value="12 days" detail="Personal best: 18" icon={Flame} tone="amber" />
        <Stat label="Goal progress" value="72%" detail="On track for Oct 12" icon={Target} />
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-card border border-border bg-surface p-6">
          <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-strong">Body composition trend</h2><p className="mt-1 text-xs text-muted">AI analysis across your last six check-ins</p></div><span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-strong">Improving</span></div>
          <div className="relative mt-5 h-32 overflow-hidden rounded-control bg-surface-muted px-4 pt-3">
            <svg className="h-full w-full" viewBox="0 0 640 120" preserveAspectRatio="none"><defs><linearGradient id="trainixTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--brand)" stopOpacity=".25"/><stop offset="1" stopColor="var(--brand)" stopOpacity="0"/></linearGradient></defs><path d="M0 92 C80 84 110 88 170 68 S270 74 330 51 S430 59 485 36 S575 31 640 16 L640 120 L0 120Z" fill="url(#trainixTrend)"/><path d="M0 92 C80 84 110 88 170 68 S270 74 330 51 S430 59 485 36 S575 31 640 16" fill="none" stroke="var(--brand)" strokeWidth="3"/></svg>
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-lg font-bold text-strong">AI coach insights</h2>
          <div className="mt-4 space-y-3">
            {["Recovery score is up 8%", "Protein target met 5/7 days", "Next body scan due Friday"].map((item) => <div key={item} className="flex items-center gap-3 text-sm text-muted"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Check size={15} /></span>{item}</div>)}
          </div>
        </div>
      </section>
    </>
  );
}

function Analysis() {
  const metrics = [
    ["Body fat", "18.6%", "−1.2%"], ["Muscle mass", "61.8 kg", "+0.9 kg"], ["Waist / hip", "0.84", "Healthy"], ["Posture", "92 / 100", "+4 pts"],
  ];
  return (
    <>
      <ScreenHeader eyebrow="Computer vision body analysis" title="Your body scan is ready" description="Trainix analyzed your latest check-in and translated the results into practical training adjustments." action={<div className="rounded-control bg-brand px-5 py-3 text-sm font-bold text-on-brand">Update scan</div>} />
      <div className="grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
        <section className="relative min-h-[560px] overflow-hidden rounded-card border border-brand/20 bg-brand-soft p-6">
          <div className="flex items-center justify-between"><span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-brand-strong">SCAN 04</span><span className="flex items-center gap-2 text-xs font-semibold text-brand-strong"><span className="size-2 rounded-full bg-brand" /> Analysis complete</span></div>
          <div className="relative mx-auto mt-8 h-[380px] w-56">
            <div className="absolute inset-x-8 top-5 h-16 rounded-full bg-brand/20" />
            <div className="absolute left-1/2 top-20 h-56 w-28 -translate-x-1/2 rounded-[45%_45%_30%_30%] bg-gradient-to-b from-brand/30 to-brand/10" />
            <div className="absolute left-6 top-28 h-52 w-12 rotate-6 rounded-full bg-brand/15" />
            <div className="absolute right-6 top-28 h-52 w-12 -rotate-6 rounded-full bg-brand/15" />
            <div className="absolute left-14 top-[280px] h-28 w-14 rounded-full bg-brand/15" />
            <div className="absolute right-14 top-[280px] h-28 w-14 rounded-full bg-brand/15" />
            <div className="absolute inset-0 border-x border-brand/20" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-brand/30" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-brand/20" />
            <span className="absolute left-0 top-20 size-3 rounded-full border-2 border-surface bg-brand" /><span className="absolute right-0 top-44 size-3 rounded-full border-2 border-surface bg-brand" /><span className="absolute left-5 bottom-12 size-3 rounded-full border-2 border-surface bg-brand" />
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-brand-strong"><ScanLine size={18} /> 14 body landmarks tracked</div>
        </section>
        <div className="space-y-4">
          <section className="rounded-card border border-border bg-surface p-6">
            <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-muted">Overall progress</p><p className="mt-1 font-outfit text-3xl font-bold text-strong">Strong momentum</p></div><span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><TrendingDown size={22} /></span></div>
            <p className="mt-3 text-sm leading-6 text-muted">You’re gaining lean mass while reducing body fat. Your plan is working—no major changes needed this week.</p>
          </section>
          <section className="grid grid-cols-2 gap-3">
            {metrics.map(([label, value, delta]) => <div key={label} className="rounded-card border border-border bg-surface p-5"><p className="text-xs font-semibold text-muted">{label}</p><div className="mt-2 flex items-end justify-between gap-3"><p className="text-2xl font-bold text-strong">{value}</p><span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-strong">{delta}</span></div></div>)}
          </section>
          <section className="rounded-card border border-border bg-surface p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-strong">Plan adjustments</h2><p className="mt-1 text-xs text-muted">Generated from this scan</p></div><Sparkles size={21} className="text-brand" /></div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[{ icon: Dumbbell, title: "Training", text: "Increase posterior-chain volume by 8%" }, { icon: Utensils, title: "Nutrition", text: "Add 18g protein on training days" }, { icon: Activity, title: "Recovery", text: "Keep one mobility session this week" }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-control bg-surface-muted p-4"><Icon size={18} className="text-brand-strong"/><p className="mt-3 text-sm font-bold text-strong">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{text}</p></div>)}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Plan() {
  const days = [
    { day: "Mon", title: "Upper Body Strength", meta: "6 exercises · 42 min", status: "Completed" },
    { day: "Tue", title: "Mobility & Core", meta: "5 exercises · 28 min", status: "Completed" },
    { day: "Wed", title: "Lower Body Power", meta: "7 exercises · 48 min", status: "Today" },
    { day: "Thu", title: "Active Recovery", meta: "3 exercises · 22 min", status: "Up next" },
    { day: "Fri", title: "Full Body Circuit", meta: "8 exercises · 45 min", status: "Scheduled" },
  ];
  return (
    <>
      <ScreenHeader eyebrow="AI-generated training plan" title="Your adaptive week" description="A structured program built around your goal, current body composition, schedule, and recovery." action={<div className="rounded-control border border-border bg-surface px-4 py-3 text-sm font-bold text-strong">Week 4 of 8</div>} />
      <section className="relative overflow-hidden rounded-card border border-brand/20 bg-brand-soft p-7">
        <div className="absolute -right-12 -top-24 size-72 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_20rem]">
          <div><div className="flex items-center gap-2 text-sm font-bold text-brand-strong"><Sparkles size={17} /> Personalized by Trainix AI</div><h2 className="mt-4 font-outfit text-3xl font-bold text-strong">Build strength. Reach 75 kg.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">4 training days · balanced upper/lower split · progressive overload adjusted weekly from your scan data.</p></div>
          <div className="rounded-card border border-brand/15 bg-surface/85 p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-muted">Weekly progress</p><p className="mt-1 text-2xl font-bold text-strong">2 of 5 sessions</p></div><CheckCircle2 size={24} className="text-brand" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-strong"><div className="h-full w-[40%] bg-brand" /></div></div>
        </div>
      </section>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-card border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold text-strong">This week</h2><p className="mt-1 text-xs text-muted">Aug 24–30 · 3h 05m total</p></div><CalendarDays size={21} className="text-brand" /></div>
          <div className="space-y-2.5">
            {days.map((item, index) => <div key={item.day} className={cn("grid grid-cols-[3rem_1fr_auto_auto] items-center gap-4 rounded-control border px-4 py-3", index === 2 ? "border-brand bg-brand-soft/60" : "border-border bg-surface")}><div className={cn("flex size-10 items-center justify-center rounded-full text-sm font-bold", index <= 2 ? "bg-brand text-on-brand" : "bg-surface-muted text-muted")}>{item.day}</div><div><p className="text-sm font-bold text-strong">{item.title}</p><p className="mt-0.5 text-xs text-subtle">{item.meta}</p></div><span className={cn("rounded-full px-3 py-1 text-xs font-bold", item.status === "Today" ? "bg-brand-soft text-brand-strong" : item.status === "Completed" ? "bg-surface-muted text-muted" : "text-subtle")}>{item.status}</span><ChevronRight size={17} className="text-subtle" /></div>)}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5"><h2 className="text-lg font-bold text-strong">Plan intelligence</h2><div className="mt-4 space-y-4">{[["Volume", "Optimal", "84%"], ["Recovery", "Strong", "91%"], ["Adherence", "On track", "88%"]].map(([label, value, width]) => <div key={label}><div className="flex justify-between text-xs"><span className="font-semibold text-muted">{label}</span><span className="font-bold text-strong">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-brand" style={{ width }} /></div></div>)}</div></div>
          <div className="rounded-card border border-border bg-surface p-5"><div className="flex items-center gap-2 text-sm font-bold text-strong"><Sparkles size={17} className="text-brand" /> Next AI review</div><p className="mt-2 text-xs leading-5 text-muted">After Friday’s session, based on performance and recovery.</p><div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-strong">See adaptation history <ArrowRight size={14}/></div></div>
        </aside>
      </div>
    </>
  );
}

export function TrainixShowcase({ screen }: { screen: TrainixScreen }) {
  return <Shell screen={screen}>{screen === "dashboard" ? <Dashboard /> : screen === "analysis" ? <Analysis /> : <Plan />}</Shell>;
}
