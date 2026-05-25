import React from "react";
import { useAuth } from "../context/AuthContext";
import Home from "./Home";
import Analytics from "./Analytics";
import DefaultSection from "./DefaultSection";
import Login from "./Login";
import Register from "./Register";

const ContentRouter: React.FC = () => {
  const { activeTab, setActiveTab } = useAuth();

  switch (activeTab) {
    case "login":
      return (
        <Login
          onNavigateToRegister={() => setActiveTab("register")}
        />
      );
    case "register":
      return (
        <Register
          onNavigateToLogin={() => setActiveTab("login")}
        />
      );
    case "home":
      return <Home />;
    case "analytics":
      return <Analytics />;
    default:
      return <DefaultSection activeTab={activeTab} onBack={() => setActiveTab("home")} />;
  }
};

export default ContentRouter;