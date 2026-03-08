import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { getVendors } from "../api";
import { RootStackParamList } from "../navigation/types";
import { Vendor } from "../types/vendor";

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export function MapScreen({ navigation }: Props) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendors", "map"],
    queryFn: () => getVendors({ limit: 100, offset: 0 }),
  });

  const initialRegion = useMemo<Region>(() => {
    if (!data || data.length === 0) {
      return DEFAULT_REGION;
    }

    return {
      latitude: data[0].latitude,
      longitude: data[0].longitude,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }, [data]);

  if (isLoading) {
    return <Text style={styles.stateText}>Loading map...</Text>;
  }

  if (isError) {
    return <Text style={styles.stateText}>Could not load map data.</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView initialRegion={initialRegion} style={styles.map}>
        {(data ?? []).map((vendor) => (
          <Marker
            key={vendor.id}
            coordinate={{ latitude: vendor.latitude, longitude: vendor.longitude }}
            onPress={() => setSelectedVendor(vendor)}
            title={vendor.name}
            description={`${vendor.district}, ${vendor.city}`}
          />
        ))}
      </MapView>

      {selectedVendor ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{selectedVendor.name}</Text>
          <Text style={styles.previewText}>
            {selectedVendor.district}, {selectedVendor.city}
          </Text>
          <Text style={styles.previewText}>Category: {selectedVendor.category}</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={() =>
              navigation.navigate("VendorDetail", {
                vendorId: selectedVendor.id,
              })
            }
          >
            <Text style={styles.buttonText}>View Details</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  previewCard: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    padding: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  previewText: {
    marginTop: 4,
    fontSize: 14,
    color: "#4b5563",
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "#111827",
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: "#4b5563",
  },
});
