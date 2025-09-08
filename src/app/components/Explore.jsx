"use client";

import { useEffect, useState } from "react";
import api, { setAuthToken } from "../services/api";

export default function Explore({ profilePosts, setProfilePosts }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) setAuthToken(token);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(res.data.items || []);
      } catch (err) {
        console.error("Error fetching posts:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle Like
  const handleLike = async (postId) => {
    if (!token) return alert("Please login to like posts");

    try {
      const res = await api.post(`/posts/${postId}/like`);
      const liked = res.data.status === "liked";

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes_count: liked ? (p.likes_count || 0) + 1 : (p.likes_count || 0) - 1,
                likes: liked
                  ? [...(p.likes || []), token]
                  : p.likes.filter((id) => id !== token),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error liking post:", err.response?.data || err.message);
    }
  };

  // Handle Comment
  const handleComment = async (postId) => {
    if (!token) return alert("Please login to comment");
    const text = commentTexts[postId];
    if (!text?.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comments`, { text });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments_count: (p.comments_count || 0) + 1,
                comments: [...(p.comments || []), res.data.comment],
              }
            : p
        )
      );

      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto mt-6">
        <h2 className="text-xl font-bold mb-4">Explore</h2>
        {loading ? (
          <p className="text-gray-500 text-center">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center">No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-white border rounded-lg shadow mb-6">
              {/* User Info */}
              <div className="flex items-center px-4 py-2">
                <img
                  src={post.user?.avatar || "/default-avatar.png"}
                  alt="user"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="font-medium">{post.user?.username || "Unknown"}</span>
              </div>

              {/* Post Image */}
              <img src={post.image_url} alt="Post" className="w-full max-h-[500px] object-cover" />

              {/* Actions */}
              <div className="flex items-center gap-4 px-4 py-2">
                <button
                  onClick={() => handleLike(post._id)}
                  className="text-sm font-medium text-blue-600"
                >
                  {post.likes?.includes(token) ? "❤️ Unlike" : "🤍 Like"}
                </button>
                <span className="text-gray-500 text-sm">{post.likes_count || 0} likes</span>
                <span className="text-gray-500 text-sm">{post.comments_count || 0} comments</span>
              </div>

              {/* Caption */}
              {post.caption && (
                <p className="px-4 text-sm">
                  <span className="font-medium">{post.user?.username} </span>
                  {post.caption}
                </p>
              )}

              {/* Comments */}
              <div className="px-4 mt-2 space-y-1">
                {(post.comments || []).map((c) => (
                  <div key={c._id} className="text-sm">
                    <span className="font-medium">{c.username}:</span> {c.text}
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="px-4 py-2 flex gap-2 border-t">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentTexts[post._id] || ""}
                  onChange={(e) =>
                    setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))
                  }
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => handleComment(post._id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Post
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
