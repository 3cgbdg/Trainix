"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Check, LockKeyhole, ShieldAlert, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { api, resumeSessionRefresh, suspendSessionRefresh } from "@/api/axiosInstance";
import { updateProfile } from "@/api/profile";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Surface } from "@/components/ui/Surface";
import { Switch } from "@/components/ui/Switch";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { getProfile, logOut } from "@/redux/authSlice";
import type { IUser } from "@/types/types";

type EditingSection = "personal" | "password" | "goals" | null;
type PasswordForm = { password: string; newPassword: string; newPasswordAgain: string };

export default function AccountSettings({ user, setEditing, editing }: { user: IUser; editing: EditingSection; setEditing: Dispatch<SetStateAction<EditingSection>> }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(user.inAppNotifications);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PasswordForm>({ defaultValues: { password: "", newPassword: "", newPasswordAgain: "" } });
  const notificationMutation = useMutation({
    mutationFn: (enabled: boolean) => updateProfile({ inAppNotifications: enabled }),
    onSuccess: (updatedUser) => dispatch(getProfile(updatedUser)),
    onError: () => setNotifications(user.inAppNotifications),
  });
  const passwordMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => { dispatch(getProfile(updatedUser)); setEditing(null); reset(); setSaveError(null); },
    onError: (error) => setSaveError(isAxiosError(error) ? error.response?.data?.message ?? "Your password could not be changed." : "Your password could not be changed."),
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      suspendSessionRefresh();
      try { return await api.delete("/api/auth/profile"); }
      catch (error) { resumeSessionRefresh(); throw error; }
    },
    onSuccess: () => { queryClient.clear(); dispatch(logOut()); router.replace("/auth/login"); },
  });
  const changeNotifications = (enabled: boolean) => { setNotifications(enabled); notificationMutation.mutate(enabled); };
  const cancelPassword = () => { reset(); setSaveError(null); setEditing(null); };

  return (
    <Surface padding="lg">
      <div><h2 className="text-xl font-bold text-strong">Account settings</h2><p className="mt-1 text-sm leading-6 text-muted">Control notifications, password security, and account access.</p></div>

      <div className="mt-6 divide-y divide-border">
        <div className="pb-6"><Switch checked={notifications} disabled={notificationMutation.isPending} onCheckedChange={changeNotifications} label="In-app notifications" description="Receive workout, meal, and progress reminders inside Trainix." />{notificationMutation.isError ? <p role="alert" className="mt-3 text-sm text-danger">The notification preference could not be saved.</p> : null}</div>

        <div className="py-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-semibold text-strong">Password</h3><p className="mt-1 text-sm text-muted">Use at least eight characters with uppercase, lowercase, and a number.</p></div>{editing !== "password" ? <Button variant="secondary" leadingIcon={<LockKeyhole size={16} />} onClick={() => setEditing("password")}>Change password</Button> : null}</div>
          {editing === "password" ? (
            <form className="mt-5 rounded-card border border-border bg-surface-muted p-4 sm:p-5" onSubmit={handleSubmit((values) => passwordMutation.mutate(values))}>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Current password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password", { required: "Enter your current password" })} />
                <TextField label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword", { required: "Enter a new password", pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: "Use 8+ characters with uppercase, lowercase, and a number" } })} />
                <TextField className="sm:col-span-2" label="Confirm new password" type="password" autoComplete="new-password" error={errors.newPasswordAgain?.message} {...register("newPasswordAgain", { required: "Confirm your new password", validate: (value) => value === watch("newPassword") || "Passwords do not match" })} />
              </div>
              {saveError ? <p role="alert" className="mt-4 text-sm font-medium text-danger">{saveError}</p> : null}
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" leadingIcon={<X size={16} />} onClick={cancelPassword}>Cancel</Button><Button type="submit" loading={passwordMutation.isPending} loadingLabel="Updating…" leadingIcon={<Check size={16} />}>Update password</Button></div>
            </form>
          ) : null}
        </div>

        <div className="pt-6">
          <div className="rounded-card border border-danger/20 bg-danger-soft p-4 sm:p-5">
            <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 shrink-0 text-danger" size={20} /><div><h3 className="font-semibold text-strong">Delete account</h3><p className="mt-1 text-sm leading-6 text-muted">Permanently removes your profile, plans, measurements, and progress history.</p></div></div>
            {!confirmDelete ? <Button className="mt-4" variant="danger" leadingIcon={<Trash2 size={16} />} onClick={() => setConfirmDelete(true)}>Delete account</Button> : (
              <div role="alert" className="mt-4 rounded-control bg-surface p-4"><p className="text-sm font-semibold text-strong">Are you absolutely sure? This cannot be undone.</p><div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row"><Button variant="secondary" onClick={() => setConfirmDelete(false)}>Keep my account</Button><Button variant="danger" loading={deleteMutation.isPending} loadingLabel="Deleting…" onClick={() => deleteMutation.mutate()}>Yes, delete permanently</Button></div>{deleteMutation.isError ? <p className="mt-3 text-sm text-danger">The account could not be deleted. Nothing was changed.</p> : null}</div>
            )}
          </div>
        </div>
      </div>
    </Surface>
  );
}
