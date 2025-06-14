import React, { useState } from "react";
import WizardStepObjective from "./WizardStepObjective";
import BranchingGraphView, { BranchNode, BranchEdge } from "./BranchingGraphView";
import { API_URL } from "../config";
import { colors } from "../theme";

// Step enums for readability.
enum Step {
  Objective = 0,
  Graph = 1
}

// Define the structure for individual rubric items if they are objects
export interface RubricObject {
  Category: string; // Display tag string from Claude
  Assessment?: string;
  Rationale?: string;
}

// Rubric items can come back as simple strings or the full object above
export type RubricItem = RubricObject | string;

export interface GeneratedQuestion {
  text: string;
  rubric: RubricItem[];
}

export default function Wizard() {
  const [step, setStep] = useState<Step>(Step.Objective);
  const [objective, setObjective] = useState<string>("");
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<BranchNode[]>([]);
  const [edges, setEdges] = useState<BranchEdge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => setStep((prev) => (prev === Step.Graph ? Step.Objective : prev));



  const handleObjectiveSubmit = async (obj: string) => {
    setObjective(obj);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/survey/branching`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: obj })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create survey');
      }
      const data = await res.json();
      setSurveyId(data.surveyId);
      setNodes(data.nodes);
      setEdges(data.edges);
      setStep(Step.Graph);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
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
              step === Step.Graph
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
              background: step === Step.Graph ? brandBlue : gray,
              color: step === Step.Graph ? "#fff" : "#1a1d1f",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: step === Step.Graph ? "0 2px 8px #2A3F5422" : undefined,
              marginRight: 10,
              marginLeft: 10,
              transition: "background 0.2s",
            }}
          >
            2
          </div>
          <span
            style={{
              color: step === Step.Graph ? brandBlue : colors.primaryText,
              fontWeight: step === Step.Graph ? 600 : 400,
              fontSize: 16,
              letterSpacing: "0.01em",
            }}
          >
            Graph
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
      {step === Step.Graph && surveyId && (
        <BranchingGraphView
          surveyId={surveyId}
          nodes={nodes}
          edges={edges}
          onSave={async (n, e) => {
            await fetch(`${API_URL}/api/survey/branching/${surveyId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nodes: n, edges: e })
            });
            setNodes(n);
          }}
        />
      )}
    </div>
  );
}