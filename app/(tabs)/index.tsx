import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { PageSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");

  // Animation values
  const logoScale = useSharedValue(1);
  const icon1Rotation = useSharedValue(0);
  const icon2Rotation = useSharedValue(0);
  const icon3Rotation = useSharedValue(0);
  const icon4Rotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const isLoading = useNavigationLoading();

  useEffect(() => {
    // Pulsing logo animation
    logoScale.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );

    // Rotating food icons around logo
    icon1Rotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );
    icon2Rotation.value = withRepeat(
      withTiming(-360, { duration: 10000 }),
      -1,
      false
    );
    icon3Rotation.value = withRepeat(
      withTiming(360, { duration: 12000 }),
      -1,
      false
    );
    icon4Rotation.value = withRepeat(
      withTiming(-360, { duration: 9000 }),
      -1,
      false
    );
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const icon1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${icon1Rotation.value}deg` }],
  }));

  const icon2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${icon2Rotation.value}deg` }],
  }));

  const icon3Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${icon3Rotation.value}deg` }],
  }));

  const icon4Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${icon4Rotation.value}deg` }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSignIn = () => {
    // TODO: Implement actual sign-in logic with your backend/authentication
    // For now, this is a placeholder that checks if fields are filled
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    // Simulate checking if user exists
    // Replace this with your actual authentication logic
    const userExists = false; // This should be replaced with actual check

    if (!userExists) {
      setShowRegisterPrompt(true);
    } else {
      // User exists, proceed with sign in
      console.log("Sign in:", { email, password });
      router.replace("/(tabs)");
    }
  };

  const handleButtonPress = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    handleSignIn();
  };

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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.logoWrapper}>
              {/* Floating food icons around logo */}
              <Animated.View
                style={[styles.floatingIcon, styles.iconTop, icon1Style]}
              >
                <MaterialCommunityIcons
                  name="chef-hat"
                  size={32}
                  color="#83ab64"
                />
              </Animated.View>
              <Animated.View
                style={[styles.floatingIcon, styles.iconRight, icon2Style]}
              >
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={28}
                  color="#ff6b6b"
                />
              </Animated.View>
              <Animated.View
                style={[styles.floatingIcon, styles.iconBottom, icon3Style]}
              >
                <MaterialCommunityIcons
                  name="food-apple"
                  size={30}
                  color="#ffa500"
                />
              </Animated.View>
              <Animated.View
                style={[styles.floatingIcon, styles.iconLeft, icon4Style]}
              >
                <MaterialCommunityIcons
                  name="cupcake"
                  size={26}
                  color="#ff69b4"
                />
              </Animated.View>

              <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Image
                  source={require("@/assets/images/logo2.png")}
                  style={styles.logo}
                  contentFit="contain"
                />
              </Animated.View>
            </View>
            {/* <ThemedText type="title" style={styles.title}>
              Welcome to DishDash
            </ThemedText> */}
            {/* <ThemedText style={styles.subtitle}>
              Your recipe and ingredient companion
            </ThemedText> */}

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#83ab64"
                    style={styles.labelIcon}
                  />
                  <ThemedText style={styles.label}>Email</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail"
                    size={20}
                    color="#83ab64"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: textColor || "#080808", borderColor: "#83ab64" },
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={iconColor || "rgba(8, 8, 8, 0.5)"}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setShowRegisterPrompt(false);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#83ab64"
                    style={styles.labelIcon}
                  />
                  <ThemedText style={styles.label}>Password</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color="#83ab64"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: textColor || "#080808", borderColor: "#83ab64" },
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={iconColor || "rgba(8, 8, 8, 0.5)"}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setShowRegisterPrompt(false);
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                </View>
              </View>

              {showRegisterPrompt && (
                <View style={styles.registerPrompt}>
                  <ThemedText style={styles.registerPromptText}>
                    No account found with this email.{" "}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.push("/sign-up")}>
                    <ThemedText style={styles.registerLink}>
                      Register here
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity onPress={handleButtonPress} activeOpacity={0.8}>
                <Animated.View
                  style={[styles.primaryButton, buttonAnimatedStyle]}
                >
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={22}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <ThemedText style={styles.primaryButtonText}>
                    Sign In
                  </ThemedText>
                </Animated.View>
              </TouchableOpacity>

              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Don't have an account?{" "}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push("/sign-up")}>
                  <ThemedText style={styles.footerLink}>Sign Up</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    backgroundColor: "transparent",
  },
  logoWrapper: {
    position: "relative",
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  floatingIcon: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconTop: {
    top: 0,
    left: "50%",
    transform: [{ translateX: -20 }],
  },
  iconRight: {
    right: 0,
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  iconBottom: {
    bottom: 0,
    left: "50%",
    transform: [{ translateX: -20 }],
  },
  iconLeft: {
    left: 0,
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  logoContainer: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#83ab64",
    justifyContent: "center",
    alignItems: "center",
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
    width: 210,
    height: 210,
  },
  title: {
    marginBottom: 20,
    opacity: 0.7,
    textAlign: "center",
    color: "#080808",
  },
  subtitle: {
    marginBottom: 20,
    textAlign: "center",
    opacity: 0.7,
    fontSize: 16,
    color: "#080808",
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#080808",
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#83ab64",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  registerPrompt: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
    padding: 12,
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.5)",
  },
  registerPromptText: {
    fontSize: 14,
    color: "#080808",
    textAlign: "center",
  },
  registerLink: {
    fontSize: 14,
    color: "#83ab64",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  primaryButton: {
    backgroundColor: "#83ab64",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    shadowColor: "#83ab64",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: 14,
    color: "#080808",
    opacity: 0.7,
  },
  footerLink: {
    fontSize: 14,
    color: "#83ab64",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
