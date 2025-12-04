import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/contexts/AuthContext";
import { RecipesProvider } from "@/contexts/RecipesContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Custom fade transition without darkening overlay
const forFade = ({ current }: { current: { progress: number } }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

// Note: initialRouteName is handled by app/index.tsx based on auth state

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
              initialRouteName="index"
              screenOptions={{
                headerShown: true,
                contentStyle: { backgroundColor: "transparent" },
              }}
            >
              <Stack.Screen
                name="sign-in"
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="sign-up"
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="recipe/[id]"
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="deleteRecipe"
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="editRecipe"
                options={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  title: "Modal",
                  contentStyle: { backgroundColor: "transparent" },
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
