import Recipe from "@/components/Recipe";
import { ThemedText } from "@/components/themed-text";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import RecipeType from "@/types/RecipeType";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "http://134.122.96.197:3000";

// Mock recipes for fallback/demo purposes
const mockRecipes: RecipeType[] = [
  {
    id: "1",
    title: "Spaghetti Carbonara",
    date: "2024-01-25",
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
    comments: 12,
    image: null,
    servings: 4,
    cookTime: 30,
    description: "Classic Italian pasta dish with eggs, cheese, and pancetta",
    user: {
      _id: "user1",
      userName: "Chef Mario",
      userProfilePicture: null,
    },
    category: [
      { _id: "cat1", categoryName: "Italian" },
      { _id: "cat2", categoryName: "Pasta" },
    ],
  },
  {
    id: "2",
    title: "Chicken Tikka Masala",
    date: "2024-01-23",
    createdAt: "2024-01-23T14:30:00Z",
    updatedAt: "2024-01-23T14:30:00Z",
    comments: 8,
    image: null,
    servings: 6,
    cookTime: 45,
    description: "Creamy and flavorful Indian curry dish",
    user: {
      _id: "user2",
      userName: "Chef Priya",
      userProfilePicture: null,
    },
    category: [
      { _id: "cat3", categoryName: "Indian" },
      { _id: "cat4", categoryName: "Curry" },
    ],
  },
  {
    id: "3",
    title: "Banana Bread",
    date: "2024-01-21",
    createdAt: "2024-01-21T09:15:00Z",
    updatedAt: "2024-01-21T09:15:00Z",
    comments: 15,
    image: null,
    servings: 8,
    cookTime: 60,
    description: "Moist and delicious homemade banana bread",
    user: {
      _id: "user3",
      userName: "Baker Sarah",
      userProfilePicture: null,
    },
    category: [
      { _id: "cat5", categoryName: "Dessert" },
      { _id: "cat6", categoryName: "Baking" },
    ],
  },
  {
    id: "4",
    title: "Fish Tacos",
    date: "2024-01-19",
    createdAt: "2024-01-19T18:00:00Z",
    updatedAt: "2024-01-19T18:00:00Z",
    comments: 20,
    image: null,
    servings: 4,
    cookTime: 25,
    description: "Fresh and zesty Mexican-style fish tacos",
    user: {
      _id: "user4",
      userName: "Chef Carlos",
      userProfilePicture: null,
    },
    category: [
      { _id: "cat7", categoryName: "Mexican" },
      { _id: "cat8", categoryName: "Seafood" },
    ],
  },
];

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigationLoading = useNavigationLoading();

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
        setError(null);
      } else {
        // Fallback to mock data if API fails
        setRecipes(mockRecipes);
        setError("Failed to load recipes. Showing demo data.");
      }
    } catch (err) {
      // Fallback to mock data on error
      setRecipes(mockRecipes);
      setError("Unable to connect to server. Showing demo data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRecipes();
  };

  if (navigationLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.container} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#83ab64" />
          </View>
        </SafeAreaView>
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
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Recipes</ThemedText>
            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
          </View>

          {/* Recipes List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#83ab64" />
              <ThemedText style={styles.loadingText}>
                Loading recipes...
              </ThemedText>
            </View>
          ) : recipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No recipes found</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Start creating recipes to see them here!
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor="#83ab64"
                />
              }
            >
              {recipes.map((recipe, index) => (
                <View
                  key={recipe.id}
                  style={index > 0 ? styles.recipeSpacing : undefined}
                >
                  <Recipe recipe={recipe} />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
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
    backgroundColor: "transparent",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#080808",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#ff6b6b",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#080808",
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    backgroundColor: "transparent",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#080808",
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 48,
    color: "#080808",
  },
  recipeSpacing: {
    marginTop: 16,
  },
});
