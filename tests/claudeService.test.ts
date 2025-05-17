import { describe, it, expect } from 'vitest';
import { generateQuestions } from '../server/services/claudeService';

describe('generateQuestions', () => {
  it('returns at least 5 questions with rubric tags', async () => {
    const questions = await generateQuestions('Improve engagement');
    expect(questions.length).toBeGreaterThanOrEqual(5);
    for (const q of questions) {
      expect(q.text.length).toBeGreaterThan(0);
      expect(Array.isArray(q.rubric)).toBe(true);
      expect(q.rubric.length).toBeGreaterThan(0);
    }
  });
});
