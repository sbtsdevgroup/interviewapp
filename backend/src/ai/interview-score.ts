import { isCompletionCriteria } from './objective-scoring';

export interface ScoredResponse {
  type: string;
  criteria?: string | null;
  ai_score: number | null;
}

export interface ScoreBreakdown {
  overall: number | null;
  objective: number | null;
  written: number | null;
  reading: number | null;
}

export type ScoreKind = 'Objective' | 'Written' | 'Reading' | 'Completion';

const OBJECTIVE_TYPES = new Set(['true-false', 'yes-no', 'multiple-choice', 'checklist']);

export function scoreBucket(type: string, criteria = ''): 'objective' | 'written' | 'reading' {
  if (type === 'accent') return 'reading';
  if (OBJECTIVE_TYPES.has(type) || type === 'ranking' || isCompletionCriteria(criteria)) {
    return 'objective';
  }
  return 'written';
}

export function scoreKind(type: string, criteria = ''): ScoreKind {
  if (type === 'accent') return 'Reading';
  if (type === 'ranking' || isCompletionCriteria(criteria)) return 'Completion';
  if (OBJECTIVE_TYPES.has(type)) return 'Objective';
  return 'Written';
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundOrNull(value: number | null): number | null {
  return value === null ? null : Math.round(value);
}

const WEIGHTS = { objective: 40, written: 40, reading: 20 } as const;

/**
 * Objective 40, written 40, reading 20.
 * A bucket with no scored rows is dropped and the remaining weights are renormalized.
 * Null scores are skipped.
 */
export function scoreInterview(rows: ScoredResponse[]): ScoreBreakdown {
  const buckets: Record<'objective' | 'written' | 'reading', number[]> = {
    objective: [],
    written: [],
    reading: [],
  };

  for (const row of rows) {
    if (row.ai_score === null || row.ai_score === undefined || Number.isNaN(row.ai_score)) continue;
    buckets[scoreBucket(row.type, row.criteria || '')].push(row.ai_score);
  }

  const objectiveMean = mean(buckets.objective);
  const writtenMean = mean(buckets.written);
  const readingMean = mean(buckets.reading);

  const parts = [
    { mean: objectiveMean, weight: WEIGHTS.objective },
    { mean: writtenMean, weight: WEIGHTS.written },
    { mean: readingMean, weight: WEIGHTS.reading },
  ].filter((part): part is { mean: number; weight: number } => part.mean !== null);

  const weightTotal = parts.reduce((sum, part) => sum + part.weight, 0);
  const overall =
    weightTotal === 0
      ? null
      : Math.round(parts.reduce((sum, part) => sum + part.mean * part.weight, 0) / weightTotal);

  return {
    overall,
    objective: roundOrNull(objectiveMean),
    written: roundOrNull(writtenMean),
    reading: roundOrNull(readingMean),
  };
}
