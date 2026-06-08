/**
 * Home. The brand wordmark + promise, one primary CTA, and the six case types
 * (sourced from core's registry) as tap targets into the intake flow.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listCaseTypeDefinitions } from "@cancelclaim/core";
import type { CaseTypeDefinition } from "@cancelclaim/core";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors, fonts, fontSize, radius, spacing, typography } from "../theme";

/** Lightweight glyphs standing in for the web's lucide icons (no icon dep). */
const TYPE_GLYPH: Record<string, string> = {
  cancel_subscription: "⊘", // circled minus
  refund_request: "↩", // return arrow
  chargeback_dispute: "⚠", // warning
  complaint_letter: "✎", // pencil
  appeal_letter: "⚖", // scales
  follow_up: "⏱", // stopwatch
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const definitions = listCaseTypeDefinitions();
  const first = definitions[0];

  return (
    <Screen contentStyle={{ paddingTop: insets.top + spacing.xxl }}>
      <Text style={styles.eyebrow}>CANCEL &amp; CLAIM AI</Text>
      <Text style={styles.wordmark}>Cancel &amp; Claim</Text>
      <Text style={styles.tagline}>
        Recover money and end unwanted charges — in minutes.
      </Text>

      <View style={styles.cta}>
        <Button
          label="Start a case"
          glyph="+"
          onPress={() => router.push(first ? `/new/${first.type}` : "/cases")}
        />
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/cases")}
          style={styles.linkRow}
        >
          <Text style={styles.link}>My cases</Text>
          <Text style={styles.linkChevron}>{"›"}</Text>
        </Pressable>
      </View>

      <Text style={[typography.eyebrow, styles.sectionEyebrow]}>WHAT DO YOU NEED?</Text>
      <View style={styles.grid}>
        {definitions.map((def) => (
          <CaseTypeTile
            key={def.type}
            def={def}
            onPress={() => router.push(`/new/${def.type}`)}
          />
        ))}
      </View>
    </Screen>
  );
}

function CaseTypeTile({ def, onPress }: { def: CaseTypeDefinition; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.tile}>
      <View style={styles.tileIcon}>
        <Text style={styles.tileGlyph}>{TYPE_GLYPH[def.type] ?? "•"}</Text>
      </View>
      <Text style={styles.tileTitle}>{def.label}</Text>
      <Text style={styles.tileTagline} numberOfLines={3}>
        {def.tagline}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    color: colors.gold700,
    fontWeight: "700",
    letterSpacing: 2,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: fontSize.display,
    lineHeight: fontSize.display * 1.05,
    color: colors.navy,
    fontWeight: "600",
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  tagline: {
    ...typography.body,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.45,
    marginTop: spacing.md,
  },
  cta: { marginTop: spacing.xl, gap: spacing.lg },
  linkRow: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: spacing.xs },
  link: { fontFamily: fonts.sans, fontSize: fontSize.md, color: colors.navy, fontWeight: "600" },
  linkChevron: { fontFamily: fonts.sans, fontSize: fontSize.lg, color: colors.gold700 },
  sectionEyebrow: { marginTop: spacing.xxxl, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  tile: { width: "47%", minHeight: 150, justifyContent: "flex-start" },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.stone100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  tileGlyph: { fontSize: 22, color: colors.gold700 },
  tileTitle: {
    fontFamily: fonts.serif,
    fontSize: fontSize.lg,
    color: colors.navy,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  tileTagline: { ...typography.caption, lineHeight: fontSize.xs * 1.5 },
});
