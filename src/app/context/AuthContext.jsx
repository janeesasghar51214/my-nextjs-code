"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // ✅ On refresh, restore token & fetch user
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setAuthToken(savedToken);

      // fetch user info
      api
        .get("/me")
        .then((res) => setUser(res.data))
        .catch((err) => {
          console.error("Restore session failed:", err.response?.data || err.message);
          logout();
        });
    }
  }, []);

  // ✅ Login function
  const login = async (emailOrUsername, password) => {
    try {
      const res = await api.post("/auth/login", {
        email_or_username: emailOrUsername,
        password,
      });

      const { access_token, refresh_token } = res.data;

      // save token
      localStorage.setItem("token", access_token);
      setToken(access_token);
      setAuthToken(access_token);

      // fetch user from /me
      const meRes = await api.get("/me");
      setUser(meRes.data);

      router.push("/profile");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ Signup function
  const signup = async (email, username, password) => {
    try {
      await api.post("/auth/signup", { email, username, password });
      router.push("/auth/login");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthToken(null);
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
