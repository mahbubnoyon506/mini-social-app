import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import PostCard from "@/components/PostCard";
import CommentSheet from "@/components/CommentSheet";
import EmptyState from "@/components/EmptyState";
import { postsApi } from "@/api/posts";
import { addNotificationListeners } from "@/services/notifications";
import type { Post } from "@/types";

const PAGE_LIMIT = 10;

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (pageToFetch: number, filter: string, mode: "replace" | "append") => {
      const thisRequest = ++requestId.current;
      try {
        const data = await postsApi.list({
          page: pageToFetch,
          limit: PAGE_LIMIT,
          username: filter || undefined,
        });
        if (thisRequest !== requestId.current) return; // a newer request superseded this one
        setPosts((prev) => (mode === "append" ? [...prev, ...data.posts] : data.posts));
        setPage(data.page);
        setTotalPages(data.totalPages);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const loadInitial = useCallback(
    (filter: string) => {
      setLoading(true);
      fetchPage(1, filter, "replace");
    },
    [fetchPage]
  );

  useEffect(() => {
    loadInitial("");
  }, [loadInitial]);

  // Refresh the feed whenever the app comes back into focus (e.g. after creating a post).
  useFocusEffect(
    useCallback(() => {
      fetchPage(1, appliedFilter, "replace");
    }, [fetchPage, appliedFilter])
  );

  // A like/comment push notification arriving means someone interacted with the feed — refresh it.
  useEffect(() => {
    const unsubscribe = addNotificationListeners({
      onReceive: () => fetchPage(1, appliedFilter, "replace"),
    });
    return unsubscribe;
  }, [fetchPage, appliedFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPage(1, appliedFilter, "replace");
  };

  const handleLoadMore = () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    fetchPage(page + 1, appliedFilter, "append");
  };

  const applyFilter = (value: string) => {
    setAppliedFilter(value);
    loadInitial(value);
  };

  const handleToggleLike = async (post: Post) => {
    try {
      const result = await postsApi.toggleLike(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likedByMe: result.liked, likeCount: result.likeCount } : p
        )
      );
    } catch {
      // Revert optimistic update by re-syncing from the server on failure.
      fetchPage(1, appliedFilter, "replace");
    }
  };

  const handleOpenComments = (post: Post) => {
    setActivePost(post);
    setSheetVisible(true);
  };

  const handleSubmitComment = async (post: Post, text: string) => {
    const result = await postsApi.addComment(post.id, text);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              commentCount: result.commentCount,
              comments: [...p.comments, result.comment],
            }
          : p
      )
    );
    setActivePost((prev) =>
      prev && prev.id === post.id
        ? { ...prev, commentCount: result.commentCount, comments: [...prev.comments, result.comment] }
        : prev
    );
  };

  return (
    <View className="flex-1 bg-gray-50 pt-14">
      <View className="px-4 pb-3">
        <Text className="mb-3 text-2xl font-bold text-gray-900">Feed</Text>
        <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-3">
          <Ionicons name="search" size={17} color="#9CA3AF" />
          <TextInput
            className="ml-2 flex-1 py-2.5 text-[14px] text-gray-900"
            placeholder="Filter by username"
            placeholderTextColor="#9CA3AF"
            value={usernameFilter}
            autoCapitalize="none"
            onChangeText={setUsernameFilter}
            onSubmitEditing={() => applyFilter(usernameFilter.trim())}
            returnKeyType="search"
          />
          {appliedFilter ? (
            <Pressable
              onPress={() => {
                setUsernameFilter("");
                applyFilter("");
              }}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View className="mt-16">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
          }
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          ListEmptyComponent={
            <EmptyState
              icon={appliedFilter ? "person-outline" : "chatbubbles-outline"}
              title={appliedFilter ? `No posts from "${appliedFilter}"` : "No posts yet"}
              subtitle={appliedFilter ? "Try a different username" : "Be the first to share something"}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="my-4">
                <ActivityIndicator color="#4F46E5" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onToggleLike={handleToggleLike}
              onOpenComments={handleOpenComments}
              onPressAuthor={(username) => {
                setUsernameFilter(username);
                applyFilter(username);
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
