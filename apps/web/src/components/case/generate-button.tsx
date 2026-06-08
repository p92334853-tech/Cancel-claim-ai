"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

export function GenerateButton({ caseId, regenerate = false }: { caseId: string; regenerate?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/generate`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Generation failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={run} variant={regenerate ? "outline" : "gold"} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : regenerate ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Drafting…" : regenerate ? "Regenerate" : "Generate my drafts"}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
