"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // 👇 Future me yahan /me API call karke user data fetch kar sakte ho
    setUser({ username: "Guest User" });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        InstaApp
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-blue-600"
        >
          Dashboard
        </button>

        <button
          onClick={() => router.push("/profile")}
          className="hover:text-blue-600"
        >
          Profile
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
