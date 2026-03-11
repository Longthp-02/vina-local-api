import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGE_OPTIONS, LanguageCode, translations } from "./translations";

const LANGUAGE_KEY = "vinal-local.language";
const DEFAULT_LANGUAGE: LanguageCode = "vi";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: keyof (typeof translations)["vi"], params?: Record<string, string>) => string;
  options: typeof LANGUAGE_OPTIONS;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);

      if (stored === "vi" || stored === "en" || stored === "ja") {
        setLanguageState(stored);
      }

      setIsLoading(false);
    }

    void loadLanguage();
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      async setLanguage(nextLanguage: LanguageCode) {
        setLanguageState(nextLanguage);
        await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
      },
      t(key, params) {
        const template = String(translations[language][key]);

        if (!params) {
          return template;
        }

        return Object.entries(params).reduce<string>(
          (result, [paramKey, value]) =>
            result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), value),
          template,
        );
      },
      options: LANGUAGE_OPTIONS,
      isLoading,
    }),
    [isLoading, language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
