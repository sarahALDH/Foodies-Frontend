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
import { PageSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";

export default function HomeScreen() {
  const tintColor = useThemeColor({}, "tint");
  const isLoading = useNavigationLoading();

  if (isLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <PageSkeleton />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo2.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <ThemedText type="title" style={styles.title}>
          Welcome to DishDash
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your recipe and ingredient companion
        </ThemedText>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/sign-in")}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.primaryButtonText}>Sign In</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/sign-up")}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.secondaryButtonText}>Sign Up</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "transparent",
  },
  logoContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#83ab64",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
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
    width: 260,
    height: 260,
  },
  title: {
    marginBottom: 20,
    opacity: 0.7,
    textAlign: "center",
    color: "#080808",
  },
  subtitle: {
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.7,
    fontSize: 16,
    color: "#080808",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: "#83ab64",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    width: "100%",
    shadowColor: "#83ab64",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: "#83ab64",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: "#83ab64",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
