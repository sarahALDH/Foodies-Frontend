import { SearchSkeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Mock recipes for grid view
const mockExploreRecipes = [
  { id: "1", name: "Homemade Pasta", category: "Italian", image: null },
  { id: "2", name: "Chocolate Cake", category: "Dessert", image: null },
  { id: "3", name: "Grilled Salmon", category: "Seafood", image: null },
  { id: "4", name: "Vegetable Stir Fry", category: "Vegetarian", image: null },
  { id: "5", name: "Beef Steak", category: "Meat", image: null },
  { id: "6", name: "Caesar Salad", category: "Salad", image: null },
  { id: "7", name: "Margherita Pizza", category: "Italian", image: null },
  { id: "8", name: "Chicken Curry", category: "Asian", image: null },
  { id: "9", name: "Apple Pie", category: "Dessert", image: null },
];

// Mock search results
const mockRecipes = [
  { id: "1", name: "Homemade Pasta", category: "Italian", rating: 4.5 },
  { id: "2", name: "Chocolate Cake", category: "Dessert", rating: 4.8 },
  { id: "3", name: "Grilled Salmon", category: "Seafood", rating: 4.6 },
  { id: "4", name: "Vegetable Stir Fry", category: "Vegetarian", rating: 4.4 },
  { id: "5", name: "Beef Steak", category: "Meat", rating: 4.7 },
  { id: "6", name: "Caesar Salad", category: "Salad", rating: 4.3 },
];

type CategoryType = "All" | "Recipes" | "Ingredients" | "Categories";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockRecipes>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
  const isLoading = useNavigationLoading();
  const insets = useSafeAreaInsets();

  const categories: CategoryType[] = [
    "All",
    "Recipes",
    "Ingredients",
    "Categories",
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = mockRecipes.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SearchSkeleton />
      </View>
    );
  }

  const isSearching = searchQuery.length > 0;

  return (
    <View style={styles.container}>
      {/* Creative Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.content, { paddingTop: insets.top + 10 }]}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search-outline"
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isSearching ? (
            /* Search Results */
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {searchResults.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="search-outline"
                    size={60}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                  <ThemedText style={styles.emptyText}>
                    No results found
                  </ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    Try a different search term
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.resultsContainer}>
                  <ThemedText style={styles.resultsHeader}>
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""} found
                  </ThemedText>
                  {searchResults.map((recipe) => (
                    <TouchableOpacity key={recipe.id} style={styles.resultItem}>
                      <View style={styles.resultContent}>
                        <ThemedText style={styles.resultName}>
                          {recipe.name}
                        </ThemedText>
                        <View style={styles.resultMeta}>
                          <ThemedText style={styles.resultCategory}>
                            {recipe.category}
                          </ThemedText>
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#ffa500" />
                            <ThemedText style={styles.rating}>
                              {recipe.rating}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            /* Explore Grid View */
            <View style={styles.exploreContainer}>
              {/* Category Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContainer}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setActiveCategory(category)}
                    style={[
                      styles.categoryTab,
                      activeCategory === category && styles.activeCategoryTab,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryText,
                        activeCategory === category &&
                          styles.activeCategoryText,
                      ]}
                    >
                      {category}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Recipe Grid */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.recipeGrid}>
                  {mockExploreRecipes.map((recipe) => (
                    <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                      <View style={styles.recipeImageContainer}>
                        {recipe.image ? (
                          <View style={styles.recipeImagePlaceholder} />
                        ) : (
                          <Ionicons
                            name="restaurant-outline"
                            size={30}
                            color="rgba(255, 255, 255, 0.7)"
                          />
                        )}
                      </View>
                      <ThemedText
                        style={styles.recipeCardName}
                        numberOfLines={1}
                      >
                        {recipe.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
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
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    backgroundColor: "transparent",
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 48,
    color: "rgba(255, 255, 255, 0.8)",
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  resultsHeader: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.9,
    color: "#fff",
    paddingHorizontal: 8,
    fontWeight: "600",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    marginBottom: 4,
    color: "#fff",
    fontWeight: "600",
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultCategory: {
    fontSize: 14,
    opacity: 0.8,
    color: "rgba(255, 255, 255, 0.9)",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  exploreContainer: {
    flex: 1,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginRight: 8,
    minHeight: 40,
    justifyContent: "center",
  },
  activeCategoryTab: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  categoryText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    opacity: 0.9,
  },
  activeCategoryText: {
    color: "#fff",
    fontWeight: "600",
    opacity: 1,
  },
  gridContent: {
    paddingBottom: 24,
  },
  recipeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 2,
  },
  recipeCard: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 1,
  },
  recipeImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  recipeImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  recipeCardName: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    fontSize: 10,
    color: "#fff",
    backgroundColor: "rgba(26, 77, 46, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: "center",
    fontWeight: "600",
  },
});
