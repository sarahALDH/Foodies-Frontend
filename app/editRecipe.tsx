import { ThemedText } from "@/components/themed-text";
import { config } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Category, getCategories } from "@/services/categories";
import {
  createRecipeIngredient,
  deleteRecipeIngredient,
  getIngredientsByRecipe,
} from "@/services/recipeIngredients";
import { getRecipeById, updateRecipe } from "@/services/recipes";
import { styles } from "@/styles/create";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Recipe {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  image: string;
  user_id: string;
  category_id: string;
}

interface RecipeIngredient {
  id?: string;
  _id?: string;
  recipe_id: string;
  ingredient_id: string;
}

export default function EditRecipeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const insets = useSafeAreaInsets();

  // Recipe form state
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [recipeCategoryId, setRecipeCategoryId] = useState("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    []
  );
  const [recipeDescription, setRecipeDescription] = useState("");

  // Shared state
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalRecipe, setOriginalRecipe] = useState<Recipe | null>(null);

  // Fetch recipe data, categories, and ingredients
  useEffect(() => {
    const fetchData = async () => {
      if (!recipeId) {
        Alert.alert("Error", "Recipe ID is missing");
        router.back();
        return;
      }

      setIsLoadingData(true);
      setIsLoadingCategories(true);
      setIsLoadingIngredients(true);

      try {
        // Fetch recipe details using the service function
        const recipeData = await getRecipeById(recipeId);

        if (!recipeData) {
          throw new Error("Recipe not found");
        }

        // Helper function to extract user ID from recipe
        const extractRecipeUserId = (recipe: any): string | null => {
          // Try user_id field - could be string, ObjectId, or populated object
          if (recipe.user_id) {
            if (typeof recipe.user_id === "object" && recipe.user_id !== null) {
              const userIdObj = recipe.user_id;
              if (userIdObj._id) return String(userIdObj._id);
              if (userIdObj.id) return String(userIdObj.id);
            }
            return String(recipe.user_id);
          }
          if (recipe.user?._id) return String(recipe.user._id);
          if (recipe.user?.id) return String(recipe.user.id);
          if (recipe.createdBy?._id) return String(recipe.createdBy._id);
          if (recipe.createdBy?.id) return String(recipe.createdBy.id);
          return null;
        };

        // Check if user owns this recipe
        const recipeUserId = extractRecipeUserId(recipeData);
        const currentUserId = user?.id || (user as any)?._id;
        const currentUserIdStr = currentUserId ? String(currentUserId) : null;

        if (
          !recipeUserId ||
          !currentUserIdStr ||
          recipeUserId !== currentUserIdStr
        ) {
          Alert.alert("Error", "You don't have permission to edit this recipe");
          router.back();
          return;
        }

        setOriginalRecipe(recipeData as any);
        setRecipeTitle(recipeData.title || "");
        setRecipeImage(recipeData.image || null);
        setOriginalImage(recipeData.image || null);
        setRecipeCategoryId(
          recipeData.category_id || (recipeData as any)?.category_id || ""
        );
        setRecipeDescription(recipeData.description || "");

        // Fetch recipe ingredients using service
        const recipeIngredientsData = await getIngredientsByRecipe(recipeId);

        const ingredientIds = Array.isArray(recipeIngredientsData)
          ? recipeIngredientsData.map((ri: any) => {
              const ingredient = ri.ingredient || ri;
              return ingredient?.id || ingredient?._id || ri.ingredient_id;
            })
          : [];
        setSelectedIngredientIds(ingredientIds);

        // Fetch categories and ingredients
        const [categoriesData, ingredientsData] = await Promise.all([
          getCategories(),
          fetch(`${config.API_BASE_URL}/api/ingredients`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch ingredients");
            }
            return res.json();
          }),
        ]);

        setCategories(categoriesData || []);
        setIngredients(ingredientsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load recipe data. Please try again.");
        router.back();
      } finally {
        setIsLoadingData(false);
        setIsLoadingCategories(false);
        setIsLoadingIngredients(false);
      }
    };

    fetchData();
  }, [recipeId]);

  const requestImagePermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera and media library permissions to select images."
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (source: "camera" | "library") => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    try {
      let result;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setRecipeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert("Select Image", "Choose an option", [
      { text: "Cancel", style: "cancel" },
      { text: "Camera", onPress: () => pickImage("camera") },
      { text: "Photo Library", onPress: () => pickImage("library") },
    ]);
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const formData = new FormData();

      // Create file object from URI
      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/recipes/${recipeId}/image`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.image || data.imageUrl || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleUpdateRecipe = async () => {
    if (!recipeTitle.trim()) {
      Alert.alert("Error", "Please enter a recipe title");
      return;
    }
    if (!recipeImage) {
      Alert.alert("Error", "Please select an image");
      return;
    }
    if (!recipeCategoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (selectedIngredientIds.length === 0) {
      Alert.alert("Error", "Please select at least one ingredient");
      return;
    }
    if (!recipeDescription.trim()) {
      Alert.alert("Error", "Please enter recipe steps or directions");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User information is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = user.id || (user as any)?._id;
      let finalImageUrl: string = recipeImage || "";

      // Upload new image if it changed
      if (
        recipeImage &&
        recipeImage !== originalImage &&
        recipeImage.startsWith("file://")
      ) {
        try {
          const uploadedImageUrl = await uploadImage(recipeImage);
          if (uploadedImageUrl) {
            finalImageUrl = uploadedImageUrl;
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          Alert.alert(
            "Warning",
            "Failed to upload new image. Using previous image."
          );
          finalImageUrl = originalImage || "";
        }
      }

      // Update recipe using service function
      await updateRecipe(recipeId, {
        title: recipeTitle,
        description: recipeDescription,
        image: finalImageUrl || undefined,
        user_id: userId,
        category_id: recipeCategoryId,
      });

      // Delete existing recipe-ingredient relationships
      try {
        const existingIngredients = await getIngredientsByRecipe(recipeId);

        if (Array.isArray(existingIngredients)) {
          for (const ri of existingIngredients) {
            const riId =
              ri.id || (ri as any)._id || (ri as any).recipeIngredientId;
            if (riId) {
              await deleteRecipeIngredient(riId);
            }
          }
        }
      } catch (error) {
        console.error("Error deleting old recipe ingredients:", error);
      }

      // Create new recipe-ingredient relationships
      for (const ingredientId of selectedIngredientIds) {
        try {
          await createRecipeIngredient({
            recipe_id: recipeId,
            ingredient_id: ingredientId,
          });
        } catch (ingredientError) {
          console.error("Error creating recipe ingredient:", ingredientError);
        }
      }

      Alert.alert("Success", "Recipe updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error updating recipe:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to update recipe. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={[styles.container, loadingStyles.container]}>
        <View style={styles.backgroundElements}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>
        <ActivityIndicator size="large" color="#fff" />
        <ThemedText style={loadingStyles.text}>Loading recipe...</ThemedText>
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Edit Recipe</ThemedText>
            <View style={styles.headerRight} />
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.formScrollView}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Recipe Title *</ThemedText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter recipe title"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={recipeTitle}
                  onChangeText={setRecipeTitle}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Image *</ThemedText>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={showImagePickerOptions}
              >
                {recipeImage ? (
                  <Image
                    source={{ uri: recipeImage }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#fff" />
                    <ThemedText style={styles.imagePlaceholderText}>
                      Tap to add image
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              {recipeImage && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={showImagePickerOptions}
                >
                  <ThemedText style={styles.removeImageText}>
                    Change Image
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Category *</ThemedText>
              {isLoadingCategories ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.loader}
                />
              ) : (
                <View style={styles.pickerContainer}>
                  {categories.map((category) => {
                    const categoryId = category.id || (category as any)._id;
                    const isSelected = recipeCategoryId === categoryId;
                    return (
                      <TouchableOpacity
                        key={categoryId}
                        style={[
                          styles.pickerOption,
                          isSelected && styles.pickerOptionActive,
                        ]}
                        onPress={() => setRecipeCategoryId(categoryId)}
                      >
                        <ThemedText
                          style={[
                            styles.pickerOptionText,
                            isSelected && styles.pickerOptionTextActive,
                          ]}
                        >
                          {category.name || category.categoryName || ""}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Ingredients *</ThemedText>
              {isLoadingIngredients ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.loader}
                />
              ) : (
                <View style={styles.pickerContainer}>
                  {Array.isArray(ingredients) && ingredients.length > 0 ? (
                    ingredients.map((ingredient) => {
                      const ingredientId =
                        ingredient.id || (ingredient as any)._id;
                      const isSelected =
                        selectedIngredientIds.includes(ingredientId);
                      return (
                        <TouchableOpacity
                          key={ingredientId}
                          style={[
                            styles.pickerOption,
                            styles.multiSelectOption,
                            isSelected && styles.pickerOptionActive,
                          ]}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedIngredientIds(
                                selectedIngredientIds.filter(
                                  (id) => id !== ingredientId
                                )
                              );
                            } else {
                              setSelectedIngredientIds([
                                ...selectedIngredientIds,
                                ingredientId,
                              ]);
                            }
                          }}
                        >
                          <View style={styles.checkboxContainer}>
                            <View
                              style={[
                                styles.checkbox,
                                isSelected && styles.checkboxChecked,
                              ]}
                            >
                              {isSelected && (
                                <Ionicons
                                  name="checkmark"
                                  size={16}
                                  color="#fff"
                                />
                              )}
                            </View>
                            <ThemedText
                              style={[
                                styles.pickerOptionText,
                                isSelected && styles.pickerOptionTextActive,
                              ]}
                            >
                              {ingredient.name ||
                                ingredient.ingredientName ||
                                ""}
                            </ThemedText>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.emptyState}>
                      <ThemedText style={styles.emptyStateText}>
                        No ingredients available. Create one first.
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>
                Steps / Directions *
              </ThemedText>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter cooking steps or directions"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={recipeDescription}
                  onChangeText={setRecipeDescription}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleUpdateRecipe}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#1a4d2e" />
              ) : (
                <ThemedText style={styles.submitButtonText}>
                  Update Recipe
                </ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Additional Styles
const loadingStyles = {
  container: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
};
