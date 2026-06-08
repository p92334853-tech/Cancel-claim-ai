"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Loader2, Paperclip, Plus, Sparkles, X } from "lucide-react";
import {
  getCaseTypeDefinition,
  validateIntake,
  type CaseType,
  type IntakeField,
  type MissingInfoItem,
} from "@cancelclaim/core";
import { Button, Card } from "@/components/ui";
import { Disclaimer } from "@/components/site/disclaimer";
import { track } from "@/lib/track";

type LocalEvidence = { tempId: string; kind: "file" | "note"; name: string; mime?: string; size?: number; textContent?: string };

const STEPS = ["Details", "Evidence", "Review"] as const;

export function IntakeWizard({ caseType }: { caseType: CaseType; source?: string }) {
  const def = getCaseTypeDefinition(caseType);
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [intake, setIntake] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of def.fields) if (f.defaultValue) initial[f.name] = f.defaultValue;
    return initial;
  });
  const [evidence, setEvidence] = useState<LocalEvidence[]>([]);
  const [note, setNote] = useState("");
  const [missing, setMissing] = useState<MissingInfoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredMissing = useMemo(() => validateIntake(caseType, intake).items.filter((i) => i.severity === "required"), [caseType, intake]);

  function setField(name: string, value: string) {
    setIntake((prev) => ({ ...prev, [name]: value }));
  }

  function goDetails() {
    if (requiredMissing.length) {
      setMissing(requiredMissing);
      return;
    }
    setMissing([]);
    track("intake_step", { caseType, step: "evidence" });
    setStep(1);
  }

  function addNote() {
    const text = note.trim();
    if (!text) return;
    setEvidence((prev) => [...prev, { tempId: crypto.randomUUID(), kind: "note", name: "Note", textContent: text }]);
    setNote("");
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("That file is over 5MB. Please attach a smaller file or paste the relevant text.");
      } else {
        const isText = file.type.startsWith("text/") || /\.(txt|md|csv|log|eml)$/i.test(file.name);
        const textContent = isText ? (await file.text()).slice(0, 20_000) : undefined;
        setEvidence((prev) => [
          ...prev,
          { tempId: crypto.randomUUID(), kind: "file", name: file.name, mime: file.type, size: file.size, textContent },
        ]);
        setError(null);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeEvidence(tempId: string) {
    setEvidence((prev) => prev.filter((e) => e.tempId !== tempId));
  }

  async function generate() {
    setSubmitting(true);
    setError(null);
    try {
      const createRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: caseType, intake, locale: "en" }),
      });
      if (!createRes.ok) throw new Error("create");
      const { case: created } = (await createRes.json()) as { case: { id: string } };

      for (const ev of evidence) {
        await fetch(`/api/cases/${created.id}/evidence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: ev.kind, name: ev.name, mime: ev.mime, size: ev.size, textContent: ev.textContent }),
        });
      }

      const genRes = await fetch(`/api/cases/${created.id}/generate`, { method: "POST" });
      if (!genRes.ok) {
        // Still navigate — the detail page lets them fix details and retry.
        router.push(`/cases/${created.id}`);
        return;
      }
      track("case_generated_client", { caseType });
      router.push(`/cases/${created.id}`);
    } catch {
      setError("Something went wrong creating your case. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Stepper step={step} />

      {step === 0 ? (
        <Card className="mt-6 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold text-navy">{def.label}</h2>
          <p className="mt-1 text-stone-600">{def.tagline}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {def.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={intake[field.name] ?? ""}
                invalid={missing.some((m) => m.field === field.name)}
                onChange={(v) => setField(field.name, v)}
              />
            ))}
          </div>
          {missing.length ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Please complete the highlighted required fields.
            </p>
          ) : null}
          <div className="mt-7 flex items-center justify-between">
            <Link href="/start" className="btn-ghost px-3 py-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <Button onClick={goDetails} variant="primary">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="mt-6 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold text-navy">Add evidence</h2>
          <p className="mt-1 text-stone-600">
            Optional, but it makes your case stronger. Paste an order confirmation, an email, or a few key facts.
          </p>

          <div className="mt-6">
            <label htmlFor="note" className="label">
              Paste text or notes
            </label>
            <textarea
              id="note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Order #A-1182 confirmed on 2 May for $89. Support said they'd reply in 48h — that was 9 days ago."
              className="input-base resize-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button onClick={addNote} variant="outline" disabled={!note.trim()}>
                <Plus className="h-4 w-4" /> Add note
              </Button>
              <button onClick={() => fileInput.current?.click()} className="btn-ghost px-3 py-2 text-sm">
                <Paperclip className="h-4 w-4" /> Attach a file
              </button>
              <input ref={fileInput} type="file" className="hidden" onChange={onFile} />
            </div>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </div>

          {evidence.length ? (
            <ul className="mt-6 space-y-2">
              {evidence.map((ev) => (
                <li key={ev.tempId} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-ivory px-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-stone-500" />
                  <span className="min-w-0 flex-1 truncate text-sm text-navy">
                    {ev.name}
                    {ev.kind === "note" && ev.textContent ? `: ${ev.textContent.slice(0, 60)}…` : ""}
                  </span>
                  {ev.kind === "file" && !ev.textContent ? (
                    <span className="text-xs text-stone-400">stored as reference</span>
                  ) : null}
                  <button onClick={() => removeEvidence(ev.tempId)} className="text-stone-400 hover:text-red-600" aria-label="Remove">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-ivory px-4 py-6 text-center text-sm text-stone-500">
              No evidence yet. You can add some now or continue without it.
            </p>
          )}

          <div className="mt-7 flex items-center justify-between">
            <Button onClick={() => setStep(0)} variant="ghost">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(2)} variant="primary">
              Review <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="mt-6 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold text-navy">Review &amp; generate</h2>
          <p className="mt-1 text-stone-600">We&apos;ll write five versions, summarise your evidence, and build a follow-up plan.</p>

          <dl className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
            {def.fields
              .filter((f) => (intake[f.name] ?? "").trim())
              .map((f) => (
                <div key={f.name} className="flex gap-4 px-4 py-3">
                  <dt className="w-40 shrink-0 text-sm text-stone-500">{f.label.replace(/\s*\(optional\)/i, "")}</dt>
                  <dd className="text-sm text-navy">{displayValue(f, intake[f.name] ?? "")}</dd>
                </div>
              ))}
            <div className="flex gap-4 px-4 py-3">
              <dt className="w-40 shrink-0 text-sm text-stone-500">Evidence</dt>
              <dd className="text-sm text-navy">{evidence.length ? `${evidence.length} item(s)` : "None attached"}</dd>
            </div>
          </dl>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 rounded-xl bg-navy/5 p-4">
            <Disclaimer />
          </div>

          <div className="mt-7 flex items-center justify-between">
            <Button onClick={() => setStep(1)} variant="ghost" disabled={submitting}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={generate} variant="gold" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {submitting ? "Drafting your case…" : "Generate my drafts"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={
                "grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold " +
                (active
                  ? "border-gold bg-gold text-navy-900"
                  : done
                    ? "border-navy bg-navy text-ivory"
                    : "border-stone-300 bg-paper text-stone-400")
              }
            >
              {i + 1}
            </span>
            <span className={active ? "font-medium text-navy" : "text-stone-500"}>{label}</span>
            {i < STEPS.length - 1 ? <span className="mx-1 h-px w-6 bg-stone-300" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function FieldInput({
  field,
  value,
  invalid,
  onChange,
}: {
  field: IntakeField;
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  const wide = field.type === "textarea";
  const base = "input-base" + (invalid ? " border-red-400 ring-2 ring-red-100" : "");

  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={field.name} className="label">
        {field.label}
        {field.required ? <span className="ml-1 text-gold-700">*</span> : null}
      </label>
      {field.type === "textarea" ? (
        <textarea id={field.name} rows={3} value={value} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={base + " resize-none"} />
      ) : field.type === "select" ? (
        <select id={field.name} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.name}
          type={field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
          inputMode={field.type === "money" ? "decimal" : undefined}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
      {field.help ? <p className="mt-1 text-xs text-stone-500">{field.help}</p> : null}
    </div>
  );
}

function displayValue(field: IntakeField, value: string): string {
  if (field.type === "select") return field.options?.find((o) => o.value === value)?.label ?? value;
  return value;
}
