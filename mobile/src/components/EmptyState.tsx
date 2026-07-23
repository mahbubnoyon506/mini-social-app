import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyState({
  icon = "newspaper-outline",
  title,
  subtitle,
}: {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="mt-20 items-center px-8">
      <Ionicons name={icon} size={40} color="#D1D5DB" />
      <Text className="mt-3 text-center text-base font-semibold text-gray-500">{title}</Text>
      {subtitle ? (
        <Text className="mt-1 text-center text-sm text-gray-400">{subtitle}</Text>
      ) : null}
    </View>
  );
}
