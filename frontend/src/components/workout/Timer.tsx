"use client";

import { memo, useEffect, useRef, useState } from "react";

function Timer({ workoutTime, isPaused, onFinish }: { workoutTime: number; onFinish: () => void; isPaused: boolean }) {
  const [time, setTime] = useState(workoutTime);
  const finished = useRef(false);

  useEffect(() => {
    if (isPaused || time <= 0) return;
    const timeout = window.setTimeout(() => setTime((current) => Math.max(current - 1, 0)), 1000);
    return () => window.clearTimeout(timeout);
  }, [isPaused, time]);
  useEffect(() => {
    if (time === 0 && !finished.current) { finished.current = true; onFinish(); }
  }, [time, onFinish]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return <div role="timer" aria-label={`${minutes} minutes ${seconds} seconds remaining`} className="font-mono text-5xl font-bold tabular-nums tracking-tight text-strong sm:text-6xl">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>;
}

export default memo(Timer);
