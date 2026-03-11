export type AuthUser = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
};

export type AuthSession = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
};

export type RequestPhoneCodeInput = {
  phoneNumber: string;
};

export type VerifyPhoneCodeInput = {
  phoneNumber: string;
  code: string;
};
