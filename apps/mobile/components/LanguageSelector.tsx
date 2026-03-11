import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../i18n/LanguageProvider";
import { colors } from "../theme/colors";

export function LanguageSelector() {
  const { language, options, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const activeOption = options.find((option) => option.code === language) ?? options[0];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerFlag}>{getFlag(activeOption.code)}</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.sheet}>
            {options.map((option) => {
              const isActive = option.code === language;

              return (
                <Pressable
                  key={option.code}
                  accessibilityRole="button"
                  onPress={() => {
                    void setLanguage(option.code);
                    setIsOpen(false);
                  }}
                  style={[styles.option, isActive ? styles.activeOption : null]}
                >
                  <Text style={styles.optionFlag}>{getFlag(option.code)}</Text>
                  <Text style={[styles.optionText, isActive ? styles.activeOptionText : null]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function getFlag(languageCode: string): string {
  switch (languageCode) {
    case "vi":
      return "🇻🇳";
    case "ja":
      return "🇯🇵";
    case "en":
    default:
      return "🇺🇸";
  }
}

const styles = StyleSheet.create({
  trigger: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  triggerFlag: {
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 88,
    paddingRight: 16,
    backgroundColor: "rgba(17, 24, 39, 0.12)",
  },
  sheet: {
    width: 180,
    borderRadius: 20,
    padding: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activeOption: {
    backgroundColor: colors.secondaryStrong,
  },
  optionFlag: {
    fontSize: 18,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  activeOptionText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
