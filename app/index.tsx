import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useRef } from "react";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const index = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasRedirected = useRef(false);

  // Handle redirect based on auth state
  useEffect(() => {
    console.log('Index redirect check:', { isLoading, isAuthenticated, user: user ? 'exists' : 'null', hasRedirected: hasRedirected.current });
    
    // Only redirect once and when loading is complete
    if (!isLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      
      if (isAuthenticated || user) {
        console.log('User is authenticated, redirecting to tabs...', { isAuthenticated, hasUser: !!user });
        // Use immediate redirect without delay
        router.replace('/(tabs)');
      } else {
        console.log('User is not authenticated, redirecting to sign-in...', { isAuthenticated, hasUser: !!user });
        router.replace('/sign-in');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Show loading indicator while checking auth or during redirect
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
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
