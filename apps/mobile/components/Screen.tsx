/**
 * Brand-consistent screen scaffold: ivory background, safe-area aware, with an
 * optional scroll container. Keeps every screen visually aligned without
 * repeating layout boilerplate.
 */
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Extra content style for the scroll/content container. */
  contentStyle?: ViewStyle;
  /** When true, avoids the keyboard (forms). */
  keyboardAware?: boolean;
}

export function Screen({ children, scroll = true, contentStyle, keyboardAware = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: insets.bottom + spacing.xxl,
  };

  const body = scroll ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[padding, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, padding, contentStyle]}>{children}</View>
  );

  if (keyboardAware) {
    return (
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.ivory },
});
