import {
  Ban,
  FileWarning,
  Scale,
  Send,
  ShieldAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Maps case-type icon names (from the core registry) to Lucide icons. */
const ICONS: Record<string, LucideIcon> = {
  ban: Ban,
  wallet: Wallet,
  "shield-alert": ShieldAlert,
  "file-warning": FileWarning,
  scale: Scale,
  send: Send,
};

export function CaseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FileWarning;
  return <Icon className={className} aria-hidden />;
}
