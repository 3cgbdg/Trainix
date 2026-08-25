"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, Apple, Camera, Dumbbell, LayoutDashboard, LogOut, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { api, resumeSessionRefresh, suspendSessionRefresh } from "@/api/axiosInstance";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { cn } from "@/lib/cn";
import { logOut } from "@/redux/authSlice";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  matches: string[];
};

const navItems: NavItem[] = [
  { label: "Today", href: "/today", icon: LayoutDashboard, matches: ["/today", "/dashboard"] },
  { label: "Plan", href: "/workout-plan", icon: Dumbbell, matches: ["/workout-plan", "/nutrition-plan", "/workout"] },
  { label: "Body Scan", href: "/ai-analysis", icon: Camera, matches: ["/ai-analysis"] },
  { label: "Progress", href: "/progress", icon: Activity, matches: ["/progress"] },
  { label: "Profile", href: "/profile", icon: UserRound, matches: ["/profile"] },
];

function isCurrentPath(pathname: string, matches: string[]) {
  return matches.some((match) => pathname === match || pathname.startsWith(`${match}/`));
}

function Brand() {
  return (
    <Link href="/today" className="inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      <Logo size={32} />
      <span className="font-outfit text-lg font-bold tracking-tight">Trainix</span>
    </Link>
  );
}

function NavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return navItems.map((item) => {
    const active = isCurrentPath(pathname, item.matches);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          compact
            ? "relative flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold"
            : "flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          active ? "bg-brand-soft text-brand-strong" : "text-muted hover:bg-surface-muted hover:text-strong",
        )}
      >
        <Icon size={compact ? 21 : 20} strokeWidth={active ? 2.4 : 2} />
        <span>{item.label}</span>
        {compact && active ? <span aria-hidden="true" className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand" /> : null}
      </Link>
    );
  });
}

export function AppNavigation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      suspendSessionRefresh();
      try { return await api.delete("/api/auth/logout"); }
      catch (error) { resumeSessionRefresh(); throw error; }
    },
    onSuccess: () => {
      queryClient.clear();
      dispatch(logOut());
      router.push("/auth/login");
    },
  });

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-border bg-surface/95 px-3 backdrop-blur lg:hidden">
        <Brand />
        <Link href="/nutrition-plan" className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <Apple size={19} />
          <span className="hidden sm:inline">Nutrition</span>
        </Link>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface p-4 lg:flex">
        <Brand />
        <nav aria-label="Primary" className="mt-8 flex flex-1 flex-col gap-1">
          <NavLinks />
        </nav>
        <div className="mb-4 rounded-card border border-brand/20 bg-brand-soft p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-strong">
            <span className="grid size-8 place-items-center rounded-full bg-brand text-white">
              <Sparkles size={16} aria-hidden="true" />
            </span>
            AI coach active
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            Your plan adapts from workouts, nutrition, and body scans.
          </p>
          <Link
            href="/ai-analysis"
            className="mt-3 inline-flex min-h-9 items-center text-xs font-bold text-brand-strong hover:text-brand"
          >
            Review latest scan →
          </Link>
        </div>
        <div className="border-t border-border pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            leadingIcon={<LogOut size={19} />}
            loading={logoutMutation.isPending}
            loadingLabel="Signing out…"
            onClick={() => logoutMutation.mutate()}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <NavLinks compact />
      </nav>
    </>
  );
}
