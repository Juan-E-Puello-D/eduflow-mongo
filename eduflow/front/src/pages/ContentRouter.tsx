import React from "react";
import { useAuth } from "../context/AuthContext";
import Home from "./Home";
import Analytics from "./Analytics";
import DefaultSection from "./DefaultSection";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Settings from "./Settings";
import CoursesPage from "./CoursesPage";
import CourseDetail from "./CourseDetail";
import StudentDashboard from "./Dashboard/StudentDashboard";
import InstructorDashboard from "./Dashboard/InstructorDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

const ContentRouter: React.FC = () => {
  const { activeTab, setActiveTab, isLoggedIn, userRole } = useAuth();

  switch (activeTab) {
    case "login":
      return isLoggedIn
        ? <Home />
        : <Login onNavigateToRegister={() => setActiveTab("register")} />;

    case "register":
      return isLoggedIn
        ? <Home />
        : <Register onNavigateToLogin={() => setActiveTab("login")} />;

    case "home":
      return <Home />;

    case "courses":
      return <CoursesPage />;

    case "analytics":
      return (
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      );

    case "instructor":
      return (
        <ProtectedRoute requiredRole="instructor">
          <InstructorDashboard />
        </ProtectedRoute>
      );

    case "dashboard":
      return (
        <ProtectedRoute>
          {userRole === "instructor" ? <InstructorDashboard /> : <StudentDashboard />}
        </ProtectedRoute>
      );

    case "courseDetail":
      return <CourseDetail />;

    case "profile":
      return (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      );

    case "settings":
      return (
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      );

    default:
      return <DefaultSection activeTab={activeTab} onBack={() => setActiveTab("home")} />;
  }
};

export default ContentRouter;