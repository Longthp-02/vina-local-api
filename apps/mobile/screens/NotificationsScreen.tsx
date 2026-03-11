import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { UserNotification } from "../types/user";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

export function NotificationsScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    enabled: isAuthenticated,
  });

  const readMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: async (notification) => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (notification.listId) {
        navigation.navigate("ListDetail", { listId: notification.listId });
      }
    },
  });

  const readAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>Sign in to see notifications.</Text>
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
    return <Text style={styles.stateText}>Loading notifications...</Text>;
  }

  if (isError) {
    return <Text style={styles.stateText}>Could not load notifications.</Text>;
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            style={[styles.readAllButton, readAllMutation.isPending ? styles.buttonDisabled : null]}
          >
            <Text style={styles.readAllButtonText}>
              {readAllMutation.isPending ? "Updating..." : "Mark All Read"}
            </Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <NotificationRow
          item={item}
          onPress={() => readMutation.mutate(item.id)}
          isPending={readMutation.isPending}
        />
      )}
      ListEmptyComponent={<Text style={styles.stateText}>No notifications yet.</Text>}
    />
  );
}

function NotificationRow({
  item,
  onPress,
  isPending,
}: {
  item: UserNotification;
  onPress: () => void;
  isPending: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isPending}
      style={[styles.card, item.readAt ? styles.cardRead : styles.cardUnread]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.meta}>{item.readAt ? "Read" : "New"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.secondary,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  readAllButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
  },
  readAllButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: "#FFF1ED",
  },
  cardRead: {
    opacity: 0.82,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  meta: {
    marginTop: 10,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
});
