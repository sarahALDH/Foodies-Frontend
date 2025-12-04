import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteRecipe as deleteRecipeService,
  getRecipes,
  Recipe,
} from "@/services/recipes";
import { styles } from "@/styles/create"; // Reusing the same styles
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function DeleteRecipeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Fetch user's recipes
  const fetchRecipes = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const userId = user?.id || (user as any)?._id;
      if (!userId) {
        console.log("No user ID found");
        setRecipes([]);
        setFilteredRecipes([]);
        return;
      }

      console.log("Fetching recipes for user ID:", userId);

      // Use the service function which includes authentication
      // First try with user_id query param, if that doesn't work, fetch all and filter
      let recipesData: Recipe[] = [];
      try {
        recipesData = await getRecipes({ user_id: userId });
        console.log("Fetched recipes with user_id param:", recipesData);
      } catch (error) {
        console.log(
          "Error fetching with user_id param, trying all recipes:",
          error
        );
        // Fallback: fetch all recipes and filter client-side
        recipesData = await getRecipes();
        console.log("Fetched all recipes:", recipesData);
      }

      // Convert userId to string for comparison
      const userIdStr = String(userId);
      console.log("Comparing with userId (string):", userIdStr);

      // Helper function to extract user ID from recipe in various formats
      const extractRecipeUserId = (recipe: Recipe): string | null => {
        // Try user_id field - could be string, ObjectId, or populated object
        if (recipe.user_id) {
          // If it's an object with _id property (populated user)
          if (typeof recipe.user_id === "object" && recipe.user_id !== null) {
            const userIdObj = recipe.user_id as any;
            if (userIdObj._id) {
              return String(userIdObj._id);
            }
            if (userIdObj.id) {
              return String(userIdObj.id);
            }
          }
          // If it's a string or primitive
          return String(recipe.user_id);
        }
        if ((recipe as any)?.user_id) {
          const userIdValue = (recipe as any).user_id;
          // If it's an object with _id property
          if (typeof userIdValue === "object" && userIdValue !== null) {
            if (userIdValue._id) {
              return String(userIdValue._id);
            }
            if (userIdValue.id) {
              return String(userIdValue.id);
            }
          }
          return String(userIdValue);
        }
        // Try nested user object
        if ((recipe as any)?.user?._id) {
          return String((recipe as any).user._id);
        }
        if ((recipe as any)?.user?.id) {
          return String((recipe as any).user.id);
        }
        // Try createdBy
        if ((recipe as any)?.createdBy?._id) {
          return String((recipe as any).createdBy._id);
        }
        if ((recipe as any)?.createdBy?.id) {
          return String((recipe as any).createdBy.id);
        }
        return null;
      };

      // Filter to ensure we only show recipes belonging to the user
      // Handle both string and ObjectId formats, and various field names
      const userRecipes = Array.isArray(recipesData)
        ? recipesData.filter((recipe: Recipe) => {
            const recipeUserIdStr = extractRecipeUserId(recipe);
            const matches = recipeUserIdStr === userIdStr;

            console.log("Recipe check:", {
              title: recipe.title || (recipe as any).name,
              recipeUserId: recipeUserIdStr,
              userId: userIdStr,
              matches: matches,
              recipe: {
                user_id: recipe.user_id,
                _user_id: (recipe as any)?._user_id,
                user: (recipe as any)?.user,
                createdBy: (recipe as any)?.createdBy,
              },
            });

            return matches;
          })
        : [];

      console.log(
        `Filtered ${userRecipes.length} user recipes out of ${recipesData.length} total recipes`
      );
      setRecipes(userRecipes);
      setFilteredRecipes(userRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error", "Failed to load recipes. Please try again.");
      setRecipes([]);
      setFilteredRecipes([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecipes();
    }
  }, [user]);

  // Filter recipes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const handleDeleteRecipe = async (recipe: Recipe) => {
    // Try multiple ways to get the recipe ID
    const recipeId =
      recipe.id ||
      (recipe as any)._id ||
      (recipe as any).recipe_id ||
      String((recipe as any).id) ||
      String((recipe as any)._id);
    const recipeTitle = recipe.title || "Untitled Recipe";

    if (!recipeId) {
      console.error("Recipe ID is missing:", recipe);
      Alert.alert("Error", "Recipe ID is missing. Cannot delete recipe.");
      return;
    }

    // Ensure recipeId is a string
    const recipeIdStr = String(recipeId);

    console.log("Attempting to delete recipe:", {
      recipeId: recipeIdStr,
      recipeTitle,
      originalRecipe: recipe,
      allIds: {
        id: recipe.id,
        _id: (recipe as any)._id,
        recipe_id: (recipe as any).recipe_id,
      },
    });

    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const recipeIdStr = String(recipeId);
            setDeletingIds((prev) => new Set(prev).add(recipeIdStr));
            try {
              console.log("Calling deleteRecipeService with ID:", recipeIdStr);
              console.log("User info:", {
                userId: user?.id || (user as any)?._id,
                user: user,
              });
              // Use the service function which includes authentication
              await deleteRecipeService(recipeIdStr);
              console.log("Recipe deleted successfully");

              Alert.alert("Success", "Recipe deleted successfully!");

              // Remove from local state
              setRecipes((prev) =>
                prev.filter((r) => {
                  const rId = r.id || (r as any)._id;
                  return String(rId) !== recipeIdStr;
                })
              );
              setFilteredRecipes((prev) =>
                prev.filter((r) => {
                  const rId = r.id || (r as any)._id;
                  return String(rId) !== recipeIdStr;
                })
              );
            } catch (error: any) {
              console.error("Error deleting recipe:", error);
              console.error("Error details:", {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
              });
              Alert.alert(
                "Error",
                error?.message || "Failed to delete recipe. Please try again."
              );
            } finally {
              setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(recipeIdStr);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    const recipeId = item.id || (item as any)._id;
    const recipeIdStr = String(recipeId);
    const isDeleting = deletingIds.has(recipeIdStr);

    return (
      <View style={recipeItemStyles.container}>
        <View style={recipeItemStyles.content}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={recipeItemStyles.image}
              contentFit="cover"
            />
          ) : (
            <View style={recipeItemStyles.imagePlaceholder}>
              <Ionicons
                name="restaurant-outline"
                size={30}
                color="rgba(255, 255, 255, 0.5)"
              />
            </View>
          )}
          <View style={recipeItemStyles.textContainer}>
            <ThemedText style={recipeItemStyles.title} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={recipeItemStyles.description} numberOfLines={2}>
              {item.description}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={[
            recipeItemStyles.deleteButton,
            isDeleting && recipeItemStyles.deleteButtonDisabled,
          ]}
          onPress={() => handleDeleteRecipe(item)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={emptyStateStyles.container}>
      <Ionicons
        name="restaurant-outline"
        size={80}
        color="rgba(255, 255, 255, 0.3)"
      />
      <ThemedText style={emptyStateStyles.title}>No Recipes Found</ThemedText>
      <ThemedText style={emptyStateStyles.subtitle}>
        {searchQuery
          ? "No recipes match your search"
          : "You haven't created any recipes yet"}
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Creative Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image
              source={require("@/assets/images/logo2.png")}
              style={styles.headerLogo}
              contentFit="contain"
            />
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Search Bar */}
        <View style={searchBarStyles.container}>
          <View style={searchBarStyles.inputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color="rgba(255, 255, 255, 0.5)"
              style={searchBarStyles.icon}
            />
            <TextInput
              style={searchBarStyles.input}
              placeholder="Search recipes..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recipes List */}
        {isLoading ? (
          <View style={loadingStyles.container}>
            <ActivityIndicator size="large" color="#fff" />
            <ThemedText style={loadingStyles.text}>
              Loading recipes...
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id || (item as any)._id}
            contentContainerStyle={listStyles.contentContainer}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchRecipes(true)}
                tintColor="#fff"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

// Additional Styles
const searchBarStyles = {
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
  },
};

const recipeItemStyles = {
  container: {
    flexDirection: "row" as const,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  deleteButton: {
    padding: 10,
    marginLeft: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
};

const loadingStyles = {
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
};

const emptyStateStyles = {
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center" as const,
  },
};

const listStyles = {
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 30,
  },
};
