import type { CaseType, FollowUpChannel, FollowUpPlan, FollowUpStep, IntakeData } from "../domain/types.js";
import { addDays, todayISO } from "../utils/dates.js";
import { shortId } from "../utils/id.js";

interface StepTemplate {
  offsetDays: number;
  channel: FollowUpChannel;
  label: string;
  message: (company: string) => string;
}

/**
 * Default follow-up sequences per case type. These encode the "what to do next
 * and when" logic that turns a one-off draft into a campaign — the difference
 * between a template dump and a recovery companion.
 */
const SEQUENCES: Record<CaseType, StepTemplate[]> = {
  cancel_subscription: [
    {
      offsetDays: 0,
      channel: "email",
      label: "Send the cancellation request",
      message: (c) => `Send the formal cancellation request to ${c} and keep a copy. Ask for written confirmation.`,
    },
    {
      offsetDays: 7,
      channel: "email",
      label: "Chase written confirmation",
      message: (c) =>
        `Following up on my cancellation request sent a week ago. Please confirm in writing that my subscription is cancelled and that no further charges will be made.`,
    },
    {
      offsetDays: 14,
      channel: "email",
      label: "Final notice before dispute",
      message: (c) =>
        `I have not received confirmation that my cancellation has been processed. If I am charged again, I will dispute the charge with my bank. Please confirm cancellation today.`,
    },
  ],
  refund_request: [
    {
      offsetDays: 0,
      channel: "email",
      label: "Send the refund request",
      message: (c) => `Send the refund request to ${c} with any receipts attached.`,
    },
    {
      offsetDays: 5,
      channel: "email",
      label: "Polite follow-up",
      message: () =>
        `Just following up on my refund request from a few days ago. Could you let me know the status and expected timeline? Happy to provide anything you need.`,
    },
    {
      offsetDays: 10,
      channel: "email",
      label: "Escalate / mention dispute",
      message: () =>
        `It has now been ten days without resolution on my refund. If we can't resolve this directly, I'll have to escalate or dispute the charge with my card issuer. I'd much prefer to settle it with you.`,
    },
  ],
  chargeback_dispute: [
    {
      offsetDays: 0,
      channel: "email",
      label: "Give the merchant a final chance",
      message: (c) => `Send ${c} a final, clear request to resolve before you file with your bank. Keep the timestamp.`,
    },
    {
      offsetDays: 3,
      channel: "phone",
      label: "File the dispute with your bank",
      message: () =>
        `Call or open a dispute with your card issuer. Provide the dispute summary, the dates, and proof you tried to resolve it with the merchant.`,
    },
    {
      offsetDays: 30,
      channel: "phone",
      label: "Check dispute status",
      message: () => `Check on the status of the dispute with your bank and ask for the provisional credit timeline.`,
    },
  ],
  complaint_letter: [
    {
      offsetDays: 0,
      channel: "email",
      label: "Send the complaint",
      message: (c) => `Send the complaint to ${c}, ideally to a named person or the complaints team.`,
    },
    {
      offsetDays: 14,
      channel: "email",
      label: "Follow up on your complaint",
      message: () =>
        `I'm following up on my complaint from two weeks ago, which I haven't had a substantive response to. Please let me know how you intend to resolve it.`,
    },
    {
      offsetDays: 28,
      channel: "email",
      label: "Escalate if unresolved",
      message: () =>
        `As my complaint remains unresolved after four weeks, I intend to escalate it to the relevant ombudsman or consumer body. Please treat this as a final opportunity to put things right.`,
    },
  ],
  appeal_letter: [
    {
      offsetDays: 0,
      channel: "email",
      label: "Submit the appeal",
      message: (c) => `Submit the appeal to ${c} through the correct channel and request written acknowledgement.`,
    },
    {
      offsetDays: 14,
      channel: "email",
      label: "Confirm it's being reviewed",
      message: () => `Following up to confirm my appeal has been received and is under review. Could you share an expected decision date?`,
    },
    {
      offsetDays: 30,
      channel: "email",
      label: "Request a decision",
      message: () => `It has been a month since I submitted my appeal. Please provide a decision or a firm date by which I can expect one.`,
    },
  ],
  follow_up: [
    {
      offsetDays: 0,
      channel: "email",
      label: "Send the follow-up",
      message: (c) => `Send the follow-up to ${c}, referencing your original request and reference number.`,
    },
    {
      offsetDays: 5,
      channel: "email",
      label: "Second nudge",
      message: () => `A short second nudge — I still haven't heard back and would appreciate an update at your earliest convenience.`,
    },
    {
      offsetDays: 10,
      channel: "email",
      label: "Final follow-up",
      message: () => `This is my final follow-up before I escalate. Please respond with a status update today.`,
    },
  ],
};

export function buildFollowUpPlan(
  caseType: CaseType,
  intake: IntakeData = {},
  anchorDate: string = todayISO(),
): FollowUpPlan {
  const company = (intake.company ?? intake.organization ?? "the company").trim() || "the company";
  const steps: FollowUpStep[] = SEQUENCES[caseType].map((t) => ({
    id: shortId("step"),
    offsetDays: t.offsetDays,
    channel: t.channel,
    label: t.label,
    message: t.message(company),
    dueDate: addDays(anchorDate, t.offsetDays),
    done: false,
  }));
  return { anchorDate, steps };
}

/** Re-anchor an existing plan to a new send date (e.g. when the user marks "sent"). */
export function reanchorPlan(plan: FollowUpPlan, anchorDate: string): FollowUpPlan {
  return {
    anchorDate,
    steps: plan.steps.map((s) => ({ ...s, dueDate: addDays(anchorDate, s.offsetDays) })),
  };
}
