// src/components/ChatBox.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import api from "../services/api";

export default function ChatBox({ chat, onClose, onUpdate }) {
  const [messages, setMessages] = useState(chat.messages || []);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    // fetch full chat (messages) to ensure latest
    const fetchChat = async () => {
      try {
        const res = await api.get(`/chats/${chat._id}`);
        setMessages(res.data.messages || []);
        if (onUpdate) onUpdate(res.data);
      } catch (err) {
        console.error("Error fetching chat messages:", err.response?.data || err.message);
      }
    };
    fetchChat();
    // scroll to bottom after messages update
    setTimeout(() => scrollToBottom(), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const payload = { text };
    // optimistic UI
    const tempMsg = {
      _id: `tmp-${Date.now()}`,
      sender_id: localStorage.getItem("userId") || "me",
      text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setText("");
    scrollToBottom();

    try {
      const res = await api.post(`/chats/${chat._id}/message`, payload);
      const saved = res.data.message;
      // replace temp message with saved message
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m._id !== tempMsg._id);
        return [...withoutTemp, saved];
      });
      // notify parent
      if (onUpdate) {
        const updatedChat = { ...chat, messages: [...(chat.messages || []), saved] };
        onUpdate(updatedChat);
      }
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
      // rollback optimistic
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      alert("Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Chat</h3>
        <button onClick={onClose} className="text-gray-500">Close</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 border rounded mb-3">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500">No messages yet</div>
        ) : (
          messages.map((m) => (
            <div key={m._id} className={`mb-2 ${m.sender_id === (localStorage.getItem("userId") || "me") ? "text-right" : "text-left"}`}>
              <div className={`inline-block px-3 py-2 rounded ${m.sender_id === (localStorage.getItem("userId") || "me") ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                <div className="text-sm">{m.text}</div>
                <div className="text-xs text-gray-300 mt-1">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2"
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
