import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Avatar from "@/components/Avatar";
import PrimaryButton from "@/components/PrimaryButton";
import PostCard from "@/components/PostCard";
import EmptyState from "@/components/EmptyState";
import CommentSheet from "@/components/CommentSheet";
import { useAuth } from "@/context/AuthContext";
import { postsApi } from "@/api/posts";
import type { Post } from "@/types";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const loadMyPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await postsApi.list({ username: user.username, page: 1, limit: 20 });
      setPosts(data.posts);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadMyPosts();
    }, [loadMyPosts])
  );

  const handleToggleLike = async (post: Post) => {
    const result = await postsApi.toggleLike(post.id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, likedByMe: result.liked, likeCount: result.likeCount } : p
      )
    );
  };

  const handleSubmitComment = async (post: Post, text: string) => {
    const result = await postsApi.addComment(post.id, text);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, commentCount: result.commentCount, comments: [...p.comments, result.comment] }
          : p
      )
    );
  };

  if (!user) return null;

  return (
    <View className="flex-1 bg-gray-50 pt-14">
      <View className="items-center px-5 pb-4">
        <Avatar username={user.username} size={72} />
        <Text className="mt-3 text-xl font-bold text-gray-900">{user.username}</Text>
        <Text className="text-sm text-gray-500">{user.email}</Text>
        <View className="mt-4 w-full">
          <PrimaryButton label="Log out" onPress={logout} variant="outline" />
        </View>
      </View>

      {loading ? (
        <View className="mt-10">
          <ActivityIndicator color="#4F46E5" size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState title="You haven't posted yet" subtitle="Your posts will show up here" />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onToggleLike={handleToggleLike}
              onOpenComments={(post) => {
                setActivePost(post);
                setSheetVisible(true);
              }}
            />
          )}
        />
      )}

      <CommentSheet
        post={activePost}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmitComment={handleSubmitComment}
      />
    </View>
  );
}
