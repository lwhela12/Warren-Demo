// Stub service for generating questions from an objective
// In production, replace with real AI API calls (e.g. OpenAI, Anthropic Claude)
export interface GeneratedQuestion {
  text: string;
  rubric: string[];
}

/**
 * Generate a list of questions and rubric tags based on a survey objective.
 * Currently returns a static stub of 5 questions.
 */
export async function generateQuestions(objective: string): Promise<GeneratedQuestion[]> {
  // Static stub questions; include objective in prompt example
  const baseQuestions = [
    `In your own words, what does "${objective}" mean to you?`,
    `Why is ${objective} important in this context?`,
    `Describe a successful outcome related to ${objective}.`,
    `What challenges do you anticipate regarding ${objective}?`,
    `How would you measure the success of ${objective}?`
  ];
  // Assign a default rubric tag to each (e.g., 'Proficient')
  return baseQuestions.map((q) => ({ text: q, rubric: ['Proficient'] }));
}