import Link from "next/link";
import {
  ArrowRight,
  FileText,
  FolderCheck,
  ListChecks,
  Lock,
  PenLine,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { ClassifierBox } from "@/components/classifier-box";
import { ProblemGrid } from "@/components/problem-grid";
import { Disclaimer } from "@/components/site/disclaimer";

const STEPS = [
  { icon: PenLine, title: "Tell us the problem", body: "Pick a category or describe it in your words. We classify it instantly." },
  { icon: Upload, title: "Add what you have", body: "Paste an order number, dates, or a screenshot. Minimum input, maximum output." },
  { icon: Sparkles, title: "Get five drafts", body: "Short, formal, firm, chat, and follow-up — written for the outcome you want." },
  { icon: FileText, title: "Export the pack", body: "A clean PDF case file, copy-ready emails, and an evidence summary." },
  { icon: ListChecks, title: "Follow up on time", body: "A reminder plan that nudges the next step until you get a result." },
];

const OUTPUTS = [
  "Email draft",
  "Chat / support message",
  "Formal complaint letter",
  "Short version",
  "Evidence summary",
  "Timeline summary",
  "PDF case packet",
  "Follow-up plan",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-paper to-ivory" />
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Eyebrow>Recover money · Stop unwanted charges</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-tightish text-navy sm:text-5xl lg:text-6xl">
              The calm way to cancel, claim, and dispute.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-700">
              Cancel &amp; Claim AI turns a frustrating situation into a ready-to-send action pack — the right words, the right
              evidence, and a plan to follow up. From problem to outcome in minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href="/start" variant="gold" large>
                Start a case <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/pricing" variant="outline" large>
                See pricing
              </ButtonLink>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
              <li className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Private by design
              </li>
              <li className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-gold" /> No account to start
              </li>
              <li className="inline-flex items-center gap-2">
                <FolderCheck className="h-4 w-4 text-gold" /> Free preview, pay per case
              </li>
            </ul>
          </div>
          <div className="lg:pl-4">
            <ClassifierBox />
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="border-y border-stone-200 bg-paper py-20">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="One clear path, the fewest possible steps"
            description="No dead ends, no clutter. Every screen has one job and one obvious next action."
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy/5 text-navy">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-serif text-2xl text-stone-300">{i + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-navy">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Problem grid */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Choose your problem" title="Built for the moments money is on the line" />
          <div className="mt-10">
            <ProblemGrid target="case" />
          </div>
        </Container>
      </section>

      {/* Outputs */}
      <section className="bg-navy py-20 text-ivory">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow className="text-gold-300">Everything you need to act</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">One case. A complete, polished pack.</h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-stone-300">
              Not a single template — a full kit tuned to your situation, ready to send through whichever channel actually
              gets a reply.
            </p>
            <ButtonLink href="/start" variant="gold" className="mt-7">
              Build my case pack <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {OUTPUTS.map((o) => (
              <li key={o} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-ivory">
                {o}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="py-20">
        <Container className="card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl font-semibold text-navy sm:text-3xl">Ready when you are.</h2>
            <p className="mt-2 text-stone-600">
              Start free and see your drafts before you pay. You stay in control of every word.
            </p>
          </div>
          <ButtonLink href="/start" variant="gold" large className="shrink-0">
            Start a case <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </Container>
        <Container className="mt-8">
          <Disclaimer />
        </Container>
      </section>
    </>
  );
}
