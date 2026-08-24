"use client";

import { Activity, Brain, Droplets, Leaf, Moon, Percent, RefreshCw, Scale, ScanLine, Sparkles, Target, TrendingDown, TrendingUp, Weight } from "lucide-react";
import { memo, type ComponentType, type Dispatch, type SetStateAction } from "react";
import BodyImages from "@/components/ai-analysis/BodyImages";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import { TrendChart, type TrendPoint } from "@/components/ui/TrendChart";

type AnalysisMetric = { data: number | string; difference: number | null };

export type ReceivedAnalysis = {
  weight: AnalysisMetric;
  chartData: Array<{ month: string; bodyFat?: number; bodyFatPercent?: number }>;
  leanBodyMass: AnalysisMetric;
  bodyFatPercent: AnalysisMetric;
  MuscleMass: AnalysisMetric;
  bmi: AnalysisMetric;
  imageUrlCurrent: string;
  imageUrlLast: string | null;
  waistToHipRatio: AnalysisMetric;
  advices: { nutrition: string; hydration: string; recovery: string; progress: string };
};

type MetricCardProps = {
  label: string;
  metric: AnalysisMetric;
  unit?: string;
  icon: ComponentType<{ size?: number }>;
};

function MetricCard({ label, metric, unit = "", icon: Icon }: MetricCardProps) {
  const difference = metric.difference;
  return (
    <Surface padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-strong">{metric.data}{unit}</p><p className="mt-1 text-xs text-subtle">{difference == null ? "First check-in" : difference === 0 ? "No change" : `${difference > 0 ? "+" : ""}${difference.toFixed(2)}${unit} vs previous`}</p></div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Icon size={19} /></span>
      </div>
    </Surface>
  );
}

const adviceItems = [
  { key: "hydration", label: "Hydration", icon: Droplets },
  { key: "nutrition", label: "Nutrition", icon: Leaf },
  { key: "progress", label: "Training focus", icon: Target },
  { key: "recovery", label: "Recovery", icon: Moon },
] as const;

function AnalyzedResults({ data, setReset }: { data: ReceivedAnalysis; setReset: Dispatch<SetStateAction<boolean>> }) {
  const bodyFatTrend: TrendPoint[] = data.chartData.map((point) => ({
    label: point.month,
    values: { bodyFat: point.bodyFat ?? point.bodyFatPercent ?? 0 },
  }));
  const bodyFatDifference = data.bodyFatPercent.difference;
  const ProgressIcon = bodyFatDifference != null && bodyFatDifference <= 0 ? TrendingDown : TrendingUp;
  const progressTitle = bodyFatDifference == null ? "Baseline established" : bodyFatDifference <= 0 ? "Strong momentum" : "New data captured";

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="flex items-center gap-2 text-sm font-semibold text-brand-strong"><Sparkles size={16} /> Computer-vision body analysis</p><h1 className="mt-1 font-outfit text-3xl font-bold tracking-tight text-strong sm:text-4xl">Your body scan is ready</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">Your latest private check-in is translated into clear body metrics and practical plan adjustments.</p></div>
        <Button leadingIcon={<RefreshCw size={17} />} onClick={() => setReset(true)} className="w-full sm:w-auto">Update scan</Button>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
        <Surface variant="brand" padding="lg" className="relative overflow-hidden">
          <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-strong">Private scan comparison</h2><p className="mt-1 text-sm leading-6 text-muted">Previous and current check-ins.</p></div><span className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-brand-strong"><span className="size-2 rounded-full bg-brand" /> Analysis complete</span></div>
          <BodyImages current={data.imageUrlCurrent} last={data.imageUrlLast} />
          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-brand-strong"><ScanLine size={18} /> Body landmarks analyzed privately</div>
        </Surface>
        <div className="space-y-4">
          <Surface padding="md">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-muted">Overall progress</p><h2 className="mt-1 font-outfit text-3xl font-bold text-strong">{progressTitle}</h2></div><span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><ProgressIcon size={22} /></span></div>
            <p className="mt-3 text-sm leading-6 text-muted">Use these estimates as directional signals. Trainix combines them with your goal and training history when the next plan is generated.</p>
          </Surface>
          <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Body fat" metric={data.bodyFatPercent} unit="%" icon={Percent} />
            <MetricCard label="Muscle mass" metric={data.MuscleMass} unit=" kg" icon={Weight} />
            <MetricCard label="BMI" metric={data.bmi} icon={Scale} />
            <MetricCard label="Waist-to-hip" metric={data.waistToHipRatio} icon={Target} />
            <MetricCard label="Body weight" metric={data.weight} unit=" kg" icon={Weight} />
            <MetricCard label="Lean body mass" metric={data.leanBodyMass} unit=" kg" icon={Sparkles} />
          </div>
          <Surface padding="md">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-strong">Plan adjustments</h2><p className="mt-1 text-sm text-muted">Generated from this scan</p></div><Brain className="text-brand" size={21} /></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {adviceItems.slice(0, 3).map(({ key, label, icon: Icon }) => (
                <div key={key} className="rounded-control bg-surface-muted p-4"><Icon size={18} className="text-brand-strong" /><h3 className="mt-3 text-sm font-bold text-strong">{label}</h3><p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">{data.advices[key]}</p></div>
              ))}
            </div>
          </Surface>
        </div>
      </section>

      <section aria-labelledby="recommendations-title" className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Surface padding="lg">
          <div className="mb-5"><div className="flex items-center gap-2"><Activity className="text-brand" size={21} /><h2 className="text-xl font-bold text-strong">Body-fat trend</h2></div><p className="mt-1 text-sm text-muted">Directional change across recent monthly check-ins.</p></div>
          <TrendChart data={bodyFatTrend} series={[{ key: "bodyFat", label: "Body fat (%)", color: "var(--brand)" }]} ariaLabel="Body fat percentage trend across recent months" />
        </Surface>
        <Surface padding="lg">
        <div className="mb-4"><div className="flex items-center gap-2"><Brain className="text-brand" size={21} /><h2 id="recommendations-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">Personalized recommendations</h2></div><p className="mt-1 text-sm text-muted">Four practical areas to focus on next.</p></div>
        <div className="space-y-3">
          {adviceItems.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Icon size={17} /></span><div><h3 className="text-sm font-bold text-strong">{label}</h3><p className="mt-1 text-xs leading-5 text-muted">{data.advices[key]}</p></div></div>
          ))}
        </div>
        </Surface>
      </section>
    </div>
  );
}

export default memo(AnalyzedResults);
