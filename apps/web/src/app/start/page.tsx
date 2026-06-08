import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { ClassifierBox } from "@/components/classifier-box";
import { ProblemGrid } from "@/components/problem-grid";

export const metadata: Metadata = {
  title: "Start a case",
  description: "Choose your problem or describe it in your own words. Cancel & Claim AI does the rest.",
};

export default function StartPage() {
  return (
    <Container className="py-14">
      <div className="max-w-2xl">
        <Eyebrow>Start a case</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tightish text-navy">What can we help you resolve?</h1>
        <p className="mt-4 text-lg text-stone-700">
          Describe your situation and we&apos;ll point you to the right path — or choose a category below.
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <ClassifierBox />
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-gold-700">Or pick a problem</h2>
          <ProblemGrid target="case" />
        </div>
      </div>
    </Container>
  );
}
