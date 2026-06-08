"use client";

import { useState } from "react";
import { CalendarClock, Check, Lock } from "lucide-react";
import { formatLongDate, type FollowUpStep } from "@cancelclaim/core";
import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";
import { UnlockButton } from "./unlock-button";

export function ReminderList({ caseId, steps, unlocked }: { caseId: string; steps: FollowUpStep[]; unlocked: boolean }) {
  const [items, setItems] = useState(steps);

  async function toggle(id: string, done: boolean) {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, done } : s)));
    try {
      await fetch(`/api/cases/${caseId}/reminders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId: id, done }),
      });
    } catch {
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, done: !done } : s)));
    }
  }

  return (
    <ol className="space-y-3">
      {items.map((step) => (
        <li key={step.id} className={cn("rounded-xl border p-4 transition", step.done ? "border-emerald-200 bg-emerald-50/40" : "border-stone-200 bg-paper")}>
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggle(step.id, !step.done)}
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
                step.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 hover:border-navy",
              )}
              aria-label={step.done ? "Mark not done" : "Mark done"}
            >
              {step.done ? <Check className="h-3.5 w-3.5" /> : null}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("font-medium", step.done ? "text-stone-500 line-through" : "text-navy")}>{step.label}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs capitalize text-stone-600">
                  {step.channel}
                </span>
              </div>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-stone-500">
                <CalendarClock className="h-3.5 w-3.5" />
                {step.dueDate ? formatLongDate(step.dueDate) : `Day ${step.offsetDays}`}
              </p>

              {unlocked ? (
                <div className="mt-3 rounded-lg bg-ivory p-3">
                  <p className="whitespace-pre-wrap text-sm text-stone-700">{step.message}</p>
                  <div className="mt-2">
                    <CopyButton text={step.message} label="Copy message" className="px-2.5 py-1 text-xs" />
                  </div>
                </div>
              ) : (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone-400">
                  <Lock className="h-3.5 w-3.5" /> Ready-to-send message included in the full pack
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
      {!unlocked ? (
        <li>
          <UnlockButton caseId={caseId} label="Unlock follow-up messages" />
        </li>
      ) : null}
    </ol>
  );
}
