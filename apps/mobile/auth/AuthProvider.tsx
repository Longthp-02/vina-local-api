import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, requestPhoneCode, verifyPhoneCode } from "../api/auth";
import { clearStoredAccessToken, loadStoredAccessToken, setStoredAccessToken } from "./session";
import { AuthUser } from "../types/auth";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  requestCode: (phoneNumber: string) => Promise<void>;
  verifyCode: (phoneNumber: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function hydrateAuth() {
      const token = await loadStoredAccessToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        await clearStoredAccessToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void hydrateAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: Boolean(user),
      user,
      async requestCode(phoneNumber: string) {
        await requestPhoneCode({ phoneNumber });
      },
      async verifyCode(phoneNumber: string, code: string) {
        const session = await verifyPhoneCode({ phoneNumber, code });
        await setStoredAccessToken(session.accessToken);
        setUser(session.user);
      },
      async signOut() {
        await clearStoredAccessToken();
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
