import React from "react";
import { colors } from "../theme";

interface Props {
  onStartSurvey: () => void;
  onViewResults: (surveyId?: string) => void;
}

export default function DashboardView({ onStartSurvey, onViewResults }: Props) {
  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ margin: 0, color: colors.primaryText }}>Burrow Builder</h1>
          <div style={{ fontSize: 14, color: colors.secondaryText }}>
            Welcome to Warren—dig in.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            placeholder="Search here"
            style={{
              padding: "0.5rem",
              borderRadius: 4,
              border: `1px solid ${colors.border}`,
            }}
          />
          <button
            style={{
              padding: "0.5rem",
              borderRadius: "50%",
              border: `1px solid ${colors.border}`,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            🔍
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600 }}>Megan Riley</div>
            <div style={{ fontSize: 12 }}>4th | Flanders Elementary</div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#ccc",
            }}
          />
        </div>
      </div>
      <h2 style={{ color: colors.primaryText }}>Dig Your Burrow!</h2>
      <div className="action-card" onClick={onStartSurvey}>
        Dig New Burrow
      </div>
      <div className="action-card" onClick={() => onViewResults()}>
        The Den (Survey Results)
      </div>
    </div>
  );
}
