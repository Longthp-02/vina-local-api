import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "vinal-local.access-token";

let accessToken: string | null = null;

export async function loadStoredAccessToken(): Promise<string | null> {
  if (accessToken) {
    return accessToken;
  }

  accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  return accessToken;
}

export async function setStoredAccessToken(token: string): Promise<void> {
  accessToken = token;
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function clearStoredAccessToken(): Promise<void> {
  accessToken = null;
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return loadStoredAccessToken();
}
