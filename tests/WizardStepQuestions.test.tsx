import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import WizardStepQuestions from '../client/src/components/WizardStepQuestions';

// Simple noop handlers for required callbacks
const noop = () => {};

describe('WizardStepQuestions', () => {
  it('renders without crashing when a question lacks rubric', () => {
    const question: any = { id: 'q1', text: 'What is 2+2?' };
    expect(() =>
      renderToString(
        <WizardStepQuestions
          surveyId="1"
          objective="math"
          questions={[question]}
          onQuestionChange={noop}
          onStatusChange={noop}
          onRegenerate={noop}
          onBack={noop}
        />
      )
    ).not.toThrow();
  });
});
