import { apiRequest } from "./client";
import {
  AuthSession,
  AuthUser,
  RequestPhoneCodeInput,
  VerifyPhoneCodeInput,
} from "../types/auth";

type RequestPhoneCodeResponse = {
  phoneNumber: string;
  expiresAt: string;
  message: string;
};

export async function requestPhoneCode(
  input: RequestPhoneCodeInput,
): Promise<RequestPhoneCodeResponse> {
  return apiRequest<RequestPhoneCodeResponse>("/auth/request-code", {
    method: "POST",
    body: input,
  });
}

export async function verifyPhoneCode(
  input: VerifyPhoneCodeInput,
): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/verify-code", {
    method: "POST",
    body: input,
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}
