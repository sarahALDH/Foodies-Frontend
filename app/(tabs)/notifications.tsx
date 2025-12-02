import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PageSkeleton } from "@/components/skeleton";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "recipe",
    title: "New Recipe Available",
    message: "Check out the new Homemade Pasta recipe!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "like",
    title: "Someone liked your recipe",
    message: "Your Chocolate Cake recipe received a like",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "comment",
    title: "New comment on your recipe",
    message: "Great recipe! Thanks for sharing.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "recipe",
    title: "Recipe suggestion",
    message: "You might like this Grilled Salmon recipe",
    time: "2 days ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const iconColor = useThemeColor({}, "icon");
  const isLoading = useNavigationLoading();

  if (isLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <PageSkeleton />
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
            Notifications
          </ThemedText>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mockNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="bell.fill" size={60} color={iconColor} />
              <ThemedText type="subtitle" style={styles.emptyText}>
                No notifications
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                You're all caught up!
              </ThemedText>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {mockNotifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    index === mockNotifications.length - 1 && styles.lastItem,
                    !notification.read && styles.unreadItem,
                  ]}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={[
                          styles.notificationTitle,
                          !notification.read && styles.unreadTitle,
                        ]}
                      >
                        {notification.title}
                      </ThemedText>
                      {!notification.read && (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: "#83ab64" },
                          ]}
                        />
                      )}
                    </View>
                    <ThemedText style={styles.notificationMessage}>
                      {notification.message}
                    </ThemedText>
                    <ThemedText style={styles.notificationTime}>
                      {notification.time}
                    </ThemedText>
                  </View>
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
    color: "#080808",
  },
  notificationsList: {
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  notificationItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  unreadItem: {
    backgroundColor: "rgba(131, 171, 100, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  notificationContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
    color: "#080808",
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
    color: "#080808",
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
    color: "#080808",
  },
});
