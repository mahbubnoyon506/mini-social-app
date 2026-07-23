import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "msf_auth_token";

async function getStoredValue(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

async function setStoredValue(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function clearStoredValue(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

/**
 * Thin wrapper around secure storage with a fallback to AsyncStorage so the rest of the app never
 * touches the storage API directly (makes it trivial to swap later).
 */
export const tokenStorage = {
  async get(): Promise<string | null> {
    return getStoredValue(TOKEN_KEY);
  },
  async set(token: string): Promise<void> {
    await setStoredValue(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    await clearStoredValue(TOKEN_KEY);
  },
};
