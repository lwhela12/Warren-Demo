import React, { useEffect, useState } from "react";
import Wizard from "./components/Wizard";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import BranchingSurveyPlayer from "./components/BranchingSurveyPlayer";
import ResultsView from "./components/ResultsView";
import DenHome from "./components/DenHome";

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
  const [activeSurveyIdForResults, setActiveSurveyIdForResults] = useState<string | null>(null);

  const handleNavigate = (p: string, surveyId?: string) => {
    if (p === "results") {
      setActiveSurveyIdForResults(surveyId || null);
      setPage(p);
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
    return <BranchingSurveyPlayer surveyId="active" />;
  }

  // Callback for DenHome to select a specific survey from the list
  const handleSelectSurveyInDen = (surveyId: string) => {
    setActiveSurveyIdForResults(surveyId);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar active={page} onNavigate={handleNavigate} onLogout={handleLogout} />
      <div className="main-content">
        {page === 'results' ? (
          activeSurveyIdForResults ? (
            <ResultsView
              surveyId={activeSurveyIdForResults}
              onGoBackToList={() => setActiveSurveyIdForResults(null)}
            />
          ) : (
            <DenHome onSelectSurvey={handleSelectSurveyInDen} />
          )
        ) : page === 'builder' ? (
          <Wizard />
        ) : (
          <DashboardView
            onStartSurvey={() => setPage('builder')}
            onViewResults={(surveyId?: string) => handleNavigate('results', surveyId)}
          />
        )}
      </div>
    </div>
  );
}
