"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity, Apple, ArrowRight, Camera, CheckCircle2, ChevronRight, Dumbbell,
  Flame, Scale, Sparkles, Target, TrendingDown, TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";
import { api } from "@/api/axiosInstance";
import { ErrorState, Skeleton } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/LinkButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Surface } from "@/components/ui/Surface";
import { useAppSelector } from "@/hooks/reduxHooks";
import { cn } from "@/lib/cn";

type DashboardNumbers = {
  hasPlan?: boolean;
  weight?: number;
  lastWeight?: number;
  bmi?: number;
  streak?: number;
  calories?: { current?: number; target?: number | null } | null;
  weightsData?: Array<{ month: string; weight: number }>;
};

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  tone?: "neutral" | "positive" | "warning";
};

const toneClasses = {
  neutral: "bg-surface-muted text-muted",
  positive: "bg-brand-soft text-brand-strong",
  warning: "bg-amber-50 text-amber-700",
};

async function getDashboardNumbers() {
  const response = await api.get<DashboardNumbers>("/api/fitness-plan/reports/numbers", {
    params: { date: new Date().toISOString() },
  });
  return response.data;
}

function formatNumber(value: number | undefined, suffix = "") {
  return Number.isFinite(value) ? `${value}${suffix}` : "—";
}

function getBmiLabel(value: number | undefined) {
  if (!Number.isFinite(value)) return "Awaiting a measurement";
  if (value! < 18.5) return "Below healthy range";
  if (value! < 25) return "Healthy range";
  if (value! < 30) return "Above healthy range";
  return "High range";
}

function MetricCard({ label, value, detail, icon: Icon, tone = "neutral" }: MetricCardProps) {
  return (
    <Surface padding="sm" className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-strong">{value}</p>
          <p className="mt-1 text-xs leading-5 text-subtle">{detail}</p>
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon aria-hidden="true" size={19} />
        </span>
      </div>
    </Surface>
  );
}

function WeightTrend({ data = [] }: { data?: DashboardNumbers["weightsData"] }) {
  const validData = data.filter((item) => Number.isFinite(item.weight));

  if (validData.length < 2) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-control border border-dashed border-border-strong bg-surface-muted px-6 text-center">
        <p className="max-w-sm text-sm leading-6 text-muted">Add another body measurement to unlock your weight trend.</p>
      </div>
    );
  }

  const weights = validData.map((item) => item.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = Math.max(max - min, 1);
  const points = validData.map((item, index) => {
    const x = (index / (validData.length - 1)) * 100;
    const y = 86 - ((item.weight - min) / range) * 64;
    return `${x},${y}`;
  }).join(" ");

  return (
    <figure aria-label="Weight trend over the available months">
      <svg viewBox="0 0 100 100" role="img" className="h-48 w-full overflow-visible" preserveAspectRatio="none">
        <title>Weight trend from {validData[0].weight} to {validData.at(-1)?.weight} kilograms</title>
        <defs>
          <linearGradient id="weight-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M ${points} L 100,94 L 0,94 Z`} fill="url(#weight-area)" vectorEffect="non-scaling-stroke" />
        <polyline points={points} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mt-2 flex justify-between gap-3 text-xs font-medium text-subtle">
        {validData.map((item) => <span key={`${item.month}-${item.weight}`}>{item.month}</span>)}
      </figcaption>
    </figure>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-label="Loading your day" className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-32" />)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { initialized, user } = useAppSelector((state) => state.auth);
  const nutritionDay = useAppSelector((state) => state.nutritionDay.nutritionDay);
  const workouts = useAppSelector((state) => state.workouts.workouts);
  const todayIndex = workouts?.todayWorkoutNumber ?? 0;
  const todayWorkout = workouts?.items?.[todayIndex];
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-numbers", new Date().toISOString().slice(0, 10)],
    queryFn: getDashboardNumbers,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: Boolean(user),
  });

  if (!initialized || !user || isLoading) return <DashboardSkeleton />;

  const calorieCurrent = nutritionDay?.dailyGoals?.calories?.current ?? data?.calories?.current ?? 0;
  const calorieTarget = nutritionDay?.dailyGoals?.calories?.target ?? data?.calories?.target ?? 0;
  const exerciseCount = todayWorkout?.exercises?.length ?? 0;
  const timedSeconds = todayWorkout?.exercises?.reduce((sum, exercise) => sum + (exercise.time ?? 0), 0) ?? 0;
  const estimatedMinutes = Math.max(Math.round(timedSeconds / 60), exerciseCount * 4);
  const weightChange = data?.weight && data.lastWeight ? data.weight - data.lastWeight : undefined;
  const WeightDirection = weightChange !== undefined && weightChange <= 0 ? TrendingDown : TrendingUp;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-strong">Your daily focus</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Good to see you, {user.firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">One clear workout, balanced nutrition, and a small win today.</p>
        </div>
        <LinkButton href="/progress" variant="secondary" leadingIcon={<Activity size={18} />} className="w-full sm:w-auto">View progress</LinkButton>
      </header>

      {isError ? (
        <Surface><ErrorState title="Your latest metrics are unavailable" description="Your plan is still ready. Try loading the metrics again when your connection is stable." onRetry={() => void refetch()} /></Surface>
      ) : null}

      <section aria-labelledby="today-focus-title" className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)]">
        <Surface variant="brand" padding="lg" className="relative overflow-hidden">
          <div aria-hidden="true" className="absolute -right-16 -top-24 size-72 rounded-full bg-brand/10 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
                <span className="flex size-8 items-center justify-center rounded-full bg-surface"><Dumbbell size={17} /></span>
                Today’s workout
              </div>
              <h2 id="today-focus-title" className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-strong sm:text-4xl">{todayWorkout?.day ?? "Your next training session"}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
                {todayWorkout ? `${exerciseCount} exercises · about ${estimatedMinutes} minutes · built for your ${user.fitnessLevel.toLowerCase()} level.` : "Create your personalized plan to turn today into a focused, achievable session."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href={todayWorkout ? `/workout/${todayIndex + 1}` : "/ai-analysis"} size="lg" leadingIcon={todayWorkout ? <Dumbbell size={19} /> : <Sparkles size={19} />} className="w-full sm:w-auto">
                {todayWorkout ? "Start workout" : "Create my plan"}
              </LinkButton>
              {todayWorkout ? <LinkButton href="/workout-plan" size="lg" variant="secondary" className="w-full sm:w-auto">See weekly plan</LinkButton> : null}
            </div>
          </div>
        </Surface>

        <Surface padding="lg" className="flex flex-col justify-between gap-8">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted">Nutrition today</p>
                <p className="mt-1 text-2xl font-bold text-strong">{calorieCurrent.toLocaleString()} <span className="text-sm font-medium text-subtle">/ {calorieTarget ? calorieTarget.toLocaleString() : "—"} kcal</span></p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-full bg-amber-50 text-amber-700"><Apple size={20} /></span>
            </div>
            <ProgressBar className="mt-5" value={calorieCurrent} max={calorieTarget} label="Daily calorie progress" />
            <p className="mt-3 text-sm text-muted">{calorieTarget ? `${Math.max(calorieTarget - calorieCurrent, 0).toLocaleString()} kcal remaining` : "Generate a meal plan for today"}</p>
          </div>
          <LinkButton href="/nutrition-plan" variant="secondary" className="w-full justify-between">Open nutrition <ArrowRight size={18} /></LinkButton>
        </Surface>
      </section>

      <section aria-labelledby="metrics-title">
        <div className="mb-4">
          <h2 id="metrics-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">At a glance</h2>
          <p className="mt-1 text-sm text-muted">The numbers that matter today.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Current weight" value={formatNumber(data?.weight, " kg")} detail={weightChange === undefined ? "Add weekly measurements" : `${Math.abs(weightChange).toFixed(1)} kg since last check-in`} icon={WeightDirection} tone={weightChange !== undefined ? "positive" : "neutral"} />
          <MetricCard label="BMI" value={Number.isFinite(data?.bmi) ? data!.bmi!.toFixed(1) : "—"} detail={getBmiLabel(data?.bmi)} icon={Scale} tone={data?.bmi && data.bmi >= 18.5 && data.bmi < 25 ? "positive" : "neutral"} />
          <MetricCard label="Current streak" value={formatNumber(data?.streak ?? workouts?.streak, " days")} detail={`Personal best: ${user.longestStreak ?? 0} days`} icon={Flame} tone="warning" />
          <MetricCard label="Today’s plan" value={todayWorkout?.status ?? "Not started"} detail={todayWorkout ? `${exerciseCount} exercises ready` : "Create a plan to begin"} icon={todayWorkout?.status === "Completed" ? CheckCircle2 : Target} tone={todayWorkout?.status === "Completed" ? "positive" : "neutral"} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <Surface padding="lg">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div><h2 className="text-xl font-bold tracking-tight text-strong">Weight trend</h2><p className="mt-1 text-sm text-muted">A calm view of your recent direction—not a daily judgment.</p></div>
            <Scale className="shrink-0 text-brand" size={21} />
          </div>
          <WeightTrend data={data?.weightsData} />
        </Surface>

        <Surface padding="lg">
          <h2 className="text-xl font-bold tracking-tight text-strong">Keep momentum</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Two useful next steps when you have a minute.</p>
          <div className="mt-6 space-y-2">
            <LinkButton href="/ai-analysis" variant="ghost" className="w-full justify-start px-2" leadingIcon={<Camera size={19} />}><span className="flex flex-1 items-center justify-between">Update body scan <ChevronRight size={17} /></span></LinkButton>
            <LinkButton href="/progress" variant="ghost" className="w-full justify-start px-2" leadingIcon={<Activity size={19} />}><span className="flex flex-1 items-center justify-between">Review progress <ChevronRight size={17} /></span></LinkButton>
          </div>
        </Surface>
      </section>
    </div>
  );
}
