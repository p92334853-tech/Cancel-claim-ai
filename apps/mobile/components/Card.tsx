/**
 * Soft, generously padded surface used to group content. Pressable when an
 * `onPress` is supplied (e.g. case-type tiles, saved-case rows).
 */
import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";

interface CardProps extends ViewProps {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  /** Tighter padding for dense list rows. */
  compact?: boolean;
}

export function Card({ children, onPress, onLongPress, style, compact, ...rest }: CardProps) {
  const padding = compact ? spacing.lg : spacing.xl;
  if (onPress || onLongPress) {
    return (
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.card, { padding }, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[styles.card, { padding }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stone200,
    ...shadow.soft,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
});
