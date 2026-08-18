"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "trainix-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const respond = (choice: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie notice" className="fixed inset-x-3 bottom-3 z-[80] mx-auto flex max-w-xl flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-5 text-muted">
        We use a few strictly necessary cookies to keep you signed in. See our{" "}
        <Link href="/privacy" className="link">Privacy Policy</Link> for details.
      </p>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" size="sm" onClick={() => respond("declined")}>Decline</Button>
        <Button size="sm" onClick={() => respond("accepted")}>Accept</Button>
      </div>
    </div>
  );
}
