// src/app/chats/page.jsx
"use client";

import { useEffect, useState } from "react";
import api, { setAuthToken } from "../services/api";
import ChatBox from "../components/Chatbox";
import { useRouter } from "next/navigation";

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]); // all users (for starting new chat)
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setAuthToken(token);

    const fetchAll = async () => {
      try {
        const [chatsRes, usersRes] = await Promise.allSettled([
          api.get("/chats"),
          api.get("/users") // <-- requires backend GET /users. if not present, will fail and we handle gracefully
        ]);

        if (chatsRes.status === "fulfilled") {
          setChats(chatsRes.value.data.items || []);
        } else {
          console.error("Error fetching chats:", chatsRes.reason);
        }

        if (usersRes.status === "fulfilled") {
          setUsers(usersRes.value.data.items || usersRes.value.data || []);
        } else {
          // not fatal — show message later
          console.warn("Could not fetch users list (backend may not expose /users).");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  const openOrCreateChat = async (otherUserId) => {
    try {
      const res = await api.post(`/chats/${otherUserId}`);
      // response will be the chat object
      const chat = res.data;
      setActiveChat(chat);
      // Add to chats list if not already present
      setChats((prev) => {
        if (!prev.find((c) => c._id === chat._id)) return [chat, ...prev];
        return prev;
      });
    } catch (err) {
      console.error("Error creating/getting chat:", err.response?.data || err.message);
      alert("Unable to open chat. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chats list */}
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-3">Chats</h2>
          {loading ? <p>Loading...</p> : chats.length === 0 ? <p>No chats yet</p> : (
            <div className="space-y-2">
              {chats.map((c) => {
                // find other participant name (not current user)
                const other = (c.participants || []).filter(Boolean).find((p) => p !== localStorage.getItem("userId") && p !== (JSON.parse(localStorage.getItem("user") || "null")?.id));
                const display = c.name || other || c._id;
                return (
                  <div key={c._id} onClick={() => setActiveChat(c)} className="p-2 rounded hover:bg-gray-50 cursor-pointer border">
                    <div className="font-medium">{display}</div>
                    <div className="text-sm text-gray-500">{(c.messages?.length || 0)} messages</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Middle: user list to start new chat */}
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-3">Users</h2>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">User list not available. Ensure backend exposes GET /users returning {"{ items: [...] }"} or similar.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-sm text-gray-500">{u.bio}</div>
                  </div>
                  <button onClick={() => openOrCreateChat(u._id)} className="bg-blue-500 text-white px-3 py-1 rounded">Chat</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active chat */}
        <div className="col-span-1 lg:col-span-1 bg-white p-4 rounded shadow">
          {activeChat ? (
            <ChatBox
              chat={activeChat}
              onClose={() => setActiveChat(null)}
              onUpdate={(updatedChat) => {
                // keep local list and active updated
                setChats((prev) => prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)));
                setActiveChat(updatedChat);
              }}
            />
          ) : (
            <div className="text-center text-gray-500">Select a chat or start a new one</div>
          )}
        </div>
      </div>
    </div>
  );
}
