import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getTopLists } from "../api";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { VendorList } from "../types/list";

type Props = NativeStackScreenProps<RootStackParamList, "TopLists">;

export function TopListsScreen({ navigation }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["topLists"],
    queryFn: () => getTopLists(),
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading top lists...</Text>;
  }

  if (isError) {
    return <Text style={styles.stateText}>Could not load top lists.</Text>;
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>Top lists</Text>
          <Text style={styles.headerTitle}>What people keep opening and liking</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <ListRow
          rank={index + 1}
          list={item}
          onPress={() => navigation.navigate("ListDetail", { listId: item.id })}
          onCreatorPress={() => navigation.navigate("CreatorProfile", { userId: item.user.id })}
        />
      )}
      ListEmptyComponent={<Text style={styles.stateText}>No top lists yet.</Text>}
    />
  );
}

function ListRow({
  rank,
  list,
  onPress,
  onCreatorPress,
}: {
  rank: number;
  list: VendorList;
  onPress: () => void;
  onCreatorPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.rankPill}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
      <Pressable onPress={onPress}>
        <Text style={styles.title}>{list.title}</Text>
        {list.description ? <Text style={styles.description}>{list.description}</Text> : null}
      </Pressable>
      <Pressable onPress={onCreatorPress}>
        <Text style={styles.creator}>by {list.user.displayName}</Text>
      </Pressable>
      <Text style={styles.meta}>
        {list.likeCount} likes · {list.viewCount} views
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
    backgroundColor: colors.primary,
  },
  headerEyebrow: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  headerTitle: {
    marginTop: 10,
    color: colors.secondary,
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
  rankPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.secondaryStrong,
    marginBottom: 10,
  },
  rankText: {
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
  meta: {
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
