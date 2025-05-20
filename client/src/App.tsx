import React, { useEffect, useState } from "react";
import Wizard from "./components/Wizard";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import StudentPlaceholder from "./components/StudentPlaceholder";

import Login from "./Login";
import "./index.css";

interface AuthInfo {
  token: string | null;
  role: string | null;
}

function useAuthInfo(): AuthInfo {
  const [info, setInfo] = useState<AuthInfo>({
    token: localStorage.getItem("jwt"),
    role: localStorage.getItem("userRole")
  });

  useEffect(() => {
    const handleStorage = () => {
      setInfo({
        token: localStorage.getItem("jwt"),
        role: localStorage.getItem("userRole")
      });
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return info;
}

export default function App() {
  const { token, role } = useAuthInfo();
  const [page, setPage] = useState("dashboard");

  const handleNavigate = (p: string) => {
    if (p === "results") {
      alert("Results to come!");
    } else {
      setPage(p);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  if (!token || !role) {
    return (
      <div className="page-container">
        <Login />
      </div>
    );
  }

  if (role === "student") {
    return <StudentPlaceholder />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active={page} onNavigate={handleNavigate} onLogout={handleLogout} />
      <div className="main-content">
        {page === "builder" ? (
          <Wizard />
        ) : (
          <DashboardView
            onStartSurvey={() => setPage("builder")}
            onViewResults={() => alert("Results to come!")}
          />
        )}
      </div>
    </div>
  );
}
