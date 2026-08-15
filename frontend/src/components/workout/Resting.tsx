"use client";

import { SkipForward } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

function Resting({ onComplete, seconds = 15 }: { onComplete: () => void; seconds?: number }) {
  const [time, setTime] = useState(seconds);
  useEffect(() => {
    if (time <= 0) { onComplete(); return; }
    const timeout = window.setTimeout(() => setTime((current) => current - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [time, onComplete]);

  return (
    <Surface variant="brand" padding="lg" className="mx-auto flex min-h-[32rem] max-w-3xl flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-brand-strong">Recovery interval</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-strong">Catch your breath</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">Relax your shoulders, breathe slowly, and get ready for the next movement.</p>
      <div role="timer" aria-label={`${time} seconds of rest remaining`} className="my-10 font-mono text-7xl font-bold tabular-nums text-strong">00:{String(time).padStart(2, "0")}</div>
      <Button variant="secondary" size="lg" leadingIcon={<SkipForward size={18} />} onClick={onComplete}>Skip rest</Button>
    </Surface>
  );
}

export default memo(Resting);
