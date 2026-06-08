import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "gold" | "outline" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  gold: "btn-gold",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

export function buttonClass(variant: Variant = "primary", large = false, className?: string): string {
  return cn(VARIANT_CLASS[variant], large && "btn-lg", className);
}

export function Button({
  variant = "primary",
  large = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant; large?: boolean }) {
  return <button className={buttonClass(variant, large, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  large = false,
  className,
  href,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant; large?: boolean }) {
  return (
    <Link href={href} className={buttonClass(variant, large, className)} {...props}>
      {children}
    </Link>
  );
}

export function Container({
  as: As = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <As className={cn("container-page", className)}>{children}</As>;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function Badge({
  children,
  tone = "stone",
  className,
}: {
  children: ReactNode;
  tone?: "stone" | "gold" | "navy" | "green";
  className?: string;
}) {
  const tones: Record<string, string> = {
    stone: "bg-stone-100 text-stone-700 border-stone-200",
    gold: "bg-gold/10 text-gold-700 border-gold/30",
    navy: "bg-navy text-ivory border-navy",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2 className="font-serif text-3xl font-semibold tracking-tightish text-navy sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-lg leading-relaxed text-stone-700">{description}</p> : null}
    </div>
  );
}
