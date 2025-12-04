import { PageSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { styles } from "@/styles/signIn";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = useNavigation();
  const isLoading = useNavigationLoading();
  const { register } = useAuth();

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  const buttonShine = useSharedValue(0);

  // Hide navigation bar
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Start animations
  useEffect(() => {
    // Form fade in and slide up
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));

    // Button shine animation
    buttonShine.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);

  // Animated styles
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonShineStyle = useAnimatedStyle(() => {
    const progress = buttonShine.value;
    return {
      left: `${(progress - 1) * 200}%`,
      opacity: progress > 0.5 ? (1 - progress) * 0.5 : progress * 0.5,
    };
  });

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await register(name, email, password);
      // Navigation is handled by AuthContext after successful registration
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMsg =
        error?.message || "Failed to create account. Please try again.";
      setErrorMessage(errorMsg);
      Alert.alert("Sign Up Failed", errorMsg);
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#0d2818" }]}
      edges={["bottom"]}
    >
      {/* Creative Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: 80 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>

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
                Create Your Account
              </ThemedText>
              <View style={styles.welcomeLine} />
            </View>

            {/* Static Text Under Welcome */}
            <View style={styles.subtitleContainer}>
              <ThemedText style={styles.subtitleText}>
                dash through the dishes
              </ThemedText>
            </View>

            {/* Form Container */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Name</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="restaurant-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Email</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="restaurant-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={setEmail}
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
                    name="chef-hat"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="fast-food-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
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

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.inputLabel}>
                    Confirm Password
                  </ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="fast-food-outline"
                    size={22}
                    color="rgba(255, 255, 255, 0.8)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {errorMessage && (
                <View style={styles.registerPrompt}>
                  <ThemedText style={styles.registerPromptText}>
                    {errorMessage}
                  </ThemedText>
                </View>
              )}

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                activeOpacity={0.9}
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.primaryButtonDisabled,
                ]}
                disabled={isSubmitting}
              >
                <Animated.View
                  style={[styles.buttonShineOverlay, buttonShineStyle]}
                />
                <View style={styles.buttonContent}>
                  <ThemedText style={styles.primaryButtonText}>
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                  </ThemedText>
                  {!isSubmitting && (
                    <View style={styles.buttonArrowContainer}>
                      <Ionicons name="restaurant" size={18} color="#0d2818" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                  Already have account?{" "}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push("/sign-in")}>
                  <ThemedText style={styles.footerLink}>Sign In</ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
