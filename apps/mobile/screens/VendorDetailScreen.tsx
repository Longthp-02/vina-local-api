import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addVendorToList,
  createVendorReview,
  getMyLists,
  getVendorById,
  getVendorReviews,
} from "../api";
import { resolveApiMediaUrl } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { PhotoUploadInput } from "../types/vendor";
import { pickPhotoUploads } from "../utils/photos";
import { formatPriceRange, formatRating } from "../utils/vendor";

type Props = NativeStackScreenProps<RootStackParamList, "VendorDetail">;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function VendorDetailScreen({ navigation, route }: Props) {
  const { vendorId } = route.params;
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [ratingInput, setRatingInput] = useState("5");
  const [contentInput, setContentInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reviewPhotos, setReviewPhotos] = useState<PhotoUploadInput[]>([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => getVendorById(vendorId),
  });

  const {
    data: reviews,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
  } = useQuery({
    queryKey: ["vendorReviews", vendorId],
    queryFn: () => getVendorReviews(vendorId, { limit: 20, offset: 0 }),
  });

  const {
    data: myLists,
    isLoading: isListsLoading,
    isError: isListsError,
  } = useQuery({
    queryKey: ["myLists"],
    queryFn: () => getMyLists(),
    enabled: isAuthenticated,
  });

  const submitReview = useMutation({
    mutationFn: (input: {
      rating: number;
      content: string;
      photos: PhotoUploadInput[];
    }) =>
      createVendorReview(vendorId, input),
    onSuccess: async () => {
      setSubmitError(null);
      setContentInput("");
      setReviewPhotos([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] }),
        queryClient.invalidateQueries({ queryKey: ["vendorReviews", vendorId] }),
      ]);
    },
    onError: () => {
      setSubmitError("Could not submit review. Please try again.");
    },
  });

  const saveVendorMutation = useMutation({
    mutationFn: (listId: string) => addVendorToList(listId, vendorId),
    onSuccess: async (list) => {
      setSaveError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myLists"] }),
        queryClient.invalidateQueries({ queryKey: ["list", list.id] }),
      ]);
      Alert.alert("Saved", `Added to "${list.title}".`);
    },
    onError: (error) => {
      setSaveError(error instanceof Error ? error.message : "Could not save vendor to list.");
    },
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading vendor details...</Text>;
  }

  if (isError || !data) {
    return <Text style={styles.stateText}>Could not load vendor details.</Text>;
  }

  function onSubmitReview() {
    if (!isAuthenticated) {
      setSubmitError("Please sign in before submitting a review.");
      navigation.navigate("PhoneAuth");
      return;
    }

    const rating = Number(ratingInput);
    const content = contentInput.trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setSubmitError("Rating must be a number from 1 to 5.");
      return;
    }

    if (!content) {
      setSubmitError("Please write a short review.");
      return;
    }

    setSubmitError(null);
    submitReview.mutate({ rating, content, photos: reviewPhotos });
  }

  async function onPickReviewPhotos() {
    try {
      const remainingSlots = Math.max(0, 3 - reviewPhotos.length);

      if (remainingSlots === 0) {
        setSubmitError("You can add up to 3 photos.");
        return;
      }

      const nextPhotos = await pickPhotoUploads(remainingSlots);
      if (nextPhotos.length === 0) {
        return;
      }

      setReviewPhotos((current) => [...current, ...nextPhotos].slice(0, 3));
      setSubmitError(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not pick photos.");
    }
  }

  function removeReviewPhoto(index: number) {
    setReviewPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  const summaryText =
    data.aiSummary && data.aiSummary.trim().length > 0
      ? data.aiSummary.trim()
      : "No summary available yet.";

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{data.category}</Text>
        </View>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.locationText}>
          {data.district}, {data.city}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>{formatPriceRange(data)}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>Rating {formatRating(data)}</Text>
          </View>
        </View>
      </View>

      {data.photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vendorPhotoRow}
        >
          {data.photos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: resolveApiMediaUrl(photo.url) }}
              style={styles.vendorPhoto}
            />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.infoCard}>
        <SectionHeading compact icon="map-marker-radius" label="Address" />
        <Text style={styles.infoValue}>{data.addressText}</Text>
        {data.description ? <Text style={styles.description}>{data.description}</Text> : null}
      </View>

      <View style={styles.summaryCard}>
        <SectionHeading compact icon="star-four-points" label="AI summary" />
        <Text style={styles.summary}>{summaryText}</Text>
      </View>

      <View style={styles.section}>
        <SectionHeading icon="book-heart" label="Save to List" />
        {!isAuthenticated ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>Sign in is required to save vendors to your lists.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("PhoneAuth")}
              style={styles.primaryButton}
            >
              <ButtonLabel icon="account-heart" label="Sign In" />
            </Pressable>
          </View>
        ) : null}
        {isAuthenticated && isListsLoading ? (
          <Text style={styles.helperText}>Loading your lists...</Text>
        ) : null}
        {isAuthenticated && isListsError ? (
          <Text style={styles.helperText}>Could not load your lists.</Text>
        ) : null}
        {isAuthenticated && !isListsLoading && !isListsError && (myLists?.length ?? 0) === 0 ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>You do not have any lists yet.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("CreateList")}
              style={styles.primaryButton}
            >
              <ButtonLabel icon="playlist-plus" label="Create List" />
            </Pressable>
          </View>
        ) : null}
        {isAuthenticated
          ? myLists?.map((list) => (
              <Pressable
                key={list.id}
                accessibilityRole="button"
                onPress={() => saveVendorMutation.mutate(list.id)}
                disabled={saveVendorMutation.isPending}
                style={[
                  styles.listSaveCard,
                  saveVendorMutation.isPending ? styles.buttonDisabled : null,
                ]}
              >
                <View style={styles.listSaveHeader}>
                  <View style={styles.listSaveBadge}>
                    <MaterialCommunityIcons color={colors.gold} name="bookmark-multiple" size={18} />
                  </View>
                  <Text style={styles.listSaveTitle}>{list.title}</Text>
                </View>
                <Text style={styles.listSaveMeta}>
                  {list.visibility === "PUBLIC" ? "Public" : "Private"} · {list.itemCount} vendors
                </Text>
              </Pressable>
            ))
          : null}
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
      </View>

      <View style={styles.section}>
        <SectionHeading icon="message-draw" label="Add a Review" />
        {!isAuthenticated ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>Sign in is required to submit a review.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("PhoneAuth")}
              style={styles.primaryButton}
            >
              <ButtonLabel icon="account-heart" label="Sign In" />
            </Pressable>
          </View>
        ) : null}
        <TextInput
          value={ratingInput}
          onChangeText={setRatingInput}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Rating (1-5)"
          placeholderTextColor={colors.textMuted}
          editable={isAuthenticated}
        />
        <TextInput
          value={contentInput}
          onChangeText={setContentInput}
          style={[styles.input, styles.textArea]}
          placeholder="Write a short review"
          placeholderTextColor={colors.textMuted}
          multiline
          editable={isAuthenticated}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onPickReviewPhotos}
          disabled={!isAuthenticated}
          style={[styles.photoButton, !isAuthenticated ? styles.buttonDisabled : null]}
        >
          <View style={styles.photoButtonRow}>
            <MaterialCommunityIcons color={colors.primary} name="camera-plus" size={18} />
            <Text style={styles.photoButtonText}>Add Photos</Text>
          </View>
        </Pressable>
        {reviewPhotos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewPhotoPreviewRow}
          >
            {reviewPhotos.map((photo, index) => (
              <View key={`${photo.uri}-${index}`} style={styles.reviewPhotoPreviewCard}>
                <Image source={{ uri: photo.uri }} style={styles.reviewPhotoPreview} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => removeReviewPhoto(index)}
                  style={styles.photoRemoveButton}
                >
                  <MaterialCommunityIcons color={colors.secondary} name="close" size={14} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={onSubmitReview}
          disabled={submitReview.isPending || !isAuthenticated}
          style={[
            styles.primaryButton,
            submitReview.isPending || !isAuthenticated ? styles.buttonDisabled : null,
          ]}
        >
          <ButtonLabel
            icon={submitReview.isPending ? "loading" : "star-circle"}
            label={submitReview.isPending ? "Submitting..." : "Submit Review"}
          />
        </Pressable>
      </View>

      <View style={styles.section}>
        <SectionHeading icon="cards-heart-outline" label="Reviews" />
        {isReviewsLoading ? <Text style={styles.helperText}>Loading reviews...</Text> : null}
        {isReviewsError ? <Text style={styles.helperText}>Could not load reviews.</Text> : null}
        {!isReviewsLoading && !isReviewsError && (reviews?.length ?? 0) === 0 ? (
          <Text style={styles.helperText}>No reviews yet.</Text>
        ) : null}
        {reviews?.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewRatingRow}>
              <MaterialCommunityIcons color={colors.gold} name="star-four-points" size={16} />
              <Text style={styles.reviewRating}>Rating: {review.rating}/5</Text>
            </View>
            <Text style={styles.reviewContent}>{review.content}</Text>
            {review.photos.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reviewPhotoRow}
              >
                {review.photos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: resolveApiMediaUrl(photo.url) }}
                    style={styles.reviewPhoto}
                  />
                ))}
              </ScrollView>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SectionHeading({
  icon,
  label,
  compact,
}: {
  icon: IconName;
  label: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.sectionHeading, compact ? styles.sectionHeadingCompact : null]}>
      <View style={styles.sectionHeadingBadge}>
        <MaterialCommunityIcons color={colors.gold} name={icon} size={compact ? 16 : 18} />
      </View>
      <Text style={compact ? styles.infoLabel : styles.sectionTitle}>{label}</Text>
    </View>
  );
}

function ButtonLabel({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.buttonLabel}>
      <MaterialCommunityIcons color={colors.secondary} name={icon} size={18} />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    backgroundColor: colors.secondary,
    gap: 14,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: colors.primary,
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 247, 242, 0.18)",
  },
  categoryPillText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  name: {
    marginTop: 14,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.secondary,
  },
  locationText: {
    marginTop: 8,
    fontSize: 15,
    color: "#FFE8DC",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  vendorPhotoRow: {
    gap: 10,
  },
  vendorPhoto: {
    width: 180,
    height: 180,
    borderRadius: 24,
    backgroundColor: colors.secondaryStrong,
  },
  statChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.secondary,
  },
  statChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  infoCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    fontWeight: "700",
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 18,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionHeadingCompact: {
    marginBottom: 4,
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
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  noticeCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  helperText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  photoButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.goldSoft,
  },
  photoButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  reviewPhotoPreviewRow: {
    gap: 10,
  },
  reviewPhotoPreviewCard: {
    position: "relative",
  },
  reviewPhotoPreview: {
    width: 88,
    height: 88,
    borderRadius: 18,
    backgroundColor: colors.secondaryStrong,
  },
  photoRemoveButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  buttonLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "800",
  },
  listSaveCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listSaveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  listSaveBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },
  listSaveTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  listSaveMeta: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.surface,
  },
  reviewRating: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 6,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  reviewPhotoRow: {
    gap: 8,
    marginTop: 10,
  },
  reviewPhoto: {
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: colors.secondaryStrong,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.textMuted,
  },
});
