import { useMutation } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import { useLanguage } from "../i18n/LanguageProvider";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "VerifyCode">;

export function VerifyCodeScreen({ navigation, route }: Props) {
  const { phoneNumber } = route.params;
  const { verifyCode } = useAuth();
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const verifyCodeMutation = useMutation({
    mutationFn: async (value: string) => verifyCode(phoneNumber, value),
    onSuccess: () => {
      setSubmitError(null);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Could not verify code.");
    },
  });

  function onSubmit() {
    const normalizedCode = code.trim();

    if (normalizedCode.length !== 6) {
      setSubmitError(t("enterSixDigitCode"));
      return;
    }

    setSubmitError(null);
    verifyCodeMutation.mutate(normalizedCode);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("verifyCodeTitle")}</Text>
        <Text style={styles.subtitle}>{t("verifyCodeSubtitle", { value: phoneNumber })}</Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          autoCapitalize="none"
          style={styles.input}
          maxLength={6}
        />

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={onSubmit}
          disabled={verifyCodeMutation.isPending}
          style={[styles.button, verifyCodeMutation.isPending ? styles.buttonDisabled : null]}
        >
          <Text style={styles.buttonText}>
            {verifyCodeMutation.isPending ? t("verifying") : t("verify")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: colors.secondary,
  },
  card: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 18,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: "center",
    color: colors.text,
    backgroundColor: colors.secondary,
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
  errorText: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 14,
  },
});
