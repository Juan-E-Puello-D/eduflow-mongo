import React, { createContext, useContext, useState, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister } from "../services/authService";
import type { Usuario } from "../types/models";

type Role = "student" | "instructor";

interface AuthContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: Role;
  isLoggedIn: boolean;
  userName: string;
  user: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string, rol?: "estudiante" | "instructor") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<string>("home");
  const [user, setUser] = useState<Usuario | null>(null);

  const isLoggedIn = user !== null;
  const userName = user?.nombre ?? "";
  const userRole: Role = user?.rol === "instructor" ? "instructor" : "student";

  const setActiveTab = (tab: string) => setActiveTabState(tab);

  const login = async (email: string, password: string) => {
    const { user: loggedIn } = await apiLogin(email, password);
    setUser(loggedIn);
    setActiveTabState("home");
  };

  const register = async (
    nombre: string,
    email: string,
    password: string,
    rol: "estudiante" | "instructor" = "estudiante"
  ) => {
    const { user: created } = await apiRegister(nombre, email, password, rol);
    setUser(created);
  };

  const logout = () => {
    setUser(null);
    setActiveTabState("home");
  };

  return (
    <AuthContext.Provider value={{
      activeTab, setActiveTab,
      userRole, isLoggedIn, userName, user,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
