import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { router, useNavigation } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { PageSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { getCategories, createCategory, Category } from "@/services/categories";
import { getRecipes, Recipe } from "@/services/recipes";
import { ActivityIndicator } from "react-native";

// Default "All" category (not stored in backend)
const ALL_CATEGORY = { id: "all", name: "All", icon: "food" };

// Available icons for category selection
const availableIcons = [
  "food",
  "coffee",
  "bowl-mix",
  "silverware-fork-knife",
  "cupcake",
  "cookie",
  "leaf",
  "sprout",
  "pizza",
  "hamburger",
  "noodles",
  "ice-cream",
  "bread-slice",
  "fish",
  "fruit-grapes",
  "carrot",
];


export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Array<Category & { icon?: string }>>([ALL_CATEGORY]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAllRecipesModal, setShowAllRecipesModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("food");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const navigation = useNavigation();
  const isLoading = useNavigationLoading();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  // Hide navigation bar
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch recipes on mount and when category changes
  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const apiCategories = await getCategories();
      // Map API categories and add icon field (using first letter or default)
      const mappedCategories = apiCategories.map((cat) => ({
        ...cat,
        name: cat.categoryName || cat.name || "",
        icon: "food", // Default icon, can be enhanced later
      }));
      setCategories([ALL_CATEGORY, ...mappedCategories]);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setIsLoadingRecipes(true);
      const params: any = {};
      
      // If a specific category is selected (not "all"), filter by category_id
      if (selectedCategory !== "all") {
        const selectedCat = categories.find((cat) => cat.id === selectedCategory);
        if (selectedCat?.id && selectedCat.id !== "all") {
          params.category_id = selectedCat.id;
        }
      }
      
      const apiRecipes = await getRecipes(params);
      // Map API recipes to match our format
      const mappedRecipes = apiRecipes.map((recipe) => ({
        ...recipe,
        name: recipe.title || recipe.name,
        category: recipe.category_id || "",
        dateAdded: recipe.date || recipe.createdAt || new Date().toISOString(),
      }));
      setRecipes(mappedRecipes);
    } catch (error: any) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error", "Failed to load recipes");
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    // Check if category name already exists
    if (
      categories.some(
        (cat) => cat.name?.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      Alert.alert("Error", "A category with this name already exists");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const newCategory = await createCategory({
        categoryName: newCategoryName.trim(),
        name: newCategoryName.trim(),
      });
      
      // Add to local state with icon
      const categoryWithIcon = {
        ...newCategory,
        name: newCategory.categoryName || newCategory.name || "",
        icon: selectedIcon,
      };
      
      setCategories([ALL_CATEGORY, ...categories.slice(1), categoryWithIcon]);
      setNewCategoryName("");
      setSelectedIcon("food");
      setShowCategoryModal(false);
      Alert.alert("Success", "Category created successfully!");
    } catch (error: any) {
      console.error("Error creating category:", error);
      Alert.alert("Error", error?.message || "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const filteredRecipes =
    selectedCategory === "all"
      ? recipes
      : recipes.filter(
          (recipe) => recipe.category_id === selectedCategory
        );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageSkeleton />
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

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft} />
        <View style={styles.headerCenter}>
          <Image
            source={require("@/assets/images/logo2.png")}
            style={styles.headerLogo}
            contentFit="contain"
          />
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories Scroll View */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {isLoadingCategories ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialCommunityIcons
                    name={(category.icon || "food") as any}
                    size={20}
                    color={selectedCategory === category.id ? "#fff" : "#fff"}
                  />
                  <ThemedText
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.name || category.categoryName || ""}
                  </ThemedText>
                </TouchableOpacity>
              ))
            )}
            {/* Add Category Button */}
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recipes List */}
        <View style={styles.recipesSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Latest Recipes</ThemedText>
            <TouchableOpacity
              onPress={() => setShowAllRecipesModal(true)}
              style={styles.viewAllButton}
            >
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          {isLoadingRecipes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No recipes found</ThemedText>
            </View>
          ) : (
            filteredRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              activeOpacity={0.8}
            >
              <View style={styles.recipeImageContainer}>
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
                      size={40}
                      color="#fff"
                    />
                  </View>
                )}
              </View>
              <View style={styles.recipeContent}>
                <ThemedText style={styles.recipeName} numberOfLines={1}>
                  {recipe.name}
                </ThemedText>
                <ThemedText style={styles.recipeDescription} numberOfLines={2}>
                  {recipe.description}
                </ThemedText>
                <View style={styles.recipeMeta}>
                  <View style={styles.recipeMetaItem}>
                    <Ionicons name="time-outline" size={14} color="#fff" />
                    <ThemedText style={styles.recipeMetaText}>
                      {recipe.time}
                    </ThemedText>
                  </View>
                  <View style={styles.recipeMetaItem}>
                    <MaterialCommunityIcons
                      name="chef-hat"
                      size={14}
                      color="#fff"
                    />
                    <ThemedText style={styles.recipeMetaText}>
                      {recipe.difficulty}
                    </ThemedText>
                  </View>
                  <View style={styles.recipeMetaItem}>
                    <Ionicons name="flame-outline" size={14} color="#fff" />
                    <ThemedText style={styles.recipeMetaText}>
                      {recipe.calories} kcal
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.recipeRating}>
                  <Ionicons name="star" size={16} color="#ffa500" />
                  <ThemedText style={styles.recipeRatingText}>
                    {recipe.rating}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Create New Category
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setSelectedIcon("food");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Category Name Input */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Category Name</ThemedText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter category name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Icon Selection */}
              <View style={styles.iconSelectionContainer}>
                <ThemedText style={styles.inputLabel}>Select Icon</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.iconScrollContainer}
                >
                  {availableIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        selectedIcon === icon && styles.iconOptionActive,
                      ]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={24}
                        color={selectedIcon === icon ? "#1a4d2e" : "#fff"}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[styles.createButton, isCreatingCategory && styles.createButtonDisabled]}
                onPress={handleCreateCategory}
                activeOpacity={0.85}
                disabled={isCreatingCategory}
              >
                {isCreatingCategory ? (
                  <ActivityIndicator size="small" color="#1a4d2e" />
                ) : (
                  <ThemedText style={styles.createButtonText}>
                    Create Category
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* View All Recipes Modal */}
      <Modal
        visible={showAllRecipesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllRecipesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.allRecipesModalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>All Recipes</ThemedText>
              <TouchableOpacity
                onPress={() => setShowAllRecipesModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.allRecipesScrollView}
              contentContainerStyle={styles.allRecipesScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {recipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.allRecipesCard}
                  activeOpacity={0.8}
                >
                  <View style={styles.allRecipesImageContainer}>
                    {recipe.image ? (
                      <Image
                        source={{ uri: recipe.image }}
                        style={styles.allRecipesImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.allRecipesImagePlaceholder}>
                        <MaterialCommunityIcons
                          name="food"
                          size={40}
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.allRecipesContent}>
                    <ThemedText style={styles.allRecipesName} numberOfLines={1}>
                      {recipe.name}
                    </ThemedText>
                    <ThemedText
                      style={styles.allRecipesDescription}
                      numberOfLines={2}
                    >
                      {recipe.description}
                    </ThemedText>
                    <View style={styles.allRecipesMeta}>
                      <View style={styles.allRecipesMetaItem}>
                        <Ionicons name="time-outline" size={14} color="#fff" />
                        <ThemedText style={styles.allRecipesMetaText}>
                          {recipe.time}
                        </ThemedText>
                      </View>
                      <View style={styles.allRecipesMetaItem}>
                        <MaterialCommunityIcons
                          name="chef-hat"
                          size={14}
                          color="#fff"
                        />
                        <ThemedText style={styles.allRecipesMetaText}>
                          {recipe.difficulty}
                        </ThemedText>
                      </View>
                      <View style={styles.allRecipesMetaItem}>
                        <Ionicons name="flame-outline" size={14} color="#fff" />
                        <ThemedText style={styles.allRecipesMetaText}>
                          {recipe.calories} kcal
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.allRecipesFooter}>
                      <View style={styles.allRecipesRating}>
                        <Ionicons name="star" size={16} color="#ffa500" />
                        <ThemedText style={styles.allRecipesRatingText}>
                          {recipe.rating}
                        </ThemedText>
                      </View>
                      <View style={styles.allRecipesCategory}>
                        <MaterialCommunityIcons
                          name={
                            categories.find(
                              (cat) => cat.name === recipe.category
                            )?.icon as any
                          }
                          size={14}
                          color="#fff"
                        />
                        <ThemedText style={styles.allRecipesCategoryText}>
                          {recipe.category}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "rgba(26, 77, 46, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 10,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 180,
    height: 75,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoriesSection: {
    paddingVertical: 20,
    backgroundColor: "transparent",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 6,
    minWidth: 100,
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  categoryTextActive: {
    color: "#fff",
    opacity: 1,
  },
  addCategoryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  recipesSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
    maxHeight: "80%",
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
  },
  input: {
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "transparent",
    flex: 1,
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
  iconSelectionContainer: {
    marginBottom: 32,
  },
  iconScrollContainer: {
    paddingVertical: 12,
    gap: 12,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconOptionActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  createButton: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
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
  allRecipesModalContent: {
    backgroundColor: "#1a4d2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "90%",
    height: "90%",
  },
  allRecipesScrollView: {
    flex: 1,
  },
  allRecipesScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  allRecipesCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  allRecipesImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  allRecipesImage: {
    width: "100%",
    height: "100%",
  },
  allRecipesImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  allRecipesContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  allRecipesName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    opacity: 0.95,
  },
  allRecipesDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    lineHeight: 16,
  },
  allRecipesMeta: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  allRecipesMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  allRecipesMetaText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  allRecipesFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allRecipesRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  allRecipesRatingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  allRecipesCategory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  allRecipesCategoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    opacity: 0.95,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  recipeImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  recipeContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    opacity: 0.95,
  },
  recipeDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    lineHeight: 18,
  },
  recipeMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  recipeMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  recipeRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
});
