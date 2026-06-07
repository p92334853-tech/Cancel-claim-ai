import type { Config } from "tailwindcss";

/**
 * Cancel & Claim AI design tokens.
 * Refined, restrained, subtly Byzantine: deep navy, ivory, muted gold, stone.
 * High contrast, calm surfaces, soft shadows — premium, not flashy.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0E2236",
          950: "#070F19",
          900: "#0A1A2A",
          800: "#0E2236",
          700: "#163049",
          600: "#1E3E5C",
          500: "#2A5277",
        },
        ivory: "#F7F4EC",
        paper: "#FFFFFF",
        gold: {
          DEFAULT: "#B8924A",
          700: "#8C6E36",
          600: "#9A7A3A",
          500: "#B8924A",
          400: "#C9A85F",
          300: "#DCC487",
        },
        stone: {
          DEFAULT: "#6B6B63",
          900: "#2C2A24",
          700: "#4A4842",
          500: "#6B6B63",
          400: "#8A857A",
          300: "#D6D1C4",
          200: "#E7E3D8",
          100: "#F1EEE5",
        },
        ink: "#0A1622",
      },
      fontFamily: {
        serif: ['Georgia', '"Cormorant Garamond"', '"Times New Roman"', "ui-serif", "serif"],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10, 22, 34, 0.04), 0 8px 24px rgba(10, 22, 34, 0.06)",
        card: "0 1px 3px rgba(10, 22, 34, 0.05), 0 12px 32px rgba(10, 22, 34, 0.07)",
        gold: "0 8px 28px rgba(184, 146, 74, 0.18)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      maxWidth: {
        prose: "68ch",
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
