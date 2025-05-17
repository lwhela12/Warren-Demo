import React, { useState } from "react";
import WizardStepObjective from "./WizardStepObjective";
import WizardStepQuestions from "./WizardStepQuestions";
import { API_URL } from "../config";
import { colors } from "../theme";

// Step enums for readability.
enum Step {
  Objective = 0,
  Questions = 1,
}

export interface GeneratedQuestion {
  text: string;
  rubric: string[];
}

export interface Question extends GeneratedQuestion {
  id: string;
  status?: 'pending' | 'approved' | 'excluded';
}

export default function Wizard() {
  const [step, setStep] = useState<Step>(Step.Objective);
  const [objective, setObjective] = useState<string>("");
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const goToStep = (target: Step) => setStep(target);
  const handleBack = () => setStep((prev) => (prev === Step.Questions ? Step.Objective : prev));

  const handleQuestionChange = (qid: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, text } : q)));
  };

  const handleStatusChange = (qid: string, status: 'approved' | 'excluded') => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qid ? { ...q, status } : q))
    );
  };

const handleRegenerate = async (
  qid: string,
  feedback: string
) => {
  setRegenerating(qid);
  setError(null);
  try {
    const current = questions.find(q => q.id === qid)?.text || '';
    const res = await fetch(`${API_URL}/api/claude/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective, question: current, feedback })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to regenerate');
    }
    const data = await res.json();
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, text: data.question.text, rubric: data.question.rubric } : q
      )
    );
  } catch (err: any) {
    console.error(err);
    setError(err.message || 'Failed to regenerate');
  } finally {
    setRegenerating(null);
  }
};

  const handleObjectiveSubmit = async (obj: string) => {
    setObjective(obj);
    setError(null);
    setLoading(true);
    setQuestions([]);
    // Call API
    try {
      const res = await fetch(`${API_URL}/api/claude`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective: obj })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate questions");
      }
      const data = await res.json();

      const save = await fetch(`${API_URL}/api/survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective: obj, questions: data.questions })
      });
      if (!save.ok) {
        const err = await save.json();
        throw new Error(err.error || "Failed to save survey");
      }
      const { survey } = await save.json();
      const merged = survey.questions.map((q: any, idx: number) => ({
        id: q.id,
        text: q.text,
        rubric: data.questions[idx].rubric,
        status: 'pending' as const
      }));
      setSurveyId(survey.id);
      setQuestions(merged);
      setStep(Step.Questions);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  // Pretty horizontal step indicator styled close to reference.
  function Stepper() {
    // Color definitions (brand blue and stepper grays)
    const brandBlue = colors.primaryDarkBlue;
    const gray = "#D2D6DB";
    return (
      <div
        className="wizard-stepper"
        style={{
          display: "flex",
          gap: "0",
          marginBottom: 32,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          userSelect: "none",
        }}
      >
        {/* Step 1 */}
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div
            className="wizard-stepper-circle"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: step === Step.Objective ? brandBlue : gray,
              color: step === Step.Objective ? "#fff" : "#1a1d1f",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: step === Step.Objective ? "0 2px 8px #2A3F5422" : undefined,
              marginRight: 10,
              transition: "background 0.2s",
            }}
          >
            1
          </div>
          <span
            style={{
              color: step === Step.Objective ? brandBlue : colors.primaryText,
              fontWeight: step === Step.Objective ? 600 : 400,
              fontSize: 16,
              letterSpacing: "0.01em",
            }}
          >
            Objective
          </span>
        </div>
        {/* Line Between */}
        <div
          style={{
            flex: 2,
            height: 3,
            borderRadius: 3,
            background:
              step === Step.Questions
                ? `linear-gradient(to right, ${gray}, ${brandBlue} 80%)`
                : gray,
            margin: "0 6px",
            transition: "background 0.3s",
          }}
        />
        {/* Step 2 */}
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div
            className="wizard-stepper-circle"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: step === Step.Questions ? brandBlue : gray,
              color: step === Step.Questions ? "#fff" : "#1a1d1f",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: step === Step.Questions ? "0 2px 8px #2A3F5422" : undefined,
              marginRight: 10,
              marginLeft: 10,
              transition: "background 0.2s",
            }}
          >
            2
          </div>
          <span
            style={{
              color: step === Step.Questions ? brandBlue : colors.primaryText,
              fontWeight: step === Step.Questions ? 600 : 400,
              fontSize: 16,
              letterSpacing: "0.01em",
            }}
          >
            Questions
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card wizard-main-card"
      style={{
        maxWidth: 580,
        margin: "0 auto",
        marginTop: "3vw",
        marginBottom: "3vw",
        boxShadow: "0 6px 32px rgba(37,74,138,0.08)",
        padding: "2.2rem 2.5rem 2.2rem 2.5rem",
        borderRadius: 24,
        background: colors.offWhite,
        border: "1.5px solid #e7e7ef",
      }}
    >
      <h1 style={{
        marginTop: 0,
        marginBottom: 18,
        fontSize: 32,
        fontWeight: 700,
        color: colors.primaryDarkBlue,
        textAlign: "center",
        letterSpacing: "0.015em"
      }}>
        Burrow Builder
      </h1>
      <Stepper />
      {step === Step.Objective && (
        <WizardStepObjective
          initialObjective={objective}
          loading={loading}
          error={error}
          onSubmit={handleObjectiveSubmit}
        />
      )}
      {step === Step.Questions && (
        <WizardStepQuestions
          objective={objective}
          surveyId={surveyId as string}
          questions={questions}
          regeneratingId={regenerating}
          onQuestionChange={handleQuestionChange}
          onStatusChange={handleStatusChange}
          onRegenerate={handleRegenerate}
          loading={loading}
          error={error}
          onBack={handleBack}
        />
      )}
    </div>
  );
}