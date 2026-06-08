/**
 * Results. Loads a saved case and presents the generated pack:
 *   1. Recommended next step (nextBestAction)
 *   2. The draft variants in a segmented tab view, each with a selectable body
 *      plus Copy (expo-clipboard) and Share (RN Share API)
 *   3. Evidence summary
 *   4. Follow-up plan — each step with due date, channel, message, copy/share
 */
import { useCallback, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { formatLongDate } from "@cancelclaim/core";
import type { DraftVariant, FollowUpStep } from "@cancelclaim/core";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { getCase, type StoredCase } from "../../lib/storage";
import { channelLabel, composeMessage } from "../../lib/format";
import { colors, fonts, fontSize, radius, spacing, typography } from "../../theme";

export default function CaseResultScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [item, setItem] = useState<StoredCase | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [activeVariant, setActiveVariant] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (typeof id !== "string") {
        setState("missing");
        return;
      }
      getCase(id).then((found) => {
        if (!active) return;
        if (found) {
          setItem(found);
          setState("ready");
        } else {
          setState("missing");
        }
      });
      return () => {
        active = false;
      };
    }, [id]),
  );

  const flashCopied = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };

  const onCopy = async (key: string, text: string) => {
    await Clipboard.setStringAsync(text);
    flashCopied(key);
  };

  const onShare = async (text: string, subject?: string) => {
    try {
      await Share.share(subject ? { message: text, title: subject } : { message: text });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  if (state === "loading") {
    return (
      <Screen>
        <Text style={typography.body}>Loading…</Text>
      </Screen>
    );
  }

  if (state === "missing" || !item) {
    return (
      <Screen>
        <Text style={typography.h2}>Case not found</Text>
        <Text style={[typography.body, { marginTop: spacing.md }]}>
          This case may have been deleted.
        </Text>
        <View style={{ marginTop: spacing.xl }}>
          <Button label="Back to my cases" variant="secondary" onPress={() => router.replace("/cases")} />
        </View>
      </Screen>
    );
  }

  const { output } = item;
  const variant: DraftVariant | undefined = output.variants[activeVariant];

  return (
    <Screen>
      <Stack.Screen options={{ title: "Your case" }} />

      <Text style={typography.eyebrow}>YOUR CASE</Text>
      <Text style={[typography.h1, styles.title]}>{item.title}</Text>

      {/* 1. Recommended next step */}
      <Card style={styles.nextCard}>
        <Text style={styles.nextLabel}>RECOMMENDED NEXT STEP</Text>
        <Text style={styles.nextText}>{output.nextBestAction}</Text>
      </Card>

      {/* 2. Draft variants */}
      <Text style={[typography.h2, styles.sectionTitle]}>Drafts</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {output.variants.map((v, i) => {
          const active = i === activeVariant;
          return (
            <Text
              key={v.key}
              accessibilityRole="button"
              onPress={() => setActiveVariant(i)}
              style={[styles.tab, active && styles.tabActive]}
            >
              {v.label}
            </Text>
          );
        })}
      </ScrollView>

      {variant ? (
        <Card style={styles.variantCard}>
          <View style={styles.variantMeta}>
            <Badge label={channelLabel(variant.channel)} tone="navy" />
            <Badge label={variant.tone} tone="stone" />
          </View>
          {variant.subject ? (
            <Text style={styles.subject}>
              <Text style={styles.subjectLabel}>Subject: </Text>
              {variant.subject}
            </Text>
          ) : null}
          <Text selectable style={styles.body}>
            {variant.body}
          </Text>
          <View style={styles.btnRow}>
            <Button
              label={copied === "variant" ? "Copied" : "Copy"}
              glyph="⧉"
              variant="secondary"
              fullWidth={false}
              style={styles.flexBtn}
              onPress={() => onCopy("variant", composeMessage(variant.subject, variant.body))}
            />
            <Button
              label="Share"
              glyph="↗"
              variant="ghost"
              fullWidth={false}
              style={styles.flexBtn}
              onPress={() => onShare(composeMessage(variant.subject, variant.body), variant.subject)}
            />
          </View>
        </Card>
      ) : null}

      {/* 3. Evidence summary */}
      <Text style={[typography.h2, styles.sectionTitle]}>Evidence summary</Text>
      <Card>
        <Text selectable style={styles.body}>
          {output.evidenceSummary}
        </Text>
      </Card>

      {/* 4. Follow-up plan */}
      <Text style={[typography.h2, styles.sectionTitle]}>Follow-up plan</Text>
      <View style={styles.steps}>
        {output.followUpPlan.steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            copiedKey={copied}
            onCopy={onCopy}
            onShare={onShare}
          />
        ))}
      </View>
    </Screen>
  );
}

function StepCard({
  step,
  copiedKey,
  onCopy,
  onShare,
}: {
  step: FollowUpStep;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  onShare: (text: string) => void;
}) {
  const copyKey = `step-${step.id}`;
  const due = step.dueDate ? formatLongDate(step.dueDate, "en") : `Day ${step.offsetDays}`;
  return (
    <Card compact>
      <View style={styles.stepHead}>
        <Text style={styles.stepLabel}>{step.label}</Text>
        <Badge label={channelLabel(step.channel)} tone="stone" />
      </View>
      <Text style={styles.stepDue}>{due}</Text>
      <Text selectable style={[styles.body, styles.stepMessage]}>
        {step.message}
      </Text>
      <View style={styles.btnRow}>
        <Button
          label={copiedKey === copyKey ? "Copied" : "Copy"}
          glyph="⧉"
          variant="secondary"
          fullWidth={false}
          style={styles.flexBtn}
          onPress={() => onCopy(copyKey, step.message)}
        />
        <Button
          label="Share"
          glyph="↗"
          variant="ghost"
          fullWidth={false}
          style={styles.flexBtn}
          onPress={() => onShare(step.message)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  nextCard: { marginTop: spacing.xl, backgroundColor: colors.navy, borderColor: colors.navy },
  nextLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    color: colors.gold300,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  nextText: {
    fontFamily: fonts.sans,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.ivory,
  },
  sectionTitle: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  tabs: { gap: spacing.sm, paddingBottom: spacing.sm },
  tab: {
    fontFamily: fonts.sans,
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.stone700,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.stone300,
    overflow: "hidden",
  },
  tabActive: { backgroundColor: colors.navy, borderColor: colors.navy, color: colors.ivory },
  variantCard: { gap: spacing.md },
  variantMeta: { flexDirection: "row", gap: spacing.sm },
  subject: { fontFamily: fonts.sans, fontSize: fontSize.base, color: colors.navy },
  subjectLabel: { color: colors.stone500, fontWeight: "600" },
  body: {
    fontFamily: fonts.sans,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.6,
    color: colors.ink,
  },
  btnRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs },
  flexBtn: { flex: 1 },
  steps: { gap: spacing.md },
  stepHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  stepLabel: { flex: 1, fontFamily: fonts.serif, fontSize: fontSize.lg, color: colors.navy, fontWeight: "600" },
  stepDue: { ...typography.caption, color: colors.gold700, fontWeight: "600", marginTop: spacing.xs },
  stepMessage: { marginTop: spacing.md, marginBottom: spacing.md },
});
