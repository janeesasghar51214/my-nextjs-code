"use client";
import { useState } from "react";
import api from "../services/api";

export default function PostModal({ post, onClose }) {
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");

  // 🔹 Like / Unlike toggle
  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      if (res.data.status === "liked") {
        setLikes(likes + 1);
      } else if (res.data.status === "unliked") {
        setLikes(likes - 1);
      }
    } catch (err) {
      console.error("Like failed:", err.response?.data || err.message);
    }
  };

  // 🔹 Add Comment
  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/posts/${post._id}/comment`, {
        text: newComment,
      });
      // backend returns { ok, comments_count, latest }
      setComments(res.data.latest);
      setNewComment("");
    } catch (err) {
      console.error("Comment failed:", err.response?.data || err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white rounded-lg flex w-[80%] h-[80%] overflow-hidden">
        {/* Left - Image */}
        <div className="w-2/3 bg-black flex items-center justify-center">
          <img
            src={post.image_url}
            alt="Post"
            className="max-h-full max-w-full"
          />
        </div>

        {/* Right - Details */}
        <div className="w-1/3 flex flex-col p-4">
          <h2 className="font-bold text-lg">{post.user?.username || "User"}</h2>
          <p className="text-gray-600 mb-2">{post.caption}</p>

          <div className="flex gap-4 mb-4">
            <button onClick={handleLike}>❤️ {likes}</button>
            <button>💬 {comments.length}</button>
            <button>↗️ Share</button>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto border-t pt-2">
            {comments.map((c, i) => (
              <p key={i} className="text-sm mb-1">
                <span className="font-bold">{c.username || "User"}:</span>{" "}
                {c.text}
              </p>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Add a comment..."
            />
            <button
              onClick={handleComment}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl"
      >
        ✖
      </button>
    </div>
  );
}
