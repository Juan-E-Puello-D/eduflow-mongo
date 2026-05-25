import React, { createContext, useContext, useState, type ReactNode } from "react";

type Role = "student" | "instructor";

interface AuthContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: Role;
  setUserRole: (r: Role) => void;
  isLoggedIn: boolean;
  userName: string;
  login: (name: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<string>("home");
  const [userRole, setUserRoleState] = useState<Role>("instructor");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const setActiveTab = (tab: string) => setActiveTabState(tab);
  const setUserRole = (r: Role) => setUserRoleState(r);

  const login = (name: string, role: Role) => {
    setUserName(name);
    setUserRoleState(role);
    setIsLoggedIn(true);
    setActiveTabState("home");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setActiveTabState("home");
  };

  return (
    <AuthContext.Provider value={{
      activeTab, setActiveTab,
      userRole, setUserRole,
      isLoggedIn, userName,
      login, logout,
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
