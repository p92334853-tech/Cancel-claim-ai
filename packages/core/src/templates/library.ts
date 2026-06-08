import type {
  CaseType,
  Channel,
  DraftVariant,
  DraftVariantKey,
  EvidenceItem,
  IntakeData,
  Locale,
  Tone,
} from "../domain/types.js";
import { formatLongDate } from "../utils/dates.js";

/**
 * Structured building blocks for a case. Each case type produces these; a single
 * assembler then renders them into the five tone/channel variants. This keeps
 * copy consistent and the logic testable, and is the deterministic engine behind
 * the product (used directly when no LLM is configured, and as a safety net when
 * one is).
 */
interface Blocks {
  subject: string;
  recipientName: string;
  senderName: string;
  senderContact: string;
  /** Opening sentence stating the purpose. */
  purpose: string;
  /** Factual context sentences. */
  context: string[];
  /** The explicit request. */
  ask: string;
  /** A measured line strengthening the request (never a legal claim). */
  basis?: string;
  /** Firm-only escalation line. */
  escalation?: string;
  deadlineDays: number;
  /** Noun used in follow-ups, e.g. "refund request". */
  noun: string;
  /** Per-variant overrides (used by chargeback, which targets different readers). */
  overrides?: Partial<Record<DraftVariantKey, Partial<{ subject: string; recipientName: string; intro: string }>>>;
}

const VARIANT_META: Record<DraftVariantKey, { label: string; channel: Channel; tone: Tone }> = {
  short: { label: "Short version", channel: "email", tone: "polite" },
  formal: { label: "Formal letter", channel: "letter", tone: "formal" },
  firm: { label: "Firm version", channel: "email", tone: "firm" },
  chat: { label: "Chat / support message", channel: "chat", tone: "short" },
  follow_up: { label: "Follow-up", channel: "email", tone: "polite" },
};

const v = (intake: IntakeData, key: string): string => (intake[key] ?? "").trim();

function join(parts: (string | undefined | false)[], sep: string): string {
  return parts.filter((p): p is string => Boolean(p && p.length)).join(sep);
}

// ---------------------------------------------------------------------------
// Per-case-type block builders
// ---------------------------------------------------------------------------

function buildBlocks(type: CaseType, intake: IntakeData): Blocks {
  const senderName = v(intake, "yourName") || "[Your name]";
  const senderContact = v(intake, "yourContact");
  const base = { senderName, senderContact };

  switch (type) {
    case "cancel_subscription": {
      const company = v(intake, "company") || "the company";
      const product = v(intake, "product");
      const wantsRefund = v(intake, "desiredOutcome") === "cancel_and_refund";
      const amount = v(intake, "amount");
      const renewal = v(intake, "renewalDate");
      return {
        ...base,
        subject: join([`Cancellation request`, company, product], " — "),
        recipientName: company,
        purpose: `I am writing to cancel my ${product || "subscription"} with ${company}${v(intake, "accountId") ? `, account ${v(intake, "accountId")}` : ""}, effective immediately.`,
        context: [
          v(intake, "accountEmail") && `The account is registered to ${v(intake, "accountEmail")}.`,
          renewal && `My next billing date is ${renewal}, so please ensure no further charges are taken.`,
          v(intake, "reason") && `For context: ${v(intake, "reason")}.`,
        ].filter(Boolean) as string[],
        ask: wantsRefund
          ? `Please cancel the subscription and refund the most recent charge${amount ? ` of ${amount}` : ""}, and confirm both in writing.`
          : `Please cancel the subscription and confirm in writing that it will not renew.`,
        basis: `As I am requesting cancellation before the next renewal, I do not expect any further charges.`,
        escalation: `If I am charged after this request, I will dispute the charge with my bank.`,
        deadlineDays: 14,
        noun: "cancellation request",
      };
    }
    case "refund_request": {
      const company = v(intake, "company") || "the seller";
      const amount = v(intake, "amount");
      const outcome = v(intake, "desiredOutcome");
      const ask =
        outcome === "replacement"
          ? `Please provide a replacement or a credit of equal value.`
          : outcome === "partial_refund"
            ? `Please issue a partial refund to my original payment method.`
            : `Please issue a full refund${amount ? ` of ${amount}` : ""} to my original payment method.`;
      return {
        ...base,
        subject: join([`Refund request`, v(intake, "orderId") && `order ${v(intake, "orderId")}`], " — "),
        recipientName: company,
        purpose: `I am requesting a refund${amount ? ` of ${amount}` : ""} for ${v(intake, "product") || "my recent purchase"} from ${company}${v(intake, "orderId") ? `, order ${v(intake, "orderId")}` : ""}.`,
        context: [
          v(intake, "purchaseDate") && `I purchased this on ${v(intake, "purchaseDate")}.`,
          v(intake, "reason") && `${v(intake, "reason")}.`,
        ].filter(Boolean) as string[],
        ask,
        basis: `The purchase did not meet what was promised, so a refund is a fair and reasonable resolution.`,
        escalation: `If we cannot resolve this directly, I will dispute the charge with my card issuer.`,
        deadlineDays: 14,
        noun: "refund request",
      };
    }
    case "chargeback_dispute": {
      const merchant = v(intake, "company") || "the merchant";
      const issuer = v(intake, "cardIssuer") || "my card issuer";
      const amount = v(intake, "amount");
      const date = v(intake, "transactionDate");
      const reasonLine = chargebackReason(v(intake, "reason"), v(intake, "attemptedResolution"));
      return {
        ...base,
        subject: join([`Dispute of charge`, merchant, amount && `${amount}${date ? ` on ${date}` : ""}`], " — "),
        recipientName: issuer,
        purpose: `I am formally disputing a charge of ${amount || "[amount]"} from ${merchant}${date ? ` dated ${date}` : ""}${v(intake, "orderId") ? `, reference ${v(intake, "orderId")}` : ""}.`,
        context: [
          reasonLine,
          v(intake, "attemptedResolution") && `I attempted to resolve this directly with the merchant: ${v(intake, "attemptedResolution")}.`,
        ].filter(Boolean) as string[],
        ask: `Please reverse this charge and process a chargeback under the appropriate reason code.`,
        basis: `The merchant has not resolved the issue despite my attempt to do so.`,
        deadlineDays: 0,
        noun: "dispute",
        overrides: {
          firm: { recipientName: merchant, subject: `Final request before dispute — ${merchant}`, intro: `This is a final request to resolve charge ${amount || "[amount]"}${date ? ` from ${date}` : ""} before I dispute it with ${issuer}.` },
          chat: { recipientName: merchant },
          follow_up: { subject: `Dispute status — ${merchant}`, intro: `I'm following up on the dispute I filed regarding ${merchant} (${amount || "[amount]"}${date ? `, ${date}` : ""}).` },
        },
      };
    }
    case "complaint_letter": {
      const company = v(intake, "company") || "the company";
      return {
        ...base,
        subject: join([`Complaint`, v(intake, "subject")], " — "),
        recipientName: v(intake, "recipient") || company,
        purpose: `I am writing to formally complain about ${v(intake, "subject") || "an issue"} with ${company}.`,
        context: [
          v(intake, "incidentDate") && `This occurred on ${v(intake, "incidentDate")}.`,
          v(intake, "description") && `${v(intake, "description")}.`,
          v(intake, "amount") && `The amount involved is ${v(intake, "amount")}.`,
        ].filter(Boolean) as string[],
        ask: `To resolve this, I am asking you to: ${v(intake, "desiredOutcome") || "put the matter right"}.`,
        basis: `I have acted in good faith and expect this to be handled fairly and promptly.`,
        escalation: `If I do not receive a satisfactory response, I will escalate to the relevant ombudsman or consumer body.`,
        deadlineDays: 14,
        noun: "complaint",
      };
    }
    case "appeal_letter": {
      const org = v(intake, "organization") || "the organization";
      return {
        ...base,
        subject: join([`Appeal`, v(intake, "referenceId")], " — "),
        recipientName: org,
        purpose: `I am writing to appeal the following decision: ${v(intake, "decision") || "[the decision]"}.`,
        context: [
          v(intake, "decisionDate") && `The decision was issued on ${v(intake, "decisionDate")}.`,
          v(intake, "referenceId") && `Reference: ${v(intake, "referenceId")}.`,
          v(intake, "grounds") && `The grounds for my appeal are: ${v(intake, "grounds")}.`,
        ].filter(Boolean) as string[],
        ask: `I am asking you to reconsider this decision${v(intake, "desiredOutcome") ? `: ${v(intake, "desiredOutcome")}` : " and reverse it"}.`,
        basis: `I believe the original decision did not fully account for these points.`,
        escalation: `If the appeal is unsuccessful, please advise the next stage of the appeals process.`,
        deadlineDays: 21,
        noun: "appeal",
      };
    }
    case "follow_up": {
      const company = v(intake, "company") || "the company";
      return {
        ...base,
        subject: join([`Follow-up`, v(intake, "subject"), v(intake, "referenceId") && `(${v(intake, "referenceId")})`], " — "),
        recipientName: company,
        purpose: `I am following up on ${v(intake, "subject") || "my earlier request"}${v(intake, "originalDate") ? `, first raised on ${v(intake, "originalDate")}` : ""}${v(intake, "referenceId") ? `, reference ${v(intake, "referenceId")}` : ""}.`,
        context: [v(intake, "summary") && `${v(intake, "summary")}.`].filter(Boolean) as string[],
        ask: `Please provide an update and let me know the next step.`,
        escalation: `If I don't hear back, I'll assume the matter needs to be escalated.`,
        deadlineDays: 7,
        noun: "message",
      };
    }
  }
}

function chargebackReason(reason: string, fallback: string): string {
  const map: Record<string, string> = {
    not_received: "I paid for an order that I never received.",
    not_as_described: "What I received was materially not as described or was defective.",
    duplicate: "I was charged twice, or for an incorrect amount.",
    cancelled_still_charged: "I cancelled the service but was still charged.",
    unauthorized: "I did not authorize this charge.",
    other: fallback ? `${fallback}.` : "The charge is being disputed for the reasons described below.",
  };
  return map[reason] ?? map.other!;
}

// ---------------------------------------------------------------------------
// Variant assembly
// ---------------------------------------------------------------------------

function deadlineLine(days: number): string {
  if (days <= 0) return "";
  if (days <= 7) return `Please respond within ${days} days.`;
  return `I would appreciate written confirmation within ${days} days.`;
}

function formalLetter(b: Blocks, locale: Locale, today: string): { subject: string; body: string } {
  const named = !/company|seller|merchant|organization|issuer/i.test(b.recipientName) && b.recipientName.includes(" ");
  const salutation = named ? `Dear ${b.recipientName},` : "Dear Sir or Madam,";
  const signoff = named ? "Yours sincerely," : "Yours faithfully,";
  const body = join(
    [
      formatLongDate(today, locale),
      b.recipientName,
      salutation,
      b.purpose,
      ...b.context,
      b.basis,
      b.ask,
      deadlineLine(b.deadlineDays),
      signoff,
      join([b.senderName, b.senderContact], "\n"),
    ],
    "\n\n",
  );
  return { subject: b.subject, body };
}

function shortEmail(b: Blocks): { subject: string; body: string } {
  const body = join(
    ["Hello,", b.purpose, b.ask, deadlineLine(b.deadlineDays) || "Thank you for your help.", `Thank you,\n${b.senderName}`],
    "\n\n",
  );
  return { subject: b.subject, body };
}

function firmEmail(b: Blocks): { subject: string; body: string } {
  const override = b.overrides?.firm;
  const body = join(
    [
      "Hello,",
      override?.intro ?? b.purpose,
      b.context[0],
      b.ask,
      b.basis,
      b.escalation,
      deadlineLine(b.deadlineDays || 7),
      `Regards,\n${join([b.senderName, b.senderContact], "\n")}`,
    ],
    "\n\n",
  );
  return { subject: override?.subject ?? b.subject, body };
}

function chatMessage(b: Blocks): { subject?: string; body: string } {
  const ref = b.context.find((c) => /reference|order|account|#/i.test(c));
  const body = join([trimPeriod(b.purpose) + ".", b.ask, ref], " ");
  return { body };
}

function followUpEmail(b: Blocks, today: string, caseType: CaseType): { subject: string; body: string } {
  const override = b.overrides?.follow_up;
  const intro =
    override?.intro ??
    (caseType === "follow_up"
      ? `This is a further follow-up on ${trimPeriod(b.purpose).replace(/^I am following up on /, "")}.`
      : `I'm following up on my ${b.noun} sent on ${formatLongDate(today)}, which I haven't yet had a response to.`);
  const body = join(
    ["Hello,", intro, b.ask, "Could you confirm the current status? I'd appreciate a reply within a few days.", `Thank you,\n${b.senderName}`],
    "\n\n",
  );
  return { subject: override?.subject ?? `Follow-up: ${b.subject.replace(/^Follow-up\s*—\s*/i, "")}`, body };
}

function trimPeriod(s: string): string {
  return s.replace(/\.\s*$/, "");
}

/** Produce all five draft variants for a case. */
export function buildVariants(type: CaseType, intake: IntakeData, locale: Locale, today: string): DraftVariant[] {
  const b = buildBlocks(type, intake);
  const renderers: Record<DraftVariantKey, () => { subject?: string; body: string }> = {
    short: () => shortEmail(b),
    formal: () => formalLetter(b, locale, today),
    firm: () => firmEmail(b),
    chat: () => chatMessage(b),
    follow_up: () => followUpEmail(b, today, type),
  };

  return (Object.keys(VARIANT_META) as DraftVariantKey[]).map((key) => {
    const meta = VARIANT_META[key];
    const out = renderers[key]();
    return { key, label: meta.label, channel: meta.channel, tone: meta.tone, subject: out.subject, body: out.body };
  });
}

/** Summarise attached evidence (or guide the user to add some). */
export function buildEvidenceSummary(evidence: EvidenceItem[]): string {
  if (!evidence.length) {
    return "No documents attached yet. Adding receipts, screenshots, or prior emails will make this case noticeably stronger.";
  }
  const lines = evidence.map((e) => {
    const detail = e.textContent ? ` — ${e.textContent.slice(0, 140).replace(/\s+/g, " ").trim()}${e.textContent.length > 140 ? "…" : ""}` : "";
    return `• ${e.name}${detail}`;
  });
  return `You attached ${evidence.length} item${evidence.length === 1 ? "" : "s"}:\n${lines.join("\n")}`;
}

/** The single most useful next step for this case type. */
export function buildNextBestAction(type: CaseType, intake: IntakeData): string {
  const company = v(intake, "company") || v(intake, "organization") || "the company";
  switch (type) {
    case "cancel_subscription":
      return `Send the Firm version by email to ${company}'s support or billing address and keep a copy. If you're not confirmed cancelled within 14 days, send the Follow-up.`;
    case "refund_request":
      return `Email the Short or Firm version to ${company} with any receipts attached. No reply in 5 days? Send the Follow-up, then consider a chargeback.`;
    case "chargeback_dispute":
      return `Give ${company} the Firm (final-notice) version first. If unresolved in a few days, file the dispute with your bank using the Formal summary.`;
    case "complaint_letter":
      return `Send the Formal letter to a named person or the complaints team at ${company}. Note the date — you'll follow up in two weeks.`;
    case "appeal_letter":
      return `Submit the Formal appeal through the official channel and request written acknowledgement. Track the decision date.`;
    case "follow_up":
      return `Send the Short version now. If there's still no reply in 5 days, escalate with the Firm version.`;
  }
}
