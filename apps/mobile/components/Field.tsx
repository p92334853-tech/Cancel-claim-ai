/**
 * Renders a single core IntakeField as the right native control:
 *   text | email | money  -> TextInput (with matching keyboard)
 *   textarea              -> multiline TextInput
 *   date                  -> TextInput, placeholder YYYY-MM-DD (no native picker in v1)
 *   select                -> option chips
 *
 * Controlled: the parent owns the intake string map and passes value + onChange.
 */
import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import type { IntakeField } from "@cancelclaim/core";
import { colors, fonts, fontSize, radius, spacing, typography } from "../theme";

interface FieldProps {
  field: IntakeField;
  value: string;
  onChange: (value: string) => void;
  /** Inline error message (shown when required field is missing on submit). */
  error?: string;
}

export function Field({ field, value, onChange, error }: FieldProps) {
  const keyboardType = useMemo<KeyboardTypeOptions>(() => {
    if (field.type === "email") return "email-address";
    if (field.type === "money") return "decimal-pad";
    return "default";
  }, [field.type]);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={typography.label}>{field.label}</Text>
        {field.required ? <Text style={styles.required}>required</Text> : null}
      </View>

      {field.type === "select" ? (
        <View style={styles.chips}>
          {(field.options ?? []).map((opt) => {
            const active = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onChange(opt.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={field.placeholder ?? (field.type === "date" ? "YYYY-MM-DD" : undefined)}
          placeholderTextColor={colors.stone400}
          keyboardType={keyboardType}
          autoCapitalize={field.type === "email" ? "none" : "sentences"}
          autoCorrect={field.type !== "email"}
          multiline={field.type === "textarea"}
          numberOfLines={field.type === "textarea" ? 4 : 1}
          style={[
            styles.input,
            field.type === "textarea" && styles.inputMultiline,
            !!error && styles.inputError,
          ]}
        />
      )}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : field.help ? (
        <Text style={styles.help}>{field.help}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  required: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    color: colors.gold700,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.stone300,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: fonts.sans,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  inputMultiline: { minHeight: 110, textAlignVertical: "top", paddingTop: spacing.md },
  inputError: { borderColor: colors.danger },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.stone300,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontFamily: fonts.sans, fontSize: fontSize.sm, color: colors.stone700, fontWeight: "600" },
  chipTextActive: { color: colors.ivory },
  help: { ...typography.caption },
  error: { fontFamily: fonts.sans, fontSize: fontSize.sm, color: colors.danger, fontWeight: "500" },
});
