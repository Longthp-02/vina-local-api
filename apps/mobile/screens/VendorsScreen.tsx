import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getVendors } from "../api";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { Vendor } from "../types/vendor";
import { formatPriceRange, formatRating, getVendorCoverUrl } from "../utils/vendor";

type Props = NativeStackScreenProps<RootStackParamList, "Vendors">;

export function VendorsScreen({ navigation }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendors({ limit: 20, offset: 0 }),
  });

  if (isLoading) {
    return <Text style={styles.stateText}>Loading vendors...</Text>;
  }

  if (isError) {
    return <Text style={styles.stateText}>Could not load vendors.</Text>;
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>Fresh picks</Text>
          <Text style={styles.headerTitle}>Local spots worth checking</Text>
        </View>
      }
      renderItem={({ item }) => (
        <VendorRow
          vendor={item}
          onPress={() => navigation.navigate("VendorDetail", { vendorId: item.id })}
        />
      )}
      ListEmptyComponent={<Text style={styles.stateText}>No vendors found.</Text>}
    />
  );
}

function VendorRow({ vendor, onPress }: { vendor: Vendor; onPress: () => void }) {
  const coverUrl = getVendorCoverUrl(vendor);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.coverImage} />
      ) : (
        <View style={styles.placeholderCover}>
          <View style={styles.placeholderBadge}>
            <MaterialCommunityIcons color={colors.gold} name="silverware-fork-knife" size={20} />
          </View>
          <Text style={styles.placeholderText}>Photo coming soon</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{vendor.category}</Text>
        </View>
        <Text style={styles.vendorName}>{vendor.name}</Text>
        <Text style={styles.meta}>
          {vendor.district}, {vendor.city}
        </Text>
        <Text style={styles.meta}>{formatPriceRange(vendor)}</Text>
        <Text style={styles.ratingText}>Rating: {formatRating(vendor)}</Text>
      </View>
    </Pressable>
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
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  coverImage: {
    width: "100%",
    height: 180,
    backgroundColor: colors.secondaryStrong,
  },
  placeholderCover: {
    width: "100%",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.secondaryStrong,
  },
  placeholderBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.secondaryStrong,
    marginBottom: 10,
  },
  cardBody: {
    padding: 16,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
  },
  vendorName: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  ratingText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.textMuted,
  },
});
