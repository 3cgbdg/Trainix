import { Suspense, type ReactNode } from "react";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { Skeleton } from "@/components/ui/Feedback";

function NavigationFallback() {
  return (
    <div aria-hidden="true" className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center gap-3 border-t border-border bg-surface px-3 lg:inset-y-0 lg:right-auto lg:h-auto lg:w-64 lg:flex-col lg:border-r lg:border-t-0 lg:p-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="hidden h-10 w-full lg:block" />
      <Skeleton className="hidden h-10 w-full lg:block" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Suspense fallback={<NavigationFallback />}>
        <AppNavigation />
      </Suspense>
      <main id="main-content" tabIndex={-1} className="min-w-0 px-3 pb-24 pt-4 sm:px-6 sm:pt-6 lg:ml-64 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mx-auto w-full max-w-content">{children}</div>
      </main>
    </div>
  );
}
