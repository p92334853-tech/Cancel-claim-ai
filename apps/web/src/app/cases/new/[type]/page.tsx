import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_TYPES, getCaseTypeDefinition, type CaseType } from "@cancelclaim/core";
import { Container, Eyebrow } from "@/components/ui";
import { IntakeWizard } from "@/components/intake-wizard";

type Params = { params: Promise<{ type: string }>; searchParams: Promise<{ source?: string }> };

export function generateStaticParams() {
  return CASE_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type } = await params;
  if (!(CASE_TYPES as readonly string[]).includes(type)) return {};
  return { title: `New case · ${getCaseTypeDefinition(type as CaseType).label}` };
}

export default async function NewCasePage({ params, searchParams }: Params) {
  const { type } = await params;
  const { source } = await searchParams;
  if (!(CASE_TYPES as readonly string[]).includes(type)) notFound();

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <Eyebrow>New case</Eyebrow>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tightish text-navy">Let&apos;s build your case</h1>
        <p className="mt-2 text-stone-600">A few details, optional evidence, and you&apos;ll have a complete pack to act on.</p>
        <div className="mt-8">
          <IntakeWizard caseType={type as CaseType} source={source} />
        </div>
      </div>
    </Container>
  );
}
