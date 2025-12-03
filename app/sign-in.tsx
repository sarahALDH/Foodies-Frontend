import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { router, useNavigation } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { PageSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
} from "react-native-reanimated";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = useNavigation();
  const isLoading = useNavigationLoading();
  const insets = useSafeAreaInsets();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Animation values
  const mushroom1Y = useSharedValue(0);
  const mushroom1Rotate = useSharedValue(0);
  const mushroom2Y = useSharedValue(0);
  const mushroom2Rotate = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);

  // Hide navigation bar
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('User already authenticated, redirecting from sign-in to tabs...');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, authLoading]);

  // Start animations
  useEffect(() => {
    // Mushroom 1 floating and rotating
    mushroom1Y.value = withRepeat(
      withTiming(-15, { duration: 3000 }),
      -1,
      true
    );
    mushroom1Rotate.value = withRepeat(
      withTiming(10, { duration: 4000 }),
      -1,
      true
    );

    // Mushroom 2 floating and rotating
    mushroom2Y.value = withRepeat(
      withTiming(-12, { duration: 3500 }),
      -1,
      true
    );
    mushroom2Rotate.value = withRepeat(
      withTiming(-8, { duration: 4500 }),
      -1,
      true
    );

    // Form fade in and slide up
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));
  }, []);

  // Animated styles
  const mushroom1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: mushroom1Y.value },
      { rotate: `${mushroom1Rotate.value}deg` },
    ],
  }));

  const mushroom2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: mushroom2Y.value },
      { rotate: `${mushroom2Rotate.value}deg` },
    ],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setShowRegisterPrompt(false);

    try {
      await login(email, password);
      // Navigation is handled by AuthContext after successful login
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMsg = error?.message || "Failed to sign in. Please check your credentials.";
      setErrorMessage(errorMsg);
      Alert.alert("Sign In Failed", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Creative Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
        {/* Mushroom Decorative Element */}
        <Animated.View
          style={[styles.mushroomContainer1, mushroom1AnimatedStyle]}
        >
          <Image
            source={require("@/assets/images/mashroom.png")}
            style={styles.mushroom}
            contentFit="contain"
          />
        </Animated.View>
        <Animated.View
          style={[styles.mushroomContainer2, mushroom2AnimatedStyle]}
        >
          <Image
            source={require("@/assets/images/mashroom.png")}
            style={styles.mushroom}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 80 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo with Creative Frame */}
            <View style={styles.logoContainer}>
              <View style={styles.logoFrame}>
                <Image
                  source={require("@/assets/images/logo2.png")}
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
            </View>

            {/* Welcome Text with Creative Typography */}
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeLine} />
              <ThemedText style={styles.welcomeText}>
                Your Dish, Your Dash
              </ThemedText>
              <View style={styles.welcomeLine} />
            </View>

            {/* Form Container */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Email</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
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

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setShowRegisterPrompt(false);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText style={styles.forgotPasswordText}>
                  Forgot password?
                </ThemedText>
              </TouchableOpacity>

              {errorMessage && (
                <View style={styles.registerPrompt}>
                  <ThemedText style={styles.registerPromptText}>
                    {errorMessage}{" "}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.push("/sign-up")}>
                    <ThemedText style={styles.registerLink}>
                      Register here
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                activeOpacity={0.85}
                style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                disabled={isSubmitting}
              >
                <View style={styles.buttonContent}>
                  <ThemedText style={styles.primaryButtonText}>
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </ThemedText>
                  {!isSubmitting && (
                    <View style={styles.buttonArrowContainer}>
                      <Ionicons name="arrow-forward" size={18} color="#1a4d2e" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Don't have account?{" "}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push("/sign-up")}>
                  <ThemedText style={styles.footerLink}>Register</ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a4d2e", // Dark forest green
    position: "relative",
  },
  backgroundElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 0,
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    top: -50,
    right: -50,
  },
  circle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    bottom: 100,
    left: -30,
  },
  circle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    top: "40%",
    right: 20,
  },
  mushroomContainer1: {
    position: "absolute",
    top: 40,
    left: -120,
    width: 280,
    height: 280,
    opacity: 0.2,
    transform: [{ rotate: "-50deg" }],
  },
  mushroomContainer2: {
    position: "absolute",
    bottom: 40,
    right: -100,
    width: 260,
    height: 260,
    opacity: 0.1,
    transform: [{ rotate: "20deg" }],
  },
  mushroom: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    tintColor: "rgba(255, 255, 255, 0.7)",
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFrame: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
    width: "100%",
    maxWidth: 300,
  },
  welcomeLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 12,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1.2,
    opacity: 0.95,
  },
  formContainer: {
    width: "100%",
    maxWidth: 380,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
    paddingLeft: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 18,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    minHeight: 58,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 14,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "transparent",
    letterSpacing: 0.3,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.85,
    fontWeight: "500",
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
    color: "#fff",
    textAlign: "center",
  },
  registerLink: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  primaryButton: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    width: "100%",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: "#1a4d2e",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 1,
  },
  buttonArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(26, 77, 46, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.85,
  },
  footerLink: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
});
