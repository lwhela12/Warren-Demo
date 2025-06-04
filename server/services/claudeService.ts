// Service for generating questions from an objective.
// Calls Anthropic's Claude API when a key is provided, otherwise returns a stub.
import { readFileSync } from 'fs';
import path from 'path';

const frameworkPath = path.join(
  __dirname,
  '..',
  '..',
  'docs',
  'AL _ PFEL_Survey Methodology Framework.docx.md'
);

// Load the Survey Methodology Framework so it can be embedded in prompts.
const methodologyFramework = readFileSync(frameworkPath, 'utf8');

export interface RubricItem {
  Category: string;
  Assessment?: string;
  Rationale?: string;
}

export interface GeneratedQuestion {
  text: string;
  rubric: RubricItem[];
}

/**
 * Generate a list of questions and rubric tags based on a survey objective.
 * If CLAUDE_API_KEY is set, questions are generated via the Claude API.
 * Otherwise a static stub is returned for local usage.
 */
export async function generateQuestions(objective: string): Promise<GeneratedQuestion[]> {
  const methodologyPrompt = `You are an expert survey designer. Use the following Survey Methodology Framework to craft 5 developmentally appropriate questions with rubric tags.\n\n${methodologyFramework}`;

  const prompt = `${methodologyPrompt}\n\nObjective: ${objective}\nReturn only a JSON that includes the questions and rubric tags in the JSON format [{\"text\":...,\"rubric\":[...]}, ...] provide no other text or explanation.`;

  const timeoutMs = Number(process.env.CLAUDE_TIMEOUT_MS || 10000);
  const apiKey = process.env.CLAUDE_API_KEY;

  // If running tests or no API key is provided, return a static stub
  if (process.env.NODE_ENV === 'test' || !apiKey) {
    const templates = [
      `In your own words, what does "${objective}" mean to you?`,
      `Why is ${objective} important in this context?`,
      `Describe a successful outcome related to ${objective}.`,
      `What challenges do you anticipate regarding ${objective}?`,
      `How would you measure the success of ${objective}?`
    ];
    const rubricTags = ['Proficient', 'Emerging', 'Developing'];
    const questions = templates.map((text, idx) => ({
      text,
      rubric: [{ Category: rubricTags[idx % rubricTags.length] }]
    }));
    return questions;
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error('Claude API returned empty content');

    return JSON.parse(text) as GeneratedQuestion[];
  } finally {
    clearTimeout(id);
  }
}

// Regenerate a single question based on an objective and teacher feedback.
export async function regenerateQuestion(
  objective: string,
  question: string,
  feedback: string
): Promise<GeneratedQuestion> {
  const methodologyPrompt = `You are an expert survey designer. Use the following Survey Methodology Framework to craft one developmentally appropriate question with rubric tags.\n\n${methodologyFramework}`;

  const prompt = `${methodologyPrompt}\n\nObjective: ${objective}\nCurrent question: ${question}\nTeacher feedback: ${feedback}\nRewrite the question based on the feedback, keeping it as similar as possible unless the feedback requests otherwise.\nReturn only a JSON that includes the question and rubric tags in the JSON format [{\"text\":...,\"rubric\":[...]}, ...] provide no other text or explanation.`;

  const timeoutMs = Number(process.env.CLAUDE_TIMEOUT_MS || 10000);
  const apiKey = process.env.CLAUDE_API_KEY;

  if (process.env.NODE_ENV === 'test' || !apiKey) {
    return {
      text: `${question} – revised per feedback`,
      rubric: [{ Category: 'Proficient' }]
    };
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error('Claude API returned empty content');

    const parsed = JSON.parse(text);
    return (Array.isArray(parsed) ? parsed[0] : parsed) as GeneratedQuestion;
  } finally {
    clearTimeout(id);
  }
}
export async function generateBulkStudentAnswers(questionText: string, count = 30): Promise<string[]> {
  const prompt = `You are a student answering a survey question. Provide ${count} distinct and realistic answers in a JSON array. Question: ${questionText}\n\nReturn strictly a JSON array of ${count} strings. Example: [\"Answer 1\", \"Answer 2\"]`;
  const timeoutMs = Number(process.env.CLAUDE_TIMEOUT_MS || 10000);
  const apiKey = process.env.CLAUDE_API_KEY;

  if (process.env.NODE_ENV === 'test' || !apiKey) {
    return Array.from({ length: count }, (_, i) => `Sample answer ${i + 1} to: ${questionText}`);
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error('Claude API returned empty content');

    const parsedJson: unknown = JSON.parse(text);

    if (!Array.isArray(parsedJson)) {
      throw new Error('Claude response is not an array');
    }

    // Cast to any[] first, then map to string[]
    let answers: string[] = (parsedJson as any[]).map((a: any) => String(a));

    if (answers.length < count) {
      answers = answers.concat(Array.from({ length: count - answers.length }, () => 'Default generated answer'));
    } else if (answers.length > count) {
      answers = answers.slice(0, count);
    }
    return answers;
  } finally {
    clearTimeout(id);
  }
}

export async function getSurveyAnalysisFromClaude(promptContent: string): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  const timeoutMs = Number(process.env.CLAUDE_TIMEOUT_MS || 10000);

  if (!apiKey) {
    return 'LLM analysis not available without CLAUDE_API_KEY';
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
        max_tokens: 2048,
        messages: [{ role: 'user', content: promptContent }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error('Claude API returned empty content');

    return text;
  } finally {
    clearTimeout(id);
  }
}
