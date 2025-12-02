import { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SearchSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";

// Mock search results
const mockRecipes = [
  { id: "1", name: "Homemade Pasta", category: "Italian", rating: 4.5 },
  { id: "2", name: "Chocolate Cake", category: "Dessert", rating: 4.8 },
  { id: "3", name: "Grilled Salmon", category: "Seafood", rating: 4.6 },
  { id: "4", name: "Vegetable Stir Fry", category: "Vegetarian", rating: 4.4 },
  { id: "5", name: "Beef Steak", category: "Meat", rating: 4.7 },
  { id: "6", name: "Caesar Salad", category: "Salad", rating: 4.3 },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockRecipes>([]);
  const isLoading = useNavigationLoading();

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");

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
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SearchSkeleton />
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
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Search
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search recipes, ingredients..."
              placeholderTextColor={iconColor}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <IconSymbol
                  name="xmark.circle.fill"
                  size={20}
                  color={iconColor}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {searchQuery.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="magnifyingglass.fill"
                size={60}
                color={iconColor}
              />
              <ThemedText type="subtitle" style={styles.emptyText}>
                Start searching
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Search for recipes, ingredients, or categories
              </ThemedText>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="magnifyingglass.fill"
                size={60}
                color={iconColor}
              />
              <ThemedText type="subtitle" style={styles.emptyText}>
                No results found
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Try a different search term
              </ThemedText>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              <ThemedText type="defaultSemiBold" style={styles.resultsHeader}>
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} found
              </ThemedText>
              {searchResults.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.resultItem}>
                  <View style={styles.resultContent}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.resultName}
                    >
                      {recipe.name}
                    </ThemedText>
                    <View style={styles.resultMeta}>
                      <ThemedText style={styles.resultCategory}>
                        {recipe.category}
                      </ThemedText>
                      <View style={styles.ratingContainer}>
                        <IconSymbol
                          name="star.fill"
                          size={14}
                          color="#83ab64"
                        />
                        <ThemedText
                          style={[styles.rating, { color: "#83ab64" }]}
                        >
                          {recipe.rating}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <IconSymbol
                    name="chevron.right"
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 28,
    color: "#080808",
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    color: "#080808",
  },
  emptySubtext: {
    opacity: 0.7,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 48,
    color: "#080808",
  },
  resultsContainer: {
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  resultsHeader: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
    color: "#080808",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  resultContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  resultName: {
    fontSize: 16,
    marginBottom: 4,
    color: "#080808",
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "transparent",
  },
  resultCategory: {
    fontSize: 14,
    opacity: 0.7,
    color: "#080808",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "transparent",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
  },
});
