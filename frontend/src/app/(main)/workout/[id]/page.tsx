"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/api/axiosInstance";
import { ErrorState, Spinner } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/LinkButton";
import { Surface } from "@/components/ui/Surface";
import ExercisePage from "@/components/workout/ExercisePage";
import GetReady from "@/components/workout/GetReady";
import Resting from "@/components/workout/Resting";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { updateWorkouts } from "@/redux/workoutsSlice";
import type { IDayPlan } from "@/types/types";

type WorkoutStage = "ready" | "active" | "rest";
type CompletionRecord = { completed: boolean };

export default function ActiveWorkoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const workouts = useAppSelector((state) => state.workouts.workouts);
  const dayId = Array.isArray(params.id) ? params.id[0] : params.id;
  const dayIndex = Number(dayId) - 1;
  const baseWorkout = Number.isInteger(dayIndex) ? workouts?.items?.[dayIndex] : undefined;
  const [generatedWorkout, setGeneratedWorkout] = useState<IDayPlan | null>(null);
  const [stage, setStage] = useState<WorkoutStage>("ready");
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<CompletionRecord[]>([]);
  const workout = generatedWorkout ?? baseWorkout;

  const completionMutation = useMutation({
    mutationFn: (records: CompletionRecord[]) => api.post(`/api/fitness-plan/workouts/${dayIndex}/completed`, records).then((response) => response.data),
    onSuccess: (data) => {
      dispatch(updateWorkouts({ day: data.day, streak: data.streak }));
      // the dashboard/progress pages' streak numbers come from separately cached
      // queries (30s staleTime) that completing a workout doesn't otherwise touch -
      // without this, landing back on either page right after finishing can show the
      // pre-completion numbers until the cache happens to expire on its own
      void queryClient.invalidateQueries({ queryKey: ["dashboard-numbers"] });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      router.push(`/workout/${dayId}/success`);
    },
  });

  // the backend reads the user's metrics, calls the AI service, attaches exercise
  // images and saves the day - the client just names the day it wants regenerated
  const generationMutation = useMutation({
    mutationFn: async () => {
      if (!baseWorkout) throw new Error("This workout day does not exist in your plan");
      const response = await api.post(`/api/fitness-plan/workouts/${dayIndex}/generate`);
      return response.data;
    },
    onSuccess: (data) => {
      const generatedDay = data?.day as IDayPlan | undefined;
      if (!generatedDay) throw new Error("The generated workout was empty");
      setGeneratedWorkout(generatedDay);
      dispatch(updateWorkouts({ day: generatedDay }));
    },
  });

  const startWorkout = useCallback(() => {
    const exercises = workout?.exercises ?? [];
    const initialRecords = exercises.map((exercise) => ({ completed: exercise.status === "completed" }));
    const firstIncomplete = initialRecords.findIndex((record) => !record.completed);
    setCompletedItems(initialRecords);
    if (firstIncomplete === -1) { router.push(`/workout/${dayId}/success`); return; }
    setActiveIndex(firstIncomplete);
    setStage("active");
  }, [dayId, router, workout]);

  const advance = useCallback((completed: boolean) => {
    if (!workout?.exercises) return;
    const nextRecords = completedItems.map((record, index) => index === activeIndex ? { completed } : record);
    setCompletedItems(nextRecords);
    const nextIndex = nextRecords.findIndex((record, index) => index > activeIndex && !record.completed);
    if (nextIndex === -1) { completionMutation.mutate(nextRecords); return; }
    setActiveIndex(nextIndex);
    setStage("rest");
  }, [activeIndex, completedItems, completionMutation, workout]);

  const finishEarly = useCallback(() => completionMutation.mutate(completedItems), [completedItems, completionMutation]);
  const finishRest = useCallback(() => setStage("active"), []);

  if (!workouts) return <div className="flex min-h-80 items-center justify-center"><Spinner label="Loading your workout" /></div>;
  if (!workout) return <Surface><ErrorState title="Workout not found" description="This workout day does not exist in your current plan." /><div className="flex justify-center pb-8"><LinkButton href="/workout-plan">Back to plan</LinkButton></div></Surface>;

  if (stage === "ready") return <><GetReady workout={workout} streak={workouts.streak} dayId={dayId} onStart={startWorkout} onGenerate={() => generationMutation.mutate()} isGenerating={generationMutation.isPending} />{generationMutation.isError ? <Surface className="mt-4"><ErrorState title="This workout could not be generated" description="Check your body scan and the workout service, then try again." onRetry={() => generationMutation.mutate()} /></Surface> : null}</>;
  if (stage === "rest") return <Resting onComplete={finishRest} />;

  const exercise = workout.exercises?.[activeIndex];
  if (!exercise) return <Surface><ErrorState title="Exercise unavailable" description="Return to your plan and choose another workout." /><div className="flex justify-center pb-8"><LinkButton href="/workout-plan">Back to plan</LinkButton></div></Surface>;

  return <ExercisePage key={activeIndex} workout={workout} exercise={exercise} index={activeIndex} onComplete={() => advance(true)} onSkip={() => advance(false)} onFinish={finishEarly} isSubmitting={completionMutation.isPending} />;
}
