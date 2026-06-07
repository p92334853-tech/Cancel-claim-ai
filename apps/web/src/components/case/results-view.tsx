"use client";

import { useState } from "react";
import { Download, Lock, Mail } from "lucide-react";
import type { DraftVariant } from "@cancelclaim/core";
import { cn } from "@/lib/cn";
import { track } from "@/lib/track";
import { CopyButton } from "./copy-button";
import { UnlockButton } from "./unlock-button";

export function ResultsView({
  caseId,
  variants,
  unlocked,
}: {
  caseId: string;
  variants: DraftVariant[];
  unlocked: boolean;
}) {
  const [active, setActive] = useState(0);
  const variant = variants[active] ?? variants[0];
  if (!variant) return null;

  // Free preview: the short version is always fully usable; the rest unlock together.
  const locked = !unlocked && variant.key !== "short";
  const fullText = variant.subject ? `Subject: ${variant.subject}\n\n${variant.body}` : variant.body;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-ivory/60 p-2">
        {variants.map((v, i) => {
          const isLocked = !unlocked && v.key !== "short";
          return (
            <button
              key={v.key}
              onClick={() => setActive(i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                i === active ? "bg-navy text-ivory" : "text-stone-600 hover:bg-stone-100",
              )}
            >
              {isLocked ? <Lock className="h-3.5 w-3.5 opacity-70" /> : null}
              {v.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 p-1">
          {unlocked ? (
            <a
              href={`/api/cases/${caseId}/export`}
              className="btn-outline px-3 py-1.5 text-sm"
              onClick={() => track("export_done", { caseType: "", format: "pdf" })}
            >
              <Download className="h-4 w-4" /> Export PDF
            </a>
          ) : null}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="rounded-full bg-stone-100 px-2 py-0.5 capitalize">{variant.channel}</span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 capitalize">{variant.tone} tone</span>
          </div>
          {!locked ? (
            <div className="flex items-center gap-2">
              {(variant.channel === "email" || variant.channel === "letter") && variant.subject ? (
                <a
                  className="btn-ghost px-3 py-1.5 text-sm"
                  href={`mailto:?subject=${encodeURIComponent(variant.subject)}&body=${encodeURIComponent(variant.body)}`}
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
              <CopyButton text={fullText} label="Copy" />
            </div>
          ) : null}
        </div>

        {variant.subject && !locked ? (
          <p className="mb-3 text-sm">
            <span className="font-medium text-stone-500">Subject:</span> <span className="text-navy">{variant.subject}</span>
          </p>
        ) : null}

        {locked ? (
          <LockedPreview caseId={caseId} body={variant.body} />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-ink">{variant.body}</pre>
        )}
      </div>
    </div>
  );
}

function LockedPreview({ caseId, body }: { caseId: string; body: string }) {
  const preview = body.split("\n").slice(0, 3).join("\n").slice(0, 260);
  return (
    <div className="relative">
      <pre className="max-h-40 overflow-hidden whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-stone-500 blur-[1.5px]">
        {preview}
      </pre>
      <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-paper via-paper/90 to-transparent pb-2 pt-10 text-center">
        <p className="mb-3 max-w-xs text-sm text-stone-600">
          Your short version is free. Unlock to reveal the formal, firm, chat, and follow-up versions plus the PDF pack.
        </p>
        <UnlockButton caseId={caseId} />
      </div>
    </div>
  );
}
