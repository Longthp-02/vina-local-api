import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { deleteList, getListById, updateList } from "../api";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { VendorListVisibility } from "../types/list";

type Props = NativeStackScreenProps<RootStackParamList, "EditList">;

export function EditListScreen({ navigation, route }: Props) {
  const { listId } = route.params;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["list", listId],
    queryFn: () => getListById(listId),
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<VendorListVisibility>("PRIVATE");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    setTitle(data.title);
    setDescription(data.description ?? "");
    setVisibility(data.visibility);
  }, [data]);

  const updateListMutation = useMutation({
    mutationFn: () =>
      updateList(listId, {
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", listId] }),
        queryClient.invalidateQueries({ queryKey: ["myLists"] }),
        queryClient.invalidateQueries({ queryKey: ["publicLists"] }),
        queryClient.invalidateQueries({ queryKey: ["topLists"] }),
      ]);
      navigation.goBack();
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Could not update list.");
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: () => deleteList(listId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myLists"] }),
        queryClient.invalidateQueries({ queryKey: ["publicLists"] }),
        queryClient.invalidateQueries({ queryKey: ["topLists"] }),
      ]);
      navigation.reset({
        index: 0,
        routes: [{ name: "MyLists" }],
      });
    },
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading list...</Text>;
  }

  if (isError || !data) {
    return <Text style={styles.stateText}>Could not load this list.</Text>;
  }

  function onSubmit() {
    if (!title.trim()) {
      setSubmitError("Please enter a list title.");
      return;
    }

    setSubmitError(null);
    updateListMutation.mutate();
  }

  function onDelete() {
    Alert.alert("Delete List", "Delete this list permanently?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteListMutation.mutate() },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Edit List</Text>
        <Text style={styles.subtitle}>Update title, notes, and visibility.</Text>
      </View>

      <View style={styles.formCard}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="List title"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Description"
          placeholderTextColor={colors.textMuted}
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
          disabled={updateListMutation.isPending}
          style={[styles.button, updateListMutation.isPending ? styles.buttonDisabled : null]}
        >
          <Text style={styles.buttonText}>
            {updateListMutation.isPending ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onDelete}
          disabled={deleteListMutation.isPending}
          style={[styles.deleteButton, deleteListMutation.isPending ? styles.buttonDisabled : null]}
        >
          <Text style={styles.deleteButtonText}>
            {deleteListMutation.isPending ? "Deleting..." : "Delete List"}
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
  deleteButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#FDE2E3",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "800",
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "800",
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.textMuted,
  },
});
