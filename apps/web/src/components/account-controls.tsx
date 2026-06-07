"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";

/** Privacy controls: export everything, or delete everything for this session. */
export function AccountControls() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function deleteAll() {
    setDeleting(true);
    try {
      await fetch("/api/account", { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href="/api/account" className="btn-outline px-3.5 py-2 text-sm" download>
        <Download className="h-4 w-4" /> Export my data
      </a>
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-600">Delete everything?</span>
          <Button onClick={deleteAll} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Confirm delete
          </Button>
          <button onClick={() => setConfirming(false)} className="text-sm text-stone-500 hover:text-navy">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="btn-ghost px-3.5 py-2 text-sm text-stone-600">
          <Trash2 className="h-4 w-4" /> Delete my data
        </button>
      )}
    </div>
  );
}
