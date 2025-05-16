import React from "react";
import { GeneratedQuestion } from "./Wizard";

interface Props {
  objective: string;
  questions: GeneratedQuestion[];
  loading?: boolean;
  error?: string | null;
  onBack: () => void;
}

// Rubric badge color scheme example
const rubricColors: Record<string, { bg: string; color: string }> = {
  Proficient: { bg: "#E3F0DF", color: "#228375" },
  Emerging: { bg: "#FFF4D5", color: "#B68C2E" },
  Developing: { bg: "#F9E6EC", color: "#A23B63" },
  // fallback
  default: { bg: "#D7E8FB", color: "#275488" },
};

function RubricBadge({ tag }: { tag: string }) {
  const color = rubricColors[tag] || rubricColors.default;
  return (
    <span
      style={{
        display: "inline-block",
        background: color.bg,
        color: color.color,
        fontWeight: 600,
        fontSize: 12.7,
        borderRadius: 14,
        padding: "3px 14px",
        marginRight: 6,
      }}
    >
      {tag}
    </span>
  );
}

export default function WizardStepQuestions({ objective, questions, loading, error, onBack }: Props) {
  return (
    <div style={{ width: "100%", maxWidth: 510, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <span style={{ color: "#1B2945", fontSize: 15.5, fontWeight: 600 }}>Survey Objective:</span>{" "}
        <span style={{ fontStyle: "italic", color: "#276EF1", fontSize: 16 }}>{objective}</span>
      </div>
      <h2 style={{ marginTop: 0, fontSize: 22, fontWeight: 700, color: "#121a2f", letterSpacing: 0.5 }}>
        Generated Questions
      </h2>
      {/* loading spinner */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "24px 0" }}>
          <span className="lds-ellipsis" style={{ display: "inline-block" }}>
            <span style={{
              display: "inline-block", width: 10, height: 10, margin: "0 1.2px", background: "#276EF1",
              borderRadius: "50%", opacity: 0.45,
              animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: "0s"
            }} />
            <span style={{
              display: "inline-block", width: 10, height: 10, margin: "0 1.2px", background: "#276EF1",
              borderRadius: "50%", opacity: 0.7,
              animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: ".15s"
            }} />
            <span style={{
              display: "inline-block", width: 10, height: 10, margin: "0 1.2px", background: "#276EF1",
              borderRadius: "50%", opacity: 1,
              animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: ".3s"
            }} />
          </span>
          <span style={{ marginLeft: 13, color: "#276EF1", fontWeight: 600 }}>Loading...</span>
          <style>
            {`
              @keyframes lds-bounce {
                0%, 80%, 100% { transform: scale(0.85);}
                40% { transform: scale(1);}
              }
            `}
          </style>
        </div>
      )}
      {/* error state */}
      {error && (
        <div className="error" style={{ color: "#d7382a", background: "#fff6f4", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontWeight: 500 }}>
          {error}
        </div>
      )}
      <div>
        {!loading && questions.length === 0 ? (
          <div style={{ color: "#aaa" }}>No questions generated.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {questions.map((q, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: 28,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "1.2rem 1.3rem",
                  boxShadow: "0 2px 12px 0 rgba(39,110,241,0.07)",
                  border: "1.3px solid #e7e7f0",
                  fontSize: "1rem"
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8, color: "#26325A" }}>
                  <span style={{
                    display: "inline-block",
                    marginRight: 6,
                    fontSize: 17,
                    verticalAlign: "middle",
                  }}>Q{idx + 1}.</span>
                  {q.text}
                </div>
                <div>
                  {q.rubric.map((tag, rIdx) => (
                    <RubricBadge tag={tag} key={rIdx} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: 13,
          background: "#EFEFF5",
          color: "#265ab3",
          border: "none",
          borderRadius: 7,
          fontWeight: 600,
          fontSize: 15.5,
          padding: "10px 28px",
          cursor: "pointer",
        }}
      >
        &larr; Back
      </button>
    </div>
  );
}