import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useThemeColor } from "@/hooks/use-theme-color";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: backgroundColor === "#fff" 
            ? "rgba(0, 0, 0, 0.15)" 
            : "rgba(255, 255, 255, 0.15)",
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonText({
  width,
  height = 16,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: any;
}) {
  return <Skeleton width={width} height={height} borderRadius={4} style={style} />;
}

export function SkeletonCard({
  width = "100%",
  height = 200,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: any;
}) {
  return <Skeleton width={width} height={height} borderRadius={12} style={style} />;
}

export function SkeletonAvatar({
  size = 100,
  style,
}: {
  size?: number;
  style?: any;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

// Page-specific skeleton layouts
export function PageSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonText width="60%" height={28} style={styles.title} />
      <SkeletonText width="40%" height={16} style={styles.subtitle} />
      <View style={styles.content}>
        <SkeletonCard height={150} style={styles.card} />
        <SkeletonCard height={150} style={styles.card} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <SkeletonAvatar size={100} />
        <SkeletonText width="50%" height={32} style={styles.profileName} />
        <SkeletonText width="70%" height={16} style={styles.profileEmail} />
        <SkeletonText width="90%" height={60} style={styles.bio} />
      </View>
      <View style={styles.section}>
        <SkeletonText width="40%" height={20} style={styles.sectionTitle} />
        <View style={styles.grid}>
          <SkeletonCard width="48%" height={180} />
          <SkeletonCard width="48%" height={180} />
        </View>
      </View>
    </View>
  );
}

export function SearchSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonText width="30%" height={28} style={styles.title} />
      <Skeleton height={50} borderRadius={12} style={styles.searchBar} />
      <View style={styles.results}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.resultItem}>
            <SkeletonText width="60%" height={18} />
            <SkeletonText width="30%" height={14} style={styles.meta} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 24,
  },
  content: {
    gap: 16,
  },
  card: {
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileName: {
    marginTop: 16,
    marginBottom: 8,
  },
  profileEmail: {
    marginBottom: 24,
  },
  bio: {
    marginTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  searchBar: {
    marginBottom: 24,
  },
  results: {
    gap: 16,
  },
  resultItem: {
    paddingVertical: 12,
    gap: 8,
  },
  meta: {
    marginTop: 4,
  },
});

