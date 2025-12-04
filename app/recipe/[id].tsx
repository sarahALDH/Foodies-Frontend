import { ThemedText } from "@/components/themed-text";
import { config } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryById } from "@/services/categories";
import {
  createOrUpdateLike,
  getRecipeLikeCounts,
  getUserLikeForRecipe,
  Like,
} from "@/services/likes";
import { createNotification } from "@/services/notifications";
import {
  createOrUpdateRating,
  getRatings,
  getUserRatingForRecipe,
} from "@/services/ratings";
import { getIngredientsByRecipe } from "@/services/recipeIngredients";
import { getRecipeById } from "@/services/recipes";
import { getUserById } from "@/services/users";
import { styles } from "@/styles/recipeDetail";
import RecipeType from "@/types/RecipeType";
import { getImageUrl } from "@/utils/imageUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [userLike, setUserLike] = useState<Like | null>(null);

  useEffect(() => {
    // Handle both string and array formats from useLocalSearchParams
    const recipeId = Array.isArray(id) ? id[0] : id;
    if (recipeId) {
      fetchRecipe(recipeId);
    } else {
      setError("Recipe ID is missing");
      setIsLoading(false);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!recipeId) {
        throw new Error("Recipe ID is required");
      }

      // Helper function to safely convert ObjectId to string
      const toObjectIdString = (value: any): string => {
        if (!value) return "";
        // If it's already a string, return it
        if (typeof value === "string") return value;
        // If it has toString method, use it
        if (value && typeof value.toString === "function") {
          const str = value.toString();
          // Check if it's not "[object Object]"
          if (str !== "[object Object]") return str;
        }
        // If it's an object with _id or id property
        if (typeof value === "object" && value !== null) {
          if (value._id) return toObjectIdString(value._id);
          if (value.id) return toObjectIdString(value.id);
        }
        return "";
      };

      // Helper function to extract user data (async to fetch from users endpoint if needed)
      const extractUserData = async (recipeData: any) => {
        console.log(
          "Extracting user data from:",
          JSON.stringify(recipeData, null, 2)
        );

        // Try nested user object first (MongoDB populated field)
        if (recipeData.user) {
          const user = recipeData.user;
          // Handle both object and string (ObjectId) cases
          if (typeof user === "object" && user !== null) {
            const userData = {
              _id:
                toObjectIdString(user._id) ||
                toObjectIdString(user.id) ||
                toObjectIdString(recipeData.user_id) ||
                toObjectIdString(recipeData.userId) ||
                "",
              userName:
                user.userName ||
                user.name ||
                user.username ||
                user.user_name ||
                recipeData.userName ||
                "",
              userProfilePicture:
                user.userProfilePicture ||
                user.profileImage ||
                user.avatar ||
                user.profile_picture ||
                null,
            };
            console.log(
              "Extracted user data from nested user object:",
              userData
            );
            return userData;
          }
        }

        // Try top-level user fields (user_id is ObjectId reference)
        // If we have user_id but no populated user data, fetch from users endpoint
        const userId = toObjectIdString(
          recipeData.user_id || recipeData.userId
        );
        if (userId) {
          // If we already have username in recipe data, use it
          if (
            recipeData.userName ||
            recipeData.username ||
            recipeData.user_name
          ) {
            const userData = {
              _id: userId,
              userName:
                recipeData.userName ||
                recipeData.username ||
                recipeData.user_name ||
                "",
              userProfilePicture:
                recipeData.userProfilePicture ||
                recipeData.profileImage ||
                null,
            };
            console.log("Extracted user data from top-level fields:", userData);
            return userData;
          }

          // Otherwise, fetch from users endpoint
          try {
            console.log(
              `Fetching user data from users endpoint for user_id: ${userId}`
            );
            const user = await getUserById(userId);
            const userData = {
              _id: userId,
              userName: user.userName || user.name || user.username || "",
              userProfilePicture:
                user.userProfilePicture || user.profileImage || null,
            };
            console.log("Fetched user data from users endpoint:", userData);
            return userData;
          } catch (error) {
            console.error(
              `Error fetching user ${userId} from users endpoint:`,
              error
            );
            // Return user data with just the ID if fetch fails
            return {
              _id: userId,
              userName: "",
              userProfilePicture: null,
            };
          }
        }

        // Try to find user data in any nested structure
        if (recipeData.createdBy) {
          const createdBy = recipeData.createdBy;
          if (typeof createdBy === "object" && createdBy !== null) {
            return {
              _id: toObjectIdString(createdBy._id || createdBy.id),
              userName:
                createdBy.userName ||
                createdBy.name ||
                createdBy.username ||
                "",
              userProfilePicture:
                createdBy.userProfilePicture || createdBy.profileImage || null,
            };
          }
        }

        console.log("No user data found in recipe data");
        return null;
      };

      // Try using the service first
      try {
        const recipeData = await getRecipeById(recipeId);
        console.log(
          "Recipe detail API response:",
          JSON.stringify(recipeData, null, 2)
        );

        // Ensure we have the actual recipe object (handle MongoDB _id)
        const actualRecipe = recipeData || {};

        const userData = await extractUserData(actualRecipe);
        console.log("Extracted userData:", userData);

        const imageUrl = getImageUrl(
          actualRecipe.image ||
            (actualRecipe as any).imageUrl ||
            (actualRecipe as any).imagePath ||
            (actualRecipe as any).photo ||
            (actualRecipe as any).photoUrl
        );

        // Map the response to RecipeType format
        // MongoDB uses _id, so prioritize _id over id
        const mappedRecipeIdMain: string =
          toObjectIdString((actualRecipe as any)._id) ||
          toObjectIdString(actualRecipe.id) ||
          recipeId;

        // Ensure user data is properly set
        const finalUserData = userData || {
          _id: toObjectIdString(
            (actualRecipe as any).user_id || (actualRecipe as any).userId
          ),
          userName:
            (actualRecipe as any).userName ||
            (actualRecipe as any).username ||
            "",
          userProfilePicture: null,
        };

        console.log("Final user data being set:", finalUserData);

        // Extract title and description (which is steps/directions)
        const recipeTitle =
          actualRecipe.title ||
          actualRecipe.name ||
          actualRecipe.recipeName ||
          "Untitled Recipe";
        const recipeDescription = actualRecipe.description || "";

        // Handle category based on schema structure
        // Schema has category_id (ObjectId ref), category may be populated
        // Backend uses 'name' field, not 'categoryName'
        let categoryData: Array<{ _id: string; name: string }> = [];
        const categoryIdRaw =
          actualRecipe.category_id || actualRecipe.categoryId || "";
        const categoryId = categoryIdRaw ? toObjectIdString(categoryIdRaw) : "";

        // If category is populated (object), use it
        if (
          actualRecipe.category &&
          typeof actualRecipe.category === "object" &&
          !Array.isArray(actualRecipe.category)
        ) {
          categoryData = [
            {
              _id: toObjectIdString(
                actualRecipe.category._id ||
                  actualRecipe.category.id ||
                  categoryId
              ),
              name:
                actualRecipe.category.name ||
                actualRecipe.category.categoryName ||
                "",
            },
          ];
        }
        // If category_id exists but category is not populated, fetch it from backend
        else if (categoryId) {
          try {
            console.log(
              `Fetching category data from backend for category_id: ${categoryId}`
            );
            const category = await getCategoryById(categoryId);
            categoryData = [
              {
                _id: categoryId,
                name: category.name || category.categoryName || "",
              },
            ];
            console.log(`Fetched category data from backend:`, categoryData);
          } catch (error) {
            console.error(
              `Error fetching category ${categoryId} from backend:`,
              error
            );
            // If fetch fails, just store the ID
            categoryData = [
              {
                _id: categoryId,
                name: "",
              },
            ];
          }
        }

        const mappedRecipe: RecipeType = {
          id: mappedRecipeIdMain,
          title: recipeTitle,
          date:
            actualRecipe.date ||
            actualRecipe.createdAt ||
            new Date().toISOString(),
          createdAt:
            actualRecipe.createdAt ||
            actualRecipe.date ||
            new Date().toISOString(),
          updatedAt:
            actualRecipe.updatedAt ||
            actualRecipe.createdAt ||
            new Date().toISOString(),
          comments: (actualRecipe as any).comments || 0,
          image: imageUrl,
          servings: 0,
          cookTime: 0,
          description: recipeDescription,
          user: finalUserData,
          category: categoryData,
        };
        setRecipe(mappedRecipe);

        // Fetch recipe ingredients
        const recipeIdForIngredients: string = mappedRecipeIdMain;
        try {
          const ingredients = await getIngredientsByRecipe(
            recipeIdForIngredients
          );
          setRecipeIngredients(Array.isArray(ingredients) ? ingredients : []);
        } catch (ingredientError) {
          console.error("Error fetching recipe ingredients:", ingredientError);
          setRecipeIngredients([]);
        }
      } catch (serviceError) {
        console.log("Service error, trying direct API call:", serviceError);
        // Fallback to direct API call
        const response = await fetch(
          `${config.API_BASE_URL}/api/recipes/${recipeId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Direct API response:", JSON.stringify(data, null, 2));

          // Handle different response structures
          const recipeData = data.data || data;

          // Ensure we have the actual recipe object
          const actualRecipe = recipeData || {};

          const userData = await extractUserData(actualRecipe);
          console.log("Extracted userData (fallback):", userData);

          const imageUrl = getImageUrl(
            actualRecipe.image ||
              (actualRecipe as any).imageUrl ||
              (actualRecipe as any).imagePath ||
              (actualRecipe as any).photo ||
              (actualRecipe as any).photoUrl
          );

          // MongoDB uses _id, so prioritize _id over id
          const mappedRecipeIdFallback: string =
            (actualRecipe as any)._id || actualRecipe.id || recipeId;

          // Ensure user data is properly set (reuse toObjectIdString from outer scope)
          const finalUserData = userData || {
            _id: toObjectIdString(
              (actualRecipe as any).user_id || (actualRecipe as any).userId
            ),
            userName:
              (actualRecipe as any).userName ||
              (actualRecipe as any).username ||
              "",
            userProfilePicture: null,
          };

          console.log("Final user data being set (fallback):", finalUserData);

          // Extract title and description (which is steps/directions)
          const recipeTitle =
            actualRecipe.title ||
            actualRecipe.name ||
            actualRecipe.recipeName ||
            "Untitled Recipe";
          const recipeDescription = actualRecipe.description || "";

          // Handle category based on schema structure
          // Schema has category_id (ObjectId ref), category may be populated
          // Backend uses 'name' field, not 'categoryName'
          let categoryData: Array<{ _id: string; name: string }> = [];
          const categoryIdRaw =
            actualRecipe.category_id || actualRecipe.categoryId || "";
          const categoryId = categoryIdRaw
            ? toObjectIdString(categoryIdRaw)
            : "";

          // If category is populated (object), use it
          if (
            actualRecipe.category &&
            typeof actualRecipe.category === "object" &&
            !Array.isArray(actualRecipe.category)
          ) {
            categoryData = [
              {
                _id: toObjectIdString(
                  actualRecipe.category._id ||
                    actualRecipe.category.id ||
                    categoryId
                ),
                name:
                  actualRecipe.category.name ||
                  actualRecipe.category.categoryName ||
                  "",
              },
            ];
          }
          // If category_id exists but category is not populated, fetch it from backend
          else if (categoryId) {
            try {
              console.log(
                `Fetching category data from backend for category_id: ${categoryId}`
              );
              const category = await getCategoryById(categoryId);
              categoryData = [
                {
                  _id: categoryId,
                  name: category.name || category.categoryName || "",
                },
              ];
              console.log(`Fetched category data from backend:`, categoryData);
            } catch (error) {
              console.error(
                `Error fetching category ${categoryId} from backend:`,
                error
              );
              // If fetch fails, just store the ID
              categoryData = [
                {
                  _id: categoryId,
                  name: "",
                },
              ];
            }
          }

          const mappedRecipe: RecipeType = {
            id: mappedRecipeIdFallback,
            title: recipeTitle,
            date:
              actualRecipe.date ||
              actualRecipe.createdAt ||
              new Date().toISOString(),
            createdAt:
              actualRecipe.createdAt ||
              actualRecipe.date ||
              new Date().toISOString(),
            updatedAt:
              actualRecipe.updatedAt ||
              actualRecipe.createdAt ||
              new Date().toISOString(),
            comments: (actualRecipe as any).comments || 0,
            image: imageUrl,
            servings: 0,
            cookTime: 0,
            description: recipeDescription,
            user: finalUserData,
            category: categoryData,
          };
          setRecipe(mappedRecipe);

          // Fetch recipe ingredients
          const recipeIdForIngredientsFallback: string = mappedRecipeIdFallback;
          try {
            const ingredients = await getIngredientsByRecipe(
              recipeIdForIngredientsFallback
            );
            setRecipeIngredients(Array.isArray(ingredients) ? ingredients : []);
          } catch (ingredientError) {
            console.error(
              "Error fetching recipe ingredients:",
              ingredientError
            );
            setRecipeIngredients([]);
          }

          // Fetch ratings
          await fetchRatings(recipeIdForIngredientsFallback);

          // Fetch likes/dislikes
          await fetchLikes(recipeIdForIngredientsFallback);
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

  const fetchRatings = async (recipeId: string) => {
    try {
      const ratings = await getRatings({ recipe_id: recipeId });
      setRatingCount(ratings.length);

      if (ratings.length > 0) {
        const sum = ratings.reduce(
          (acc, rating) => acc + (rating.rating || 0),
          0
        );
        setAverageRating(sum / ratings.length);
      } else {
        setAverageRating(0);
      }

      // Fetch user's rating if authenticated
      if (isAuthenticated && user) {
        const userId = user._id || (user as any)?.id;
        if (userId) {
          const userRatingData = await getUserRatingForRecipe(recipeId, userId);
          if (userRatingData) {
            setUserRating(userRatingData.rating);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const fetchLikes = async (recipeId: string) => {
    try {
      const counts = await getRecipeLikeCounts(recipeId);
      setLikes(counts.likes);
      setDislikes(counts.dislikes);

      // Fetch user's like/dislike if authenticated
      if (isAuthenticated && user) {
        const userId = user._id || (user as any)?.id;
        if (userId) {
          const userLikeData = await getUserLikeForRecipe(recipeId, userId);
          setUserLike(userLikeData);
        }
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
      setLikes(0);
      setDislikes(0);
      setUserLike(null);
    }
  };

  const handleRatingPress = async (rating: number) => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to rate recipes.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!recipe) {
      return;
    }

    try {
      setIsSubmittingRating(true);
      const userId = user._id || (user as any)?.id;
      const recipeId = recipe.id || (recipe as any)._id;

      if (!recipeId || !userId) {
        throw new Error("Missing recipe or user ID");
      }

      // Get recipe owner ID
      const recipeOwnerId =
        recipe.user?._id ||
        (recipe as any)?.user_id ||
        (recipe as any)?.createdBy?._id ||
        (recipe as any)?.createdBy?.id;

      await createOrUpdateRating({
        recipe_id: recipeId,
        user_id: userId,
        rating: rating,
      });

      setUserRating(rating);

      // Refresh ratings to update average
      await fetchRatings(recipeId);

      // Create notification for recipe owner if they're different from the rater
      if (recipeOwnerId && recipeOwnerId !== userId) {
        try {
          await createNotification({
            user_id: recipeOwnerId,
            type: "rating",
            title: "New Rating on Your Recipe",
            message: `Your recipe "${
              recipe.title || "Untitled Recipe"
            }" received a ${rating} star${rating !== 1 ? "s" : ""} rating!`,
            recipe_id: recipeId,
            read: false,
          });
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Don't fail the rating if notification creation fails
        }
      }

      Alert.alert("Success", "Rating submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", error?.message || "Failed to submit rating");
    } finally {
      setIsSubmittingRating(false);
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
          style={[styles.container, { backgroundColor: "#0d2818" }]}
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
          style={[styles.container, { backgroundColor: "#0d2818" }]}
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
              <Ionicons name="arrow-back" size={24} color="#fff" />
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
          contentContainerStyle={styles.scrollContent}
        >
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
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  const recipeId = recipe?.id || (recipe as any)?._id;
                  if (recipeId) {
                    router.push(`/editRecipe?recipeId=${recipeId}` as any);
                  }
                }}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => router.push("/deleteRecipe" as any)}
              >
                <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipe Info */}
          <View style={styles.infoContainer}>
            {/* Recipe Image */}
            {recipe.image ? (
              <Image
                source={{ uri: recipe.image }}
                style={styles.recipeImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.recipeImagePlaceholder}>
                <MaterialCommunityIcons
                  name="food"
                  size={60}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </View>
            )}

            {/* Recipe Title */}
            <View style={styles.titleSection}>
              <ThemedText style={styles.recipeTitle}>
                {recipe.title || "Untitled Recipe"}
              </ThemedText>

              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const displayRating =
                        hoveredRating || userRating || averageRating;
                      const isFilled = star <= Math.round(displayRating);
                      return (
                        <TouchableOpacity
                          key={star}
                          onPress={() => handleRatingPress(star)}
                          onPressIn={() => setHoveredRating(star)}
                          onPressOut={() => setHoveredRating(null)}
                          disabled={isSubmittingRating || !isAuthenticated}
                          style={styles.starButton}
                        >
                          <Ionicons
                            name={isFilled ? "star" : "star-outline"}
                            size={28}
                            color={
                              isFilled ? "#ffa500" : "rgba(255, 255, 255, 0.4)"
                            }
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {averageRating > 0 && (
                    <View style={styles.ratingInfo}>
                      <ThemedText style={styles.ratingText}>
                        {averageRating.toFixed(1)}
                      </ThemedText>
                      <ThemedText style={styles.ratingCountText}>
                        ({ratingCount}{" "}
                        {ratingCount === 1 ? "rating" : "ratings"})
                      </ThemedText>
                    </View>
                  )}
                </View>
                {!isAuthenticated && (
                  <ThemedText style={styles.ratingHint}>
                    Sign in to rate this recipe
                  </ThemedText>
                )}
                {isAuthenticated && userRating && (
                  <ThemedText style={styles.userRatingText}>
                    Your rating: {userRating} star{userRating !== 1 ? "s" : ""}
                  </ThemedText>
                )}
              </View>

              {/* Like/Dislike Section */}
              <View style={styles.likesSection}>
                <View style={styles.likesContainer}>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={async () => {
                      if (!isAuthenticated || !user) {
                        Alert.alert(
                          "Authentication Required",
                          "Please sign in to like recipes."
                        );
                        return;
                      }
                      if (!recipe) return;

                      const recipeId = recipe.id || (recipe as any)._id;
                      const userId = user._id || (user as any)?.id;
                      if (!recipeId || !userId) return;

                      try {
                        const newLike = await createOrUpdateLike({
                          recipe_id: recipeId,
                          user_id: userId,
                          type: "like",
                        });
                        const counts = await getRecipeLikeCounts(recipeId);
                        setLikes(counts.likes);
                        setDislikes(counts.dislikes);
                        setUserLike(newLike);

                        // Create notification if like was added (not removed)
                        if (newLike && newLike.type === "like") {
                          const recipeOwnerId =
                            recipe.user?._id ||
                            (recipe as any)?.user_id ||
                            (recipe as any)?.createdBy?._id;
                          if (recipeOwnerId && recipeOwnerId !== userId) {
                            try {
                              await createNotification({
                                user_id: recipeOwnerId,
                                type: "like" as const,
                                title: "New Like on Your Recipe",
                                message: recipe.title || "Untitled Recipe",
                                recipe_id: recipeId,
                                read: false,
                                liked_by: userId,
                                from_user_id: userId,
                              });
                            } catch (notificationError) {
                              console.error(
                                "Error creating notification:",
                                notificationError
                              );
                            }
                          }
                        }
                      } catch (error) {
                        console.error("Error liking recipe:", error);
                        Alert.alert("Error", "Failed to like recipe");
                      }
                    }}
                  >
                    <Ionicons
                      name={
                        userLike?.type === "like"
                          ? "thumbs-up"
                          : "thumbs-up-outline"
                      }
                      size={24}
                      color={
                        userLike?.type === "like"
                          ? "#4CAF50"
                          : "rgba(255, 255, 255, 0.7)"
                      }
                    />
                    <ThemedText style={styles.likeCount}>{likes}</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dislikeButton}
                    onPress={async () => {
                      if (!isAuthenticated || !user) {
                        Alert.alert(
                          "Authentication Required",
                          "Please sign in to dislike recipes."
                        );
                        return;
                      }
                      if (!recipe) return;

                      const recipeId = recipe.id || (recipe as any)._id;
                      const userId = user._id || (user as any)?.id;
                      if (!recipeId || !userId) return;

                      try {
                        const newLike = await createOrUpdateLike({
                          recipe_id: recipeId,
                          user_id: userId,
                          type: "dislike",
                        });
                        const counts = await getRecipeLikeCounts(recipeId);
                        setLikes(counts.likes);
                        setDislikes(counts.dislikes);
                        setUserLike(newLike);

                        // Create notification if dislike was added (not removed)
                        if (newLike && newLike.type === "dislike") {
                          const recipeOwnerId =
                            recipe.user?._id ||
                            (recipe as any)?.user_id ||
                            (recipe as any)?.createdBy?._id;
                          if (recipeOwnerId && recipeOwnerId !== userId) {
                            try {
                              await createNotification({
                                user_id: recipeOwnerId,
                                type: "dislike" as const,
                                title: "New Dislike on Your Recipe",
                                message: recipe.title || "Untitled Recipe",
                                recipe_id: recipeId,
                                read: false,
                                disliked_by: userId,
                                from_user_id: userId,
                              });
                            } catch (notificationError) {
                              console.error(
                                "Error creating notification:",
                                notificationError
                              );
                            }
                          }
                        }
                      } catch (error) {
                        console.error("Error disliking recipe:", error);
                        Alert.alert("Error", "Failed to dislike recipe");
                      }
                    }}
                  >
                    <Ionicons
                      name={
                        userLike?.type === "dislike"
                          ? "thumbs-down"
                          : "thumbs-down-outline"
                      }
                      size={24}
                      color={
                        userLike?.type === "dislike"
                          ? "#ff4444"
                          : "rgba(255, 255, 255, 0.7)"
                      }
                    />
                    <ThemedText style={styles.dislikeCount}>
                      {dislikes}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                {!isAuthenticated && (
                  <ThemedText style={styles.likesHint}>
                    Sign in to like or dislike this recipe
                  </ThemedText>
                )}
              </View>
            </View>

            {/* Categories */}
            {recipe.category && recipe.category.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
                <View style={styles.categoriesContainer}>
                  {recipe.category.map((cat, index) => (
                    <View key={index} style={styles.categoryTag}>
                      <ThemedText style={styles.categoryText}>
                        {cat.name}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Ingredients */}
            {recipeIngredients.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Ingredients</ThemedText>
                <View style={styles.ingredientsContainer}>
                  {recipeIngredients.map((recipeIngredient, index) => {
                    const ingredient =
                      recipeIngredient.ingredient || recipeIngredient;
                    const ingredientName =
                      ingredient?.name ||
                      ingredient?.ingredientName ||
                      recipeIngredient?.name ||
                      "Unknown Ingredient";
                    return (
                      <View key={index} style={styles.ingredientItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#fff"
                        />
                        <ThemedText style={styles.ingredientText}>
                          {ingredientName}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Steps / Directions */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Steps / Directions
              </ThemedText>
              <View style={styles.stepsWrapper}>
                <ThemedText style={styles.stepsText}>
                  {recipe.description || "No steps available."}
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
