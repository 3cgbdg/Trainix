"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Camera, Flame, Percent, Scale, TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";
import { api } from "@/api/axiosInstance";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/LinkButton";
import { Surface } from "@/components/ui/Surface";
import { TrendChart, type TrendPoint } from "@/components/ui/TrendChart";
import { useAppSelector } from "@/hooks/reduxHooks";

type ProgressData = {
  weight?: number;
  lastWeight?: number | null;
  bmi?: number;
  bodyFat?: number;
  streak?: number;
  longestStreak?: number;
  weightsData?: Array<{ month: string; weight: number }>;
  fatsData?: Array<{ month: string; bodyFat: number }>;
  bmiData?: Array<{ month: string; bmi: number }>;
  imagesData?: Array<{ date: string; imageUrl: string }>;
};

type MetricProps = {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ size?: number }>;
};

async function getProgress(signal?: AbortSignal) {
  const response = await api.get<ProgressData>("/api/fitness-plan/reports/numbers", {
    params: { date: new Date().toISOString(), progress: true },
    signal,
  });
  return response.data;
}

function formatDelta(value: number | undefined, unit = "") {
  if (!Number.isFinite(value)) return "No earlier check-in";
  if (value === 0) return "No change since last check-in";
  return `${value! > 0 ? "+" : ""}${value!.toFixed(1)}${unit} since last check-in`;
}

function Metric({ label, value, detail, icon: Icon }: MetricProps) {
  return (
    <Surface padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-strong">{value}</p><p className="mt-1 text-xs leading-5 text-subtle">{detail}</p></div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Icon size={19} /></span>
      </div>
    </Surface>
  );
}

function ProgressSkeleton() {
  return <div className="space-y-6"><Skeleton className="h-20" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-32" />)}</div><Skeleton className="h-80" /></div>;
}

export default function ProgressPage() {
  const { initialized, user } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["progress", new Date().toISOString().slice(0, 10)],
    queryFn: ({ signal }) => getProgress(signal),
    enabled: initialized && Boolean(user),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (!initialized || !user || isLoading) return <ProgressSkeleton />;
  if (isError || !data) return <Surface><ErrorState title="Your progress could not be loaded" description="Your saved check-ins are safe. Try again when the connection is stable." onRetry={() => void refetch()} /></Surface>;

  const weightDelta = data.weight !== undefined && data.lastWeight != null ? data.weight - data.lastWeight : undefined;
  const previousFat = data.fatsData?.at(-2)?.bodyFat;
  const fatDelta = data.bodyFat !== undefined && previousFat !== undefined ? data.bodyFat - previousFat : undefined;
  const previousBmi = data.bmiData?.at(-2)?.bmi;
  const bmiDelta = data.bmi !== undefined && previousBmi !== undefined ? data.bmi - previousBmi : undefined;
  const WeightIcon = weightDelta !== undefined && weightDelta <= 0 ? TrendingDown : TrendingUp;
  const weightTrend: TrendPoint[] = (data.weightsData ?? []).map((point) => ({ label: point.month, values: { weight: point.weight } }));
  const compositionByMonth = new Map<string, TrendPoint>();
  for (const point of data.fatsData ?? []) compositionByMonth.set(point.month, { label: point.month, values: { bodyFat: point.bodyFat } });
  for (const point of data.bmiData ?? []) {
    const existing = compositionByMonth.get(point.month);
    compositionByMonth.set(point.month, { label: point.month, values: { ...(existing?.values ?? {}), bmi: point.bmi } });
  }
  const compositionTrend = [...compositionByMonth.values()];

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-brand-strong">Long-term direction</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Your progress</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">Look for the trend, not perfection in a single day.</p></div>
        <LinkButton href="/ai-analysis" variant="secondary" leadingIcon={<Camera size={18} />} className="w-full sm:w-auto">New check-in</LinkButton>
      </header>

      <section aria-labelledby="progress-metrics-title">
        <h2 id="progress-metrics-title" className="sr-only">Current progress metrics</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Current weight" value={Number.isFinite(data.weight) ? `${data.weight} kg` : "—"} detail={formatDelta(weightDelta, " kg")} icon={WeightIcon} />
          <Metric label="Body fat" value={Number.isFinite(data.bodyFat) ? `${data.bodyFat}%` : "—"} detail={formatDelta(fatDelta, "%")} icon={Percent} />
          <Metric label="BMI" value={Number.isFinite(data.bmi) ? data.bmi!.toFixed(1) : "—"} detail={formatDelta(bmiDelta)} icon={Scale} />
          <Metric label="Workout streak" value={`${data.streak ?? 0} days`} detail={`Personal best: ${data.longestStreak ?? user.longestStreak ?? 0} days`} icon={Flame} />
        </div>
      </section>

      <section aria-labelledby="trends-title">
        <div className="mb-4"><h2 id="trends-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">Progress trends</h2><p className="mt-1 text-sm text-muted">Monthly check-ins smooth out everyday fluctuations.</p></div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Surface padding="lg"><div className="mb-5"><h3 className="font-bold text-strong">Weight</h3><p className="mt-1 text-xs leading-5 text-muted">Body weight across recent check-ins.</p></div><TrendChart data={weightTrend} series={[{ key: "weight", label: "Weight (kg)", color: "var(--brand)" }]} ariaLabel="Weight trend across recent months" /></Surface>
          <Surface padding="lg"><div className="mb-5"><h3 className="font-bold text-strong">Body composition</h3><p className="mt-1 text-xs leading-5 text-muted">BMI and body fat across recent check-ins.</p></div><TrendChart data={compositionTrend} series={[{ key: "bmi", label: "BMI", color: "var(--brand)" }, { key: "bodyFat", label: "Body fat (%)", color: "var(--warning)" }]} ariaLabel="BMI and body fat trend across recent months" /></Surface>
        </div>
      </section>

      <section aria-labelledby="photos-title">
        <div className="mb-4"><h2 id="photos-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">Progress photos</h2><p className="mt-1 text-sm text-muted">Private visual check-ins, shown in chronological context.</p></div>
        {data.imagesData?.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {data.imagesData.map((item, index) => (
              <Surface key={`${item.date}-${item.imageUrl}`} padding="none" className="overflow-hidden">
                <div className="relative aspect-[3/4] bg-surface-muted"><Image fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw" className="object-cover object-top" src={item.imageUrl} alt={`Body check-in from ${item.date}`} priority={index < 2} /></div>
                <p className="px-3 py-3 text-xs font-medium text-muted">{item.date}</p>
              </Surface>
            ))}
          </div>
        ) : <Surface><EmptyState icon={<Activity size={32} />} title="No progress photos yet" description="Complete your first body scan to start a private visual timeline." action={<LinkButton href="/ai-analysis">Start body scan</LinkButton>} /></Surface>}
      </section>
    </div>
  );
}
