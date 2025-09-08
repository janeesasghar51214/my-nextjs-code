"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "@/app/services/api";


import AddPostModal from "@/app/components/AddPostModal";
import EditProfileModal from "@/app/components/EditProfileModal";
import PostGrid from "@/app/components/PostGrid";
import PostModal from "@/app/components/PostModal";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showAddPost, setShowAddPost] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        router.push("/auth/login");
        return;
      }

      setAuthToken(token);

      try {
        const profileRes = await api.get("/me");
        const postsRes = await api.get("/posts/me");

        setProfile(profileRes.data);
        setPosts(postsRes.data.items || []);
      } catch (err) {
  console.error("Error fetching profile:", err);

  if (err.response) {
    console.error("Response data:", err.response.data);
    console.error("Status:", err.response.status);
    console.error("Headers:", err.response.headers);
  } else if (err.request) {
    console.error("Request made but no response:", err.request);
  } else {
    console.error("Error setting up request:", err.message);
  }

  router.push("/auth/login");
}
    };

    fetchProfile();
  }, [router]);

  if (!profile) return <p className="p-6 text-center">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Profile Header */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
          />

          {/* Username */}
          <h1 className="text-2xl font-bold mt-4">{profile.username}</h1>

          {/* Bio */}
          <p className="text-gray-600 mt-2">{profile.bio || "No bio yet"}</p>

          {/* Stats */}
          <div className="flex justify-center gap-10 mt-4 text-center">
            <div>
              <span className="font-bold">{posts.length}</span>
              <p className="text-gray-500 text-sm">Posts</p>
            </div>
            <div>
              <span className="font-bold">{profile.followers || 0}</span>
              <p className="text-gray-500 text-sm">Followers</p>
            </div>
            <div>
              <span className="font-bold">{profile.following || 0}</span>
              <p className="text-gray-500 text-sm">Following</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setShowAddPost(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600"
            >
              Add Post
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mt-8" />

        {/* Posts Grid */}
        <div className="mt-6">
          {posts.length > 0 ? (
            <PostGrid posts={posts} onPostClick={setSelectedPost} />
          ) : (
            <p className="text-gray-500 text-center">No posts yet</p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddPost && (
        <AddPostModal
          onClose={() => setShowAddPost(false)}
          onSave={(newPost) => setPosts([newPost, ...posts])}
        />
      )}
      {showEditProfile && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}
