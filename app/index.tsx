import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // If user is logged in, redirect to home screen
  // Otherwise, redirect to sign in screen
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/sign-in" />;
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a4d2e",
    justifyContent: "center",
    alignItems: "center",
  },
});
