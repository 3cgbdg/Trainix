"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Check, Pencil, X } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { updateProfile } from "@/api/profile";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { Surface } from "@/components/ui/Surface";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { getProfile } from "@/redux/authSlice";
import type { IUser } from "@/types/types";

type EditingSection = "personal" | "password" | "goals" | null;
type GoalForm = { targetWeight: number; fitnessLevel: IUser["fitnessLevel"]; primaryFitnessGoal: IUser["primaryFitnessGoal"] };

export default function GoalsInfoForm({ user, setEditing, editing }: { user: IUser; editing: EditingSection; setEditing: Dispatch<SetStateAction<EditingSection>> }) {
  const dispatch = useAppDispatch();
  const [saveError, setSaveError] = useState<string | null>(null);
  const enabled = editing === "goals";
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalForm>({ defaultValues: { targetWeight: user.targetWeight, fitnessLevel: user.fitnessLevel, primaryFitnessGoal: user.primaryFitnessGoal } });
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => { dispatch(getProfile(updatedUser)); setEditing(null); setSaveError(null); },
    onError: (error) => setSaveError(isAxiosError(error) ? error.response?.data?.message ?? "Your goals could not be saved." : "Your goals could not be saved."),
  });
  const cancel = () => { reset(); setEditing(null); setSaveError(null); };

  return (
    <Surface padding="lg">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div><h2 className="text-xl font-bold text-strong">Fitness goals</h2><p className="mt-1 text-sm leading-6 text-muted">Your target and experience level shape every recommendation.</p></div>
        {!enabled ? <Button variant="secondary" leadingIcon={<Pencil size={16} />} onClick={() => setEditing("goals")}>Edit goals</Button> : null}
      </div>
      <form className="mt-6" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <fieldset disabled={!enabled || mutation.isPending} className="grid gap-4 sm:grid-cols-2">
          <TextField label="Target weight (kg)" type="number" min="30" max="400" step="0.1" error={errors.targetWeight?.message} {...register("targetWeight", { valueAsNumber: true, min: { value: 30, message: "Enter a target from 30 to 400 kg" }, max: { value: 400, message: "Enter a target from 30 to 400 kg" } })} />
          <SelectField label="Fitness level" {...register("fitnessLevel")}><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></SelectField>
          <SelectField className="sm:col-span-2" label="Primary goal" {...register("primaryFitnessGoal")}><option value="Lose weight">Lose weight</option><option value="Gain muscle">Gain muscle</option><option value="Stay fit">Stay fit</option><option value="Improve endurance">Improve endurance</option></SelectField>
        </fieldset>
        {saveError ? <p role="alert" className="mt-4 text-sm font-medium text-danger">{saveError}</p> : null}
        {enabled ? <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" leadingIcon={<X size={16} />} onClick={cancel}>Cancel</Button><Button type="submit" loading={mutation.isPending} loadingLabel="Saving…" leadingIcon={<Check size={16} />}>Save goals</Button></div> : null}
      </form>
    </Surface>
  );
}
