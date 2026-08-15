"use client";

import { Check, CheckCircle2, Flame, Sparkles, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { EmptyState, Skeleton } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/LinkButton";
import { Surface } from "@/components/ui/Surface";
import { useAppSelector } from "@/hooks/reduxHooks";

export default function WorkoutSuccessPage() {
  const params = useParams<{ id: string }>();
  const workouts = useAppSelector((state) => state.workouts.workouts);
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const workout = workouts?.items?.[Number(id) - 1];

  if (!workouts) return <div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-80" /></div>;
  if (!workout) return <Surface><EmptyState title="Workout results unavailable" description="Return to your plan and choose an available workout." action={<LinkButton href="/workout-plan">Back to plan</LinkButton>} /></Surface>;

  const exercises = workout.exercises ?? [];
  const completedExercises = exercises.filter((exercise) => exercise.status === "completed");
  const totalCalories = completedExercises.reduce((total, exercise) => total + exercise.calories, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Surface variant="brand" padding="lg" className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand text-on-brand"><CheckCircle2 size={30} /></span>
        <p className="mt-5 text-sm font-semibold text-brand-strong">Workout saved</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-strong sm:text-4xl">Nice work—you showed up.</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Consistency is built one completed session at a time. Take a moment to recover and hydrate.</p>
        <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
          <div className="rounded-control bg-surface/80 p-4"><Zap className="mx-auto text-brand" size={20} /><p className="mt-2 text-2xl font-bold text-strong">{totalCalories}</p><p className="text-xs text-muted">Calories</p></div>
          <div className="rounded-control bg-surface/80 p-4"><Check className="mx-auto text-brand" size={20} /><p className="mt-2 text-2xl font-bold text-strong">{completedExercises.length}/{exercises.length}</p><p className="text-xs text-muted">Exercises</p></div>
          <div className="rounded-control bg-surface/80 p-4"><Flame className="mx-auto text-brand" size={20} /><p className="mt-2 text-2xl font-bold text-strong">{workouts.streak}</p><p className="text-xs text-muted">Day streak</p></div>
        </div>
      </Surface>

      <Surface padding="lg">
        <div className="flex items-center gap-2"><Sparkles className="text-brand" size={20} /><h2 className="text-xl font-bold text-strong">Session summary</h2></div>
        <ul className="mt-5 space-y-2">
          {exercises.map((exercise, index) => <li key={`${exercise.title}-${index}`} className="flex items-center justify-between gap-4 rounded-control bg-surface-muted px-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${exercise.status === "completed" ? "bg-brand-soft text-brand-strong" : "bg-surface-strong text-subtle"}`}>{exercise.status === "completed" ? <Check size={14} /> : index + 1}</span><span className="truncate font-semibold text-strong">{exercise.title}</span></div><span className="shrink-0 text-xs text-muted">{exercise.calories} kcal · {exercise.time ? `${Math.ceil(exercise.time / 60)} min` : `${exercise.repeats ?? 0} reps`}</span></li>)}
        </ul>
      </Surface>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><LinkButton href="/today" variant="secondary">Back to Today</LinkButton><LinkButton href="/workout-plan">View weekly plan</LinkButton></div>
    </div>
  );
}
