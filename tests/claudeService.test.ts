import { describe, it, expect } from 'vitest';
import {
  generateQuestions,
  regenerateQuestion,
  generateBulkStudentAnswers
} from '../server/services/claudeService';

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

describe('regenerateQuestion', () => {
  it('returns a single question', async () => {
    const q = await regenerateQuestion(
      'Engagement',
      'Why is engagement important?',
      'make it shorter'
    );
    expect(q.text.length).toBeGreaterThan(0);
    expect(Array.isArray(q.rubric)).toBe(true);
    expect(q.rubric.length).toBeGreaterThan(0);
  });
});

describe('generateBulkStudentAnswers', () => {
  it('returns the requested number of answers', async () => {
    const count = 5;
    const answers = await generateBulkStudentAnswers('What did you learn?', count);
    expect(Array.isArray(answers)).toBe(true);
    expect(answers.length).toBe(count);
    for (const a of answers) {
      expect(typeof a).toBe('string');
      expect(a.length).toBeGreaterThan(0);
    }
  });
});
