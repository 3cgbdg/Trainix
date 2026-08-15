"use client";

import type { UseMutateFunction } from "@tanstack/react-query";
import { Apple, Check, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { Surface } from "@/components/ui/Surface";
import { useAppSelector } from "@/hooks/reduxHooks";

const planBenefits = [
  "Calories and macros matched to your goal",
  "Simple meals arranged around your training",
  "Daily hydration and nutrition tracking",
];

type GenerateNutritionPlanProps = {
  mutate: UseMutateFunction<unknown, unknown, number, unknown>;
  isPending: boolean;
};

export default function GenerateNutritionPlan({ mutate, isPending }: GenerateNutritionPlanProps) {
  const workouts = useAppSelector((state) => state.workouts.workouts);
  const canGenerate = Boolean(workouts?.items?.length);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Apple size={22} /></span>
        <p className="mt-5 text-sm font-semibold text-brand-strong">Nutrition that fits your plan</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Build today’s meal plan</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">Trainix combines your goal, measurements, and workout schedule into practical meals you can actually follow.</p>
      </header>

      <Surface padding="lg" className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)] md:items-center">
        <div>
          <h2 className="text-xl font-bold text-strong">What you’ll get</h2>
          <ul className="mt-5 space-y-4">
            {planBenefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6 text-muted">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Check size={14} strokeWidth={3} /></span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-brand/15 bg-brand-soft p-5">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-surface text-brand-strong"><Sparkles size={19} /></span><div><p className="font-semibold text-strong">Personalized by AI</p><p className="text-xs text-muted">Usually ready in about 30 seconds</p></div></div>
          {isPending ? (
            <div role="status" className="mt-6 rounded-control bg-surface p-4 text-sm text-muted">
              <div className="flex items-center gap-2 font-semibold text-strong"><span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-brand border-r-transparent" />Preparing your meals…</div>
              <p className="mt-2 pl-6 text-xs leading-5">Keep this page open while we balance your plan.</p>
            </div>
          ) : null}
          <div className="mt-6">
            {canGenerate ? (
              <Button className="w-full" size="lg" loading={isPending} loadingLabel="Building your plan…" leadingIcon={<Clock3 size={18} />} onClick={() => mutate(1)}>Generate meal plan</Button>
            ) : (
              <LinkButton href="/ai-analysis" className="w-full" size="lg" leadingIcon={<Sparkles size={18} />}>Create fitness plan first</LinkButton>
            )}
          </div>
        </div>
      </Surface>
    </div>
  );
}
