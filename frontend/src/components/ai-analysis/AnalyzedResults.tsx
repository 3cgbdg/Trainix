"use client";

import { Brain, Droplets, Leaf, Moon, Percent, RefreshCw, Scale, Sparkles, Target, Weight } from "lucide-react";
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

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-brand-strong">Latest body check-in</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Your analysis</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">Use these estimates as directional signals alongside how you feel and perform.</p></div>
        <Button variant="secondary" leadingIcon={<RefreshCw size={17} />} onClick={() => setReset(true)} className="w-full sm:w-auto">Retake photo</Button>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
        <Surface padding="lg"><div className="mb-5"><h2 className="text-xl font-bold text-strong">Visual comparison</h2><p className="mt-1 text-sm leading-6 text-muted">Your previous and current private check-ins.</p></div><BodyImages current={data.imageUrlCurrent} last={data.imageUrlLast} /></Surface>
        <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Body fat" metric={data.bodyFatPercent} unit="%" icon={Percent} />
          <MetricCard label="Muscle mass" metric={data.MuscleMass} unit=" kg" icon={Weight} />
          <MetricCard label="BMI" metric={data.bmi} icon={Scale} />
          <MetricCard label="Waist-to-hip" metric={data.waistToHipRatio} icon={Target} />
          <MetricCard label="Body weight" metric={data.weight} unit=" kg" icon={Weight} />
          <MetricCard label="Lean body mass" metric={data.leanBodyMass} unit=" kg" icon={Sparkles} />
        </div>
      </section>

      <section aria-labelledby="recommendations-title">
        <div className="mb-4"><div className="flex items-center gap-2"><Brain className="text-brand" size={21} /><h2 id="recommendations-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">Personalized recommendations</h2></div><p className="mt-1 text-sm text-muted">Four practical areas to focus on next.</p></div>
        <div className="grid gap-3 md:grid-cols-2">
          {adviceItems.map(({ key, label, icon: Icon }) => (
            <Surface key={key} padding="lg">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Icon size={19} /></span>
              <h3 className="mt-4 font-bold text-strong">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{data.advices[key]}</p>
            </Surface>
          ))}
        </div>
      </section>

      <Surface padding="lg">
        <div className="mb-5"><h2 className="text-xl font-bold text-strong">Body-fat trend</h2><p className="mt-1 text-sm text-muted">Directional change across recent monthly check-ins.</p></div>
        <TrendChart data={bodyFatTrend} series={[{ key: "bodyFat", label: "Body fat (%)", color: "var(--brand)" }]} ariaLabel="Body fat percentage trend across recent months" />
      </Surface>
    </div>
  );
}

export default memo(AnalyzedResults);
