"use client";
import { createContext, useContext, useState } from "react";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (emailOrUsername, password) => {
    const res = await api.post("/auth/login", { email_or_username: emailOrUsername, password });
    setToken(res.data.access_token);
    setAuthToken(res.data.access_token);
    const me = await api.get("/me");
    setUser(me.data);
  };

  const signup = async (email, username, password) => {
    const res = await api.post("/auth/signup", { email, username, password });
    setToken(res.data.access_token);
    setAuthToken(res.data.access_token);
    const me = await api.get("/me");
    setUser(me.data);
  };

  const logout = async () => {
    await api.post("/auth/logout", { access_token: token });
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
