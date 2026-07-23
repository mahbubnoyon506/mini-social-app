import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Avatar from "./Avatar";
import { timeAgo } from "@/utils/date";
import type { Comment, Post } from "@/types";

interface CommentSheetProps {
  post: Post | null;
  visible: boolean;
  onClose: () => void;
  onSubmitComment: (post: Post, text: string) => Promise<void>;
}

export default function CommentSheet({
  post,
  visible,
  onClose,
  onSubmitComment,
}: CommentSheetProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!post) return null;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmitComment(post, trimmed);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="max-h-[75%] rounded-t-3xl bg-white"
        >
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <Text className="text-base font-semibold text-gray-900">
              Comments ({post.commentCount})
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <FlatList<Comment>
            data={post.comments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            ListEmptyComponent={
              <Text className="mt-6 text-center text-sm text-gray-400">
                No comments yet — be the first to reply.
              </Text>
            }
            renderItem={({ item }) => (
              <View className="mb-4 flex-row">
                <Avatar username={item.author.username} size={32} />
                <View className="ml-2.5 flex-1">
                  <Text className="text-[13px] font-semibold text-gray-900">
                    {item.author.username}{" "}
                    <Text className="text-[11px] font-normal text-gray-400">
                      {timeAgo(item.createdAt)} ago
                    </Text>
                  </Text>
                  <Text className="mt-0.5 text-[14px] text-gray-700">{item.text}</Text>
                </View>
              </View>
            )}
          />

          <View className="flex-row items-center border-t border-gray-100 px-3 py-2">
            <TextInput
              className="mr-2 flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-[14px] text-gray-900"
              placeholder="Add a comment..."
              placeholderTextColor="#9CA3AF"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() || submitting}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                text.trim() ? "bg-brand-600" : "bg-gray-200"
              }`}
            >
              <Ionicons name="send" size={17} color={text.trim() ? "#fff" : "#9CA3AF"} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
