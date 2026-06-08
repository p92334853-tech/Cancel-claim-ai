"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileText, Paperclip, Plus, X } from "lucide-react";
import type { EvidenceItem } from "@cancelclaim/core";
import { Button } from "@/components/ui";

export function EvidenceManager({ caseId, initial }: { caseId: string; initial: EvidenceItem[] }) {
  const [items, setItems] = useState<EvidenceItem[]>(initial);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function add(payload: { kind: "file" | "note"; name: string; mime?: string; size?: number; textContent?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("add");
      const { evidence } = (await res.json()) as { evidence: EvidenceItem };
      setItems((prev) => [...prev, evidence]);
    } catch {
      setError("Couldn't add that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    const text = note.trim();
    if (!text) return;
    await add({ kind: "note", name: "Note", textContent: text });
    setNote("");
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("That file is over 5MB. Paste the relevant text instead.");
      } else {
        const isText = file.type.startsWith("text/") || /\.(txt|md|csv|log|eml)$/i.test(file.name);
        const textContent = isText ? (await file.text()).slice(0, 20_000) : undefined;
        await add({ kind: "file", name: file.name, mime: file.type, size: file.size, textContent });
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/cases/${caseId}/evidence?evidenceId=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  return (
    <div>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((ev) => (
            <li key={ev.id} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-ivory px-3 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-stone-500" />
              <span className="min-w-0 flex-1 truncate text-sm text-navy">
                {ev.name}
                {ev.kind === "note" && ev.textContent ? `: ${ev.textContent.slice(0, 60)}…` : ""}
              </span>
              <button onClick={() => remove(ev.id)} className="text-stone-400 hover:text-red-600" aria-label="Remove">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-stone-300 bg-ivory px-4 py-5 text-center text-sm text-stone-500">
          No evidence attached. Add a note or file to strengthen this case.
        </p>
      )}

      <div className="mt-4">
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Paste an order number, a quote from support, dates…"
          className="input-base resize-none"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button onClick={addNote} variant="outline" disabled={busy || !note.trim()}>
            <Plus className="h-4 w-4" /> Add note
          </Button>
          <button onClick={() => fileInput.current?.click()} className="btn-ghost px-3 py-2 text-sm" disabled={busy}>
            <Paperclip className="h-4 w-4" /> Attach file
          </button>
          <input ref={fileInput} type="file" className="hidden" onChange={onFile} />
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <p className="mt-2 text-xs text-stone-500">Tip: after changing evidence, regenerate to refresh your drafts.</p>
      </div>
    </div>
  );
}
