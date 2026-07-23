import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/api/auth";
import { normalizeApiError, setUnauthorizedHandler } from "@/api/client";
import { tokenStorage } from "@/utils/tokenStorage";
import { syncPushTokenWithBackend } from "@/services/notifications";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signup: (input: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On cold start: if we have a stored token, validate it against /auth/me.
  useEffect(() => {
    (async () => {
      const token = await tokenStorage.get();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me ?? null);
        void syncPushTokenWithBackend();
      } catch {
        await tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Any 401 from the API layer logs the user out immediately.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear();
      setUser(null);
    });
  }, []);

  const signup = useCallback(
    async (input: { username: string; email: string; password: string }) => {
      try {
        const { token, user: newUser } = await authApi.signup(input);
        await tokenStorage.set(token);
        setUser(newUser ?? null);
        void syncPushTokenWithBackend();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    [],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      try {
        const { token, user: loggedInUser } = await authApi.login(input);

        await tokenStorage.set(token);
        setUser(loggedInUser ?? null);
        void syncPushTokenWithBackend();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signup, login, logout }),
    [user, isLoading, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
