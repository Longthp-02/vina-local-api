import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createVendor } from "../api";
import { RootStackParamList } from "../navigation/types";
import { CreateVendorInput } from "../types/vendor";

type Props = NativeStackScreenProps<RootStackParamList, "AddVendor">;

type FormState = {
  name: string;
  description: string;
  addressText: string;
  district: string;
  city: string;
  category: string;
  priceMin: string;
  priceMax: string;
  latitude: string;
  longitude: string;
};

const initialForm: FormState = {
  name: "",
  description: "",
  addressText: "",
  district: "",
  city: "Ho Chi Minh City",
  category: "",
  priceMin: "",
  priceMax: "",
  latitude: "",
  longitude: "",
};

export function AddVendorScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitVendor = useMutation({
    mutationFn: (input: CreateVendorInput) => createVendor(input),
    onSuccess: async () => {
      setSubmitError(null);
      setForm(initialForm);
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

  function buildPayload(): CreateVendorInput | null {
    const latitude = parseNumber(form.latitude);
    const longitude = parseNumber(form.longitude);

    if (!form.name.trim() || !form.addressText.trim() || !form.district.trim()) {
      setSubmitError("Please fill in name, address, and district.");
      return null;
    }

    if (!form.city.trim() || !form.category.trim()) {
      setSubmitError("Please fill in city and category.");
      return null;
    }

    if (latitude === undefined || longitude === undefined) {
      setSubmitError("Please enter valid latitude and longitude.");
      return null;
    }

    const payload: CreateVendorInput = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      addressText: form.addressText.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      category: form.category.trim(),
      priceMin: parseNumber(form.priceMin),
      priceMax: parseNumber(form.priceMax),
      latitude,
      longitude,
    };

    return payload;
  }

  function onSubmit() {
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
      <Text style={styles.subtitle}>Submit a place for moderation review.</Text>

      <FormInput label="Name" value={form.name} onChangeText={(value) => updateField("name", value)} />
      <FormInput
        label="Description"
        value={form.description}
        onChangeText={(value) => updateField("description", value)}
        multiline
      />
      <FormInput
        label="Address"
        value={form.addressText}
        onChangeText={(value) => updateField("addressText", value)}
      />
      <FormInput
        label="District"
        value={form.district}
        onChangeText={(value) => updateField("district", value)}
      />
      <FormInput label="City" value={form.city} onChangeText={(value) => updateField("city", value)} />
      <FormInput
        label="Category"
        value={form.category}
        onChangeText={(value) => updateField("category", value)}
      />
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
      <FormInput
        label="Latitude"
        value={form.latitude}
        onChangeText={(value) => updateField("latitude", value)}
        keyboardType="decimal-pad"
      />
      <FormInput
        label="Longitude"
        value={form.longitude}
        onChangeText={(value) => updateField("longitude", value)}
        keyboardType="decimal-pad"
      />

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={submitVendor.isPending}
        onPress={onSubmit}
        style={[styles.submitButton, submitVendor.isPending ? styles.submitButtonDisabled : null]}
      >
        <Text style={styles.submitButtonText}>
          {submitVendor.isPending ? "Submitting..." : "Submit Vendor"}
        </Text>
      </Pressable>
    </ScrollView>
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
  keyboardType?: "default" | "numeric" | "decimal-pad";
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: "#4b5563",
  },
  field: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  error: {
    marginTop: 4,
    marginBottom: 10,
    color: "#b91c1c",
    fontSize: 14,
  },
  submitButton: {
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: "#111827",
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
