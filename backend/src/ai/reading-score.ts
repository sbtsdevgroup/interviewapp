import { isBlankAnswer } from './objective-scoring';

export interface ReadingGrade {
  score: number;
  feedback: string;
}

/** Longest double-quoted span in the question, which is the read-aloud script. */
export function extractQuotedScript(questionText: string): string {
  const matches = questionText.match(/["“]([^"”]+)["”]/g) || [];
  let longest = '';
  for (const match of matches) {
    const inner = match.slice(1, -1).trim();
    if (inner.length > longest.length) longest = inner;
  }
  return longest;
}

export function tokenizeWords(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Share of script words that appear in the transcript, in order.
 * Extra transcript words do not raise the score.
 */
export function gradeReadingAccuracy(transcript: string, questionText: string): ReadingGrade {
  const scriptWords = tokenizeWords(extractQuotedScript(questionText));
  if (isBlankAnswer(transcript) || scriptWords.length === 0) {
    const total = scriptWords.length;
    return {
      score: 0,
      feedback: `Reading accuracy: 0 of ${total} script words in order.`,
    };
  }

  const spoken = tokenizeWords(transcript);
  let cursor = 0;
  let matched = 0;
  for (const word of scriptWords) {
    const found = spoken.indexOf(word, cursor);
    if (found === -1) continue;
    matched++;
    cursor = found + 1;
  }

  return {
    score: Math.round((100 * matched) / scriptWords.length),
    feedback: `Reading accuracy: ${matched} of ${scriptWords.length} script words in order.`,
  };
}
