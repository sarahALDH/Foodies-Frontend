import { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  TextInput,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Collapsible } from "@/components/ui/collapsible";
import { ProfileSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState("John Doe");
  const [isEditingName, setIsEditingName] = useState(false);
  const [bio, setBio] = useState(
    "Food enthusiast and home chef. Love experimenting with new recipes!"
  );
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [gender, setGender] = useState("Prefer not to say");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "icon");
  const isLoading = useNavigationLoading();

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
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <ProfileSkeleton />
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
                  <IconSymbol name="person.fill" size={60} color="#83ab64" />
                )}
              </View>
              <View
                style={[
                  styles.editIconContainer,
                  { backgroundColor: "#83ab64", borderColor: "#fff" },
                ]}
              >
                <IconSymbol name="camera.fill" size={16} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.userNameContainer}>
            {isEditingName ? (
              <TextInput
                style={[
                  styles.userNameInput,
                  { color: textColor, borderColor: borderColor },
                ]}
                value={userName}
                onChangeText={setUserName}
                onSubmitEditing={() => saveUsername(userName)}
                onBlur={() => saveUsername(userName)}
                autoFocus
                placeholder="Enter username"
                placeholderTextColor={iconColor}
              />
            ) : (
              <ThemedText type="title" style={styles.userName}>
                {userName}
              </ThemedText>
            )}
            {!isEditingName && (
              <TouchableOpacity
                onPress={handleEditUsername}
                style={styles.editNameButton}
              >
                <IconSymbol
                  name={"pencil.fill" as any}
                  size={20}
                  color="#fff"
                />
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
                style={[
                  styles.bioInput,
                  { color: textColor, borderColor: borderColor },
                ]}
                value={bio}
                onChangeText={setBio}
                onSubmitEditing={() => saveBio(bio)}
                onBlur={() => saveBio(bio)}
                autoFocus
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself..."
                placeholderTextColor={iconColor}
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
                      />
                    ) : (
                      <IconSymbol
                        name="book.fill"
                        size={40}
                        color={iconColor}
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
                      />
                    ) : (
                      <IconSymbol
                        name="book.fill"
                        size={40}
                        color={iconColor}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(131, 171, 100, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
    color: "#080808",
  },
  userNameInput: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 200,
  },
  editNameButton: {
    padding: 4,
  },
  userEmail: {
    opacity: 0.7,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#080808",
  },
  bioContainer: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  bioLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#080808",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    color: "#080808",
  },
  bioInput: {
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 80,
    textAlignVertical: "top",
  },
  genderContainer: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#080808",
  },
  genderText: {
    fontSize: 14,
    opacity: 0.8,
    color: "#080808",
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
    backgroundColor: "transparent",
  },
  sectionTitle: {
    marginBottom: 16,
  },
  recipesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  recipeCard: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 16,
  },
  recipeImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  recipeName: {
    marginBottom: 4,
    fontSize: 14,
    color: "#080808",
  },
  recipeDate: {
    fontSize: 12,
    opacity: 0.7,
    color: "#080808",
  },
});
