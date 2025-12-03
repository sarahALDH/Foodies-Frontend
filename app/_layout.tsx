import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Custom fade transition without darkening overlay
const forFade = ({ current }: { current: { progress: number } }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

export const unstable_settings = {
  initialRouteName: "sign-in",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RecipesProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
          <Stack
            initialRouteName="sign-in"
            screenOptions={{
              headerShown: false,
              // Use fade transition to avoid darkening overlay
              cardStyleInterpolator: forFade,
              // Remove the overlay that causes darkening
              cardOverlayEnabled: false,
              // Use transparent background to prevent darkening
              cardStyle: { backgroundColor: "transparent" },
            }}
          >
            <Stack.Screen
              name="sign-in"
              options={{
                headerShown: false,
                presentation: "card",
                cardStyleInterpolator: forFade,
                cardOverlayEnabled: false,
                cardStyle: { backgroundColor: "transparent" },
              }}
            />
            <Stack.Screen
              name="sign-up"
              options={{
                headerShown: false,
                presentation: "card",
                cardStyleInterpolator: forFade,
                cardOverlayEnabled: false,
                cardStyle: { backgroundColor: "transparent" },
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                cardStyleInterpolator: forFade,
                cardOverlayEnabled: false,
                cardStyle: { backgroundColor: "transparent" },
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Modal",
                cardStyleInterpolator: forFade,
                cardOverlayEnabled: false,
                cardStyle: { backgroundColor: "transparent" },
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </RecipesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
