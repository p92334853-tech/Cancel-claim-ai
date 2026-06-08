"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { track } from "@/lib/track";

export function CheckoutButton({
  plan,
  label,
  variant = "primary",
}: {
  plan: "single" | "bundle" | "pro";
  label: string;
  variant?: "primary" | "gold" | "outline";
}) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    track("checkout_started", { plan });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string };
      window.location.href = data.url || "/cases";
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button onClick={go} variant={variant} disabled={loading} className="w-full">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}
