import React, { useEffect, useState } from "react";
import Wizard from "./components/Wizard";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";

import { API_URL } from "./config";

import Login from "./Login";
import "./index.css";

function useAuthToken() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwt")
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (t) {
      fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t })
      })
        .then(async (r) => {
          if (!r.ok) throw new Error("Invalid token");
          const data = await r.json();
          localStorage.setItem("jwt", data.jwt);
          setToken(data.jwt);
          url.searchParams.delete("token");
          window.history.replaceState({}, "", url.pathname);
        })
        .catch(() => {
          url.searchParams.delete("token");
          window.history.replaceState({}, "", url.pathname);
        });
    }
  }, []);

  return token;
}

export default function App() {
  const token = useAuthToken();
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
    window.location.reload();
  };

  if (!token) {
    return (
      <div className="page-container">
        <Login />
      </div>
    );
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
