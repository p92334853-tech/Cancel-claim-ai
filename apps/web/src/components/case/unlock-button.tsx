"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { track } from "@/lib/track";

export function UnlockButton({
  caseId,
  plan = "single",
  label = "Unlock full case pack",
  className,
}: {
  caseId: string;
  plan?: "single" | "bundle" | "pro";
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unlock() {
    setLoading(true);
    setError(null);
    track("checkout_started", { plan, caseId });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, caseId }),
      });
      if (!res.ok) throw new Error("checkout");
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    } catch {
      setError("Couldn't start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button onClick={unlock} variant="gold" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {label}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
