"use client";

import { CalendarDays, CheckCircle2, ChevronRight, Dumbbell, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, Skeleton } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/LinkButton";
import { Surface } from "@/components/ui/Surface";
import { useAppSelector } from "@/hooks/reduxHooks";
import { cn } from "@/lib/cn";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Completed: "bg-brand-soft text-brand-strong",
  Missed: "bg-danger-soft text-danger",
};

export default function WorkoutPlanPage() {
  const [hydrated, setHydrated] = useState(false);
  const workouts = useAppSelector((state) => state.workouts.workouts);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return <div aria-label="Loading workout plan" className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-64" /><Skeleton className="h-80" /></div>;
  }

  if (!workouts?.items?.length) {
    return (
      <Surface padding="lg">
        <EmptyState
          icon={<Sparkles size={34} />}
          title="Build your first training plan"
          description="Complete a body scan and Trainix will prepare a realistic routine for your level, schedule, and goal."
          action={<LinkButton href="/ai-analysis" size="lg">Create my plan</LinkButton>}
        />
      </Surface>
    );
  }

  const todayIndex = Math.min(Math.max(workouts.todayWorkoutNumber ?? 0, 0), workouts.items.length - 1);
  const todayWorkout = workouts.items[todayIndex];
  const completedCount = workouts.items.filter((day) => day.status === "Completed").length;
  const weekProgress = (completedCount / workouts.items.length) * 100;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-brand-strong">Your training rhythm</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Workout plan</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">A clear weekly structure with enough flexibility for real life.</p>
      </header>

      <Surface variant="brand" padding="lg" className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -right-14 -top-20 size-64 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-strong"><Dumbbell size={18} /> Up next</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-strong">{todayWorkout.day}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Week {workouts.currentWeekTitle} · {todayWorkout.exercises?.length ?? 0} exercises · {todayWorkout.status}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={`/workout/${todayIndex + 1}`} size="lg" leadingIcon={<Dumbbell size={19} />} className="w-full sm:w-auto">
                {todayWorkout.status === "Completed" ? "Review workout" : "Start workout"}
              </LinkButton>
              <LinkButton href="/nutrition-plan" variant="secondary" size="lg" className="w-full sm:w-auto">Open nutrition</LinkButton>
            </div>
          </div>
          <div className="rounded-card border border-brand/15 bg-surface/80 p-5 backdrop-blur">
            <div className="flex items-end justify-between gap-3">
              <div><p className="text-sm font-medium text-muted">Weekly progress</p><p className="mt-1 text-2xl font-bold text-strong">{completedCount} of {workouts.items.length}</p></div>
              <CheckCircle2 className="text-brand" size={24} />
            </div>
            <div role="progressbar" aria-label="Weekly workout progress" aria-valuemin={0} aria-valuemax={workouts.items.length} aria-valuenow={completedCount} className="mt-4 h-2 overflow-hidden rounded-full bg-surface-strong">
              <div className="h-full rounded-full bg-brand" style={{ width: `${weekProgress}%` }} />
            </div>
          </div>
        </div>
      </Surface>

      <section aria-labelledby="schedule-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><h2 id="schedule-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">Weekly schedule</h2><p className="mt-1 text-sm text-muted">Your plan, one day at a time.</p></div>
          <span className="hidden text-sm font-medium text-subtle sm:inline">Week {workouts.currentWeekTitle}</span>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workouts.items.map((day, index) => {
            const date = workouts.dates?.[index];
            const isToday = index === todayIndex;
            return (
              <li key={`${day.dayNumber}-${String(day.date)}`}>
                <Surface padding="sm" className={cn("flex h-full flex-col gap-5", isToday && "border-brand bg-brand-soft/40")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", isToday ? "bg-brand text-on-brand" : "bg-surface-muted text-muted")}><CalendarDays size={18} /></span>
                      <div className="min-w-0"><p className="truncate font-semibold text-strong">{date?.weekDay ?? `Day ${index + 1}`}</p><p className="mt-0.5 text-xs text-subtle">{date?.monthAndDate ?? "Scheduled session"}{isToday ? " · Today" : ""}</p></div>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[day.status])}>{day.status}</span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-5">
                    <div><h3 className="font-semibold text-strong">{day.day}</h3><p className="mt-1 text-sm text-muted">{day.exercises?.length ?? 0} exercises{day.calories ? ` · ${day.calories} kcal` : ""}</p></div>
                    <LinkButton href={`/workout/${index + 1}`} variant={isToday ? "primary" : "secondary"} className="w-full justify-between">
                      {day.status === "Completed" ? "Review details" : "View details"}<ChevronRight size={17} />
                    </LinkButton>
                  </div>
                </Surface>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
