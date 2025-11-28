import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const CURRENT_KEY = "rt_current_user";
const API_BASE = "http://127.0.0.1:8000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_KEY));
    } catch {
      return null;
    }
  });

  useEffect(
    () => localStorage.setItem(CURRENT_KEY, JSON.stringify(user)),
    [user]
  );

  const register = async ({ name, email, password }) => {
    if (!email || !password) throw new Error("Email and password are required");
    // map frontend email -> backend username
    const username = email;
    const resp = await fetch(`${API_BASE}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, user_password: password }),
      credentials: "include",
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || JSON.stringify(data));
    const newUser = {
      id: data.user_id,
      name: name || username.split("@")[0],
      email: username,
    };
    setUser(newUser);
    return newUser;
  };

  const login = async ({ email, password }) => {
    const username = email;
    const resp = await fetch(`${API_BASE}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, user_password: password }),
      credentials: "include",
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || JSON.stringify(data));
    const logged = {
      id: data.user_id,
      name: data.username || username.split("@")[0],
      email: username,
    };
    setUser(logged);
    return logged;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // ignore network errors during logout
    }
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
