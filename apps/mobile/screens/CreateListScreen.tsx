import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createList } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { CreateVendorListInput, VendorListVisibility } from "../types/list";

type Props = NativeStackScreenProps<RootStackParamList, "CreateList">;

export function CreateListScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<VendorListVisibility>("PRIVATE");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createListMutation = useMutation({
    mutationFn: (input: CreateVendorListInput) => createList(input),
    onSuccess: async (list) => {
      setSubmitError(null);
      await queryClient.invalidateQueries({ queryKey: ["myLists"] });
      navigation.replace("ListDetail", { listId: list.id });
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Could not create list.");
    },
  });

  function onSubmit() {
    if (!isAuthenticated) {
      setSubmitError("Please sign in before creating a list.");
      navigation.navigate("PhoneAuth");
      return;
    }

    if (!title.trim()) {
      setSubmitError("Please enter a list title.");
      return;
    }

    setSubmitError(null);
    createListMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      visibility,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Create List</Text>
        <Text style={styles.subtitle}>Start a collection of vendors you want to keep or share.</Text>
      </View>

      <View style={styles.formCard}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Best street food in District 1"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.textArea]}
        />

        <View style={styles.visibilityRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setVisibility("PRIVATE")}
            style={[
              styles.visibilityButton,
              visibility === "PRIVATE" ? styles.visibilityButtonActive : null,
            ]}
          >
            <Text
              style={[
                styles.visibilityButtonText,
                visibility === "PRIVATE" ? styles.visibilityButtonTextActive : null,
              ]}
            >
              Private
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setVisibility("PUBLIC")}
            style={[
              styles.visibilityButton,
              visibility === "PUBLIC" ? styles.visibilityButtonActive : null,
            ]}
          >
            <Text
              style={[
                styles.visibilityButtonText,
                visibility === "PUBLIC" ? styles.visibilityButtonTextActive : null,
              ]}
            >
              Public
            </Text>
          </Pressable>
        </View>

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={onSubmit}
          disabled={createListMutation.isPending}
          style={[styles.button, createListMutation.isPending ? styles.buttonDisabled : null]}
        >
          <Text style={styles.buttonText}>
            {createListMutation.isPending ? "Creating..." : "Create List"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.secondary,
    gap: 14,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.secondary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFE8DC",
  },
  formCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.secondary,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  visibilityRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  visibilityButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  visibilityButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  visibilityButtonTextActive: {
    color: colors.secondary,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "800",
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
  },
});
