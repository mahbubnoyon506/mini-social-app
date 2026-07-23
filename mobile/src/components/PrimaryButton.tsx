import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "solid" | "outline";
}

export default function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "solid",
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const solid = variant === "solid";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center justify-center rounded-xl px-4 py-3.5 ${
        solid ? "bg-brand-600" : "border border-brand-600 bg-transparent"
      } ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={solid ? "#fff" : "#4f46e5"} />
      ) : (
        <Text className={`text-base font-semibold ${solid ? "text-white" : "text-brand-600"}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
