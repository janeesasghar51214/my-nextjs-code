"use client";

import { useState } from "react";
import api from "../services/api";

export default function AddPostModal({ onClose, onSave }) {
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      if (selectedFile) formData.append("image", selectedFile);

      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSave(res.data);
      onClose();
    } catch (err) {
      console.error("Add post failed:", err.response?.data || err.message);
      alert("Failed to add post. Check console for details.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Add New Post</h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="mb-3"
        />

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
          placeholder="Write a caption..."
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
