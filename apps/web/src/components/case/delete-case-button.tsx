"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteCaseButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
      router.push("/cases");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="btn-ghost px-3 py-2 text-sm text-stone-500 hover:text-red-600">
        <Trash2 className="h-4 w-4" /> Delete case
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-stone-600">Delete this case?</span>
      <button onClick={remove} disabled={deleting} className="btn-outline border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Confirm
      </button>
      <button onClick={() => setConfirming(false)} className="text-stone-500 hover:text-navy">
        Cancel
      </button>
    </div>
  );
}
