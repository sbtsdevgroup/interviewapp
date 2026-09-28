import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { join } from 'path';
import { gradeObjectiveResponse, parseQuestionOptions } from '../src/ai/objective-scoring';

const candidates = [
  process.env.AI_DB_PATH,
  join(process.cwd(), 'data', 'ai_interviews.db'),
  join(process.cwd(), 'backend', 'data', 'ai_interviews.db'),
  '/app/data/ai_interviews.db',
].filter((path): path is string => Boolean(path));

const dbPath = candidates.find((path) => existsSync(path));

if (!dbPath) {
  console.error(
    'No ai_interviews.db found. Set AI_DB_PATH to the live database and run this script again.',
  );
  console.error('Looked in:');
  candidates.forEach((path) => console.error(`  ${path}`));
  process.exit(1);
}

const db = new Database(dbPath);

type ResponseRow = {
  id: string;
  student_answer: string | null;
  ai_score: number | null;
  ai_feedback: string | null;
  criteria: string | null;
  type: string;
  options: string | null;
};

const rows = db
  .prepare(
    `SELECT r.id, r.student_answer, r.ai_score, r.ai_feedback, q.criteria, q.type, q.options
     FROM ai_responses r
     JOIN ai_questions q ON r.question_id = q.id
     WHERE q.type IN ('true-false', 'yes-no', 'multiple-choice', 'checklist')`,
  )
  .all() as ResponseRow[];

const update = db.prepare(
  'UPDATE ai_responses SET ai_score = ?, ai_feedback = ? WHERE id = ?',
);

let changed = 0;

const apply = db.transaction((items: ResponseRow[]) => {
  for (const row of items) {
    const evaluation = gradeObjectiveResponse(
      row.type,
      row.student_answer || '',
      row.criteria || '',
      parseQuestionOptions(row.options),
    );
    if (!evaluation) continue;
    if (row.ai_score === evaluation.score && row.ai_feedback === evaluation.feedback) continue;
    update.run(evaluation.score, evaluation.feedback, row.id);
    changed++;
  }
});

apply(rows);

console.log(`Rescored ${dbPath}`);
console.log(`Examined ${rows.length} objective responses. Updated ${changed}.`);
db.close();
