import React from "react";
import { colors } from "../theme";

interface Props {
  active: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ active, onNavigate, onLogout }: Props) {
  const item = (label: string, page?: string, handler?: () => void) => (
    <div
      className={`sidebar-item ${active === page ? "active" : ""}`}
      onClick={handler || (() => page && onNavigate(page))}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" && (handler || page)) {
          (handler || (() => onNavigate(page as string)))();
        }
      }}
    >
      {label}
    </div>
  );

  return (
    <div className="sidebar" style={{ background: colors.primaryDarkBlue }}>
      <div className="sidebar-logo">
        <div style={{ fontSize: 24, fontWeight: 700 }}>Warren</div>
        <div style={{ fontSize: 12 }}>powered by Nesolagus</div>
      </div>
      {item("Dashboard", "dashboard")}
      {item("Burrow Builder", "builder")}
      {item("The Den", "results")}
      <hr className="sidebar-separator" />
      {item("Account")}
      {item("Settings")}
      <hr className="sidebar-separator" />
      {item("FAQs")}
      {item("Feedback")}
      {item("Log Out", undefined, onLogout)}
    </div>
  );
}
