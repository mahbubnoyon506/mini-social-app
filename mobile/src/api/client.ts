import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import { tokenStorage } from "@/utils/tokenStorage";
import type { ApiErrorBody } from "@/types";

// Falls back to app.json's `extra.apiUrl` if the env var isn't set.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request once the user is logged in.
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Called by the auth layer when a 401 comes back so the whole app
 * can react (e.g. redirect to the login screen).
 */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(normalizeApiError(error));
  },
);

export interface NormalizedApiError {
  message: string;
  fieldErrors: Record<string, string>;
  status?: number;
}

/** Turns any axios error into a consistent shape the UI can render directly. */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    const fieldErrors: Record<string, string> = {};
    body?.errors?.forEach((e) => {
      fieldErrors[e.field] = e.message;
    });
    return {
      message:
        body?.message ||
        error.message ||
        "Something went wrong. Please try again.",
      fieldErrors,
      status: error.response?.status,
    };
  }
  return {
    message: "Something went wrong. Please try again.",
    fieldErrors: {},
  };
}
