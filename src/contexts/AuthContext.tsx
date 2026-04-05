import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: UserRole, company?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string) => {
    const found = mockUsers.find((u) => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    // For demo, create a temp user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role: "candidate",
    };
    setUser(newUser);
    return true;
  }, []);

  const signup = useCallback((name: string, email: string, _password: string, role: UserRole, company?: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      company: role === "company" ? company : undefined,
    };
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
