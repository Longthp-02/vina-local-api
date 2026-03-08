import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getVendors } from "../api";
import { RootStackParamList } from "../navigation/types";
import { Vendor } from "../types/vendor";
import { formatPriceRange, formatRating } from "../utils/vendor";

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
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.vendorName}>{vendor.name}</Text>
      <Text style={styles.meta}>{vendor.district}, {vendor.city}</Text>
      <Text style={styles.meta}>Category: {vendor.category}</Text>
      <Text style={styles.meta}>{formatPriceRange(vendor)}</Text>
      <Text style={styles.meta}>Rating: {formatRating(vendor)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
  },
  vendorName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 3,
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: "#4b5563",
  },
});
