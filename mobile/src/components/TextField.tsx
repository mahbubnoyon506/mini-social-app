import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        className={`rounded-xl border bg-white px-4 py-3 text-base text-gray-900 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
