import { ThemedText } from "@/components/themed-text";
import { getRecipeById } from "@/services/recipes";
import RecipeType from "@/types/RecipeType";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const API_BASE_URL = "http://134.122.96.197:3000";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Helper function to construct image URL
      const getImageUrl = (imagePath: any): string | null => {
        if (!imagePath) return null;
        if (typeof imagePath === "string") {
          // If it's already a full URL, return it
          if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
          ) {
            return imagePath;
          }
          // If it's a relative path, construct full URL
          if (imagePath.startsWith("/")) {
            return `${API_BASE_URL}${imagePath}`;
          }
          return `${API_BASE_URL}/${imagePath}`;
        }
        return null;
      };

      // Helper function to extract user data
      const extractUserData = (recipeData: any) => {
        // Try nested user object first
        if (recipeData.user) {
          return {
            _id:
              recipeData.user._id ||
              recipeData.user.id ||
              recipeData.user_id ||
              recipeData.userId ||
              "",
            userName:
              recipeData.user.userName ||
              recipeData.user.name ||
              recipeData.user.username ||
              recipeData.userName ||
              "",
            userProfilePicture:
              recipeData.user.userProfilePicture ||
              recipeData.user.profileImage ||
              recipeData.user.avatar ||
              null,
          };
        }
        // Try top-level user fields
        if (recipeData.user_id || recipeData.userId) {
          return {
            _id: recipeData.user_id || recipeData.userId || "",
            userName: recipeData.userName || recipeData.username || "",
            userProfilePicture: null,
          };
        }
        return null;
      };

      // Try using the service first
      try {
        const recipeData = await getRecipeById(id);
        console.log(
          "Recipe detail API response:",
          JSON.stringify(recipeData, null, 2)
        );

        const userData = extractUserData(recipeData);
        const imageUrl = getImageUrl(
          recipeData.image ||
            (recipeData as any).imageUrl ||
            (recipeData as any).imagePath ||
            (recipeData as any).photo ||
            (recipeData as any).photoUrl
        );

        // Map the response to RecipeType format
        const mappedRecipe: RecipeType = {
          id: recipeData.id || (recipeData as any)._id || id,
          title:
            recipeData.title ||
            (recipeData as any).name ||
            (recipeData as any).recipeName ||
            "",
          date:
            recipeData.date || recipeData.createdAt || new Date().toISOString(),
          createdAt:
            recipeData.createdAt || recipeData.date || new Date().toISOString(),
          updatedAt:
            recipeData.updatedAt ||
            recipeData.createdAt ||
            new Date().toISOString(),
          comments: (recipeData as any).comments || 0,
          image: imageUrl,
          servings:
            recipeData.servings ||
            (recipeData as any).servingSize ||
            (recipeData as any).serves ||
            0,
          cookTime:
            recipeData.cookTime ||
            (recipeData as any).cookingTime ||
            (recipeData as any).prepTime ||
            (recipeData as any).time ||
            0,
          description:
            recipeData.description ||
            (recipeData as any).instructions ||
            (recipeData as any).directions ||
            "",
          user: userData || {
            _id: "",
            userName: "",
            userProfilePicture: null,
          },
          category: Array.isArray((recipeData as any).category)
            ? (recipeData as any).category.map((cat: any) => ({
                _id: cat._id || cat.id || "",
                categoryName: cat.categoryName || cat.name || cat || "",
              }))
            : [],
        };
        setRecipe(mappedRecipe);
      } catch (serviceError) {
        console.log("Service error, trying direct API call:", serviceError);
        // Fallback to direct API call
        const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Direct API response:", JSON.stringify(data, null, 2));
          const recipeData = data.data || data;

          const userData = extractUserData(recipeData);
          const imageUrl = getImageUrl(
            recipeData.image ||
              recipeData.imageUrl ||
              recipeData.imagePath ||
              recipeData.photo ||
              recipeData.photoUrl
          );

          const mappedRecipe: RecipeType = {
            id: recipeData.id || recipeData._id || id,
            title:
              recipeData.title ||
              recipeData.name ||
              recipeData.recipeName ||
              "",
            date:
              recipeData.date ||
              recipeData.createdAt ||
              new Date().toISOString(),
            createdAt:
              recipeData.createdAt ||
              recipeData.date ||
              new Date().toISOString(),
            updatedAt:
              recipeData.updatedAt ||
              recipeData.createdAt ||
              new Date().toISOString(),
            comments: recipeData.comments || 0,
            image: imageUrl,
            servings:
              recipeData.servings ||
              recipeData.servingSize ||
              recipeData.serves ||
              0,
            cookTime:
              recipeData.cookTime ||
              recipeData.cookingTime ||
              recipeData.prepTime ||
              recipeData.time ||
              0,
            description:
              recipeData.description ||
              recipeData.instructions ||
              recipeData.directions ||
              "",
            user: userData || {
              _id: "",
              userName: "",
              userProfilePicture: null,
            },
            category: Array.isArray(recipeData.category)
              ? recipeData.category.map((cat: any) => ({
                  _id: cat._id || cat.id || "",
                  categoryName: cat.categoryName || cat.name || cat || "",
                }))
              : [],
          };
          setRecipe(mappedRecipe);
        } else {
          throw new Error("Failed to fetch recipe");
        }
      }
    } catch (err) {
      console.error("Error fetching recipe:", err);
      setError("Failed to load recipe details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: "#1a4d2e" }]}
          edges={["top", "bottom"]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <ThemedText style={styles.loadingText}>
              Loading recipe...
            </ThemedText>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: "#1a4d2e" }]}
          edges={["top", "bottom"]}
        >
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              {error || "Recipe not found"}
            </ThemedText>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10 },
          ]}
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Recipe Image */}
          <View style={styles.imageContainer}>
            {recipe.image ? (
              <Image
                source={{ uri: recipe.image }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="restaurant"
                  size={60}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </View>
            )}
          </View>

          {/* Recipe Info */}
          <View style={styles.infoContainer}>
            <ThemedText style={styles.title}>
              {recipe.title || "Untitled Recipe"}
            </ThemedText>

            <View style={styles.metaRow}>
              <ThemedText style={styles.metaText}>
                Created By:{" "}
                {recipe.user?.userName ||
                  (recipe.user as any)?.name ||
                  (recipe as any)?.userName ||
                  "Unknown Chef"}
              </ThemedText>
              <ThemedText style={styles.metaText}>
                {formatTime(recipe.createdAt)}
              </ThemedText>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailBadge}>
                <ThemedText style={styles.detailText}>
                  ⏱️ {recipe.cookTime} min
                </ThemedText>
              </View>
              <View style={styles.detailBadge}>
                <ThemedText style={styles.detailText}>
                  🍽️ {recipe.servings} servings
                </ThemedText>
              </View>
            </View>

            {/* Categories */}
            {recipe.category && recipe.category.length > 0 && (
              <View style={styles.categoriesContainer}>
                {recipe.category.map((cat, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <ThemedText style={styles.categoryText}>
                      {cat.categoryName}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* Description */}
            <View style={styles.descriptionWrapper}>
              <ThemedText style={styles.description}>
                {recipe.description || "No description available."}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a4d2e",
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  imageContainer: {
    width: "90%",
    maxWidth: 350,
    height: 200,
    alignSelf: "center",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  metaText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 16,
  },
  detailBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 8,
    borderRadius: 8,
  },
  detailText: {
    color: "#fff",
    fontSize: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  categoryTag: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 10,
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
  },
  descriptionWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
  },
  description: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});
