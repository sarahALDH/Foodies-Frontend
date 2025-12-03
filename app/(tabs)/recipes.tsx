import Recipe from "@/components/Recipe";
import { ThemedText } from "@/components/themed-text";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import RecipeType from "@/types/RecipeType";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

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
        console.log(
          "Recipes screen API response:",
          JSON.stringify(data, null, 2)
        );

        // Handle different response structures
        let recipesArray: RecipeType[] = [];
        if (Array.isArray(data)) {
          recipesArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          recipesArray = data.data;
        } else if (data?.recipes && Array.isArray(data.recipes)) {
          recipesArray = data.recipes;
        } else {
          console.warn("Unexpected recipes response structure:", data);
          recipesArray = [];
        }

        // Map _id to id if needed and ensure user data is properly structured
        const mappedRecipes = recipesArray.map((recipe: any) => ({
          ...recipe,
          id: recipe.id || recipe._id || String(Date.now() + Math.random()),
          user: recipe.user || {
            _id: recipe.user_id || recipe.userId || "",
            userName:
              recipe.user?.userName ||
              recipe.user?.name ||
              recipe.userName ||
              "Unknown Chef",
            userProfilePicture:
              recipe.user?.userProfilePicture ||
              recipe.user?.profileImage ||
              null,
          },
        }));

        setRecipes(mappedRecipes);
        setError(null);
      } else {
        // Fallback to mock data if API fails
        setRecipes(mockRecipes);
        setError("Failed to load recipes. Showing demo data.");
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
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
      <View style={styles.container}>
        <View style={styles.backgroundElements}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>
        <SafeAreaView style={styles.container} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </SafeAreaView>
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
      </View>

      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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
          ) : !Array.isArray(recipes) ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                Error loading recipes
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Please try refreshing
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
                  tintColor="#fff"
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
  content: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 0,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    opacity: 1,
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
    color: "#fff",
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
    color: "#fff",
    opacity: 0.9,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 48,
    color: "rgba(255, 255, 255, 0.8)",
  },
  recipeSpacing: {
    marginTop: 16,
  },
});
