import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getCaseTypeBySlug, listCaseTypeDefinitions } from "@cancelclaim/core";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { CaseIcon } from "@/components/icon";
import { Disclaimer } from "@/components/site/disclaimer";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listCaseTypeDefinitions().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const def = getCaseTypeBySlug(slug);
  if (!def) return {};
  return {
    title: def.label,
    description: def.description,
    keywords: def.keywords,
    alternates: { canonical: `/solutions/${def.slug}` },
    openGraph: { title: `${def.label} · Cancel & Claim AI`, description: def.description },
  };
}

const BENEFITS = [
  "Written to get a reply, not just to vent",
  "Five versions for every channel and tone",
  "A clean PDF case file and evidence summary",
  "A follow-up plan so nothing slips",
];

export default async function SolutionPage({ params }: Params) {
  const { slug } = await params;
  const def = getCaseTypeBySlug(slug);
  if (!def) notFound();

  const others = listCaseTypeDefinitions().filter((d) => d.slug !== slug);

  return (
    <>
      <section className="border-b border-stone-200 bg-paper">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1">
              <CaseIcon name={def.icon} className="h-4 w-4 text-gold-700" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">{def.label}</span>
            </div>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tightish text-navy sm:text-5xl">
              {def.tagline}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-700">{def.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={`/cases/new/${def.type}?source=solution`} variant="gold" large>
                Start this case <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/pricing" variant="outline" large>
                Pricing
              </ButtonLink>
            </div>
          </div>
          <ul className="card space-y-3 p-6">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-700">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-stone-700">{b}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <Eyebrow>What you&apos;ll provide</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-navy sm:text-3xl">Just the essentials</h2>
          <p className="mt-3 max-w-2xl text-stone-700">
            We only ask for what strengthens your case. Most people finish in a few minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {def.fields
              .filter((f) => f.name !== "yourName" && f.name !== "yourContact")
              .map((f) => (
                <span
                  key={f.name}
                  className="rounded-full border border-stone-200 bg-paper px-3 py-1.5 text-sm text-stone-600"
                >
                  {f.label.replace(/\s*\(optional\)/i, "")}
                  {f.required ? <span className="ml-1 text-gold-700">*</span> : null}
                </span>
              ))}
          </div>
          <div className="mt-10">
            <ButtonLink href={`/cases/new/${def.type}?source=solution`} variant="primary" large>
              Begin <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-t border-stone-200 bg-paper py-16">
        <Container>
          <h2 className="font-serif text-2xl font-semibold text-navy">Other things we help with</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/solutions/${o.slug}`}
                className="group card flex items-center gap-3 p-4 transition hover:border-gold/40"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy/5 text-navy">
                  <CaseIcon name={o.icon} className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-navy">{o.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-gold-700" />
              </Link>
            ))}
          </div>
          <Disclaimer className="mt-10" />
        </Container>
      </section>
    </>
  );
}
