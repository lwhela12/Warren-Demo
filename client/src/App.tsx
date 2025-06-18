import React, { useEffect, useState } from "react";
import Wizard from "./components/Wizard";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import StudentPlaceholder from "./components/StudentPlaceholder";
import ResultsView from "./components/ResultsView";
import DenHome from "./components/DenHome";
import ExistingSurveysView from "./components/ExistingSurveysView";

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
  // hold the id of a survey being edited in the builder
  const [surveyIdToEdit, setSurveyIdToEdit] = useState<string | null>(null);

  const handleNavigate = (p: string, surveyId?: string) => {
    if (p === 'results') {
      setActiveSurveyIdForResults(surveyId || null);
    }
    setPage(p);
    if (p !== 'builder') {
      setSurveyIdToEdit(null);
    }
  };

  const handleLoadSurveyInBuilder = (id: string) => {
    setSurveyIdToEdit(id);
    setPage('builder');
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
          <Wizard surveyIdToLoad={surveyIdToEdit} />
        ) : page === 'existing' ? (
          <ExistingSurveysView onSelectSurvey={handleLoadSurveyInBuilder} />
        ) : (
          <DashboardView
            onStartSurvey={() => {
              setSurveyIdToEdit(null);
              setPage('builder');
            }}
            onViewResults={(surveyId?: string) => handleNavigate('results', surveyId)}
            onGoToExisting={() => setPage('existing')}
          />
        )}
      </div>
    </div>
  );
}
