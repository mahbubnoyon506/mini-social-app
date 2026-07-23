import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import PrimaryButton from "@/components/PrimaryButton";
import { postsApi } from "@/api/posts";
import { normalizeApiError } from "@/api/client";

const MAX_LENGTH = 500;

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Write something before posting.");
      return;
    }
    setError(null);
    setPosting(true);
    try {
      await postsApi.create(trimmed);
      setText("");
      navigation.navigate("Feed" as never);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white pt-14"
    >
      <View className="flex-1 px-5">
        <Text className="mb-4 text-2xl font-bold text-gray-900">New post</Text>

        <TextInput
          className="min-h-[140px] rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base text-gray-900"
          placeholder="What's on your mind?"
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={MAX_LENGTH}
          textAlignVertical="top"
          autoFocus
        />
        <Text className="mb-2 mt-1.5 text-right text-xs text-gray-400">
          {text.length}/{MAX_LENGTH}
        </Text>

        {error ? (
          <Text className="mb-3 text-sm text-red-500">{error}</Text>
        ) : null}

        <PrimaryButton label="Post" onPress={handlePost} loading={posting} />
      </View>
    </KeyboardAvoidingView>
  );
}
