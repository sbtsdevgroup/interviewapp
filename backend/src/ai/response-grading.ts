import { gradeReadingAccuracy } from './reading-score';
import {
  gradeCompletion,
  gradeObjectiveResponse,
  isBlankAnswer,
  isCompletionCriteria,
  ObjectiveEvaluation,
} from './objective-scoring';

export interface LocalGradeInput {
  qType: string;
  answer: string;
  criteria: string;
  options: string[] | null;
  questionText: string;
}

/**
 * Grade everything that does not need the model.
 * Returns null when the answer must go to the written checklist grader.
 */
export function gradeWithoutModel(input: LocalGradeInput): ObjectiveEvaluation | null {
  if (isBlankAnswer(input.answer)) {
    return { score: 0, feedback: 'No response submitted.' };
  }
  if (input.qType === 'accent') {
    return gradeReadingAccuracy(input.answer, input.questionText);
  }

  const objective = gradeObjectiveResponse(
    input.qType,
    input.answer,
    input.criteria,
    input.options,
  );
  if (objective) return objective;

  if (input.qType === 'ranking' || isCompletionCriteria(input.criteria)) {
    return gradeCompletion(input.answer);
  }

  return null;
}
