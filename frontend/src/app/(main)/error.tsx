"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/Feedback";

export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState onRetry={reset} />;
}
