/**
 * Intake. Renders the selected case type's fields, validates required answers
 * with core's `validateIntake`, then generates the draft ON-DEVICE via core's
 * deterministic `buildCaseDraft` (no network), persists it, and opens results.
 */
import { useMemo, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import {
  buildCaseDraft,
  getCaseTypeDefinition,
  todayISO,
  uuid,
  validateIntake,
  CASE_TYPES,
} from "@cancelclaim/core";
import type { CaseType, IntakeData } from "@cancelclaim/core";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { saveCase, type StoredCase } from "../../lib/storage";
import { caseTitle } from "../../lib/format";
import { colors, fonts, fontSize, radius, spacing, typography } from "../../theme";

function isCaseType(value: string | undefined): value is CaseType {
  return typeof value === "string" && (CASE_TYPES as readonly string[]).includes(value);
}

export default function IntakeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: string }>();
  const type = params.type;

  if (!isCaseType(type)) {
    return (
      <Screen>
        <Text style={typography.h2}>Unknown case type</Text>
        <Text style={[typography.body, { marginTop: spacing.md }]}>
          That case type isn&apos;t available. Go back and pick one of the six options.
        </Text>
        <View style={{ marginTop: spacing.xl }}>
          <Button label="Back to home" variant="secondary" onPress={() => router.replace("/")} />
        </View>
      </Screen>
    );
  }

  return <IntakeForm type={type} />;
}

function IntakeForm({ type }: { type: CaseType }) {
  const router = useRouter();
  const def = useMemo(() => getCaseTypeDefinition(type), [type]);

  // Seed values from each field's defaultValue.
  const [values, setValues] = useState<IntakeData>(() => {
    const seed: IntakeData = {};
    for (const field of def.fields) {
      if (field.defaultValue) seed[field.name] = field.defaultValue;
    }
    return seed;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const setField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const onGenerate = async () => {
    const check = validateIntake(type, values);
    if (!check.ready) {
      const nextErrors: Record<string, string> = {};
      for (const item of check.items) {
        if (item.severity === "required") nextErrors[item.field] = item.question;
      }
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    try {
      const output = buildCaseDraft({
        caseType: type,
        intake: values,
        locale: "en",
        evidence: [],
        today: todayISO(),
      });
      const record: StoredCase = {
        id: uuid(),
        type,
        title: caseTitle(type, values),
        intake: values,
        output,
        createdAt: new Date().toISOString(),
      };
      await saveCase(record);
      router.replace(`/case/${record.id}`);
    } finally {
      setBusy(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Screen keyboardAware>
      <Stack.Screen options={{ title: def.label }} />
      <Text style={typography.eyebrow}>NEW CASE</Text>
      <Text style={[typography.h1, styles.heading]}>{def.label}</Text>
      <Text style={[typography.body, styles.intro]}>{def.tagline}</Text>

      <View style={styles.form}>
        {def.fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            onChange={(v) => setField(field.name, v)}
            error={errors[field.name]}
          />
        ))}
      </View>

      {hasErrors ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Please complete the highlighted fields so we can write a strong message.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button label="Generate drafts" glyph="✦" loading={busy} onPress={onGenerate} />
        <Text style={styles.privacy}>
          Drafts are written on your device. Nothing is sent anywhere.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.sm },
  intro: { marginTop: spacing.sm, marginBottom: spacing.xl },
  form: { gap: spacing.xl },
  banner: {
    marginTop: spacing.xl,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.lg,
  },
  bannerText: { fontFamily: fonts.sans, fontSize: fontSize.sm, color: colors.danger, lineHeight: fontSize.sm * 1.5 },
  actions: { marginTop: spacing.xxl, gap: spacing.md },
  privacy: { ...typography.caption, textAlign: "center" },
});
