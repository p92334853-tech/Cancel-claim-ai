/**
 * My cases. Lists everything saved locally (most recent first), opens a case on
 * tap, and supports delete via a row button or long-press. Empty state routes
 * back into the intake flow.
 */
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getCaseTypeDefinition } from "@cancelclaim/core";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { deleteCase, listCases, type StoredCase } from "../lib/storage";
import { colors, fonts, fontSize, spacing, typography } from "../theme";

export default function CasesScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    let active = true;
    listCases().then((next) => {
      if (active) {
        setCases(next);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Reload whenever the screen regains focus (e.g. after creating/deleting).
  useFocusEffect(reload);

  const confirmDelete = (item: StoredCase) => {
    Alert.alert("Delete case", `Remove "${item.title}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCase(item.id);
          setCases((prev) => prev.filter((c) => c.id !== item.id));
        },
      },
    ]);
  };

  if (loaded && cases.length === 0) {
    return (
      <Screen contentStyle={styles.emptyWrap}>
        <View style={styles.empty}>
          <Text style={styles.emptyGlyph}>✦</Text>
          <Text style={[typography.h2, styles.emptyTitle]}>No cases yet</Text>
          <Text style={[typography.body, styles.emptyBody]}>
            Start a case and we&apos;ll draft the messages, evidence summary, and a
            follow-up plan — all on your device.
          </Text>
          <Button label="Start a case" glyph="+" onPress={() => router.push("/")} fullWidth={false} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={typography.eyebrow}>SAVED ON THIS DEVICE</Text>
      <Text style={[typography.h1, styles.heading]}>My cases</Text>

      <View style={styles.list}>
        {cases.map((item) => {
          const def = getCaseTypeDefinition(item.type);
          return (
            <Card
              key={item.id}
              compact
              onPress={() => router.push(`/case/${item.id}`)}
              onLongPress={() => confirmDelete(item)}
              style={styles.row}
            >
              <View style={styles.rowMain}>
                <Badge label={def.label} tone="gold" />
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta}>{formatDate(item.createdAt)}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.title}`}
                hitSlop={10}
                onPress={() => confirmDelete(item)}
                style={styles.delete}
              >
                <Text style={styles.deleteGlyph}>×</Text>
              </Pressable>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.sm, marginBottom: spacing.xl },
  list: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rowMain: { flex: 1, gap: spacing.sm },
  rowTitle: { fontFamily: fonts.serif, fontSize: fontSize.lg, color: colors.navy, fontWeight: "600" },
  rowMeta: { ...typography.caption },
  delete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.stone100,
  },
  deleteGlyph: { fontSize: 20, color: colors.stone500, lineHeight: 22 },
  emptyWrap: { flexGrow: 1, justifyContent: "center" },
  empty: { alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg },
  emptyGlyph: { fontSize: 40, color: colors.gold },
  emptyTitle: { textAlign: "center" },
  emptyBody: { textAlign: "center", marginBottom: spacing.lg },
});
