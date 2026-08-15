import { CheckCircle2, Clock3, Dumbbell, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { Surface } from "@/components/ui/Surface";
import type { IDayPlan } from "@/types/types";

function exerciseSummary(time: number | null, repeats: number | null) {
  return time ? `${Math.max(Math.round(time / 60), 1)} min` : `${repeats ?? 0} reps`;
}

export default function GetReady({ workout, streak, onStart, onGenerate, isGenerating, dayId }: { workout: IDayPlan; streak: number; onStart: () => void; onGenerate: () => void; isGenerating: boolean; dayId: string }) {
  const exercises = workout.exercises ?? [];
  const completed = exercises.filter((exercise) => exercise.status === "completed").length;
  const timedMinutes = Math.ceil(exercises.reduce((sum, exercise) => sum + (exercise.time ?? 0), 0) / 60);
  const estimatedMinutes = Math.max(timedMinutes, exercises.length * 4);

  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold text-brand-strong">Workout {dayId}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-strong sm:text-4xl">{workout.day}</h1><p className="mt-2 text-sm leading-6 text-muted">Review the session, then start when you have space and water nearby.</p></header>
      <Surface variant="brand" padding="lg">
        <div className="grid gap-6 sm:grid-cols-3">
          <div><Clock3 className="text-brand" size={20} /><p className="mt-3 text-2xl font-bold text-strong">{estimatedMinutes} min</p><p className="text-xs text-muted">Estimated duration</p></div>
          <div><CheckCircle2 className="text-brand" size={20} /><p className="mt-3 text-2xl font-bold text-strong">{completed}/{exercises.length}</p><p className="text-xs text-muted">Exercises completed</p></div>
          <div><Flame className="text-brand" size={20} /><p className="mt-3 text-2xl font-bold text-strong">{streak} days</p><p className="text-xs text-muted">Current streak</p></div>
        </div>
      </Surface>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Surface padding="lg"><h2 className="text-xl font-bold text-strong">Session outline</h2><ol className="mt-5 space-y-2">{exercises.length ? exercises.map((exercise, index) => <li key={`${exercise.title}-${index}`} className="flex items-center justify-between gap-4 rounded-control bg-surface-muted px-4 py-3"><span className="min-w-0"><span className="mr-3 text-xs font-bold text-subtle">{String(index + 1).padStart(2, "0")}</span><span className="font-semibold text-strong">{exercise.title}</span></span><span className="shrink-0 text-xs font-medium text-muted">{exerciseSummary(exercise.time, exercise.repeats)}</span></li>) : <li className="rounded-control border border-dashed border-border-strong p-6 text-center text-sm text-muted">This day still needs its exercise details.</li>}</ol></Surface>
        <Surface padding="lg" className="flex flex-col justify-between gap-8"><div><span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-strong">{exercises.length ? <Dumbbell size={20} /> : <Sparkles size={20} />}</span><h2 className="mt-4 text-xl font-bold text-strong">{exercises.length ? "Ready to move?" : "Generate this workout"}</h2><p className="mt-2 text-sm leading-6 text-muted">{exercises.length ? "You can pause timed exercises, skip movements, or finish early whenever needed." : "Trainix will create the missing day from your current goal and measurements."}</p></div>{workout.status === "Completed" ? <LinkButton href={`/workout/${dayId}/success`} className="w-full">View results</LinkButton> : exercises.length ? <Button size="lg" className="w-full" leadingIcon={<Dumbbell size={19} />} onClick={onStart}>Start workout</Button> : <Button size="lg" className="w-full" loading={isGenerating} loadingLabel="Generating…" leadingIcon={<Sparkles size={19} />} onClick={onGenerate}>Generate workout</Button>}</Surface>
      </div>
    </div>
  );
}
