"use client";

import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Dumbbell, Sparkles, Target } from "lucide-react";
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
  const user = useAppSelector((state) => state.auth.user);

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
  const plannedMinutes = workouts.items.reduce((total, day) => {
    const exerciseCount = day.exercises?.length ?? 0;
    const timedSeconds = day.exercises?.reduce((sum, exercise) => sum + (exercise.time ?? 0), 0) ?? 0;
    return total + Math.max(Math.round(timedSeconds / 60), exerciseCount * 4);
  }, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-strong"><Sparkles size={16} /> AI-generated training plan</p>
          <h1 className="mt-1 font-outfit text-3xl font-bold tracking-tight text-strong sm:text-4xl">Your adaptive week</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">A structured program built around your goal, current level, schedule, and latest check-in.</p>
        </div>
        <span className="rounded-control border border-border bg-surface px-4 py-3 text-sm font-semibold text-strong">Week {workouts.currentWeekTitle ?? "current"}</span>
      </header>

      <Surface variant="brand" padding="lg" className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -right-14 -top-20 size-64 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-strong"><Sparkles size={18} /> Personalized by Trainix AI</div>
            <h2 className="mt-4 font-outfit text-3xl font-bold tracking-tight text-strong">{user?.primaryFitnessGoal ?? "Build consistent strength"}{user?.targetWeight ? ` · Reach ${user.targetWeight} kg` : ""}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{workouts.items.length} scheduled sessions · {plannedMinutes || "—"} minutes planned · adjusted for your {user?.fitnessLevel?.toLowerCase() ?? "current"} level.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={`/workout/${todayIndex + 1}`} size="lg" leadingIcon={<Dumbbell size={19} />} className="w-full sm:w-auto">
                {todayWorkout.status === "Completed" ? "Review today’s workout" : "Start today’s workout"}
              </LinkButton>
              <LinkButton href="/ai-analysis" variant="secondary" size="lg" className="w-full sm:w-auto">Review body scan</LinkButton>
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <section aria-labelledby="schedule-title">
        <Surface padding="md">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><h2 id="schedule-title" className="text-xl font-bold tracking-tight text-strong sm:text-2xl">This week</h2><p className="mt-1 text-sm text-muted">Your plan, one focused session at a time.</p></div>
          <CalendarDays className="text-brand" size={21} />
        </div>
        <ol className="space-y-2.5">
          {workouts.items.map((day, index) => {
            const date = workouts.dates?.[index];
            const isToday = index === todayIndex;
            return (
              <li key={`${day.dayNumber}-${String(day.date)}`}>
                <div className={cn("grid gap-3 rounded-control border border-border bg-surface px-4 py-3 sm:grid-cols-[3rem_minmax(0,1fr)_auto_auto] sm:items-center", isToday && "border-brand bg-brand-soft/60")}>
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", day.status === "Completed" || isToday ? "bg-brand text-on-brand" : "bg-surface-muted text-muted")}>{date?.weekDay?.slice(0, 3) ?? `D${index + 1}`}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-strong">{day.day}</p>
                    <p className="mt-0.5 text-xs text-subtle">{day.exercises?.length ?? 0} exercises{day.calories ? ` · ${day.calories} kcal` : ""}{date?.monthAndDate ? ` · ${date.monthAndDate}` : ""}</p>
                  </div>
                  <span className={cn("w-fit rounded-full px-2.5 py-1 text-xs font-semibold", isToday ? "bg-brand-soft text-brand-strong" : statusStyles[day.status])}>{isToday ? "Today" : day.status}</span>
                  <LinkButton href={`/workout/${index + 1}`} variant="ghost" size="sm" aria-label={`Open ${day.day}`} className="justify-self-start px-2 sm:justify-self-end"><ChevronRight size={17} /></LinkButton>
                </div>
              </li>
            );
          })}
        </ol>
        </Surface>
      </section>
      <aside className="space-y-4">
        <Surface padding="md">
          <div className="flex items-center gap-2"><Target className="text-brand" size={19} /><h2 className="text-lg font-bold text-strong">Plan intelligence</h2></div>
          <div className="mt-5 space-y-5">
            <div><div className="flex justify-between text-xs"><span className="font-semibold text-muted">Plan completion</span><span className="font-bold text-strong">{Math.round(weekProgress)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-brand" style={{ width: `${weekProgress}%` }} /></div></div>
            <div><div className="flex justify-between text-xs"><span className="font-semibold text-muted">Current streak</span><span className="font-bold text-strong">{workouts.streak} days</span></div></div>
            <div><div className="flex justify-between text-xs"><span className="font-semibold text-muted">Next session</span><span className="font-bold text-strong">{todayWorkout.status}</span></div></div>
          </div>
        </Surface>
        <Surface padding="md">
          <div className="flex items-center gap-2"><Sparkles className="text-brand" size={18} /><h2 className="font-bold text-strong">Next AI review</h2></div>
          <p className="mt-2 text-sm leading-6 text-muted">Your next body check-in can refresh the plan with new progress data.</p>
          <LinkButton href="/ai-analysis" variant="ghost" size="sm" className="mt-3 px-0 text-brand-strong">Open body analysis <ArrowRight size={15} /></LinkButton>
        </Surface>
      </aside>
      </div>
    </div>
  );
}
