import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getPublicLists } from "../api";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { VendorList } from "../types/list";

type Props = NativeStackScreenProps<RootStackParamList, "PublicLists">;

export function PublicListsScreen({ navigation }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicLists"],
    queryFn: () => getPublicLists(),
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading public lists...</Text>;
  }

  if (isError) {
    return <Text style={styles.stateText}>Could not load public lists.</Text>;
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>Community picks</Text>
          <Text style={styles.headerTitle}>Explore what people are saving</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          list={item}
          onPress={() => navigation.navigate("ListDetail", { listId: item.id })}
          onCreatorPress={() => navigation.navigate("CreatorProfile", { userId: item.user.id })}
        />
      )}
      ListEmptyComponent={<Text style={styles.stateText}>No public lists yet.</Text>}
    />
  );
}

function ListRow({
  list,
  onPress,
  onCreatorPress,
}: {
  list: VendorList;
  onPress: () => void;
  onCreatorPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress}>
        <Text style={styles.title}>{list.title}</Text>
        {list.description ? <Text style={styles.description}>{list.description}</Text> : null}
      </Pressable>
      <Pressable onPress={onCreatorPress}>
        <Text style={styles.creator}>by {list.user.displayName}</Text>
      </Pressable>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{list.itemCount} vendors</Text>
        <Text style={styles.meta}>
          {list.likeCount} likes · {list.viewCount} views
        </Text>
      </View>
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
  creator: {
    marginTop: 10,
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  metaRow: {
    marginTop: 12,
    gap: 4,
  },
  meta: {
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
