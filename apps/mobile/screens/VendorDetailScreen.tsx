import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createVendorReview, getVendorById, getVendorReviews } from "../api";
import { RootStackParamList } from "../navigation/types";
import { formatPriceRange, formatRating } from "../utils/vendor";

type Props = NativeStackScreenProps<RootStackParamList, "VendorDetail">;

export function VendorDetailScreen({ route }: Props) {
  const { vendorId } = route.params;
  const queryClient = useQueryClient();
  const [ratingInput, setRatingInput] = useState("5");
  const [contentInput, setContentInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const submitReview = useMutation({
    mutationFn: (input: { rating: number; content: string }) =>
      createVendorReview(vendorId, input),
    onSuccess: async () => {
      setSubmitError(null);
      setContentInput("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] }),
        queryClient.invalidateQueries({ queryKey: ["vendorReviews", vendorId] }),
      ]);
    },
    onError: () => {
      setSubmitError("Could not submit review. Please try again.");
    },
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading vendor details...</Text>;
  }

  if (isError || !data) {
    return <Text style={styles.stateText}>Could not load vendor details.</Text>;
  }

  function onSubmitReview() {
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
    submitReview.mutate({ rating, content });
  }

  const summaryText =
    data.aiSummary && data.aiSummary.trim().length > 0
      ? data.aiSummary.trim()
      : "No summary available yet.";

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.name}>{data.name}</Text>
      <Text style={styles.text}>Address: {data.addressText}</Text>
      <Text style={styles.text}>Location: {data.district}, {data.city}</Text>
      <Text style={styles.text}>Category: {data.category}</Text>
      <Text style={styles.text}>{formatPriceRange(data)}</Text>
      <Text style={styles.text}>Average rating: {formatRating(data)}</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>AI summary</Text>
        <Text style={styles.summary}>{summaryText}</Text>
      </View>
      {data.description ? <Text style={styles.description}>{data.description}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add a Review</Text>
        <TextInput
          value={ratingInput}
          onChangeText={setRatingInput}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Rating (1-5)"
        />
        <TextInput
          value={contentInput}
          onChangeText={setContentInput}
          style={[styles.input, styles.textArea]}
          placeholder="Write a short review"
          multiline
        />
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={onSubmitReview}
          disabled={submitReview.isPending}
          style={[styles.button, submitReview.isPending ? styles.buttonDisabled : null]}
        >
          <Text style={styles.buttonText}>
            {submitReview.isPending ? "Submitting..." : "Submit Review"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {isReviewsLoading ? <Text style={styles.text}>Loading reviews...</Text> : null}
        {isReviewsError ? <Text style={styles.text}>Could not load reviews.</Text> : null}
        {!isReviewsLoading && !isReviewsError && (reviews?.length ?? 0) === 0 ? (
          <Text style={styles.text}>No reviews yet.</Text>
        ) : null}
        {reviews?.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <Text style={styles.reviewRating}>Rating: {review.rating}/5</Text>
            <Text style={styles.reviewContent}>{review.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    backgroundColor: "#fff",
    gap: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  text: {
    fontSize: 15,
    color: "#374151",
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    color: "#374151",
  },
  summary: {
    fontSize: 14,
    color: "#4b5563",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    padding: 10,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    marginBottom: 10,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  reviewRating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  reviewContent: {
    fontSize: 14,
    color: "#374151",
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: "#4b5563",
  },
});
