import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createListComment,
  getListById,
  getListComments,
  likeList,
  removeVendorFromList,
  reportList,
  reportListComment,
  unlikeList,
} from "../api";
import { useAuth } from "../auth/AuthProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { VendorListComment, VendorListItem } from "../types/list";
import { formatPriceRange, formatRating } from "../utils/vendor";

type Props = NativeStackScreenProps<RootStackParamList, "ListDetail">;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function ListDetailScreen({ navigation, route }: Props) {
  const { listId } = route.params;
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [commentInput, setCommentInput] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListById(listId),
  });
  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useQuery({
    queryKey: ["listComments", listId],
    queryFn: () => getListComments(listId),
  });

  const removeVendorMutation = useMutation({
    mutationFn: (vendorId: string) => removeVendorFromList(listId, vendorId),
    onSuccess: async (list) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", listId] }),
        queryClient.invalidateQueries({ queryKey: ["myLists"] }),
      ]);
      Alert.alert("Updated", `Removed vendor from "${list.title}".`);
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: () => (data?.likedByMe ? unlikeList(listId) : likeList(listId)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", listId] }),
        queryClient.invalidateQueries({ queryKey: ["publicLists"] }),
        queryClient.invalidateQueries({ queryKey: ["topLists"] }),
      ]);
    },
  });
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createListComment(listId, content),
    onSuccess: async () => {
      setCommentInput("");
      await queryClient.invalidateQueries({ queryKey: ["listComments", listId] });
    },
  });
  const reportCommentMutation = useMutation({
    mutationFn: (commentId: string) => reportListComment(commentId),
    onSuccess: async () => {
      Alert.alert("Reported", "Thanks. We will review this comment.");
      await queryClient.invalidateQueries({ queryKey: ["listComments", listId] });
    },
  });
  const reportListMutation = useMutation({
    mutationFn: () => reportList(listId),
    onSuccess: async () => {
      Alert.alert("Reported", "Thanks. We will review this list.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", listId] }),
        queryClient.invalidateQueries({ queryKey: ["publicLists"] }),
        queryClient.invalidateQueries({ queryKey: ["topLists"] }),
        queryClient.invalidateQueries({ queryKey: ["followingFeed"] }),
      ]);
    },
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading list...</Text>;
  }

  if (isError || !data) {
    return <Text style={styles.stateText}>Could not load this list.</Text>;
  }

  const isOwner = user?.id === data.userId;

  function onSubmitComment() {
    if (!isAuthenticated) {
      navigation.navigate("PhoneAuth");
      return;
    }

    const content = commentInput.trim();

    if (!content) {
      return;
    }

    createCommentMutation.mutate(content);
  }

  return (
    <FlatList
      data={data.items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <MaterialCommunityIcons color={colors.gold} name="bookmark-outline" size={20} />
          </View>
          <Text style={styles.title}>{data.title}</Text>
          {data.description ? <Text style={styles.description}>{data.description}</Text> : null}
          <Text style={styles.meta}>
            {data.visibility === "PUBLIC" ? "Public" : "Private"} · {data.itemCount} vendors
          </Text>
          <Pressable
            onPress={() => navigation.navigate("CreatorProfile", { userId: data.user.id })}
          >
            <Text style={styles.creator}>by {data.user.displayName}</Text>
          </Pressable>
          <Text style={styles.meta}>{data.likeCount} likes · {data.viewCount} views</Text>
          {data.visibility === "PUBLIC" ? (
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  isAuthenticated ? toggleLikeMutation.mutate() : navigation.navigate("PhoneAuth")
                }
                disabled={toggleLikeMutation.isPending}
                style={[
                  styles.actionButton,
                  data.likedByMe ? styles.actionButtonActive : null,
                  toggleLikeMutation.isPending ? styles.buttonDisabled : null,
                ]}
              >
                <ButtonChip
                  active={Boolean(data.likedByMe)}
                  icon={data.likedByMe ? "heart" : "heart-outline"}
                  label={data.likedByMe ? "Liked" : "Like"}
                />
              </Pressable>
              {!isOwner ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    isAuthenticated ? reportListMutation.mutate() : navigation.navigate("PhoneAuth")
                  }
                  disabled={reportListMutation.isPending}
                  style={[
                    styles.secondaryActionButton,
                    reportListMutation.isPending ? styles.buttonDisabled : null,
                  ]}
                >
                  <SecondaryLabel
                    icon="flag-outline"
                    label={reportListMutation.isPending ? "Reporting..." : "Report"}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {isOwner ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("EditList", { listId })}
              style={styles.editButton}
            >
              <PrimaryLabel icon="pencil-circle" label="Edit List" />
            </Pressable>
          ) : null}
        </View>
      }
      ListFooterComponent={
        data.visibility === "PUBLIC" ? (
          <View style={styles.commentsSection}>
            <SectionHeading icon="comment-text-outline" label="Comments" />
            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Leave a comment"
              multiline
              style={styles.commentInput}
            />
            <Pressable
              accessibilityRole="button"
              onPress={onSubmitComment}
              disabled={createCommentMutation.isPending}
              style={[
                styles.commentButton,
                createCommentMutation.isPending ? styles.buttonDisabled : null,
              ]}
            >
              <PrimaryLabel
                icon={createCommentMutation.isPending ? "loading" : "send-circle"}
                label={createCommentMutation.isPending ? "Posting..." : "Post Comment"}
              />
            </Pressable>
            {isCommentsLoading ? <Text style={styles.meta}>Loading comments...</Text> : null}
            {isCommentsError ? <Text style={styles.meta}>Could not load comments.</Text> : null}
            {!isCommentsLoading && !isCommentsError && (comments?.length ?? 0) === 0 ? (
              <Text style={styles.meta}>No comments yet.</Text>
            ) : null}
            {comments?.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                canReport={isAuthenticated && user?.id !== comment.userId}
                isReporting={reportCommentMutation.isPending}
                onReport={() => reportCommentMutation.mutate(comment.id)}
              />
            ))}
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <ListVendorRow
          item={item}
          isOwner={isOwner}
          onPress={() => navigation.navigate("VendorDetail", { vendorId: item.vendor.id })}
          onRemove={() => removeVendorMutation.mutate(item.vendor.id)}
          isRemoving={removeVendorMutation.isPending}
        />
      )}
      ListEmptyComponent={<Text style={styles.stateText}>No vendors in this list yet.</Text>}
    />
  );
}

function CommentRow({
  comment,
  canReport,
  isReporting,
  onReport,
}: {
  comment: VendorListComment;
  canReport: boolean;
  isReporting: boolean;
  onReport: () => void;
}) {
  return (
    <View style={styles.commentCard}>
      <View style={styles.commentAuthorRow}>
        <View style={styles.commentAuthorBadge}>
          <MaterialCommunityIcons color={colors.gold} name="account-heart-outline" size={16} />
        </View>
        <Text style={styles.commentAuthor}>{comment.user.displayName}</Text>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
      {canReport ? (
        <Pressable
          accessibilityRole="button"
          onPress={onReport}
          disabled={isReporting}
          style={[styles.reportButton, isReporting ? styles.buttonDisabled : null]}
        >
          <SecondaryLabel icon="flag-outline" label={isReporting ? "Reporting..." : "Report"} />
        </Pressable>
      ) : null}
    </View>
  );
}

function ListVendorRow({
  item,
  isOwner,
  onPress,
  onRemove,
  isRemoving,
}: {
  item: VendorListItem;
  isOwner: boolean;
  onPress: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress}>
        <View style={styles.vendorTitleRow}>
          <View style={styles.vendorBadge}>
            <MaterialCommunityIcons color={colors.gold} name="silverware-fork-knife" size={16} />
          </View>
          <Text style={styles.vendorName}>{item.vendor.name}</Text>
        </View>
        <Text style={styles.meta}>
          {item.vendor.district}, {item.vendor.city}
        </Text>
        <Text style={styles.meta}>{item.vendor.category}</Text>
        <Text style={styles.meta}>{formatPriceRange(item.vendor)}</Text>
        <Text style={styles.meta}>Rating: {formatRating(item.vendor)}</Text>
      </Pressable>
      {isOwner ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRemove}
          disabled={isRemoving}
          style={[styles.removeButton, isRemoving ? styles.removeButtonDisabled : null]}
        >
          <SecondaryLabel
            icon="trash-can-outline"
            label={isRemoving ? "Removing..." : "Remove"}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function SectionHeading({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingBadge}>
        <MaterialCommunityIcons color={colors.gold} name={icon} size={18} />
      </View>
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

function PrimaryLabel({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.buttonRow}>
      <MaterialCommunityIcons color={colors.secondary} name={icon} size={18} />
      <Text style={styles.editButtonText}>{label}</Text>
    </View>
  );
}

function SecondaryLabel({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.buttonRow}>
      <MaterialCommunityIcons color={colors.primary} name={icon} size={16} />
      <Text style={styles.secondaryActionButtonText}>{label}</Text>
    </View>
  );
}

function ButtonChip({
  active,
  icon,
  label,
}: {
  active?: boolean;
  icon: IconName;
  label: string;
}) {
  return (
    <View style={styles.buttonRow}>
      <MaterialCommunityIcons
        color={active ? colors.secondary : colors.primary}
        name={icon}
        size={16}
      />
      <Text style={[styles.actionButtonText, active ? styles.actionButtonTextActive : null]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.secondary,
  },
  header: {
    marginBottom: 8,
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: colors.goldSoft,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
  },
  creator: {
    marginTop: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.surface,
    gap: 10,
  },
  vendorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vendorBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  actionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtonTextActive: {
    color: colors.secondary,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryActionButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.secondaryStrong,
  },
  secondaryActionButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  editButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
  },
  editButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  removeButton: {
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FDE2E3",
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  commentsSection: {
    marginTop: 16,
    gap: 10,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionHeadingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: colors.surface,
    color: colors.text,
  },
  commentButton: {
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
  },
  commentButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "800",
  },
  commentCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: colors.surface,
  },
  commentAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  commentAuthorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  commentContent: {
    fontSize: 14,
    color: colors.textMuted,
  },
  reportButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.secondaryStrong,
  },
  reportButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
});
