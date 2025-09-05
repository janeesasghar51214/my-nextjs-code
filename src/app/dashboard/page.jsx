"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/auth/login");
          return;
        }

        const data = await res.json();
        setPosts(data.items || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [router]);

  // Handle Post Upload
  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("image", image);
      formData.append("caption", caption);

      const res = await fetch("http://localhost:8000/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload post");
      }

      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]); // prepend new post
      setShowModal(false);
      setImage(null);
      setCaption("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload post");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading posts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📸 Dashboard - All Posts</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ➕ Add Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <img
                src={post.image_url}
                alt={post.caption}
                className="w-full h-60 object-cover"
              />
              <div className="p-4">
                <p className="font-semibold text-gray-800">{post.caption}</p>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  <span>👍 {post.likes_count}</span>
                  <span>💬 {post.comments_count}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">➕ New Post</h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="mb-3"
            />

            <textarea
              placeholder="Enter a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
