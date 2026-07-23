import React from "react";
import { Text, View } from "react-native";

const COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#059669",
  "#D97706",
  "#DB2777",
  "#7C3AED",
];

function colorFor(username: string) {
  const sum = username?.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

export default function Avatar({
  username,
  size = 40,
}: {
  username: string;
  size?: number;
}) {
  const initial = username?.trim().charAt(0).toUpperCase() || "?";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colorFor(username),
      }}
      className="items-center justify-center"
    >
      <Text
        style={{ fontSize: size * 0.42 }}
        className="font-semibold text-white"
      >
        {initial}
      </Text>
    </View>
  );
}
