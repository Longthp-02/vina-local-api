import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { getVendors } from "../api";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { Vendor } from "../types/vendor";
import { formatPriceRange, getVendorCoverUrl } from "../utils/vendor";

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

  const selectedCoverUrl = selectedVendor ? getVendorCoverUrl(selectedVendor) : null;

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
            pinColor={colors.primary}
          />
        ))}
      </MapView>

      <View style={styles.topBanner}>
        <Text style={styles.topBannerText}>Tap a pin to preview a place</Text>
      </View>

      {selectedVendor ? (
        <View style={styles.previewCard}>
          {selectedCoverUrl ? (
            <Image source={{ uri: selectedCoverUrl }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <View style={styles.previewPlaceholderBadge}>
                <MaterialCommunityIcons color={colors.gold} name="map-marker-star" size={20} />
              </View>
              <Text style={styles.previewPlaceholderText}>No photo yet</Text>
            </View>
          )}
          <View style={styles.previewPill}>
            <Text style={styles.previewPillText}>{selectedVendor.category}</Text>
          </View>
          <Text style={styles.previewTitle}>{selectedVendor.name}</Text>
          <Text style={styles.previewText}>
            {selectedVendor.district}, {selectedVendor.city}
          </Text>
          <Text style={styles.previewSubtext}>{formatPriceRange(selectedVendor)}</Text>
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
    backgroundColor: colors.secondary,
  },
  map: {
    flex: 1,
  },
  topBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topBannerText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  previewCard: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: 140,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: colors.secondaryStrong,
  },
  previewPlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.secondaryStrong,
  },
  previewPlaceholderBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },
  previewPlaceholderText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  previewPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.secondaryStrong,
    marginBottom: 10,
  },
  previewPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  previewText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },
  previewSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  button: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "800",
  },
  stateText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.textMuted,
  },
});
