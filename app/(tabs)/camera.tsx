import { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRecipes } from "@/contexts/RecipesContext";
import { getCategories, Category } from "@/services/categories";

const difficultyOptions = ["Easy", "Medium", "Hard"];

export default function CameraScreen() {
  const { addRecipe } = useRecipes();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<Category & { icon?: string }>>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const insets = useSafeAreaInsets();

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const apiCategories = await getCategories();
      // Map API categories and add icon field
      const mappedCategories = apiCategories.map((cat) => ({
        ...cat,
        id: cat.id || cat._id || String(Date.now() + Math.random()),
        name: cat.categoryName || cat.name || "",
        icon: "food", // Default icon
      }));
      setCategories(mappedCategories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Recipe form state - matching index.tsx
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [recipeTime, setRecipeTime] = useState("");
  const [recipeDifficulty, setRecipeDifficulty] = useState("Easy");
  const [recipeCalories, setRecipeCalories] = useState("");
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera and media library permissions to take and select photos."
        );
        return false;
      }
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCurrentImageUri(result.assets[0].uri);
        setShowForm(true);
        resetRecipeForm();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  };

  const pickFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setCurrentImageUri(result.assets[0].uri);
        setShowForm(true);
        resetRecipeForm();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const handleCreateRecipe = () => {
    // Validation
    if (!recipeName.trim()) {
      Alert.alert("Error", "Please enter a recipe name");
      return;
    }
    if (!recipeDescription.trim()) {
      Alert.alert("Error", "Please enter a recipe description");
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!recipeTime.trim()) {
      Alert.alert("Error", "Please enter preparation time");
      return;
    }
    if (!recipeCalories.trim() || isNaN(Number(recipeCalories))) {
      Alert.alert("Error", "Please enter a valid calorie count");
      return;
    }

    setIsSubmitting(true);

    // Create new recipe
    // Note: user_id will be added automatically by RecipesContext
    const newRecipe = {
      id: String(Date.now()),
      name: recipeName.trim(),
      date: new Date().toISOString().split("T")[0],
      image: currentImageUri,
      title: recipeName.trim(), // Backend requires 'title'
      description: recipeDescription.trim(),
      category_id: selectedCategoryId, // Backend requires 'category_id' (must be ObjectId, not name)
      // user_id will be added automatically by addRecipe function
    };

    // Add to My Recipes context
    addRecipe(newRecipe);

    // Reset form
    resetRecipeForm();
    setShowForm(false);
    setCurrentImageUri(null);
    setIsSubmitting(false);

    Alert.alert("Success", "Recipe created successfully!");
  };

  const resetRecipeForm = () => {
    setRecipeName("");
    setRecipeDescription("");
    setSelectedCategoryId("");
    setRecipeTime("");
    setRecipeDifficulty("Easy");
    setRecipeCalories("");
    setShowDifficultyPicker(false);
    setShowCategoryPicker(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setCurrentImageUri(null);
    resetRecipeForm();
  };

  const showImageOptions = () => {
    Alert.alert(
      "Add Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePicture },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  return (
    <View style={styles.container}>
      {/* Creative Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Create Recipe</ThemedText>
        </View>

        {/* Camera Button */}
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={showImageOptions}
          >
            <Ionicons name="camera" size={40} color="#fff" />
            <ThemedText style={styles.cameraButtonText}>
              {selectedImages.length === 0
                ? "Take or Select Photo"
                : "Add More Photos"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Selected Images Grid */}
        {selectedImages.length > 0 && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.imagesHeader}>
              Your Photos ({selectedImages.length})
            </ThemedText>
            <View style={styles.imagesGrid}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri }}
                    style={styles.image}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Empty State */}
        {selectedImages.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="camera-outline"
              size={80}
              color="rgba(255, 255, 255, 0.6)"
            />
            <ThemedText style={styles.emptyText}>No photos yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tap the button above to take or select photos of your dishes
            </ThemedText>
          </View>
        )}
      </View>

      {/* Recipe Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={closeForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Create New Recipe
              </ThemedText>
              <TouchableOpacity
                onPress={closeForm}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Preview */}
              {currentImageUri && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: currentImageUri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                </View>
              )}

              {/* Recipe Name */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Recipe Name</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipe name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={recipeName}
                    onChangeText={setRecipeName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Recipe Description */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Description</ThemedText>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter recipe description"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={recipeDescription}
                    onChangeText={setRecipeDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Category Selection */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Category</ThemedText>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <ThemedText
                    style={[
                      styles.input,
                      !selectedCategoryId && styles.placeholderText,
                    ]}
                  >
                    {selectedCategoryId 
                      ? categories.find(c => c.id === selectedCategoryId)?.name || "Selected"
                      : "Select a category"}
                  </ThemedText>
                  <Ionicons
                    name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                </TouchableOpacity>
                {showCategoryPicker && (
                  <View style={styles.pickerContainer}>
                    {isLoadingCategories ? (
                      <ThemedText style={styles.pickerOptionText}>
                        Loading categories...
                      </ThemedText>
                    ) : categories.length === 0 ? (
                      <ThemedText style={styles.pickerOptionText}>
                        No categories available
                      </ThemedText>
                    ) : (
                      categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.pickerOption,
                            selectedCategoryId === category.id &&
                              styles.pickerOptionActive,
                          ]}
                          onPress={() => {
                            setSelectedCategoryId(category.id);
                            setShowCategoryPicker(false);
                          }}
                        >
                          <MaterialCommunityIcons
                            name={(category.icon || "food") as any}
                            size={18}
                            color={
                              selectedCategoryId === category.id
                                ? "#1a4d2e"
                                : "#fff"
                            }
                          />
                          <ThemedText
                            style={[
                              styles.pickerOptionText,
                              selectedCategoryId === category.id &&
                                styles.pickerOptionTextActive,
                            ]}
                          >
                            {category.name || category.categoryName}
                          </ThemedText>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>

              {/* Time and Difficulty Row */}
              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText style={styles.inputLabel}>Time</ThemedText>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 30 min"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={recipeTime}
                      onChangeText={setRecipeTime}
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText style={styles.inputLabel}>Difficulty</ThemedText>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() =>
                      setShowDifficultyPicker(!showDifficultyPicker)
                    }
                  >
                    <ThemedText
                      style={[
                        styles.input,
                        !recipeDifficulty && styles.placeholderText,
                      ]}
                    >
                      {recipeDifficulty}
                    </ThemedText>
                    <Ionicons
                      name={
                        showDifficultyPicker ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                  {showDifficultyPicker && (
                    <View style={styles.pickerContainer}>
                      {difficultyOptions.map((difficulty) => (
                        <TouchableOpacity
                          key={difficulty}
                          style={[
                            styles.pickerOption,
                            recipeDifficulty === difficulty &&
                              styles.pickerOptionActive,
                          ]}
                          onPress={() => {
                            setRecipeDifficulty(difficulty);
                            setShowDifficultyPicker(false);
                          }}
                        >
                          <ThemedText
                            style={[
                              styles.pickerOptionText,
                              recipeDifficulty === difficulty &&
                                styles.pickerOptionTextActive,
                            ]}
                          >
                            {difficulty}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Calories */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Calories</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter calorie count"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={recipeCalories}
                    onChangeText={setRecipeCalories}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateRecipe}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.createButtonText}>
                  {isSubmitting ? "Creating..." : "Create Recipe"}
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    opacity: 0.95,
  },
  cameraButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 18,
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imagesHeader: {
    fontSize: 18,
    marginBottom: 16,
    paddingHorizontal: 24,
    color: "#fff",
    fontWeight: "600",
    opacity: 0.95,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 8,
  },
  imageWrapper: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 48,
  },
  emptyText: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a4d2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "90%",
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  imagePreviewContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  imagePreview: {
    width: "100%",
    height: 200,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 18,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "transparent",
  },
  textAreaWrapper: {
    minHeight: 100,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  pickerOptionActive: {
    backgroundColor: "#fff",
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  pickerOptionTextActive: {
    color: "#1a4d2e",
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonText: {
    color: "#1a4d2e",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
