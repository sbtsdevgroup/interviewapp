#!/usr/bin/env node
/**
 * Add bonus marks to the overall score of every completed interview that failed.
 *
 * The bonus is stored in ai_interviews.bonus_marks and added to the computed
 * overall at read time (capped at 100), so per-question scores are untouched and
 * `npm run rescore` will not wipe it.
 *
 * Usage (from the backend folder, after `npm run build`):
 *   node scripts/add-bonus-marks.js                 # dry run: list who would get the bonus
 *   node scripts/add-bonus-marks.js --apply         # write it (backs up the DB first)
 *   node scripts/add-bonus-marks.js --undo --apply  # remove every bonus
 *
 * Options:
 *   --marks=10       marks to add (default 10)
 *   --pass-mark=70   an overall below this counts as failed (default 70)
 *   --db=PATH        database path (or set AI_DB_PATH)
 *
 * Production (script is piped in, so the image does not need rebuilding to include it):
 *   docker exec -i interviewapp_backend node - < backend/scripts/add-bonus-marks.js
 *   docker exec -i interviewapp_backend node - --apply < backend/scripts/add-bonus-marks.js
 */
const { existsSync } = require('fs');
const { join, resolve } = require('path');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const APPLY = flag('apply');
const UNDO = flag('undo');
const MARKS = Number(option('marks', '10'));
const PASS_MARK = Number(option('pass-mark', '70'));

if (!Number.isFinite(MARKS) || MARKS <= 0) {
  console.error('--marks must be a positive number');
  process.exit(1);
}
if (!Number.isFinite(PASS_MARK)) {
  console.error('--pass-mark must be a number');
  process.exit(1);
}

const roots = [process.cwd(), join(process.cwd(), 'backend'), resolve(__dirname || '.', '..')];

let Database;
let scoreInterview;
for (const root of roots) {
  try {
    Database = Database || require(join(root, 'node_modules', 'better-sqlite3'));
  } catch {}
  try {
    scoreInterview = scoreInterview || require(join(root, 'dist', 'ai', 'interview-score.js')).scoreInterview;
  } catch {}
}
if (!Database) {
  console.error('better-sqlite3 not found. Run this from the backend folder after `npm install`.');
  process.exit(1);
}
if (!scoreInterview) {
  console.error('dist/ai/interview-score.js not found. Run `npm run build` in the backend first.');
  process.exit(1);
}

const dbCandidates = [
  option('db'),
  process.env.AI_DB_PATH,
  ...roots.map((root) => join(root, 'data', 'ai_interviews.db')),
  '/app/data/ai_interviews.db',
].filter(Boolean);
const dbPath = dbCandidates.find((path) => existsSync(path));
if (!dbPath) {
  console.error('No ai_interviews.db found. Pass --db=PATH or set AI_DB_PATH. Looked in:');
  dbCandidates.forEach((path) => console.error(`  ${path}`));
  process.exit(1);
}

const db = new Database(dbPath);

const columns = db.prepare('PRAGMA table_info(ai_interviews)').all().map((c) => c.name);
if (!columns.includes('bonus_marks')) {
  if (!APPLY) {
    console.log('(bonus_marks column does not exist yet; it will be added on --apply)');
  } else {
    db.exec('ALTER TABLE ai_interviews ADD COLUMN bonus_marks INTEGER DEFAULT 0');
  }
}
const hasBonusColumn = columns.includes('bonus_marks');

async function backup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = dbPath.replace(/\.db$/, '') + `.backup-${stamp}.db`;
  await db.backup(target);
  console.log(`Backup written to ${target}`);
}

function pad(value, width) {
  const text = String(value ?? '');
  return text.length >= width ? text.slice(0, width - 1) + '…' : text.padEnd(width);
}

async function undo() {
  const rows = hasBonusColumn
    ? db.prepare('SELECT id, student_name, student_email, bonus_marks FROM ai_interviews WHERE bonus_marks > 0').all()
    : [];
  console.log(`${rows.length} interview(s) have a bonus.`);
  rows.forEach((r) => console.log(`  ${pad(r.student_name, 32)} ${pad(r.student_email, 34)} +${r.bonus_marks}`));
  if (!APPLY || rows.length === 0) {
    if (!APPLY) console.log('\nDry run. Re-run with --apply to remove them.');
    return;
  }
  await backup();
  db.prepare('UPDATE ai_interviews SET bonus_marks = 0 WHERE bonus_marks > 0').run();
  console.log(`Removed bonus from ${rows.length} interview(s).`);
}

async function addBonus() {
  const interviews = db
    .prepare(
      `SELECT id, student_name, student_email, ${hasBonusColumn ? 'bonus_marks' : '0 AS bonus_marks'}
       FROM ai_interviews WHERE status = 'COMPLETED'`,
    )
    .all();

  const responses = db.prepare(`
    SELECT r.interview_id, r.ai_score, q.type, q.criteria
    FROM ai_responses r JOIN ai_questions q ON q.id = r.question_id
  `).all();
  const byInterview = new Map();
  for (const row of responses) {
    if (!byInterview.has(row.interview_id)) byInterview.set(row.interview_id, []);
    byInterview.get(row.interview_id).push(row);
  }

  const targets = [];
  const alreadyBonused = [];
  for (const interview of interviews) {
    const { overall } = scoreInterview(byInterview.get(interview.id) || []);
    if (overall === null || overall >= PASS_MARK) continue;
    const entry = { ...interview, overall, next: Math.min(100, overall + MARKS) };
    if (interview.bonus_marks > 0) alreadyBonused.push(entry);
    else targets.push(entry);
  }

  console.log(`Database: ${dbPath}`);
  console.log(`Completed interviews: ${interviews.length}. Failed (overall < ${PASS_MARK}): ${targets.length + alreadyBonused.length}.\n`);

  if (alreadyBonused.length > 0) {
    console.log(`Skipping ${alreadyBonused.length} that already have a bonus:`);
    alreadyBonused.forEach((r) =>
      console.log(`  ${pad(r.student_name, 32)} ${pad(r.student_email, 34)} ${r.overall}% (+${r.bonus_marks} already)`),
    );
    console.log('');
  }

  if (targets.length === 0) {
    console.log('Nobody to update.');
    return;
  }

  console.log(`${APPLY ? 'Adding' : 'Would add'} +${MARKS} to:`);
  targets.forEach((r) =>
    console.log(`  ${pad(r.student_name, 32)} ${pad(r.student_email, 34)} ${String(r.overall).padStart(3)}% -> ${r.next}%`),
  );

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to write these changes.');
    return;
  }

  await backup();
  const update = db.prepare('UPDATE ai_interviews SET bonus_marks = ? WHERE id = ?');
  db.transaction(() => targets.forEach((r) => update.run(MARKS, r.id)))();
  console.log(`\nUpdated ${targets.length} interview(s).`);
}

(UNDO ? undo() : addBonus())
  .then(() => db.close())
  .catch((error) => {
    console.error(error);
    db.close();
    process.exit(1);
  });
