import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  CardStyleInterpolators,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  initialRouteName: "sign-in",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          initialRouteName="sign-in"
          screenOptions={{
            headerShown: false,
            // Use fade transition to avoid darkening overlay
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
            // Remove the overlay that causes darkening
            cardOverlayEnabled: false,
          }}
        >
          <Stack.Screen
            name="sign-in"
            options={{
              headerShown: false,
              presentation: "card",
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              cardOverlayEnabled: false,
            }}
          />
          <Stack.Screen
            name="sign-up"
            options={{
              headerShown: false,
              presentation: "card",
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              cardOverlayEnabled: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              cardOverlayEnabled: false,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              cardOverlayEnabled: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
