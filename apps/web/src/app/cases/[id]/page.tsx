import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Compass, FileStack, Lock, Sparkles } from "lucide-react";
import { formatLongDate, getCaseTypeDefinition } from "@cancelclaim/core";
import { Card, Container } from "@/components/ui";
import { CaseIcon } from "@/components/icon";
import { Disclaimer } from "@/components/site/disclaimer";
import { ResultsView } from "@/components/case/results-view";
import { ReminderList } from "@/components/case/reminder-list";
import { EvidenceManager } from "@/components/case/evidence-manager";
import { GenerateButton } from "@/components/case/generate-button";
import { UnlockButton } from "@/components/case/unlock-button";
import { DeleteCaseButton } from "@/components/case/delete-case-button";
import { caseRepository } from "@/lib/repository";
import { getOwnerId } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ canceled?: string }> };

export default async function CaseDetailPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { canceled } = await searchParams;
  const ownerId = await getOwnerId();
  const found = ownerId ? await caseRepository.get(ownerId, id) : null;
  if (!found) notFound();

  const def = getCaseTypeDefinition(found.type);
  const generated = Boolean(found.output);
  const unlocked = found.unlocked;

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between">
        <Link href="/cases" className="btn-ghost px-2.5 py-1.5 text-sm">
          <ArrowLeft className="h-4 w-4" /> All cases
        </Link>
        <DeleteCaseButton caseId={found.id} />
      </div>

      <div className="mt-4 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/5 text-navy">
          <CaseIcon name={def.icon} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tightish text-navy">{found.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <span>{def.label}</span>
            {generated ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                Draft
              </span>
            )}
            {found.output?.generatedBy === "llm" ? (
              <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                <Sparkles className="h-3 w-3" /> AI-enhanced
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {canceled ? (
        <p className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Checkout was cancelled — no charge was made. Your short version is still free to use.
        </p>
      ) : null}

      {!generated ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold text-navy">Generate your drafts</h2>
            <p className="mt-1.5 text-sm text-stone-600">
              We have your details. Generate five tailored drafts, an evidence summary, and a follow-up plan.
            </p>
            <div className="mt-5">
              <GenerateButton caseId={found.id} />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold text-navy">Evidence</h2>
            <p className="mt-1.5 text-sm text-stone-600">Optional — add anything that strengthens your case.</p>
            <div className="mt-4">
              <EvidenceManager caseId={found.id} initial={found.evidence} />
            </div>
          </Card>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {!unlocked ? (
              <Card className="border-gold/40 bg-gold/5 p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-700">
                    <Lock className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <h2 className="font-serif text-lg font-semibold text-navy">Unlock the full case pack</h2>
                    <p className="mt-1 text-sm text-stone-600">
                      Your short version is free. Unlock to reveal the formal, firm, chat, and follow-up versions, the
                      ready-to-send reminders, and a polished PDF case file.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <UnlockButton caseId={found.id} />
                      <Link href="/pricing" className="text-sm font-medium text-navy underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
                        See pricing
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {found.output?.nextBestAction ? (
              <Card className="flex items-start gap-3 p-5">
                <Compass className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">Recommended next step</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink">{found.output.nextBestAction}</p>
                </div>
              </Card>
            ) : null}

            <section>
              <h2 className="mb-3 font-serif text-xl font-semibold text-navy">Your drafts</h2>
              <ResultsView caseId={found.id} variants={found.output!.variants} unlocked={unlocked} />
            </section>

            <section>
              <h2 className="mb-3 font-serif text-xl font-semibold text-navy">Follow-up plan</h2>
              <ReminderList caseId={found.id} steps={found.output!.followUpPlan.steps} unlocked={unlocked} />
            </section>
          </div>

          <aside className="space-y-6">
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy">
                <FileStack className="h-4 w-4 text-stone-500" /> Case snapshot
              </h3>
              <dl className="mt-3 space-y-2.5">
                {found.facts.slice(0, 10).map((fact) => (
                  <div key={fact.key}>
                    <dt className="text-xs uppercase tracking-wide text-stone-400">{fact.label}</dt>
                    <dd className="text-sm text-navy">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-navy">Evidence</h3>
              {found.output?.evidenceSummary ? (
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{found.output.evidenceSummary}</p>
              ) : null}
              <div className="mt-4">
                <EvidenceManager caseId={found.id} initial={found.evidence} />
              </div>
            </Card>

            {found.output?.timeline?.length ? (
              <Card className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <Clock className="h-4 w-4 text-stone-500" /> Timeline
                </h3>
                <ul className="mt-3 space-y-3">
                  {found.output.timeline.map((entry, i) => (
                    <li key={i} className="border-l-2 border-stone-200 pl-3">
                      <p className="text-xs text-stone-400">{entry.date ? formatLongDate(entry.date, found.locale) : "—"}</p>
                      <p className="text-sm text-navy">{entry.label}</p>
                      {entry.detail ? <p className="text-xs text-stone-500">{entry.detail}</p> : null}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-navy">Refine</h3>
              <p className="mt-1 text-xs text-stone-500">Changed your details or evidence? Regenerate to refresh every draft.</p>
              <div className="mt-3">
                <GenerateButton caseId={found.id} regenerate />
              </div>
            </Card>

            <Disclaimer />
          </aside>
        </div>
      )}
    </Container>
  );
}
