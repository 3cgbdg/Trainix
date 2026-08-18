"use client";

import { Camera, Target, UserRound } from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";
import AccountSettings from "@/components/profile/AccountSettings";
import BillingSection from "@/components/profile/BillingSection";
import GoalsInfoForm from "@/components/profile/GoalsInfoForm";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import { Skeleton } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/LinkButton";
import { Surface } from "@/components/ui/Surface";
import { useAppSelector } from "@/hooks/reduxHooks";

type EditingSection = "personal" | "password" | "goals" | null;

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const [editing, setEditing] = useState<EditingSection>(null);

  if (!user) return <div className="space-y-4"><Skeleton className="h-44" /><Skeleton className="h-80" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <Surface variant="brand" padding="lg" className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-surface-muted text-muted shadow-sm">
              {user.imageUrl ? <Image fill sizes="96px" className="object-cover" src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} /> : <UserRound size={38} />}
            </div>
            <div><p className="text-sm font-semibold text-brand-strong">Your Trainix profile</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-strong">{user.firstName} {user.lastName}</h1><p className="mt-2 text-sm text-muted">{user.primaryFitnessGoal} · {user.fitnessLevel}</p></div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end"><LinkButton href="/ai-analysis" variant="secondary" leadingIcon={<Camera size={17} />}>Update body scan</LinkButton><LinkButton href="/progress" variant="ghost" leadingIcon={<Target size={17} />}>View progress</LinkButton></div>
        </div>
      </Surface>
      <PersonalInfoForm user={user} editing={editing} setEditing={setEditing} />
      <GoalsInfoForm user={user} editing={editing} setEditing={setEditing} />
      <Suspense fallback={null}>
        <BillingSection user={user} />
      </Suspense>
      <AccountSettings user={user} editing={editing} setEditing={setEditing} />
    </div>
  );
}
