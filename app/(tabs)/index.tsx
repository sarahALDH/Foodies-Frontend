import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";

export default function HomeScreen() {
  const tintColor = useThemeColor({}, "tint");

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <ThemedText type="title" style={styles.title}>
          Welcome to Foodiez
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your favorite food delivery app
        </ThemedText>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              { backgroundColor: tintColor },
            ]}
            onPress={() => router.push("/sign-in")}
          >
            <ThemedText style={styles.primaryButtonText}>Sign In</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: tintColor },
            ]}
            onPress={() => router.push("/sign-up")}
          >
            <ThemedText
              style={[styles.secondaryButtonText, { color: tintColor }]}
            >
              Sign Up
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "transparent",
  },
  logoContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#83ab64",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -70,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 270,
    height: 270,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.7,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
