import React from "react";
import { colors } from "../theme";
import "../animations.css";
import { Question } from "./Wizard";
import { API_URL } from "../config";

interface Props {
  surveyId: string;
  objective: string;
  questions: Question[];
  regeneratingId?: string | null;
  loading?: boolean;
  error?: string | null;
  onQuestionChange: (qid: string, text: string) => void;
  onStatusChange: (qid: string, status: 'approved' | 'excluded') => void;
  onRegenerate: (qid: string, feedback: string) => Promise<void> | void;
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

import { useRef, useState } from "react";

export default function WizardStepQuestions({
  surveyId,
  objective,
  questions,
  regeneratingId,
  loading,
  error,
  onQuestionChange,
  onStatusChange,
  onRegenerate,
  onBack
}: Props) {
  const timers = useRef<Record<string, any>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  return (
    <div style={{ width: "100%", maxWidth: 510, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <span style={{ color: colors.primaryDarkBlue, fontSize: 15.5, fontWeight: 600 }}>Survey Objective:</span>{" "}
        <span style={{ fontStyle: "italic", color: colors.primaryDarkBlue, fontSize: 16 }}>{objective}</span>
      </div>
      <h2 style={{ marginTop: 0, fontSize: 22, fontWeight: 700, color: "#121a2f", letterSpacing: 0.5 }}>
        Generated Questions
      </h2>
      {/* loading spinner */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "24px 0" }}>
          <span className="lds-ellipsis" style={{ display: "inline-block" }}>
            <span style={{
              display: "inline-block", width: 10, height: 10, margin: "0 1.2px", background: colors.primaryDarkBlue,
              borderRadius: "50%", opacity: 0.45,
              animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: "0s"
            }} />
            <span style={{
              display: "inline-block", width: 10, height: 10, margin: "0 1.2px", background: colors.primaryDarkBlue,
              borderRadius: "50%", opacity: 0.7,
              animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: ".15s"
            }} />
            <span style={{
              display: "inline-block", width: 10, height: 10, margin: "0 1.2px", background: colors.primaryDarkBlue,
              borderRadius: "50%", opacity: 1,
              animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: ".3s"
            }} />
          </span>
          <span style={{ marginLeft: 13, color: colors.primaryDarkBlue, fontWeight: 600 }}>Loading...</span>
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
            {questions.map((q, idx) => {
              const feedback = feedbacks[q.id] || "";
              const locked = q.status === "approved" || q.status === "excluded";
              const isRegen = regeneratingId === q.id;
              return (
                <li
                  key={q.id}
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
                    <span
                      style={{
                        display: "inline-block",
                        marginRight: 6,
                        fontSize: 17,
                        verticalAlign: "middle",
                      }}
                    >
                      Q{idx + 1}.
                    </span>
                    <textarea
                      value={q.text}
                      disabled={q.status === "approved" || isRegen}
                      onChange={(e) => {
                        const txt = e.target.value;
                        onQuestionChange(q.id, txt);
                        if (timers.current[q.id]) clearTimeout(timers.current[q.id]);
                        timers.current[q.id] = setTimeout(() => {
                          fetch(`${API_URL}/api/survey/${surveyId}/question/${q.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: txt })
                          }).catch(() => {});
                        }, 500);
                      }}
                      style={{
                        width: "100%",
                        resize: "vertical",
                        background: isRegen ? "#f6f6f6" : undefined,
                        color: isRegen ? "#666" : undefined,
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    {q.rubric.map((tag, rIdx) => (
                      <RubricBadge tag={tag} key={rIdx} />
                    ))}
                  </div>
                  {!locked && (
                    <div style={{ marginTop: 6 }}>
                      <textarea
                        placeholder="Feedback"
                        value={feedback}
                        onChange={(e) =>
                          setFeedbacks({ ...feedbacks, [q.id]: e.target.value })
                        }
                        disabled={isRegen}
                        style={{
                          width: "100%",
                          resize: "vertical",
                          marginBottom: 6,
                          background: isRegen ? "#f6f6f6" : undefined,
                          color: isRegen ? "#666" : undefined,
                        }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          disabled={isRegen}
                          onClick={async () => {
                            try {
                              await onRegenerate(q.id, feedback);
                            } catch (err) {
                              console.error(err);
                            }
                            setFeedbacks({ ...feedbacks, [q.id]: "" });
                          }}
                          style={{
                            background: "#EFEFF5",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 6,
                            cursor: isRegen ? "default" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          {isRegen ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span className="lds-ellipsis" style={{ display: "inline-block", verticalAlign: "middle" }}>
                                <span style={{ display: "inline-block", width: 8, height: 8, margin: "0 1px", background: "#555", borderRadius: "50%", opacity: 0.55, animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: "0s" }} />
                                <span style={{ display: "inline-block", width: 8, height: 8, margin: "0 1px", background: "#555", borderRadius: "50%", opacity: 0.7, animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: ".15s" }} />
                                <span style={{ display: "inline-block", width: 8, height: 8, margin: "0 1px", background: "#555", borderRadius: "50%", opacity: 1, animation: "lds-bounce 1.2s infinite ease-in-out", animationDelay: ".3s" }} />
                              </span>
                              Generating
                            </span>
                          ) : (
                            "Regenerate"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(q.id, "approved")}
                          style={{ background: colors.primaryDarkBlue, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(q.id, "excluded")}
                          style={{ background: "#F9E6EC", color: "#A23B63", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
                        >
                          Exclude
                        </button>
                      </div>
                    </div>
                  )}
                  {locked && (
                    <div style={{ marginTop: 6, fontWeight: 600, color: q.status === "approved" ? "#228375" : "#A23B63" }}>
                      {q.status === "approved" ? "Approved" : "Excluded"}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {questions.every(q => q.status === "approved" || q.status === "excluded") && (
        <button
          type="button"
          onClick={() => alert("Survey Deployed!")}
          style={{
            marginTop: 13,
            background: "#228375",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            fontWeight: 600,
            fontSize: 15.5,
            padding: "10px 28px",
            cursor: "pointer",
            marginRight: 8
          }}
        >
          Deploy Survey
        </button>
      )}
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