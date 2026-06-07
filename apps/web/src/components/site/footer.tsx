import Link from "next/link";
import { listCaseTypeDefinitions } from "@cancelclaim/core";
import { Logo } from "./logo";
import { Disclaimer } from "./disclaimer";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/start", label: "Start a case" },
      { href: "/pricing", label: "Pricing" },
      { href: "/cases", label: "My cases" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/support", label: "Support" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms & disclaimer" },
    ],
  },
];

export function Footer() {
  const solutions = listCaseTypeDefinitions();
  return (
    <footer className="mt-24 border-t border-stone-200 bg-paper">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            A calm, precise assistant for recovering money and ending unwanted charges — problem to action in minutes.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy">Solutions</h3>
          <ul className="mt-4 space-y-2.5">
            {solutions.map((s) => (
              <li key={s.slug}>
                <Link href={`/solutions/${s.slug}`} className="text-sm text-stone-600 transition hover:text-navy">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-navy">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-stone-600 transition hover:text-navy">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200">
        <div className="container-page flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} Cancel &amp; Claim AI. All rights reserved.</p>
          <Disclaimer className="max-w-xl sm:text-right" />
        </div>
      </div>
    </footer>
  );
}
