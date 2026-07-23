import { apiClient } from "./client";
import type { AuthResponse, User } from "@/types";

export const authApi = {
  signup(input: { username: string; email: string; password: string }) {
    return apiClient
      .post<AuthResponse>("/auth/signup", input)
      .then((res) => res.data);
  },

  login(input: { email: string; password: string }) {
    return apiClient
      .post<AuthResponse>("/auth/login", input)
      .then((res) => res.data);
  },

  me() {
    return apiClient.get<User>("/auth/me").then((res) => res.data);
  },

  registerFcmToken(fcmToken: string) {
    return apiClient
      .patch<{ ok?: boolean }>("/auth/fcm-token", { fcmToken })
      .then((res) => res.data);
  },
};
