import Link from "next/link";
import { cn } from "@/lib/cn";

/** Wordmark with a restrained gold seal mark. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Cancel & Claim AI home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-gold shadow-soft">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={cn("font-serif text-lg font-semibold tracking-tightish", light ? "text-ivory" : "text-navy")}>
        Cancel <span className="text-gold">&amp;</span> Claim
      </span>
    </Link>
  );
}
