"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { getCaseTypeDefinition, type CaseType, type Classification } from "@cancelclaim/core";
import { Button } from "@/components/ui";
import { track } from "@/lib/track";

const EXAMPLES = [
  "Netflix keeps charging me after I tried to cancel",
  "My flight was cancelled and they won't refund me",
  "The bank charged me twice for one order",
];

export function ClassifierBox() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Classification | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(input: string) {
    const value = input.trim();
    if (value.length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (!res.ok) throw new Error("classify failed");
      const data = (await res.json()) as { classification: Classification };
      setResult(data.classification);
      track("classify_used", { type: data.classification.type });
    } catch {
      setError("We couldn't analyse that just now. Pick a category below instead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card surface-grain p-5 sm:p-6">
      <label htmlFor="situation" className="flex items-center gap-2 text-sm font-medium text-navy">
        <Sparkles className="h-4 w-4 text-gold" aria-hidden />
        Describe your situation
      </label>
      <textarea
        id="situation"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="e.g. I cancelled my gym membership last month but I'm still being charged…"
        className="input-base mt-2 resize-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={() => run(text)} disabled={loading || text.trim().length < 3} variant="gold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analysing…" : "Find my path"}
        </Button>
        <span className="text-xs text-stone-500">No account needed</span>
      </div>

      {!result && !loading ? (
        <div className="mt-4">
          <p className="text-xs text-stone-500">Try one of these:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setText(ex);
                  void run(ex);
                }}
                className="rounded-full border border-stone-200 bg-ivory px-3 py-1 text-left text-xs text-stone-600 transition hover:border-gold hover:text-navy"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}

function ResultCard({ result }: { result: Classification }) {
  const def = getCaseTypeDefinition(result.type);
  const confidence = Math.round(result.confidence * 100);
  return (
    <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 animate-fade-in-up">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">Best match · {confidence}%</p>
      <p className="mt-1 font-serif text-lg font-semibold text-navy">{def.label}</p>
      <p className="mt-1 text-sm text-stone-600">{def.tagline}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link href={`/cases/new/${result.type}?source=classifier`} className="btn-primary px-3.5 py-2 text-sm">
          Start this case <ArrowRight className="h-4 w-4" />
        </Link>
        {result.alternatives?.slice(0, 2).map((alt) => (
          <Link
            key={alt.type}
            href={`/cases/new/${alt.type as CaseType}`}
            className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600 transition hover:border-navy hover:text-navy"
          >
            {getCaseTypeDefinition(alt.type as CaseType).label}
          </Link>
        ))}
      </div>
    </div>
  );
}
