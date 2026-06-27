const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'data', 'ai_interviews.db');
const db = new Database(dbPath);

const row = db.prepare("SELECT id, text, options FROM ai_questions WHERE type = 'ranking' AND text LIKE '%schedule types%' LIMIT 1").get();
if (row) {
  const newText = "Rank the following schedule types in order of your preference, where 1 = most preferred and 3 = least preferred.";
  const newOptions = JSON.stringify(["Full-time day schedule", "Full-time night schedule", "Flexible / rotational shift schedule"]);
  db.prepare('UPDATE ai_questions SET text = ?, options = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newText, newOptions, row.id);
  console.log('Updated schedule ranking question. Old options: ' + row.options);
  const check = db.prepare('SELECT options FROM ai_questions WHERE id = ?').get(row.id);
  console.log('New options: ' + check.options);
} else {
  console.log('Schedule ranking question not found.');
}
db.close();
