import type { CaseType, CaseTypeDefinition, IntakeField } from "./types.js";

/**
 * Fields shared by every case type. The sender's identity is needed to sign
 * letters and emails; we keep it minimal and never require more than necessary.
 */
const IDENTITY_FIELDS: IntakeField[] = [
  {
    name: "yourName",
    label: "Your name",
    type: "text",
    required: true,
    placeholder: "Alex Morgan",
    help: "Used to sign the message. Nothing else.",
  },
  {
    name: "yourContact",
    label: "Your contact (optional)",
    type: "text",
    required: false,
    placeholder: "Email or phone they can reply to",
  },
];

const company = (label = "Company or service"): IntakeField => ({
  name: "company",
  label,
  type: "text",
  required: true,
  placeholder: "e.g. Acme Streaming",
});

const amount: IntakeField = {
  name: "amount",
  label: "Amount",
  type: "money",
  required: false,
  placeholder: "e.g. 49.99",
};

/** The canonical registry. Order here drives the problem-selection screen. */
const definitions: Record<CaseType, CaseTypeDefinition> = {
  cancel_subscription: {
    type: "cancel_subscription",
    label: "Cancel a subscription",
    tagline: "Stop an unwanted renewal — cleanly and on the record.",
    description:
      "Generate a clear, firm cancellation request that creates a paper trail, asks for written confirmation, and (optionally) requests a refund of a recent charge.",
    icon: "ban",
    slug: "cancel-subscription",
    keywords: [
      "how to cancel a subscription",
      "cancel subscription email template",
      "stop auto renewal",
      "cancellation request letter",
      "cancel free trial before charge",
    ],
    fields: [
      company("Company or service"),
      { name: "product", label: "Plan or product", type: "text", required: false, placeholder: "e.g. Premium annual" },
      { name: "accountEmail", label: "Email on the account", type: "email", required: false },
      { name: "accountId", label: "Account or customer ID", type: "text", required: false },
      { ...amount, label: "Recent charge to dispute (optional)" },
      {
        name: "billingCycle",
        label: "Billing cycle",
        type: "select",
        required: false,
        options: [
          { value: "monthly", label: "Monthly" },
          { value: "annual", label: "Annual" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "renewalDate", label: "Next billing / renewal date", type: "date", required: false, help: "Helps us stress urgency before you're charged again." },
      { name: "reason", label: "Why are you cancelling?", type: "textarea", required: false, placeholder: "Optional — a short reason can strengthen a refund ask." },
      {
        name: "desiredOutcome",
        label: "What do you want?",
        type: "select",
        required: true,
        defaultValue: "cancel_only",
        options: [
          { value: "cancel_only", label: "Cancel only" },
          { value: "cancel_and_refund", label: "Cancel and refund a recent charge" },
        ],
      },
      ...IDENTITY_FIELDS,
    ],
    example: {
      company: "Acme Streaming",
      product: "Premium annual",
      renewalDate: "in 5 days",
      desiredOutcome: "cancel_only",
    },
  },

  refund_request: {
    type: "refund_request",
    label: "Request a refund",
    tagline: "Ask for your money back with the right leverage.",
    description:
      "Turn a frustrating purchase into a structured refund request that states the facts, cites the relevant consumer expectation, and makes it easy for support to say yes.",
    icon: "wallet",
    slug: "refund-request",
    keywords: [
      "how to ask for a refund",
      "refund request email template",
      "request refund for bad service",
      "money back request letter",
      "refund for item not as described",
    ],
    fields: [
      company("Where you bought it"),
      { name: "product", label: "Product or service", type: "text", required: false },
      { name: "orderId", label: "Order / transaction ID", type: "text", required: false },
      { name: "accountEmail", label: "Email on the order", type: "email", required: false },
      { ...amount, required: true, label: "Amount to refund" },
      { name: "purchaseDate", label: "Purchase date", type: "date", required: false },
      { name: "reason", label: "Why do you want a refund?", type: "textarea", required: true, placeholder: "What went wrong, in a sentence or two." },
      {
        name: "desiredOutcome",
        label: "Ideal outcome",
        type: "select",
        required: true,
        defaultValue: "full_refund",
        options: [
          { value: "full_refund", label: "Full refund" },
          { value: "partial_refund", label: "Partial refund" },
          { value: "replacement", label: "Replacement or credit" },
        ],
      },
      ...IDENTITY_FIELDS,
    ],
    example: {
      company: "Acme Store",
      product: "Wireless headphones",
      amount: "89.00",
      reason: "Arrived damaged and support has not responded in 7 days.",
      desiredOutcome: "full_refund",
    },
  },

  chargeback_dispute: {
    type: "chargeback_dispute",
    label: "Prepare a chargeback / dispute",
    tagline: "Build a bank-ready dispute your card issuer can act on.",
    description:
      "Prepare a clear dispute summary for your bank or card issuer when a merchant won't resolve a charge — with the facts, dates, and the resolution you already attempted.",
    icon: "shield-alert",
    slug: "chargeback-dispute",
    keywords: [
      "how to dispute a charge",
      "chargeback letter template",
      "dispute credit card charge",
      "unauthorized charge dispute",
      "merchant won't refund chargeback",
    ],
    fields: [
      company("Merchant name"),
      { name: "cardIssuer", label: "Your bank / card issuer", type: "text", required: false, placeholder: "e.g. Chase, Monzo" },
      { ...amount, required: true, label: "Disputed amount" },
      { name: "transactionDate", label: "Transaction date", type: "date", required: true },
      { name: "orderId", label: "Order / reference", type: "text", required: false },
      {
        name: "reason",
        label: "Reason for dispute",
        type: "select",
        required: true,
        options: [
          { value: "not_received", label: "Paid but never received" },
          { value: "not_as_described", label: "Not as described / defective" },
          { value: "duplicate", label: "Duplicate / wrong amount" },
          { value: "cancelled_still_charged", label: "Cancelled but still charged" },
          { value: "unauthorized", label: "Unauthorized charge" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "attemptedResolution", label: "What you've already tried", type: "textarea", required: false, placeholder: "Dates you contacted the merchant and what they said." },
      ...IDENTITY_FIELDS,
    ],
    example: {
      company: "Acme Box",
      amount: "120.00",
      reason: "cancelled_still_charged",
    },
  },

  complaint_letter: {
    type: "complaint_letter",
    label: "Write a complaint",
    tagline: "A composed, effective complaint that gets taken seriously.",
    description:
      "Write a measured but firm complaint that documents what happened, the impact on you, and exactly what you want done — without venting or weakening your position.",
    icon: "file-warning",
    slug: "complaint-letter",
    keywords: [
      "how to write a complaint letter",
      "formal complaint email template",
      "customer service complaint letter",
      "complaint letter for poor service",
      "letter of complaint example",
    ],
    fields: [
      company("Company or organization"),
      { name: "recipient", label: "Who is this to?", type: "text", required: false, placeholder: "e.g. Customer Relations Manager" },
      { name: "subject", label: "What is it about?", type: "text", required: false, placeholder: "e.g. Repeated billing errors" },
      { ...amount, label: "Amount involved (optional)" },
      { name: "incidentDate", label: "When did it happen?", type: "date", required: false },
      { name: "description", label: "What happened?", type: "textarea", required: true, placeholder: "The facts, in order. Keep it to what matters." },
      { name: "desiredOutcome", label: "What do you want them to do?", type: "textarea", required: true, placeholder: "e.g. A full refund and a written apology." },
      ...IDENTITY_FIELDS,
    ],
    example: {
      company: "Acme Telecom",
      subject: "Repeated billing errors",
      description: "I have been overcharged three months in a row despite two phone calls.",
      desiredOutcome: "Correct my account and refund the overcharges.",
    },
  },

  appeal_letter: {
    type: "appeal_letter",
    label: "Appeal a decision",
    tagline: "Make your case to overturn a decision — with structure.",
    description:
      "Appeal a denied claim, account action, fee, or ruling with a focused letter that addresses the decision directly, presents your grounds, and asks for a specific reconsideration.",
    icon: "scale",
    slug: "appeal-letter",
    keywords: [
      "how to write an appeal letter",
      "appeal letter template",
      "appeal a denied claim",
      "appeal a decision letter example",
      "reconsideration request letter",
    ],
    fields: [
      { name: "organization", label: "Company or organization", type: "text", required: true, placeholder: "e.g. Acme Insurance" },
      { name: "decision", label: "What decision are you appealing?", type: "textarea", required: true, placeholder: "e.g. My claim #4821 was denied on 12 May." },
      { name: "decisionDate", label: "Date of the decision", type: "date", required: false },
      { name: "referenceId", label: "Case / reference number", type: "text", required: false },
      { name: "grounds", label: "Why should it change?", type: "textarea", required: true, placeholder: "Your strongest reasons and any new information." },
      { name: "desiredOutcome", label: "What are you asking for?", type: "textarea", required: false, placeholder: "e.g. Reinstate the claim and pay it in full." },
      ...IDENTITY_FIELDS,
    ],
    example: {
      organization: "Acme Insurance",
      decision: "Claim #4821 denied as 'out of policy'.",
      grounds: "The policy explicitly covers this under section 4.2.",
    },
  },

  follow_up: {
    type: "follow_up",
    label: "Send a follow-up",
    tagline: "A polite, pointed nudge that moves a stalled request.",
    description:
      "Chase an unanswered request with a short follow-up that references your prior contact, restates the ask, and sets a clear next step or deadline.",
    icon: "send",
    slug: "follow-up-message",
    keywords: [
      "how to write a follow up email",
      "follow up email template",
      "chasing a refund follow up",
      "polite reminder email example",
      "no response follow up message",
    ],
    fields: [
      company("Company or service"),
      { name: "subject", label: "What are you chasing?", type: "text", required: false, placeholder: "e.g. My refund request" },
      { name: "originalDate", label: "When did you first contact them?", type: "date", required: false },
      { name: "referenceId", label: "Ticket / reference number", type: "text", required: false },
      { name: "summary", label: "Quick recap", type: "textarea", required: true, placeholder: "One or two lines: what you asked for and the silence since." },
      ...IDENTITY_FIELDS,
    ],
    example: {
      company: "Acme Store",
      subject: "Refund request #1190",
      summary: "I requested a refund 10 days ago and have had no reply.",
    },
  },
};

export const CASE_TYPE_DEFINITIONS = definitions;

export function getCaseTypeDefinition(type: CaseType): CaseTypeDefinition {
  return definitions[type];
}

export function listCaseTypeDefinitions(): CaseTypeDefinition[] {
  return Object.values(definitions);
}

export function getCaseTypeBySlug(slug: string): CaseTypeDefinition | undefined {
  return listCaseTypeDefinitions().find((d) => d.slug === slug);
}
