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
type PersonalForm = { firstName: string; lastName: string; email: string; gender: string; weight: number; height: number; dateOfBirth: string };

export default function PersonalInfoForm({ user, setEditing, editing }: { user: IUser; editing: EditingSection; setEditing: Dispatch<SetStateAction<EditingSection>> }) {
  const dispatch = useAppDispatch();
  const [saveError, setSaveError] = useState<string | null>(null);
  const enabled = editing === "personal";
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonalForm>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      weight: user.metrics.weight,
      height: user.metrics.height,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : "",
    },
  });
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => { dispatch(getProfile(updatedUser)); setEditing(null); setSaveError(null); },
    onError: (error) => setSaveError(isAxiosError(error) ? error.response?.data?.message ?? "Your details could not be saved." : "Your details could not be saved."),
  });
  const cancel = () => { reset(); setEditing(null); setSaveError(null); };

  return (
    <Surface padding="lg">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div><h2 className="text-xl font-bold text-strong">Personal information</h2><p className="mt-1 text-sm leading-6 text-muted">Basic account and body details used to personalize Trainix.</p></div>
        {!enabled ? <Button variant="secondary" leadingIcon={<Pencil size={16} />} onClick={() => setEditing("personal")}>Edit details</Button> : null}
      </div>
      <form className="mt-6" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <fieldset disabled={!enabled || mutation.isPending} className="grid gap-4 sm:grid-cols-2">
          <TextField label="First name" error={errors.firstName?.message} {...register("firstName", { required: "Enter your first name" })} />
          <TextField label="Last name" error={errors.lastName?.message} {...register("lastName", { required: "Enter your last name" })} />
          <TextField label="Email address" type="email" error={errors.email?.message} {...register("email", { required: "Enter your email", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } })} />
          <TextField label="Date of birth" type="date" min="1900-01-01" max="2018-12-31" error={errors.dateOfBirth?.message} {...register("dateOfBirth", { required: "Enter your date of birth" })} />
          <SelectField label="Gender" {...register("gender")}><option value="Male">Male</option><option value="Female">Female</option></SelectField>
          <TextField label="Height (cm)" type="number" min="100" max="250" error={errors.height?.message} {...register("height", { valueAsNumber: true, min: { value: 100, message: "Enter a height from 100 to 250 cm" }, max: { value: 250, message: "Enter a height from 100 to 250 cm" } })} />
          <TextField label="Weight (kg)" type="number" min="30" max="400" step="0.1" error={errors.weight?.message} {...register("weight", { valueAsNumber: true, min: { value: 30, message: "Enter a weight from 30 to 400 kg" }, max: { value: 400, message: "Enter a weight from 30 to 400 kg" } })} />
        </fieldset>
        {saveError ? <p role="alert" className="mt-4 text-sm font-medium text-danger">{saveError}</p> : null}
        {enabled ? <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" leadingIcon={<X size={16} />} onClick={cancel}>Cancel</Button><Button type="submit" loading={mutation.isPending} loadingLabel="Saving…" leadingIcon={<Check size={16} />}>Save changes</Button></div> : null}
      </form>
    </Surface>
  );
}
