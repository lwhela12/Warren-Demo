// Service for generating questions from an objective.
// In production this would call an external AI service such as Claude.
export interface GeneratedQuestion {
  text: string;
  rubric: string[];
}

/**
 * Generate a list of questions and rubric tags based on a survey objective.
 * Currently returns a static stub of 5 questions.
 */
export async function generateQuestions(objective: string): Promise<GeneratedQuestion[]> {
  const methodologyPrompt =
    'Apply the Survey Methodology Framework and return 5 developmentally appropriate questions with rubric tags.';

  // Build the prompt that would normally be sent to the AI service
  const prompt = `${methodologyPrompt}\nObjective: ${objective}`;

  // Simulate async AI call with timeout
  const timeoutMs = Number(process.env.CLAUDE_TIMEOUT_MS || 10000);

  const aiCall = new Promise<GeneratedQuestion[]>((resolve) => {
    // Static example generation
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
      rubric: [rubricTags[idx % rubricTags.length]]
    }));
    // Short delay to mimic network
    setTimeout(() => resolve(questions), 500);
  });

  const timeout = new Promise<GeneratedQuestion[]>((_, reject) => {
    setTimeout(() => reject(new Error('Claude API timeout')), timeoutMs);
  });

  return Promise.race([aiCall, timeout]);
}