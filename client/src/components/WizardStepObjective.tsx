import React, { useState } from "react";
import { colors } from "../theme";
import "../animations.css";

interface Props {
  initialObjective?: string;
  loading: boolean;
  error: string | null;
  onSubmit: (objective: string) => void;
}

export default function WizardStepObjective({ initialObjective = "", loading, error, onSubmit }: Props) {
  const [input, setInput] = useState(initialObjective);
  const [touched, setTouched] = useState(false);
  // For accessibility let user submit with Enter+Ctrl (multiline otherwise)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };
  return (
    <form onSubmit={handleFormSubmit} style={{ maxWidth: 500, margin: "0 auto" }}>
      <label htmlFor="objective" style={{ fontWeight: 600, fontSize: 18, marginBottom: 5, display: "block", color: colors.primaryDarkBlue }}>
        Survey Objective
      </label>
      <textarea
        id="objective"
        rows={4}
        placeholder="What is the goal of your survey? (e.g. 'Understand student well-being')"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
        style={{
          marginBottom: 16,
          padding: "1rem",
          background: "#fff",
          border: "1.6px solid #c6dafc",
          borderRadius: 10,
          fontSize: "1.07rem",
          width: "100%",
          boxSizing: "border-box",
          outline: "none"
        }}
      />
      {/* Error block */}
      {(touched && !input.trim()) && (
        <div className="error" style={{ color: "#d7382a", background: "#fff6f4", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontWeight: 500 }}>
          Objective is required
        </div>
      )}
      {error && <div className="error" style={{ color: "#d7382a", background: "#fff6f4", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontWeight: 500 }}>{error}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          minWidth: 160,
          background: colors.primaryDarkBlue,
          color: "white",
          border: "none",
          fontWeight: 600,
          borderRadius: 7,
          fontSize: 17,
          padding: "12px 28px",
          marginTop: 4,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? undefined : "0 2px 8px rgba(85,124,251,0.08)"
        }}
      >
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="lds-ellipsis" style={{ display: "inline-block", verticalAlign: "middle" }}>
              <span style={{
                display: "inline-block",
                width: 10,
                height: 10,
                margin: "0 1px",
                background: "#fff",
                borderRadius: "50%",
                opacity: 0.55,
                animation: "lds-bounce 1.2s infinite ease-in-out",
                animationDelay: "0s"
              }} />
              <span style={{
                display: "inline-block",
                width: 10,
                height: 10,
                margin: "0 1px",
                background: "#fff",
                borderRadius: "50%",
                opacity: 0.7,
                animation: "lds-bounce 1.2s infinite ease-in-out",
                animationDelay: ".15s"
              }} />
              <span style={{
                display: "inline-block",
                width: 10,
                height: 10,
                margin: "0 1px",
                background: "#fff",
                borderRadius: "50%",
                opacity: 1,
                animation: "lds-bounce 1.2s infinite ease-in-out",
                animationDelay: ".3s"
              }} />
            </span>
            Generating...
          </span>
        ) : (
          "Generate Questions"
        )}
      </button>
    </form>
  );
}