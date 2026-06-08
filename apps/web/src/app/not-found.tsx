import { Compass } from "lucide-react";
import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy/5 text-navy">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-serif text-4xl font-semibold text-navy">Page not found</h1>
      <p className="mt-3 max-w-sm text-stone-600">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <div className="mt-7 flex gap-3">
        <ButtonLink href="/" variant="outline">
          Go home
        </ButtonLink>
        <ButtonLink href="/start" variant="gold">
          Start a case
        </ButtonLink>
      </div>
    </Container>
  );
}
