import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getMyLists } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { VendorList } from "../types/list";

type Props = NativeStackScreenProps<RootStackParamList, "MyLists">;

export function MyListsScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["myLists"],
    queryFn: () => getMyLists(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>Sign in to create and manage your lists.</Text>
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
    return <Text style={styles.stateText}>Loading your lists...</Text>;
  }

  if (isError) {
    return <Text style={styles.stateText}>Could not load your lists.</Text>;
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("CreateList")}
          style={styles.createCard}
        >
          <Text style={styles.createEyebrow}>Your collection</Text>
          <Text style={styles.createTitle}>Create a New List</Text>
          <Text style={styles.createText}>Save favorite vendors into your own collection.</Text>
        </Pressable>
      }
      renderItem={({ item }) => (
        <ListRow
          list={item}
          onPress={() => navigation.navigate("ListDetail", { listId: item.id })}
        />
      )}
      ListEmptyComponent={<Text style={styles.stateText}>No lists yet. Create your first one.</Text>}
    />
  );
}

function ListRow({ list, onPress }: { list: VendorList; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.visibilityPill}>
        <Text style={styles.visibilityPillText}>
          {list.visibility === "PUBLIC" ? "Public" : "Private"}
        </Text>
      </View>
      <Text style={styles.title}>{list.title}</Text>
      {list.description ? <Text style={styles.description}>{list.description}</Text> : null}
      <Text style={styles.meta}>{list.itemCount} vendors</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.secondary,
  },
  createCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.primary,
    marginBottom: 12,
  },
  createEyebrow: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  createTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.secondary,
    marginTop: 8,
    marginBottom: 6,
  },
  createText: {
    fontSize: 14,
    color: "#FFE8DC",
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
  },
  visibilityPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.secondaryStrong,
    marginBottom: 10,
  },
  visibilityPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
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
    paddingHorizontal: 22,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "800",
  },
});
