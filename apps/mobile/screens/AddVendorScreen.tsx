import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker, Region } from "react-native-maps";
import { createVendor } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { hcmcDistricts } from "../data/hcmc-locations";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { CreateVendorInput, PhotoUploadInput } from "../types/vendor";
import { pickPhotoUploads } from "../utils/photos";

type Props = NativeStackScreenProps<RootStackParamList, "AddVendor">;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type StepKey = "basic" | "location" | "price" | "review";

type FormState = {
  name: string;
  description: string;
  addressText: string;
  district: string;
  ward: string;
  city: string;
  category: string;
  priceMin: string;
  priceMax: string;
  latitude: number;
  longitude: number;
  photos: PhotoUploadInput[];
};

const defaultRegion = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const initialForm: FormState = {
  name: "",
  description: "",
  addressText: "",
  district: "",
  ward: "",
  city: "Ho Chi Minh City",
  category: "",
  priceMin: "",
  priceMax: "",
  latitude: defaultRegion.latitude,
  longitude: defaultRegion.longitude,
  photos: [],
};

const steps: { key: StepKey; title: string; icon: IconName }[] = [
  { key: "basic", title: "Basic Info", icon: "silverware-fork-knife" },
  { key: "location", title: "Location", icon: "map-marker-radius" },
  { key: "price", title: "Price", icon: "cash-multiple" },
  { key: "review", title: "Review", icon: "check-decagram" },
];

const vendorCategories = [
  "Pho",
  "Com Tam",
  "Bun Bo Hue",
  "Hu Tieu",
  "Banh Mi",
  "Bun Thit Nuong",
  "Banh Xeo",
  "Seafood",
  "Dessert",
  "Hotpot",
  "Mi Quang",
  "Grill",
  "Cafe",
  "Snacks",
] as const;

export function AddVendorScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(initialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(defaultRegion);
  const [isLocating, setIsLocating] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isDistrictPickerOpen, setIsDistrictPickerOpen] = useState(false);
  const [isWardPickerOpen, setIsWardPickerOpen] = useState(false);

  const submitVendor = useMutation({
    mutationFn: (input: CreateVendorInput) => createVendor(input),
    onSuccess: async () => {
      setSubmitError(null);
      setForm(initialForm);
      setStepIndex(0);
      setMapRegion(defaultRegion);
      await queryClient.invalidateQueries({ queryKey: ["vendors"] });
      Alert.alert("Submitted", "Vendor submitted for moderation.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Vendors"),
        },
      ]);
    },
    onError: () => {
      setSubmitError("Could not submit vendor. Please check your input and try again.");
    },
  });

  const currentStep = steps[stepIndex];
  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < steps.length - 1;

  const markerCoordinate = useMemo(
    () => ({
      latitude: form.latitude,
      longitude: form.longitude,
    }),
    [form.latitude, form.longitude],
  );

  const selectedDistrict = useMemo(
    () => hcmcDistricts.find((district) => district.name === form.district) ?? null,
    [form.district],
  );

  const availableWards = selectedDistrict?.wards ?? [];

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function parseNumber(value: string): number | undefined {
    if (!value.trim()) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  function validateStep(index: number): boolean {
    if (index === 0) {
      if (!form.name.trim() || !form.category.trim()) {
        setSubmitError("Please fill in the vendor name and category.");
        return false;
      }
    }

    if (index === 1) {
      if (
        !form.addressText.trim() ||
        !form.district.trim() ||
        !form.ward.trim() ||
        !form.city.trim()
      ) {
        setSubmitError("Please fill in address, district, ward, and city.");
        return false;
      }
    }

    if (index === 2) {
      const priceMin = parseNumber(form.priceMin);
      const priceMax = parseNumber(form.priceMax);

      if (
        priceMin !== undefined &&
        priceMax !== undefined &&
        priceMax < priceMin
      ) {
        setSubmitError("Price max should be greater than or equal to price min.");
        return false;
      }
    }

    setSubmitError(null);
    return true;
  }

  function buildPayload(): CreateVendorInput | null {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return null;
    }

    return {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      addressText: form.addressText.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      category: form.category.trim(),
      priceMin: parseNumber(form.priceMin),
      priceMax: parseNumber(form.priceMax),
      latitude: form.latitude,
      longitude: form.longitude,
      photos: form.photos,
    };
  }

  function onNext() {
    if (!validateStep(stepIndex)) {
      return;
    }

    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function onBack() {
    setSubmitError(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function onMapPress(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    updateField("latitude", latitude);
    updateField("longitude", longitude);
  }

  function onMarkerDragEnd(latitude: number, longitude: number) {
    updateField("latitude", latitude);
    updateField("longitude", longitude);
  }

  function selectDistrict(districtName: string) {
    const district = hcmcDistricts.find((item) => item.name === districtName);

    if (!district) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      district: district.name,
      ward: "",
      latitude: district.latitude,
      longitude: district.longitude,
    }));
    setMapRegion({
      latitude: district.latitude,
      longitude: district.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
    setIsDistrictPickerOpen(false);
    setSubmitError(null);
  }

  function selectWard(wardName: string) {
    const ward = availableWards.find((item) => item.name === wardName);

    if (!ward) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      ward: ward.name,
      latitude: ward.latitude,
      longitude: ward.longitude,
    }));
    setMapRegion({
      latitude: ward.latitude,
      longitude: ward.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setIsWardPickerOpen(false);
    setSubmitError(null);
  }

  async function useCurrentLocation() {
    try {
      setIsLocating(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setSubmitError("Location permission was not granted.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      updateField("latitude", location.coords.latitude);
      updateField("longitude", location.coords.longitude);
      setMapRegion(nextRegion);
      setSubmitError(null);
    } catch {
      setSubmitError("Could not get your current location.");
    } finally {
      setIsLocating(false);
    }
  }

  async function addPhotos() {
    try {
      const remainingSlots = Math.max(0, 3 - form.photos.length);

      if (remainingSlots === 0) {
        setSubmitError("You can add up to 3 photos.");
        return;
      }

      const nextPhotos = await pickPhotoUploads(remainingSlots);

      if (nextPhotos.length === 0) {
        return;
      }

      setForm((prev) => ({
        ...prev,
        photos: [...prev.photos, ...nextPhotos].slice(0, 3),
      }));
      setSubmitError(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not pick photos.");
    }
  }

  function removePhoto(index: number) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
  }

  function onSubmit() {
    if (!isAuthenticated) {
      setSubmitError("Please sign in before submitting a vendor.");
      navigation.navigate("PhoneAuth");
      return;
    }

    const payload = buildPayload();

    if (!payload) {
      return;
    }

    setSubmitError(null);
    submitVendor.mutate(payload);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Add Vendor</Text>
      <Text style={styles.subtitle}>Submit a place in a few simple steps.</Text>
      {!isAuthenticated ? (
        <Text style={styles.note}>Sign in is required to submit a vendor.</Text>
      ) : null}

      <View style={styles.stepHeader}>
        <View style={styles.stepBadge}>
          <MaterialCommunityIcons color={colors.gold} name={currentStep.icon} size={20} />
        </View>
        <Text style={styles.stepIndicator}>
          Step {stepIndex + 1} of {steps.length}: {currentStep.title}
        </Text>
      </View>

      {currentStep.key === "basic" ? (
        <View style={styles.section}>
          <FormInput
            label="Name"
            value={form.name}
            onChangeText={(value) => updateField("name", value)}
          />
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsCategoryPickerOpen(true)}
              style={styles.selectButton}
            >
              <PickerLabel
                icon="noodles"
                isPlaceholder={!form.category}
                value={form.category || "Select a category"}
              />
            </Pressable>
          </View>
          <FormInput
            label="Description"
            value={form.description}
            onChangeText={(value) => updateField("description", value)}
            multiline
          />
        </View>
      ) : null}

      {currentStep.key === "location" ? (
        <View style={styles.section}>
          <FormInput
            label="Address"
            value={form.addressText}
            onChangeText={(value) => updateField("addressText", value)}
          />
          <View style={styles.field}>
            <Text style={styles.label}>City</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyFieldText}>{form.city}</Text>
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>District</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsDistrictPickerOpen(true)}
              style={styles.selectButton}
            >
              <PickerLabel
                icon="home-city-outline"
                isPlaceholder={!form.district}
                value={form.district || "Select a district"}
              />
            </Pressable>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Ward</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsWardPickerOpen(true)}
              disabled={!selectedDistrict}
              style={[
                styles.selectButton,
                !selectedDistrict ? styles.buttonDisabled : null,
              ]}
            >
              <PickerLabel
                icon="map-marker-outline"
                isPlaceholder={!form.ward}
                value={form.ward || "Select a ward"}
              />
            </Pressable>
          </View>
          <Text style={styles.label}>Pick location on map</Text>
          <Text style={styles.helperText}>
            Select district and ward to place the pin, then drag it if needed.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={useCurrentLocation}
            disabled={isLocating}
            style={[styles.locationButton, isLocating ? styles.buttonDisabled : null]}
          >
            <View style={styles.locationButtonInner}>
              <MaterialCommunityIcons
                color={colors.primary}
                name={isLocating ? "crosshairs-gps" : "map-marker-account"}
                size={18}
              />
              <Text style={styles.locationButtonText}>
                {isLocating ? "Locating..." : "Use Current Location"}
              </Text>
            </View>
          </Pressable>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={onMapPress}
          >
            <Marker
              coordinate={markerCoordinate}
              draggable
              onDragEnd={(event) =>
                onMarkerDragEnd(
                  event.nativeEvent.coordinate.latitude,
                  event.nativeEvent.coordinate.longitude,
                )
              }
            />
          </MapView>
          <Text style={styles.coordinateText}>
            {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
          </Text>
        </View>
      ) : null}

      {currentStep.key === "price" ? (
        <View style={styles.section}>
          <FormInput
            label="Price Min (VND)"
            value={form.priceMin}
            onChangeText={(value) => updateField("priceMin", value)}
            keyboardType="numeric"
          />
          <FormInput
            label="Price Max (VND)"
            value={form.priceMax}
            onChangeText={(value) => updateField("priceMax", value)}
            keyboardType="numeric"
          />
        </View>
      ) : null}

      {currentStep.key === "review" ? (
        <View style={styles.section}>
          <SummaryRow label="Name" value={form.name || "-"} />
          <SummaryRow label="Category" value={form.category || "-"} />
          <SummaryRow label="Address" value={form.addressText || "-"} />
          <SummaryRow
            label="District / City"
            value={`${form.district || "-"} / ${form.ward || "-"} / ${form.city || "-"}`}
          />
          <SummaryRow
            label="Price"
            value={`${form.priceMin || "-"} - ${form.priceMax || "-"}`}
          />
          <SummaryRow
            label="Coordinates"
            value={`${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`}
          />
          {form.description ? (
            <SummaryRow label="Description" value={form.description} />
          ) : null}
          <View style={styles.photoSection}>
            <Text style={styles.label}>Photos</Text>
            <Text style={styles.helperText}>Add up to 3 photos for the vendor.</Text>
            <Pressable accessibilityRole="button" onPress={addPhotos} style={styles.photoButton}>
              <View style={styles.photoButtonRow}>
                <MaterialCommunityIcons color={colors.primary} name="image-plus" size={18} />
                <Text style={styles.photoButtonText}>Add Photos</Text>
              </View>
            </Pressable>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoPreviewRow}>
              {form.photos.map((photo, index) => (
                <View key={`${photo.uri}-${index}`} style={styles.photoPreviewCard}>
                  <Image source={{ uri: photo.uri }} style={styles.photoPreviewImage} />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removePhoto(index)}
                    style={styles.photoRemoveButton}
                  >
                    <MaterialCommunityIcons color={colors.secondary} name="close" size={14} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <View style={styles.footer}>
        {canGoBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.secondaryButton}>
            <ButtonText icon="arrow-left" label="Back" tone="secondary" />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}

        {canGoNext ? (
          <Pressable accessibilityRole="button" onPress={onNext} style={styles.primaryButton}>
            <ButtonText icon="arrow-right-circle" label="Next" />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={submitVendor.isPending || !isAuthenticated}
            onPress={onSubmit}
            style={[
              styles.primaryButton,
              submitVendor.isPending || !isAuthenticated ? styles.buttonDisabled : null,
            ]}
          >
            <ButtonText
              icon={submitVendor.isPending ? "loading" : "sticker-check-outline"}
              label={submitVendor.isPending ? "Submitting..." : "Submit Vendor"}
            />
          </Pressable>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isCategoryPickerOpen}
        onRequestClose={() => setIsCategoryPickerOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCategoryPickerOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Choose a category</Text>
            {vendorCategories.map((category) => (
              <Pressable
                key={category}
                accessibilityRole="button"
                onPress={() => {
                  updateField("category", category);
                  setIsCategoryPickerOpen(false);
                  setSubmitError(null);
                }}
                style={[
                  styles.modalOption,
                  form.category === category ? styles.modalOptionActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    form.category === category ? styles.modalOptionTextActive : null,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={isDistrictPickerOpen}
        onRequestClose={() => setIsDistrictPickerOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDistrictPickerOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Choose a district</Text>
            {hcmcDistricts.map((district) => (
              <Pressable
                key={district.name}
                accessibilityRole="button"
                onPress={() => selectDistrict(district.name)}
                style={[
                  styles.modalOption,
                  form.district === district.name ? styles.modalOptionActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    form.district === district.name ? styles.modalOptionTextActive : null,
                  ]}
                >
                  {district.name}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={isWardPickerOpen}
        onRequestClose={() => setIsWardPickerOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsWardPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Choose a ward</Text>
            {availableWards.length === 0 ? (
              <Text style={styles.helperText}>Select a district first.</Text>
            ) : null}
            {availableWards.map((ward) => (
              <Pressable
                key={ward.name}
                accessibilityRole="button"
                onPress={() => selectWard(ward.name)}
                style={[
                  styles.modalOption,
                  form.ward === ward.name ? styles.modalOptionActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    form.ward === ward.name ? styles.modalOptionTextActive : null,
                  ]}
                >
                  {ward.name}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function PickerLabel({
  icon,
  isPlaceholder,
  value,
}: {
  icon: IconName;
  isPlaceholder?: boolean;
  value: string;
}) {
  return (
    <View style={styles.selectButtonInner}>
      <MaterialCommunityIcons color={colors.gold} name={icon} size={18} />
      <Text
        style={[
          styles.selectButtonText,
          !isPlaceholder ? styles.selectValueText : null,
          isPlaceholder ? styles.selectPlaceholderText : null,
        ]}
      >
        {value}
      </Text>
      <MaterialCommunityIcons color={colors.primary} name="chevron-down" size={18} />
    </View>
  );
}

function ButtonText({
  icon,
  label,
  tone = "primary",
}: {
  icon: IconName;
  label: string;
  tone?: "primary" | "secondary";
}) {
  const iconColor = tone === "primary" ? colors.secondary : colors.primary;

  return (
    <View style={styles.buttonTextRow}>
      <MaterialCommunityIcons color={iconColor} name={icon} size={18} />
      <Text style={tone === "primary" ? styles.primaryButtonText : styles.secondaryButtonText}>
        {label}
      </Text>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline ? styles.multilineInput : null]}
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="sentences"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: colors.textMuted,
  },
  note: {
    marginBottom: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },
  section: {
    gap: 12,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  field: {
    marginBottom: 4,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  helperText: {
    marginTop: -6,
    fontSize: 13,
    color: colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.secondary,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.secondary,
  },
  selectButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.secondaryStrong,
  },
  readOnlyFieldText: {
    fontSize: 15,
    color: colors.text,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  selectValueText: {
    fontWeight: "700",
  },
  selectPlaceholderText: {
    color: colors.textMuted,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  map: {
    height: 280,
    borderRadius: 14,
    marginTop: 6,
  },
  coordinateText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  locationButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.secondaryStrong,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  locationButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  summaryRow: {
    gap: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 15,
    color: colors.text,
  },
  photoSection: {
    gap: 10,
    paddingTop: 4,
  },
  photoButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  photoButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  photoPreviewRow: {
    gap: 10,
  },
  photoPreviewCard: {
    position: "relative",
  },
  photoPreviewImage: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: colors.secondaryStrong,
  },
  photoRemoveButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  error: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  spacer: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "800",
  },
  buttonTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 24, 39, 0.35)",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  modalOption: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.secondary,
  },
  modalOptionActive: {
    backgroundColor: colors.primary,
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  modalOptionTextActive: {
    color: colors.secondary,
    fontWeight: "800",
  },
});
