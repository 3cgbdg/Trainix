"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Droplets, Flame, GlassWater, Utensils } from "lucide-react";
import { useState } from "react";
import { api } from "@/api/axiosInstance";
import MealAccordion from "@/components/nutrition-plan/MealAccordion";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Surface } from "@/components/ui/Surface";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { logWater } from "@/redux/nutritionDaySlice";
import type { INutritionDayPlan } from "@/types/types";

type Goal = { current: number; target: number };
type WeeklyStatistic = { day: string; calories: number };

function GoalCard({ label, goal, unit }: { label: string; goal: Goal; unit: string }) {
  const remaining = Math.max(goal.target - goal.current, 0);
  return (
    <div className="rounded-control border border-brand/10 bg-surface/75 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-strong">{label}</p>
        <p className="text-xs font-medium text-muted">{goal.current}/{goal.target} {unit}</p>
      </div>
      <ProgressBar className="mt-3" value={goal.current} max={goal.target} label={`${label} progress`} />
      <p className="mt-2 text-xs text-subtle">{remaining > 0 ? `${remaining} ${unit} remaining` : "Goal reached"}</p>
    </div>
  );
}

export default function NutritionPlanPage({ day }: { day: INutritionDayPlan }) {
  const [openMeal, setOpenMeal] = useState<string | null>(null);
  const [waterAmount, setWaterAmount] = useState("");
  const dispatch = useAppDispatch();
  const weekNumber = day.dayNumber < 8 ? 1 : day.dayNumber < 15 ? 2 : day.dayNumber < 22 ? 3 : 4;
  const parsedWaterAmount = Number(waterAmount);
  const waterError = waterAmount && (!Number.isFinite(parsedWaterAmount) || parsedWaterAmount <= 0) ? "Enter an amount greater than zero" : undefined;

  const { data: statistics = [] } = useQuery<WeeklyStatistic[]>({
    queryKey: ["nutrition-statistics", weekNumber],
    queryFn: () => api.get(`/api/nutrition-plan/statistics?week=${weekNumber}`).then((response) => response.data),
  });

  const waterMutation = useMutation({
    mutationFn: ({ planDay, amount }: { planDay: number; amount: number }) =>
      api.patch(`/api/nutrition-plan/nutrition-plans/days/${planDay}/water`, { amount }).then((response) => response.data),
    onSuccess: (_data, variables) => {
      dispatch(logWater(variables.amount));
      setWaterAmount("");
    },
  });

  const maxCalories = Math.max(...statistics.map((item) => item.calories), 1);
  const eatenMeals = day.meals.filter((meal) => meal.status === "eaten").length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-strong">Day {day.dayNumber} · Week {weekNumber}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Today’s nutrition</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">Practical targets and meals designed around your training day.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-strong"><Utensils size={17} /> {eatenMeals} of {day.meals.length} meals logged</div>
      </header>

      <Surface variant="brand" padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-semibold text-brand-strong">Daily targets</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-strong">Fuel the work, support recovery</h2></div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-brand-strong"><Flame size={20} /></span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <GoalCard label="Calories" goal={day.dailyGoals.calories} unit="kcal" />
          <GoalCard label="Protein" goal={day.dailyGoals.protein} unit="g" />
          <GoalCard label="Carbs" goal={day.dailyGoals.carbs} unit="g" />
          <GoalCard label="Fats" goal={day.dailyGoals.fats} unit="g" />
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.55fr)]">
        <section aria-labelledby="meals-title">
          <div className="mb-4"><h2 id="meals-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">Today’s meals</h2><p className="mt-1 text-sm text-muted">Open a meal for ingredients and preparation.</p></div>
          <div className="space-y-4">
            {day.meals.map((meal, index) => (
              <MealAccordion key={`${meal.foodIntake}-${meal.mealTitle}`} dayNumber={day.dayNumber} idx={index} meal={meal} isOpen={openMeal} setIsOpen={setOpenMeal} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <Surface padding="lg">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><GlassWater size={19} /></span><div><h2 className="font-bold text-strong">Water intake</h2><p className="text-xs text-muted">Small refills add up.</p></div></div>
            <p className="mt-5 text-2xl font-bold text-strong">{day.waterIntake.current.toLocaleString()} <span className="text-sm font-medium text-subtle">/ {day.waterIntake.target.toLocaleString()} ml</span></p>
            <ProgressBar className="mt-3" indicatorClassName="bg-sky-600" value={day.waterIntake.current} max={day.waterIntake.target} label="Daily water intake" />
            <div className="mt-5 flex items-end gap-2">
              <TextField className="min-w-0 flex-1" label="Add water" type="number" min="1" inputMode="numeric" placeholder="250 ml" value={waterAmount} error={waterError} disabled={waterMutation.isPending} onChange={(event) => setWaterAmount(event.target.value)} />
              <Button className="mb-0.5 shrink-0" loading={waterMutation.isPending} loadingLabel="Logging…" disabled={!waterAmount || Boolean(waterError)} leadingIcon={<Droplets size={17} />} onClick={() => waterMutation.mutate({ planDay: day.dayNumber - 1, amount: parsedWaterAmount })}>Log</Button>
            </div>
            {waterMutation.isError ? <p role="alert" className="mt-3 text-sm text-danger">Water could not be saved. Try again.</p> : null}
          </Surface>

          <Surface padding="lg">
            <h2 className="font-bold text-strong">Weekly calories</h2>
            <p className="mt-1 text-xs leading-5 text-muted">A quick consistency view for this week.</p>
            {statistics.length ? (
              <div className="mt-6 flex h-40 items-end gap-2" role="img" aria-label="Weekly calorie intake bar chart">
                {statistics.map((item) => (
                  <div key={item.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[10px] font-semibold text-subtle">{item.calories}</span>
                    <span className="w-full max-w-8 rounded-t bg-brand" style={{ height: `${Math.max((item.calories / maxCalories) * 100, 4)}%` }} />
                    <span className="truncate text-[10px] font-medium text-muted">{item.day}</span>
                  </div>
                ))}
              </div>
            ) : <p className="mt-6 rounded-control border border-dashed border-border-strong bg-surface-muted p-5 text-center text-sm text-muted">Log meals to build your weekly trend.</p>}
          </Surface>
        </aside>
      </div>
    </div>
  );
}
