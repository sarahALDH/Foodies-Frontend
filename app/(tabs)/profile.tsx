import { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  TextInput,
  Modal,
  ImageBackground,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Collapsible } from "@/components/ui/collapsible";
import { ProfileSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { useRecipes } from "@/contexts/RecipesContext";

// Mock data for recipes
const mockRecipes = [
  { id: "1", name: "Homemade Pasta", date: "2024-01-20", image: null },
  { id: "2", name: "Chocolate Cake", date: "2024-01-18", image: null },
  { id: "3", name: "Grilled Salmon", date: "2024-01-15", image: null },
  { id: "4", name: "Vegetable Stir Fry", date: "2024-01-12", image: null },
];

// Mock data for saved recipes
const mockSavedRecipes = [
  { id: "1", name: "Italian Risotto", date: "2024-01-22", image: null },
  { id: "2", name: "Beef Steak", date: "2024-01-21", image: null },
  { id: "3", name: "Caesar Salad", date: "2024-01-19", image: null },
];

export default function ProfileScreen() {
  const { myRecipes } = useRecipes();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState("John Doe");
  const [isEditingName, setIsEditingName] = useState(false);
  const [bio, setBio] = useState(
    "Food enthusiast and home chef. Love experimenting with new recipes!"
  );
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [gender, setGender] = useState("Prefer not to say");
  const [selectedRecipe, setSelectedRecipe] = useState<
    (typeof myRecipes)[0] | null
  >(null);
  const isLoading = useNavigationLoading();
  const insets = useSafeAreaInsets();

  const requestPermissions = async () => {
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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Select Profile Picture",
      "Choose an option",
      [
        { text: "Camera", onPress: () => pickImage("camera") },
        { text: "Photo Library", onPress: () => pickImage("library") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleEditUsername = () => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Edit Username",
        "Enter your new username",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Save",
            onPress: (text: string | undefined) => {
              if (text && text.trim()) {
                setUserName(text.trim());
              }
            },
          },
        ],
        "plain-text",
        userName
      );
    } else {
      // For Android, use a simple alert with input simulation
      setIsEditingName(true);
    }
  };

  const saveUsername = (newName: string) => {
    if (newName && newName.trim()) {
      setUserName(newName.trim());
    }
    setIsEditingName(false);
  };

  const handleEditBio = () => {
    setIsEditingBio(true);
  };

  const saveBio = (newBio: string) => {
    setBio(newBio.trim() || "");
    setIsEditingBio(false);
  };

  const handleEditGender = () => {
    Alert.alert(
      "Select Gender",
      "Choose your gender",
      [
        { text: "Male", onPress: () => setGender("Male") },
        { text: "Female", onPress: () => setGender("Female") },
        {
          text: "Prefer not to say",
          onPress: () => setGender("Prefer not to say"),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ProfileSkeleton />
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={showImagePickerOptions}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={60}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                )}
              </View>
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.userNameContainer}>
            {isEditingName ? (
              <TextInput
                style={styles.userNameInput}
                value={userName}
                onChangeText={setUserName}
                onSubmitEditing={() => saveUsername(userName)}
                onBlur={() => saveUsername(userName)}
                autoFocus
                placeholder="Enter username"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            ) : (
              <ThemedText style={styles.userName}>{userName}</ThemedText>
            )}
            {!isEditingName && (
              <TouchableOpacity
                onPress={handleEditUsername}
                style={styles.editNameButton}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <ThemedText style={styles.userEmail}>john.doe@example.com</ThemedText>

          {/* Bio Section */}
          <View style={styles.bioContainer}>
            <ThemedText type="defaultSemiBold" style={styles.bioLabel}>
              Bio
            </ThemedText>
            {isEditingBio ? (
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                onSubmitEditing={() => saveBio(bio)}
                onBlur={() => saveBio(bio)}
                autoFocus
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            ) : (
              <TouchableOpacity onPress={handleEditBio}>
                <ThemedText style={styles.bioText}>
                  {bio || "No bio yet. Tap to add one."}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Gender Section */}
          <View style={styles.genderContainer}>
            <ThemedText type="defaultSemiBold" style={styles.genderLabel}>
              Gender
            </ThemedText>
            <TouchableOpacity onPress={handleEditGender}>
              <ThemedText style={styles.genderText}>{gender}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Recipes Section */}
        <View style={styles.section}>
          <Collapsible title="My Recipes">
            <View style={styles.recipesGrid}>
              {myRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => setSelectedRecipe(recipe)}
                >
                  <View style={styles.recipeImageContainer}>
                    {recipe.image ? (
                      <Image
                        source={{ uri: recipe.image }}
                        style={styles.recipeImage}
                        contentFit="cover"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="food"
                        size={40}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    )}
                  </View>
                  <ThemedText style={styles.recipeName} numberOfLines={2}>
                    {recipe.name}
                  </ThemedText>
                  <ThemedText style={styles.recipeDate}>
                    {recipe.date}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
        </View>

        {/* Saved Recipes Section */}
        <View style={styles.section}>
          <Collapsible title="Saved Recipes">
            <View style={styles.recipesGrid}>
              {mockSavedRecipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                  <View style={styles.recipeImageContainer}>
                    {recipe.image ? (
                      <Image
                        source={{ uri: recipe.image }}
                        style={styles.recipeImage}
                        contentFit="cover"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="food"
                        size={40}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    )}
                  </View>
                  <ThemedText style={styles.recipeName} numberOfLines={2}>
                    {recipe.name}
                  </ThemedText>
                  <ThemedText style={styles.recipeDate}>
                    {recipe.date}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
        </View>

        {/* Recipe History Section */}
        <View style={styles.section}>
          <Collapsible title="Recipe History">
            <View style={styles.recipesGrid}>
              {mockRecipes.map((recipe) => (
                <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                  <View style={styles.recipeImageContainer}>
                    {recipe.image ? (
                      <Image
                        source={{ uri: recipe.image }}
                        style={styles.recipeImage}
                        contentFit="cover"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="food"
                        size={40}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    )}
                  </View>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.recipeName}
                    numberOfLines={2}
                  >
                    {recipe.name}
                  </ThemedText>
                  <ThemedText style={styles.recipeDate}>
                    {recipe.date}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>
        </View>
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent} edges={["top"]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Recipe Details
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setSelectedRecipe(null)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {selectedRecipe && (
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Recipe Image */}
                  {selectedRecipe.image ? (
                    <View style={styles.modalImageContainer}>
                      <Image
                        source={{ uri: selectedRecipe.image }}
                        style={styles.modalImage}
                        contentFit="cover"
                      />
                    </View>
                  ) : (
                    <View style={styles.modalImagePlaceholder}>
                      <MaterialCommunityIcons
                        name="food"
                        size={60}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    </View>
                  )}

                  {/* Recipe Title */}
                  <View style={styles.modalInfoContainer}>
                    <ThemedText style={styles.modalRecipeTitle}>
                      {selectedRecipe.name || selectedRecipe.title}
                    </ThemedText>

                    {/* Recipe Date */}
                    <ThemedText style={styles.modalDate}>
                      Posted on {selectedRecipe.date}
                    </ThemedText>

                    {/* Recipe Description */}
                    {selectedRecipe.description ? (
                      <View style={styles.modalDescriptionContainer}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={styles.modalDescriptionLabel}
                        >
                          Description
                        </ThemedText>
                        <ThemedText style={styles.modalDescription}>
                          {selectedRecipe.description}
                        </ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={styles.modalNoDescription}>
                        No description available for this recipe.
                      </ThemedText>
                    )}
                  </View>
                </ScrollView>
              )}
            </SafeAreaView>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#fff",
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  userName: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    opacity: 0.95,
  },
  userNameInput: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 200,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    color: "#fff",
  },
  editNameButton: {
    padding: 4,
  },
  userEmail: {
    opacity: 0.7,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "rgba(255, 255, 255, 0.8)",
  },
  bioContainer: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  bioLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    color: "rgba(255, 255, 255, 0.9)",
  },
  bioInput: {
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    color: "#fff",
  },
  genderContainer: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  genderText: {
    fontSize: 14,
    opacity: 0.8,
    color: "rgba(255, 255, 255, 0.9)",
  },
  editButton: {
    padding: 4,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  recipesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recipeCard: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  recipeImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  recipeName: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.95,
  },
  recipeDate: {
    fontSize: 12,
    opacity: 0.7,
    color: "rgba(255, 255, 255, 0.8)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1a4d2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    height: "90%",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 24,
  },
  modalImageContainer: {
    width: "100%",
    height: 300,
    marginBottom: 16,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalImagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalInfoContainer: {
    paddingHorizontal: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  modalRecipeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    opacity: 0.95,
  },
  modalDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    color: "rgba(255, 255, 255, 0.8)",
  },
  modalDescriptionContainer: {
    marginTop: 8,
  },
  modalDescriptionLabel: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.95,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    color: "rgba(255, 255, 255, 0.9)",
  },
  modalNoDescription: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: "italic",
    marginTop: 8,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
