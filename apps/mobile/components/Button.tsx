/**
 * Primary/secondary/ghost button. One primary action per screen — the primary
 * variant is the gold-on-navy CTA that carries the brand.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fonts, fontSize, radius, spacing } from "../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Optional leading glyph (emoji or short text) for lightweight iconography. */
  glyph?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  glyph,
  style,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        VARIANT_STYLE[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.navy : colors.ivory} />
      ) : (
        <View style={styles.row}>
          {glyph ? <Text style={[styles.glyph, TEXT_STYLE[variant]]}>{glyph}</Text> : null}
          <Text style={[styles.label, TEXT_STYLE[variant]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { alignSelf: "stretch" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
  label: { fontFamily: fonts.sans, fontSize: fontSize.md, fontWeight: "600" },
  glyph: { fontSize: fontSize.md, fontWeight: "600" },
});

const VARIANT_STYLE: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.gold },
  secondary: { backgroundColor: colors.navy },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.stone300 },
  danger: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
};

const TEXT_STYLE: Record<Variant, { color: string }> = {
  primary: { color: colors.navy },
  secondary: { color: colors.ivory },
  ghost: { color: colors.navy },
  danger: { color: colors.danger },
};
