import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import TextField from "@/components/TextField";
import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import type { AuthStackParamList } from "@/navigation/types";
import type { NormalizedApiError } from "@/api/client";

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { signup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setFormError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await signup({ username: username.trim(), email: email.trim(), password });
    } catch (err) {
      const apiErr = err as NormalizedApiError;
      setFieldErrors(apiErr.fieldErrors);
      setFormError(Object.keys(apiErr.fieldErrors).length ? null : apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1 text-3xl font-bold text-gray-900">Create account</Text>
        <Text className="mb-8 text-base text-gray-500">
          Join the feed and start sharing
        </Text>

        <TextField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          error={fieldErrors.username}
          placeholder="alice"
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={fieldErrors.email}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={fieldErrors.password}
          placeholder="At least 6 characters"
        />

        {formError ? (
          <Text className="mb-4 text-sm text-red-500">{formError}</Text>
        ) : null}

        <PrimaryButton label="Sign up" onPress={handleSignup} loading={loading} />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-gray-500">Already have an account? </Text>
          <Text
            className="text-sm font-semibold text-brand-600"
            onPress={() => navigation.navigate("Login")}
          >
            Log in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
