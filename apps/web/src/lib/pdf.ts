import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { type Case, formatLongDate, getCaseTypeDefinition } from "@cancelclaim/core";

const NAVY = rgb(0.055, 0.133, 0.212);
const GOLD = rgb(0.722, 0.573, 0.29);
const INK = rgb(0.04, 0.086, 0.133);
const STONE = rgb(0.42, 0.42, 0.39);
const STONE_LINE = rgb(0.84, 0.82, 0.76);

const PAGE = { w: 595.28, h: 841.89 };
const MARGIN = 56;
const CONTENT_W = PAGE.w - MARGIN * 2;

/**
 * Compose a clean, premium case packet PDF. Uses only the standard 14 fonts so
 * it runs in any Node/serverless runtime with no binaries or headless browser.
 */
export async function buildCasePdf(c: Case): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${c.title} — Cancel & Claim AI`);
  pdf.setCreator("Cancel & Claim AI");

  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const bodyBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  let page: PDFPage = pdf.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE.w, PAGE.h]);
    y = PAGE.h - MARGIN;
  };
  const ensure = (space: number) => {
    if (y - space < MARGIN + 24) newPage();
  };

  const wrap = (text: string, font: PDFFont, size: number, width = CONTENT_W): string[] => {
    const out: string[] = [];
    for (const rawLine of text.split("\n")) {
      const words = rawLine.split(/\s+/).filter(Boolean);
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(test, size) <= width) line = test;
        else {
          if (line) out.push(line);
          line = word;
        }
      }
      out.push(line);
    }
    return out.length ? out : [""];
  };

  const writeText = (
    text: string,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; gap?: number; indent?: number } = {},
  ) => {
    const font = opts.font ?? body;
    const size = opts.size ?? 10.5;
    const gap = opts.gap ?? 4;
    const indent = opts.indent ?? 0;
    for (const line of wrap(text, font, size, CONTENT_W - indent)) {
      ensure(size + gap);
      page.drawText(line, { x: MARGIN + indent, y: y - size, size, font, color: opts.color ?? INK });
      y -= size + gap;
    }
  };

  const heading = (text: string) => {
    ensure(34);
    y -= 10;
    page.drawText(text, { x: MARGIN, y: y - 15, size: 15, font: serifBold, color: NAVY });
    y -= 21;
    page.drawRectangle({ x: MARGIN, y, width: 46, height: 1.6, color: GOLD });
    y -= 10;
  };

  const subheading = (text: string) => {
    ensure(20);
    page.drawText(text, { x: MARGIN, y: y - 11, size: 10.5, font: bodyBold, color: NAVY });
    y -= 16;
  };

  const gap = (n = 8) => {
    y -= n;
  };

  // --- Cover block ---------------------------------------------------------
  page.drawText("C A N C E L   &   C L A I M   A I", { x: MARGIN, y: y - 9, size: 9, font: bodyBold, color: GOLD });
  y -= 40;
  for (const line of wrap(c.title, serifBold, 26)) {
    page.drawText(line, { x: MARGIN, y: y - 26, size: 26, font: serifBold, color: NAVY });
    y -= 32;
  }
  y -= 4;
  const def = getCaseTypeDefinition(c.type);
  writeText(`${def.label} · Prepared ${formatLongDate(c.createdAt, c.locale)}`, { color: STONE, size: 10.5 });
  gap(6);
  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 0.8, color: STONE_LINE });
  gap(16);

  // --- Recommended next step ----------------------------------------------
  if (c.output?.nextBestAction) {
    subheading("Recommended next step");
    writeText(c.output.nextBestAction, { gap: 5 });
    gap(8);
  }

  // --- Case details --------------------------------------------------------
  if (c.facts.length) {
    heading("Case details");
    for (const fact of c.facts) {
      writeText(fact.label.toUpperCase(), { font: bodyBold, size: 8, color: STONE, gap: 2 });
      writeText(fact.value, { gap: 8 });
    }
  }

  // --- Timeline ------------------------------------------------------------
  if (c.output?.timeline?.length) {
    heading("Timeline");
    for (const entry of c.output.timeline) {
      const date = entry.date ? formatLongDate(entry.date, c.locale) : "—";
      writeText(`•  ${date} — ${entry.label}${entry.detail ? `: ${entry.detail}` : ""}`, { gap: 5 });
    }
  }

  // --- Drafts --------------------------------------------------------------
  if (c.output?.variants?.length) {
    heading("Your drafts");
    for (const variant of c.output.variants) {
      gap(6);
      subheading(`${variant.label}  ·  ${variant.channel}`);
      if (variant.subject) writeText(`Subject: ${variant.subject}`, { font: bodyBold, size: 9.5, color: STONE, gap: 5 });
      writeText(variant.body, { gap: 4 });
      gap(6);
    }
  }

  // --- Evidence ------------------------------------------------------------
  if (c.output?.evidenceSummary) {
    heading("Evidence summary");
    writeText(c.output.evidenceSummary, { gap: 5 });
  }

  // --- Follow-up plan ------------------------------------------------------
  if (c.output?.followUpPlan?.steps?.length) {
    heading("Follow-up plan");
    for (const step of c.output.followUpPlan.steps) {
      const due = step.dueDate ? formatLongDate(step.dueDate, c.locale) : `Day ${step.offsetDays}`;
      writeText(`${due} · ${step.label} (${step.channel})`, { font: bodyBold, size: 10, color: NAVY, gap: 3 });
      writeText(step.message, { gap: 8, indent: 0 });
    }
  }

  // --- Footers (drawn after pagination is known) ---------------------------
  const disclaimer =
    "Cancel & Claim AI is a self-help tool, not a law firm, and does not provide legal advice. Review everything before sending.";
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(disclaimer, { x: MARGIN, y: MARGIN - 22, size: 7, font: body, color: STONE, maxWidth: CONTENT_W - 60 });
    p.drawText(`${i + 1} / ${pages.length}`, { x: PAGE.w - MARGIN - 24, y: MARGIN - 22, size: 8, font: body, color: STONE });
  });

  return pdf.save();
}
