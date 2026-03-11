import { useMutation } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import { useLanguage } from "../i18n/LanguageProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "PhoneAuth">;

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "VN", name: "Vietnam", dialCode: "+84" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "US", name: "United States", dialCode: "+1" },
];

const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0];

export function PhoneAuthScreen({ navigation }: Props) {
  const { isAuthenticated, requestCode } = useAuth();
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  }, [isAuthenticated, navigation]);

  const requestCodeMutation = useMutation({
    mutationFn: async (value: string) => requestCode(value),
    onSuccess: () => {
      setSubmitError(null);
      navigation.navigate("VerifyCode", {
        phoneNumber: buildFullPhoneNumber(phoneNumber, selectedCountry.dialCode),
      });
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Could not request code.");
    },
  });

  function onSubmit() {
    const normalizedPhoneNumber = buildFullPhoneNumber(
      phoneNumber,
      selectedCountry.dialCode,
    );

    if (!normalizedPhoneNumber || normalizedPhoneNumber === selectedCountry.dialCode) {
      setSubmitError(t("enterPhoneNumber"));
      return;
    }

    setSubmitError(null);
    requestCodeMutation.mutate(normalizedPhoneNumber);
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroShape} />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Local food, local people</Text>
        <Text style={styles.title}>{t("signInTitle")}</Text>
        <Text style={styles.subtitle}>{t("signInSubtitle")}</Text>

        <View style={styles.phoneRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsCountryModalVisible(true)}
            style={styles.countryButton}
          >
            <Text style={styles.countryButtonText}>
              {selectedCountry.code} {selectedCountry.dialCode}
            </Text>
          </Pressable>

          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="901234567"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            autoCapitalize="none"
            style={[styles.input, styles.phoneInput]}
          />
        </View>

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={onSubmit}
          disabled={requestCodeMutation.isPending}
          style={[styles.button, requestCodeMutation.isPending ? styles.buttonDisabled : null]}
        >
          <Text style={styles.buttonText}>
            {requestCodeMutation.isPending ? t("sending") : t("sendCode")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>{t("continueAsGuest")}</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isCountryModalVisible}
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsCountryModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("selectCountry")}</Text>
            {COUNTRY_OPTIONS.map((country) => (
              <Pressable
                key={country.code}
                accessibilityRole="button"
                onPress={() => {
                  setSelectedCountry(country);
                  setIsCountryModalVisible(false);
                }}
                style={styles.countryOption}
              >
                <Text style={styles.countryOptionText}>
                  {country.name} ({country.dialCode})
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function buildFullPhoneNumber(phoneNumber: string, dialCode: string): string {
  const localNumber = phoneNumber.replace(/[^\d]/g, "").replace(/^0+/, "");
  return `${dialCode}${localNumber}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: colors.secondary,
  },
  heroShape: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.secondaryStrong,
  },
  card: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  eyebrow: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.secondaryStrong,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 16,
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 20,
  },
  countryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: colors.secondary,
  },
  countryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.secondary,
  },
  phoneInput: {
    flex: 1,
  },
  button: {
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(31, 26, 26, 0.22)",
  },
  modalCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 16,
  },
  modalTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  countryOption: {
    paddingVertical: 14,
  },
  countryOptionText: {
    fontSize: 15,
    color: colors.text,
  },
});
