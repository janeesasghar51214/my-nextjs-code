"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../services/api";

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        router.push("/auth/login");
      }
    };

    fetchProfile();
  }, [token, router]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-semibold">Loading profile...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="mb-2"><span className="font-semibold">Username:</span> {profile.username}</p>
        <p className="mb-2"><span className="font-semibold">Email:</span> {profile.email}</p>
        <p className="mb-4"><span className="font-semibold">Joined:</span> {new Date(profile.created_at).toLocaleDateString()}</p>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-3 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
