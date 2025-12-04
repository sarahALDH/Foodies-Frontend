import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { Category, createCategory, getCategories } from "@/services/categories";
import {
  createIngredient,
  getIngredients,
  Ingredient,
} from "@/services/ingredients";
import { createRecipeIngredient } from "@/services/recipeIngredients";
import { createRecipe } from "@/services/recipes";
import { styles } from "@/styles/create";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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

type CreateTab = "recipe" | "ingredient" | "category";

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CreateTab>("recipe");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recipe form state
  const [recipeTitle, setRecipeTitle] = useState<string>("");
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [recipeDescription, setRecipeDescription] = useState<string>("");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);

  // Ingredient form state
  const [ingredientName, setIngredientName] = useState("");

  // Category form state
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (activeTab === "recipe") {
      fetchCategories();
      fetchIngredients();
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const apiCategories = await getCategories();
      setCategories(apiCategories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      setIsLoadingIngredients(true);
      const apiIngredients = await getIngredients();
      // Ensure we always have an array
      if (Array.isArray(apiIngredients)) {
        setIngredients(apiIngredients);
      } else if (
        (apiIngredients as any)?.data &&
        Array.isArray((apiIngredients as any).data)
      ) {
        setIngredients((apiIngredients as any).data);
      } else {
        setIngredients([]);
      }
    } catch (error: any) {
      console.error("Error fetching ingredients:", error);
      setIngredients([]); // Set empty array on error
    } finally {
      setIsLoadingIngredients(false);
    }
  };

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

  const handleCreateRecipe = async () => {
    if (!recipeTitle.trim()) {
      Alert.alert("Error", "Please enter a recipe title");
      return;
    }
    if (!recipeImage) {
      Alert.alert("Error", "Please select an image");
      return;
    }
    if (selectedCategoryIds.length === 0) {
      Alert.alert("Error", "Please select at least one category");
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
    if (!user?._id) {
      Alert.alert("Error", "User information is missing");
      return;
    }

    try {
      setIsSubmitting(true);
      const userId = user._id || (user as any)?.id;
      const recipeData: any = {
        title: recipeTitle.trim(),
        description: recipeDescription.trim(),
        image: recipeImage,
        user_id: userId,
        category_id: selectedCategoryIds[0], // Send first category for initial creation
        // Note: You may need to update the recipe with additional categories after creation
        // or modify the backend to accept an array of category_ids
      };

      const createdRecipe = await createRecipe(recipeData);
      const recipeId = createdRecipe.id || (createdRecipe as any)._id;

      // Create recipe-ingredient relationships
      if (recipeId) {
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
      }

      Alert.alert("Success", "Recipe created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setRecipeTitle("");
            setRecipeImage(null);
            setSelectedCategoryIds([]);
            setRecipeDescription("");
            setSelectedIngredientIds([]);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      Alert.alert("Error", error?.message || "Failed to create recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateIngredient = async () => {
    if (!ingredientName.trim()) {
      Alert.alert("Error", "Please enter an ingredient name");
      return;
    }

    try {
      setIsSubmitting(true);
      await createIngredient({
        name: ingredientName.trim(),
        ingredientName: ingredientName.trim(),
      });
      // Refresh ingredients list
      await fetchIngredients();
      Alert.alert("Success", "Ingredient created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setIngredientName("");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating ingredient:", error);
      Alert.alert("Error", error?.message || "Failed to create ingredient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    try {
      setIsSubmitting(true);
      await createCategory({
        categoryName: categoryName.trim(),
        name: categoryName.trim(),
      });
      Alert.alert("Success", "Category created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setCategoryName("");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating category:", error);
      Alert.alert("Error", error?.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRecipeForm = () => (
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
            onPress={() => setRecipeImage(null)}
          >
            <ThemedText style={styles.removeImageText}>Remove Image</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Categories *</ThemedText>
        {isLoadingCategories ? (
          <ActivityIndicator size="small" color="#fff" style={styles.loader} />
        ) : (
          <View style={styles.pickerContainer}>
            {categories.map((category) => {
              const categoryId = (category as any)._id || category.id;
              const isSelected = selectedCategoryIds.includes(categoryId);
              return (
                <TouchableOpacity
                  key={categoryId}
                  style={[
                    styles.pickerOption,
                    styles.multiSelectOption,
                    isSelected && styles.pickerOptionActive,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedCategoryIds(
                        selectedCategoryIds.filter((id) => id !== categoryId)
                      );
                    } else {
                      setSelectedCategoryIds([
                        ...selectedCategoryIds,
                        categoryId,
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
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <ThemedText
                      style={[
                        styles.pickerOptionText,
                        isSelected && styles.pickerOptionTextActive,
                      ]}
                    >
                      {category.categoryName || category.name || ""}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Ingredients *</ThemedText>
        {isLoadingIngredients ? (
          <ActivityIndicator size="small" color="#fff" style={styles.loader} />
        ) : (
          <View style={styles.pickerContainer}>
            {Array.isArray(ingredients) && ingredients.length > 0 ? (
              ingredients.map((ingredient) => {
                const ingredientId = ingredient.id || (ingredient as any)._id;
                const isSelected = selectedIngredientIds.includes(ingredientId);
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
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                      <ThemedText
                        style={[
                          styles.pickerOptionText,
                          isSelected && styles.pickerOptionTextActive,
                        ]}
                      >
                        {ingredient.name || ingredient.ingredientName || ""}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>
                  No ingredients available. Create one in the Ingredient tab
                  first.
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Steps / Directions *</ThemedText>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter step-by-step instructions or directions..."
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
        onPress={handleCreateRecipe}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#1a4d2e" />
        ) : (
          <ThemedText style={styles.submitButtonText}>Create Recipe</ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderIngredientForm = () => (
    <ScrollView
      style={styles.formScrollView}
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Ingredient Name *</ThemedText>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter ingredient name"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={ingredientName}
            onChangeText={setIngredientName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleCreateIngredient}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#1a4d2e" />
        ) : (
          <ThemedText style={styles.submitButtonText}>
            Create Ingredient
          </ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCategoryForm = () => (
    <ScrollView
      style={styles.formScrollView}
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Category Name *</ThemedText>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter category name"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={categoryName}
            onChangeText={setCategoryName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleCreateCategory}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#1a4d2e" />
        ) : (
          <ThemedText style={styles.submitButtonText}>
            Create Category
          </ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.headerLeft} />
            <ThemedText style={styles.headerTitle}>Create New</ThemedText>
            <View style={styles.headerRight} />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "recipe" && styles.tabActive]}
              onPress={() => setActiveTab("recipe")}
            >
              <MaterialCommunityIcons
                name="chef-hat"
                size={20}
                color={
                  activeTab === "recipe" ? "#fff" : "rgba(255, 255, 255, 0.7)"
                }
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "recipe" && styles.tabTextActive,
                ]}
              >
                Recipe
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "ingredient" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("ingredient")}
            >
              <MaterialCommunityIcons
                name="carrot"
                size={20}
                color={
                  activeTab === "ingredient"
                    ? "#fff"
                    : "rgba(255, 255, 255, 0.7)"
                }
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "ingredient" && styles.tabTextActive,
                ]}
              >
                Ingredient
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "category" && styles.tabActive]}
              onPress={() => setActiveTab("category")}
            >
              <MaterialCommunityIcons
                name="tag"
                size={20}
                color={
                  activeTab === "category" ? "#fff" : "rgba(255, 255, 255, 0.7)"
                }
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "category" && styles.tabTextActive,
                ]}
              >
                Category
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          {activeTab === "recipe" && renderRecipeForm()}
          {activeTab === "ingredient" && renderIngredientForm()}
          {activeTab === "category" && renderCategoryForm()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
