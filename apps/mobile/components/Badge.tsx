/**
 * Small pill used for channel/tone labels and section eyebrows.
 */
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, fontSize, radius, spacing } from "../theme";

type Tone = "stone" | "gold" | "navy";

export function Badge({ label, tone = "stone" }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.base, TONE_BG[tone]]}>
      <Text style={[styles.text, TONE_TEXT[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

const TONE_BG = StyleSheet.create({
  stone: { backgroundColor: colors.stone100, borderColor: colors.stone200 },
  gold: { backgroundColor: "#F4ECDB", borderColor: colors.gold300 },
  navy: { backgroundColor: colors.navy, borderColor: colors.navy },
});

const TONE_TEXT = StyleSheet.create({
  stone: { color: colors.stone700 },
  gold: { color: colors.gold700 },
  navy: { color: colors.ivory },
});
