import React from "react";
import { colors } from "../theme";

interface Props {
  onStartSurvey: () => void;
  onViewResults: (surveyId?: string) => void;
  onGoToExisting: () => void;
}

export default function DashboardView({ onStartSurvey, onViewResults, onGoToExisting }: Props) {
  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Burrow Builder</h1>
          <div className="header-subtitle">Welcome to Warren—dig in.</div>
        </div>
        <div className="header-search-container">
          <input
            type="text"
            placeholder="Search here"
            className="header-search-input"
          />
          <button className="header-search-button">🔍</button>
        </div>
        <div className="header-user-info">
          <div className="header-user-text">
            <p className="header-username">Megan Riley</p>
            <p className="header-userorg">4th | Flanders Elementary</p>
          </div>
          <div className="header-avatar" />
        </div>
      </div>
      <h2 className="dashboard-hero">Dig Your Burrow!</h2>
      <div className="action-card" onClick={onStartSurvey}>
        Dig New Burrow
      </div>
      <div className="action-card" onClick={onGoToExisting}>
        Existing Surveys
      </div>
      <div className="action-card" onClick={() => onViewResults()}>
        The Den (Survey Results)
      </div>
    </div>
  );
}
