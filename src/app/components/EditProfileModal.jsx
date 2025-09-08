"use client";

import { useState } from "react";
import api from "../services/api";

export default function EditProfileModal({ user, onClose, onSave }) {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      if (selectedFile) formData.append("avatar", selectedFile);

      const res = await api.patch("/me", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

      onSave(res.data);
      onClose();
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Edit Profile</h2>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
          placeholder="Username"
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
          placeholder="Bio"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="mb-3"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
