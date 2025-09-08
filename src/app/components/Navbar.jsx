// src/app/components/Navbar.jsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout?.();
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        MySocial
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <Link href="/" className="text-gray-700 hover:text-blue-600 transition font-medium">Home</Link>
        <Link href="/explore" className="text-gray-700 hover:text-blue-600 transition font-medium">Explore</Link>
        <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition font-medium">Profile</Link>
        <Link href="/chats" className="text-gray-700 hover:text-blue-600 transition font-medium">Chats</Link>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">Logout</button>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-blue-600 transition font-medium">Home</Link>
          <Link href="/explore" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-blue-600 transition font-medium">Explore</Link>
          <Link href="/profile" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-blue-600 transition font-medium">Profile</Link>
          <Link href="/chats" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-blue-600 transition font-medium">Chats</Link>
          <button onClick={() => { setIsOpen(false); handleLogout(); }} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">Logout</button>
        </div>
      )}
    </nav>
  );
}
