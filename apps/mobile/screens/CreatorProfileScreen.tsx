import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { followUser, getCreatorProfile, unfollowUser } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { VendorList } from "../types/list";

type Props = NativeStackScreenProps<RootStackParamList, "CreatorProfile">;

export function CreatorProfileScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["creatorProfile", userId],
    queryFn: () => getCreatorProfile(userId),
  });

  const followMutation = useMutation({
    mutationFn: () =>
      data?.user.followedByMe ? unfollowUser(userId) : followUser(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["creatorProfile", userId] }),
        queryClient.invalidateQueries({ queryKey: ["followingFeed"] }),
      ]);
    },
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading creator...</Text>;
  }

  if (isError || !data) {
    return <Text style={styles.stateText}>Could not load creator profile.</Text>;
  }

  const isOwnProfile = user?.id === data.user.id;

  return (
    <FlatList
      data={data.lists}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {data.user.displayName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{data.user.displayName}</Text>
          <Text style={styles.meta}>
            {data.user.followerCount} followers · {data.user.followingCount} following
          </Text>
          {!isOwnProfile ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                isAuthenticated ? followMutation.mutate() : navigation.navigate("PhoneAuth")
              }
              disabled={followMutation.isPending}
              style={[
                styles.followButton,
                data.user.followedByMe ? styles.followButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.followButtonText,
                  data.user.followedByMe ? styles.followButtonTextActive : null,
                ]}
              >
                {data.user.followedByMe ? "Following" : "Follow"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          list={item}
          onPress={() => navigation.navigate("ListDetail", { listId: item.id })}
        />
      )}
      ListEmptyComponent={<Text style={styles.stateText}>No public lists yet.</Text>}
    />
  );
}

function ListRow({ list, onPress }: { list: VendorList; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.title}>{list.title}</Text>
      {list.description ? <Text style={styles.description}>{list.description}</Text> : null}
      <Text style={styles.listMeta}>
        {list.likeCount} likes · {list.viewCount} views · {list.itemCount} vendors
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.secondary,
  },
  header: {
    marginBottom: 12,
    borderRadius: 26,
    padding: 20,
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
  },
  name: {
    marginTop: 14,
    fontSize: 28,
    fontWeight: "800",
    color: colors.secondary,
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: "#FFE8DC",
  },
  followButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary,
  },
  followButtonActive: {
    backgroundColor: "transparent",
  },
  followButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  followButtonTextActive: {
    color: colors.secondary,
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
  listMeta: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.textMuted,
  },
});
