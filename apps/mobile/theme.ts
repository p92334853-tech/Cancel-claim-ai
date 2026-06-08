/**
 * Shared design tokens for the Cancel & Claim AI mobile app.
 *
 * Mirrors the web brand: deep navy, ivory, muted gold, stone grays, ink.
 * Premium, calm, restrained. One source of truth for color, spacing, radius,
 * typography and shadows so every screen stays consistent.
 */
import { Platform, type TextStyle } from "react-native";

export const colors = {
  navy: "#0E2236",
  navy900: "#0A1A2A",
  navy700: "#163049",
  navy600: "#1E3E5C",
  navy500: "#2A5277",
  ivory: "#F7F4EC",
  paper: "#FFFFFF",
  gold: "#B8924A",
  gold700: "#8C6E36",
  gold400: "#C9A85F",
  gold300: "#DCC487",
  stone900: "#2C2A24",
  stone700: "#4A4842",
  stone500: "#6B6B63",
  stone400: "#8A857A",
  stone300: "#D6D1C4",
  stone200: "#E7E3D8",
  stone100: "#F1EEE5",
  ink: "#0A1622",
  danger: "#9B2C2C",
  dangerSoft: "#FBEAEA",
} as const;

/** 4pt-based spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

/**
 * Serif-ish heading family. Uses platform serif faces where available so
 * headings carry the same composed, editorial tone as the web wordmark.
 */
export const fonts = {
  serif: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "Georgia",
  }),
  sans: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
} as const;

export const shadow = {
  soft: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3,
  },
} as const;

/** Reusable text presets. */
export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily: fonts.serif,
    fontSize: fontSize.display,
    lineHeight: fontSize.display * 1.1,
    color: colors.navy,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  h1: {
    fontFamily: fonts.serif,
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * 1.15,
    color: colors.navy,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fonts.serif,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.2,
    color: colors.navy,
    fontWeight: "600",
  },
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    color: colors.gold700,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.stone700,
  },
  bodyInk: {
    fontFamily: fonts.sans,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.55,
    color: colors.ink,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: fontSize.sm,
    color: colors.navy,
    fontWeight: "600",
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: fontSize.xs,
    color: colors.stone500,
  },
};

export const theme = { colors, spacing, radius, fontSize, fonts, shadow, typography };
export type Theme = typeof theme;
