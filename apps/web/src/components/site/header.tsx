import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { Logo } from "./logo";

const NAV = [
  { href: "/start", label: "Start a case" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/cases", label: "My cases" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-ivory/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-stone-700 transition hover:text-navy">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/cases" className="text-sm font-medium text-stone-700 transition hover:text-navy md:hidden">
            My cases
          </Link>
          <ButtonLink href="/start" variant="gold" className="px-3.5 py-2 text-sm">
            Start a case
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
