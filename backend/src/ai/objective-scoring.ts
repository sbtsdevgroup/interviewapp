export interface ObjectiveEvaluation {
  score: number;
  feedback: string;
}

const CHOICE_TYPES = new Set(['true-false', 'yes-no', 'multiple-choice']);

const ANSWER_KEY = /Correct:\s*(True|False|Yes|No|[A-D])\b/i;

export function parseQuestionOptions(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item));
  }
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : null;
  } catch {
    return null;
  }
}

export function isBlankAnswer(answer: string | null | undefined): boolean {
  const clean = (answer || '').trim().toLowerCase();
  return !clean || clean.startsWith('no response') || clean.startsWith('no audio');
}

/** Criteria that award full marks for any submitted answer. */
export function isCompletionCriteria(criteria: string): boolean {
  return (
    /full completion marks/i.test(criteria) ||
    /any choice is awarded/i.test(criteria) ||
    /any ranking response awards full marks/i.test(criteria) ||
    /any response or none/i.test(criteria)
  );
}

function requiresEveryOption(criteria: string): boolean {
  return /all items must be confirmed/i.test(criteria) || /check all boxes/i.test(criteria);
}

function optionTextForKey(key: string, options: string[] | null): string | null {
  const index = 'abcdefghijklmnopqrstuvwxyz'.indexOf(key.toLowerCase());
  if (index < 0 || !options || index >= options.length) return null;
  const text = options[index];
  return text ? text.trim() : null;
}

function gradeChoice(
  answer: string,
  criteria: string,
  options: string[] | null,
): ObjectiveEvaluation {
  if (isBlankAnswer(answer)) {
    return { score: 0, feedback: 'No response submitted.' };
  }

  const match = criteria.match(ANSWER_KEY);
  const cleanAnswer = (answer || '').trim().toLowerCase();

  if (!match) {
    if (isCompletionCriteria(criteria)) {
      return {
        score: 100,
        feedback: 'Response recorded. Full completion marks awarded.',
      };
    }
    return { score: 0, feedback: 'Incorrect answer selected.' };
  }

  const key = match[1].trim();
  const optionText = optionTextForKey(key, options);
  const accepted = new Set<string>([key.toLowerCase()]);
  if (optionText) accepted.add(optionText.toLowerCase());

  const isCorrect = accepted.has(cleanAnswer);
  const label = optionText || key;

  return {
    score: isCorrect ? 100 : 0,
    feedback: isCorrect
      ? `Correct. Option "${label}" selected.`
      : `Incorrect. The correct option is "${label}".`,
  };
}

/** Drop a trailing parenthetical explanation, keeping acronyms such as "(AHT)". */
export function stripTrailingExplanation(value: string): string {
  return value.replace(/\s*\([^)]*\s[^)]*\)\s*$/, '').trim();
}

function gradeChecklist(
  answer: string,
  criteria: string,
  options: string[] | null,
): ObjectiveEvaluation {
  if (isBlankAnswer(answer)) {
    return { score: 0, feedback: 'No response submitted.' };
  }

  const match = criteria.match(/Correct:\s*(.+)/i);
  if (!match) {
    if (requiresEveryOption(criteria)) {
      const expected = (options || []).map((item) => item.trim().toLowerCase()).filter(Boolean);
      const selected = new Set(
        (answer || '')
          .split(',')
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      );
      const allSelected = expected.length > 0 && expected.every((item) => selected.has(item));
      return allSelected
        ? { score: 100, feedback: 'Checklist confirmed. All items selected.' }
        : { score: 0, feedback: 'Incorrect. Every item must be selected.' };
    }
    if (isCompletionCriteria(criteria)) {
      return { score: 100, feedback: 'Response recorded. Full completion marks awarded.' };
    }
    return { score: 0, feedback: 'Incorrect checklist response.' };
  }

  const correctList = stripTrailingExplanation(match[1]);
  const correctAnswers = correctList
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const studentAnswers = (answer || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const isCorrect =
    correctAnswers.length > 0 &&
    correctAnswers.length === studentAnswers.length &&
    correctAnswers.every((value) => studentAnswers.includes(value));

  return {
    score: isCorrect ? 100 : 0,
    feedback: isCorrect
      ? 'Correct. All correct options selected.'
      : `Incorrect. Correct options are: ${correctList}`,
  };
}

/**
 * Grade true/false, yes/no, multiple-choice, and checklist answers.
 * Returns null for question types that are not graded here.
 */
export function gradeObjectiveResponse(
  qType: string,
  answer: string,
  criteria: string,
  options: string[] | null,
): ObjectiveEvaluation | null {
  const criteriaText = criteria || '';
  if (CHOICE_TYPES.has(qType)) {
    return gradeChoice(answer, criteriaText, options);
  }
  if (qType === 'checklist') {
    return gradeChecklist(answer, criteriaText, options);
  }
  return null;
}

/** Full marks for a submitted ranking or other completion item. Blank answers score 0. */
export function gradeCompletion(answer: string): ObjectiveEvaluation {
  if (isBlankAnswer(answer)) {
    return { score: 0, feedback: 'No response submitted.' };
  }
  return { score: 100, feedback: 'Response recorded. Full completion marks awarded.' };
}
