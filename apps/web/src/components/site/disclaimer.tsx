import { cn } from "@/lib/cn";

export const DISCLAIMER_TEXT =
  "Cancel & Claim AI is a self-help tool, not a law firm, and does not provide legal advice. You are responsible for reviewing everything before you send it.";

export function Disclaimer({ className }: { className?: string }) {
  return <p className={cn("text-xs leading-relaxed text-stone-500", className)}>{DISCLAIMER_TEXT}</p>;
}
