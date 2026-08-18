"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CreditCard, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/api/axiosInstance";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import type { IUser } from "@/types/types";

export default function BillingSection({ user }: { user: IUser }) {
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");
  const isPremium = user.subscriptionTier === "premium";

  const checkoutMutation = useMutation({
    mutationFn: () => api.post<{ url: string }>("/api/billing/checkout").then((res) => res.data),
    onSuccess: (data) => { window.location.href = data.url; },
  });
  const portalMutation = useMutation({
    mutationFn: () => api.post<{ url: string }>("/api/billing/portal").then((res) => res.data),
    onSuccess: (data) => { window.location.href = data.url; },
  });

  const checkoutError = checkoutMutation.isError
    ? (isAxiosError(checkoutMutation.error) ? checkoutMutation.error.response?.data?.message : null) ?? "Could not start checkout. Please try again."
    : null;
  const portalError = portalMutation.isError
    ? (isAxiosError(portalMutation.error) ? portalMutation.error.response?.data?.message : null) ?? "Could not open billing portal. Please try again."
    : null;

  return (
    <Surface padding="lg">
      <div className="flex items-center gap-2"><CreditCard className="text-brand" size={20} /><h2 className="text-xl font-bold text-strong">Subscription</h2></div>

      {checkoutResult === "success" ? (
        <p role="status" className="mt-4 rounded-control border border-brand/20 bg-brand-soft p-3 text-sm text-brand-strong">Thanks for subscribing! It may take a moment for your account to update.</p>
      ) : null}
      {checkoutResult === "cancelled" ? (
        <p role="status" className="mt-4 rounded-control border border-border bg-surface-muted p-3 text-sm text-muted">Checkout was cancelled — no changes were made.</p>
      ) : null}

      {isPremium ? (
        <div className="mt-4">
          <p className="text-sm text-muted">You're on the <span className="font-semibold text-strong">Premium</span> plan{user.subscriptionStatus ? ` (${user.subscriptionStatus})` : ""}: unlimited AI-generated plans and priority processing.</p>
          <Button className="mt-4" variant="secondary" loading={portalMutation.isPending} loadingLabel="Opening…" onClick={() => portalMutation.mutate()}>Manage billing</Button>
          {portalError ? <p role="alert" className="mt-3 text-sm text-danger">{portalError}</p> : null}
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-muted">You're on the <span className="font-semibold text-strong">Free</span> plan: 1 new AI-generated plan per month. Upgrade to Premium for unlimited plans and priority processing.</p>
          <Button className="mt-4" leadingIcon={<Sparkles size={17} />} loading={checkoutMutation.isPending} loadingLabel="Redirecting…" onClick={() => checkoutMutation.mutate()}>Upgrade to Premium</Button>
          {checkoutError ? <p role="alert" className="mt-3 text-sm text-danger">{checkoutError}</p> : null}
        </div>
      )}
    </Surface>
  );
}
