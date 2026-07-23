import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Avatar from "./Avatar";
import { timeAgo } from "@/utils/date";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  onToggleLike: (post: Post) => void;
  onOpenComments: (post: Post) => void;
  onPressAuthor?: (username: string) => void;
}

export default function PostCard({
  post,
  onToggleLike,
  onOpenComments,
  onPressAuthor,
}: PostCardProps) {
  // Optimistic UI so a like feels instant even before the API responds.
  const [optimistic, setOptimistic] = useState<{ liked: boolean; count: number } | null>(null);
  const liked = optimistic?.liked ?? post.likedByMe;
  const likeCount = optimistic?.count ?? post.likeCount;

  const handleLike = () => {
    setOptimistic({ liked: !liked, count: likeCount + (liked ? -1 : 1) });
    onToggleLike(post);
  };

  return (
    <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Pressable
        className="flex-row items-center"
        onPress={() => onPressAuthor?.(post.author.username)}
      >
        <Avatar username={post.author.username} size={38} />
        <View className="ml-3">
          <Text className="text-[15px] font-semibold text-gray-900">
            {post.author.username}
          </Text>
          <Text className="text-xs text-gray-400">{timeAgo(post.createdAt)} ago</Text>
        </View>
      </Pressable>

      <Text className="mt-3 text-[15px] leading-5 text-gray-800">{post.text}</Text>

      <View className="mt-4 flex-row items-center border-t border-gray-100 pt-3">
        <Pressable className="flex-row items-center" onPress={handleLike} hitSlop={8}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#DB2777" : "#6B7280"}
          />
          <Text className={`ml-1.5 text-sm ${liked ? "text-pink-600" : "text-gray-500"}`}>
            {likeCount}
          </Text>
        </Pressable>

        <Pressable
          className="ml-6 flex-row items-center"
          onPress={() => onOpenComments(post)}
          hitSlop={8}
        >
          <Ionicons name="chatbubble-outline" size={19} color="#6B7280" />
          <Text className="ml-1.5 text-sm text-gray-500">{post.commentCount}</Text>
        </Pressable>
      </View>

      {post.comments.length > 0 && (
        <View className="mt-3 border-t border-gray-50 pt-3">
          {post.comments.slice(0, 2).map((comment) => (
            <View key={comment.id} className="mb-1.5 flex-row">
              <Text className="text-[13px] font-semibold text-gray-800">
                {comment.author.username}{" "}
              </Text>
              <Text className="flex-1 text-[13px] text-gray-600">{comment.text}</Text>
            </View>
          ))}
          {post.commentCount > 2 && (
            <Pressable onPress={() => onOpenComments(post)}>
              <Text className="mt-0.5 text-[13px] text-gray-400">
                View all {post.commentCount} comments
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
