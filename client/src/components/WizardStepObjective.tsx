import React, { useState } from "react";
import MethodologyModal from "./MethodologyModal";
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
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [touched, setTouched] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  // For accessibility let user submit with Enter+Ctrl (multiline otherwise)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };
  return (
    <form onSubmit={handleFormSubmit} className="wizard-objective-form">
      <div className="objective-instructions">
        Tell us what you’d like to find out today. Start with your goal.
      </div>
      <div className="wizard-fields-row">
        <div className="field-group">
          <label htmlFor="date" className="field-label">Date</label>
          <input
            id="date"
            type="date"
            className="field-input date-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="field-group">
          <label htmlFor="title" className="field-label">Survey Title</label>
          <input
            id="title"
            type="text"
            className="field-input title-field"
            placeholder="Enter survey title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <label htmlFor="objective" className="field-label">
        Survey Objective
      </label>
      <textarea
        id="objective"
        rows={4}
        className="wizard-textarea"
        placeholder="I want to know how students feel today; if about..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />
      {/* Error block */}
      {(touched && !input.trim()) && (
        <div className="error" style={{ color: "#d7382a", background: "#fff6f4", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontWeight: 500 }}>
          Objective is required
        </div>
      )}
      {error && <div className="error" style={{ color: "#d7382a", background: "#fff6f4", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontWeight: 500 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setShowMethodology(true)}
          disabled={loading}
          style={{
            minWidth: 120,
            background: colors.figmaLightGray,
            color: colors.primaryText,
            border: 'none',
            fontWeight: 600,
            borderRadius: 7,
            fontSize: 17,
            padding: '12px 28px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Methodology
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            minWidth: 160,
            background: colors.primaryDarkBlue,
            color: 'white',
            border: 'none',
            fontWeight: 600,
            borderRadius: 7,
            fontSize: 17,
            padding: '12px 28px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? undefined : '0 2px 8px rgba(85,124,251,0.08)'
          }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="lds-ellipsis" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  margin: '0 1px',
                  background: '#fff',
                  borderRadius: '50%',
                  opacity: 0.55,
                  animation: 'lds-bounce 1.2s infinite ease-in-out',
                  animationDelay: '0s'
                }} />
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  margin: '0 1px',
                  background: '#fff',
                  borderRadius: '50%',
                  opacity: 0.7,
                  animation: 'lds-bounce 1.2s infinite ease-in-out',
                  animationDelay: '.15s'
                }} />
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  margin: '0 1px',
                  background: '#fff',
                  borderRadius: '50%',
                  opacity: 1,
                  animation: 'lds-bounce 1.2s infinite ease-in-out',
                  animationDelay: '.3s'
                }} />
              </span>
              Generating...
            </span>
          ) : (
            'Generate Questions'
          )}
        </button>
      </div>
      <MethodologyModal open={showMethodology} onClose={() => setShowMethodology(false)} />
    </form>
  );
}