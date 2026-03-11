import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getFollowingFeed } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { VendorList } from "../types/list";

type Props = NativeStackScreenProps<RootStackParamList, "FollowingFeed">;

export function FollowingFeedScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["followingFeed"],
    queryFn: () => getFollowingFeed(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>Sign in to see lists from people you follow.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("PhoneAuth")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return <Text style={styles.stateText}>Loading your feed...</Text>;
  }

  if (isError) {
    return <Text style={styles.stateText}>Could not load your feed.</Text>;
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>Following feed</Text>
          <Text style={styles.headerTitle}>Fresh lists from people you follow</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          list={item}
          onListPress={() => navigation.navigate("ListDetail", { listId: item.id })}
          onCreatorPress={() => navigation.navigate("CreatorProfile", { userId: item.user.id })}
        />
      )}
      ListEmptyComponent={
        <Text style={styles.stateText}>No feed items yet. Follow list creators first.</Text>
      }
    />
  );
}

function ListRow({
  list,
  onListPress,
  onCreatorPress,
}: {
  list: VendorList;
  onListPress: () => void;
  onCreatorPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onListPress}>
        <Text style={styles.title}>{list.title}</Text>
        {list.description ? <Text style={styles.description}>{list.description}</Text> : null}
      </Pressable>
      <Pressable onPress={onCreatorPress}>
        <Text style={styles.creator}>by {list.user.displayName}</Text>
      </Pressable>
      <Text style={styles.meta}>
        {list.likeCount} likes · {list.viewCount} views · {list.itemCount} vendors
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.secondary,
  },
  headerCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  headerTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  creator: {
    marginTop: 10,
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
  meta: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.secondary,
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.textMuted,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "800",
  },
});
