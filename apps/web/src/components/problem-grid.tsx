import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listCaseTypeDefinitions, type CaseType } from "@cancelclaim/core";
import { CaseIcon } from "@/components/icon";

type LinkTarget = "case" | "solution";

function hrefFor(target: LinkTarget, type: CaseType, slug: string): string {
  return target === "case" ? `/cases/new/${type}` : `/solutions/${slug}`;
}

/** The problem-first grid used on the landing and start pages. */
export function ProblemGrid({ target = "case" }: { target?: LinkTarget }) {
  const definitions = listCaseTypeDefinitions();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {definitions.map((def) => (
        <Link
          key={def.type}
          href={hrefFor(target, def.type, def.slug)}
          className="group card flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy/5 text-navy transition group-hover:bg-gold/10 group-hover:text-gold-700">
            <CaseIcon name={def.icon} className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-serif text-xl font-semibold text-navy">{def.label}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-600">{def.tagline}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-700">
            Start <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
