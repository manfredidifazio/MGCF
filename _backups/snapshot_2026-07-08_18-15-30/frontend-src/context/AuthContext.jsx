import { createContext, useContext, useEffect, useState } from "react";

import { me } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const initialToken = localStorage.getItem("token");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(Boolean(initialToken));

  useEffect(() => {
    if (!initialToken) return;
    me()
      .then((profile) => {
        localStorage.setItem("user", JSON.stringify(profile));
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [initialToken]);

  const loginUser = (token, profile) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);
  };

  const updateUser = (profile) => {
    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
