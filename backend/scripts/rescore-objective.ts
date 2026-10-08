import Database from 'better-sqlite3';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import { parseQuestionOptions } from '../src/ai/objective-scoring';
import { gradeWithoutModel } from '../src/ai/response-grading';
import { gradeWrittenAnswer } from '../src/ai/written-scoring';

function loadEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv(join(process.cwd(), '.env'));
loadEnv(join(process.cwd(), 'backend', '.env'));

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
  text: string | null;
};

const rows = db
  .prepare(
    `SELECT r.id, r.student_answer, r.ai_score, r.ai_feedback, q.criteria, q.type, q.options, q.text
     FROM ai_responses r
     JOIN ai_questions q ON r.question_id = q.id`,
  )
  .all() as ResponseRow[];

const update = db.prepare(
  'UPDATE ai_responses SET ai_score = ?, ai_feedback = ? WHERE id = ?',
);

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

let localUpdated = 0;
let writtenUpdated = 0;
let writtenFailed = 0;
let writtenSkipped = 0;

function sameGrade(
  row: ResponseRow,
  score: number | null,
  feedback: string,
): boolean {
  return row.ai_score === score && row.ai_feedback === feedback;
}

async function rescore() {
  for (const row of rows) {
    const local = gradeWithoutModel({
      qType: row.type,
      answer: row.student_answer || '',
      criteria: row.criteria || '',
      options: parseQuestionOptions(row.options),
      questionText: row.text || '',
    });

    if (local) {
      if (sameGrade(row, local.score, local.feedback)) continue;
      update.run(local.score, local.feedback, row.id);
      localUpdated++;
      continue;
    }

    if (!openai) {
      writtenSkipped++;
      continue;
    }

    const evaluation = await gradeWrittenAnswer(openai, {
      questionText: row.text || '',
      criteria: row.criteria || '',
      answer: row.student_answer || '',
    });
    if (evaluation.score === null) writtenFailed++;
    if (sameGrade(row, evaluation.score, evaluation.feedback)) continue;
    update.run(evaluation.score, evaluation.feedback, row.id);
    writtenUpdated++;
  }
}

rescore()
  .then(() => {
    console.log(`Rescored ${dbPath}`);
    console.log(`Examined ${rows.length} responses.`);
    console.log(`Updated ${localUpdated} objective, completion, and reading rows.`);
    console.log(`Updated ${writtenUpdated} written rows. Grading failed for ${writtenFailed}.`);
    if (!openai) {
      console.log(
        `Skipped ${writtenSkipped} written rows because OPENAI_API_KEY is not set.`,
      );
    }
    db.close();
  })
  .catch((error) => {
    console.error(error);
    db.close();
    process.exit(1);
  });
