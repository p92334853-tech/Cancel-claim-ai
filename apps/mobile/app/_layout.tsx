/**
 * Root navigator. A single Stack with the brand applied to every header:
 * navy surface, ivory title in the serif heading face, gold-tinted back control.
 */
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors, fonts, fontSize } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.gold300,
          headerTitleStyle: {
            color: colors.ivory,
            fontFamily: fonts.serif,
            fontSize: fontSize.lg,
            fontWeight: "600",
          },
          headerShadowVisible: false,
          headerBackTitle: "Back",
          contentStyle: { backgroundColor: colors.ivory },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="new/[type]" options={{ title: "New case" }} />
        <Stack.Screen name="cases" options={{ title: "My cases" }} />
        <Stack.Screen name="case/[id]" options={{ title: "Your case" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
