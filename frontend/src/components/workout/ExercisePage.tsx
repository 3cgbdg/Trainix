"use client";

import { Check, Clock3, Lightbulb, Pause, Play, SkipForward, Square } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Surface } from "@/components/ui/Surface";
import Timer from "@/components/workout/Timer";
import type { IDayPlan, IExercise } from "@/types/types";

function ExercisePage({ workout, exercise, index, onComplete, onSkip, onFinish, isSubmitting }: { workout: IDayPlan; exercise: IExercise; index: number; onComplete: () => void; onSkip: () => void; onFinish: () => void; isSubmitting: boolean }) {
  const [isPaused, setIsPaused] = useState(false);
  const exercises = workout.exercises ?? [];
  const nextExercise = exercises[index + 1];
  const progress = ((index + 1) / Math.max(exercises.length, 1)) * 100;
  const timed = exercise.time != null;
  const finishTimedExercise = useCallback(() => onComplete(), [onComplete]);

  return (
    <div className="space-y-5">
      <Surface padding="sm">
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold text-brand-strong">{workout.day}</p><h1 className="mt-1 text-xl font-bold text-strong">Exercise {index + 1} of {exercises.length}</h1></div><span className="text-sm font-semibold text-muted">{Math.round(progress)}%</span></div>
        <ProgressBar className="mt-4" value={progress} label="Workout progress" />
      </Surface>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.55fr)]">
        <Surface variant="brand" padding="lg" className="flex min-h-[34rem] flex-col items-center justify-center text-center">
          {timed ? <Timer workoutTime={exercise.time!} isPaused={isPaused} onFinish={finishTimedExercise} /> : <p className="text-6xl font-bold tracking-tight text-strong">{exercise.repeats}<span className="ml-2 text-xl font-semibold text-muted">reps</span></p>}
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-strong">{exercise.title}</h2>
          <div className="relative mt-6 aspect-square w-full max-w-xs overflow-hidden rounded-card border border-brand/15 bg-surface"><Image fill sizes="320px" priority className="object-cover" src={exercise.imageUrl} alt={`${exercise.title} demonstration`} /></div>
          <div className="mt-7 flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="secondary" leadingIcon={<SkipForward size={18} />} onClick={onSkip}>Skip</Button>
            {timed ? <Button leadingIcon={isPaused ? <Play size={18} /> : <Pause size={18} />} onClick={() => setIsPaused((current) => !current)}>{isPaused ? "Resume" : "Pause"}</Button> : <Button leadingIcon={<Check size={18} />} onClick={onComplete}>Complete reps</Button>}
            <Button variant="danger" loading={isSubmitting} loadingLabel="Saving…" leadingIcon={<Square size={17} />} onClick={onFinish}>Finish</Button>
          </div>
        </Surface>

        <div className="space-y-4">
          <Surface padding="lg"><h3 className="font-bold text-strong">How to perform it</h3><p className="mt-3 text-sm leading-6 text-muted">{exercise.instruction}</p><div className="mt-5 rounded-control bg-surface-muted p-4"><div className="flex items-center gap-2 font-semibold text-strong"><Lightbulb size={17} className="text-brand" /> Coach’s tip</div><p className="mt-2 text-sm leading-6 text-muted">{exercise.advices}</p></div></Surface>
          <Surface padding="lg"><p className="text-xs font-semibold uppercase tracking-wide text-subtle">Up next</p>{nextExercise ? <div className="mt-3 flex items-center gap-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-control bg-surface-muted"><Image fill sizes="64px" className="object-cover" src={nextExercise.imageUrl} alt="" /></div><div><h3 className="font-bold text-strong">{nextExercise.title}</h3><p className="mt-1 inline-flex items-center gap-1 text-xs text-muted"><Clock3 size={13} />{nextExercise.time ? `${Math.ceil(nextExercise.time / 60)} min` : `${nextExercise.repeats ?? 0} reps`}</p></div></div> : <p className="mt-3 font-semibold text-strong">Final exercise—finish strong.</p>}</Surface>
        </div>
      </div>
    </div>
  );
}

export default memo(ExercisePage);
