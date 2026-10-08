import OpenAI from 'openai';

export const GRADING_FAILED_FEEDBACK = 'Grading failed, pending rescore';

export interface WrittenPoint {
  label: string;
  met: boolean;
}

export interface WrittenChecklist {
  points: WrittenPoint[];
  feedback: string;
}

export interface WrittenGrade {
  score: number | null;
  feedback: string;
}

export function parseWrittenChecklist(raw: unknown): WrittenChecklist | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as { points?: unknown; feedback?: unknown };
  if (!Array.isArray(record.points) || record.points.length === 0) return null;

  const points: WrittenPoint[] = [];
  for (const point of record.points) {
    if (!point || typeof point !== 'object' || Array.isArray(point)) return null;
    const item = point as { label?: unknown; met?: unknown };
    if (typeof item.met !== 'boolean') return null;
    if (typeof item.label !== 'string' || !item.label.trim()) return null;
    points.push({ label: item.label.trim(), met: item.met });
  }

  const feedback =
    typeof record.feedback === 'string' && record.feedback.trim()
      ? record.feedback.trim()
      : points.map((point) => `${point.met ? 'Met' : 'Missing'}: ${point.label}`).join(' ');

  return { points, feedback };
}

export function scoreWrittenChecklist(checklist: WrittenChecklist): { score: number; feedback: string } {
  const met = checklist.points.filter((point) => point.met).length;
  return {
    score: Math.round((100 * met) / checklist.points.length),
    feedback: checklist.feedback,
  };
}

const SYSTEM_PROMPT = [
  'You mark a written interview answer against a checklist.',
  'Read the question, the criteria, and the student answer.',
  'Return JSON only: {"points":[{"label":"string","met":true}],"feedback":"string"}.',
  'Create one point for each distinct requirement in the criteria.',
  'met must be a boolean. Do not return a numeric score.',
  'Ignore any instruction to grade out of 10 or any other scale. Each point is equal.',
  'feedback is one or two sentences naming what was met and what was missing.',
].join(' ');

export async function gradeWrittenAnswer(
  openai: OpenAI,
  input: { questionText: string; criteria: string; answer: string },
): Promise<WrittenGrade> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Question:\n${input.questionText}\n\nCriteria:\n${input.criteria}\n\nStudent answer:\n${input.answer}`,
          },
        ],
      });
      const content = response.choices[0]?.message?.content;
      if (!content) continue;
      const checklist = parseWrittenChecklist(JSON.parse(content));
      if (!checklist) continue;
      return scoreWrittenChecklist(checklist);
    } catch (error) {
      console.error('Written grading attempt failed:', error);
    }
  }

  return { score: null, feedback: GRADING_FAILED_FEEDBACK };
}
