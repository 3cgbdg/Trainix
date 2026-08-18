"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-canvas text-strong">
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold text-danger">Application error</p>
          <h1 className="mt-2 text-2xl font-bold">Trainix could not continue</h1>
          <p className="mt-3 text-muted">Your saved fitness data has not been changed. Reload the application to try again.</p>
          <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-control bg-brand px-4 font-semibold text-on-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            Reload Trainix
          </button>
        </main>
      </body>
    </html>
  );
}
