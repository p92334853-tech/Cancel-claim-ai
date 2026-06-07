import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderOpen, Plus } from "lucide-react";
import { getCaseTypeDefinition, type CaseStatus } from "@cancelclaim/core";
import { ButtonLink, Card, Container, Eyebrow } from "@/components/ui";
import { CaseIcon } from "@/components/icon";
import { AccountControls } from "@/components/account-controls";
import { caseRepository } from "@/lib/repository";
import { getOwnerId } from "@/lib/session";

export const metadata: Metadata = { title: "My cases", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<CaseStatus, { label: string; tone: string }> = {
  open: { label: "Draft", tone: "bg-stone-100 text-stone-600 border-stone-200" },
  generated: { label: "Ready", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  archived: { label: "Archived", tone: "bg-stone-100 text-stone-500 border-stone-200" },
};

export default async function CasesPage() {
  const ownerId = await getOwnerId();
  const cases = ownerId ? await caseRepository.list(ownerId) : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Your workspace</Eyebrow>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tightish text-navy">My cases</h1>
        </div>
        <ButtonLink href="/start" variant="gold">
          <Plus className="h-4 w-4" /> Start a case
        </ButtonLink>
      </div>

      {cases.length === 0 ? (
        <Card className="mt-10 flex flex-col items-center px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy/5 text-navy">
            <FolderOpen className="h-7 w-7" />
          </span>
          <h2 className="mt-5 font-serif text-2xl font-semibold text-navy">No cases yet</h2>
          <p className="mt-2 max-w-sm text-stone-600">Start one and we&apos;ll do the heavy lifting — drafts, evidence, and follow-ups.</p>
          <ButtonLink href="/start" variant="primary" className="mt-6">
            Start your first case <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => {
            const def = getCaseTypeDefinition(c.type);
            const status = STATUS[c.status];
            return (
              <li key={c.id}>
                <Link href={`/cases/${c.id}`} className="group card flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy/5 text-navy">
                      <CaseIcon name={def.icon} className="h-5 w-5" />
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <h3 className="mt-4 line-clamp-2 font-serif text-lg font-semibold text-navy">{c.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{def.label}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-400">
                    <span>Updated {new Date(c.updatedAt).toLocaleDateString()}</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-gold-700" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-16 border-t border-stone-200 pt-8">
        <h2 className="text-sm font-semibold text-navy">Privacy controls</h2>
        <p className="mt-1 max-w-xl text-sm text-stone-600">
          Your cases are tied to this device session. Export or permanently delete everything at any time.
        </p>
        <div className="mt-4">
          <AccountControls />
        </div>
      </div>
    </Container>
  );
}
