const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const candidateQuery = process.argv[2] || 'APP-2025-57886';
console.log(`Searching for candidate: "${candidateQuery}"...`);

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'ai_interviews.db');

if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database file not found at ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

try {
  const interviews = db.prepare(`
    SELECT * FROM ai_interviews 
    WHERE student_id LIKE ? OR student_name LIKE ? OR id = ?
    ORDER BY created_at DESC
  `).all(`%${candidateQuery}%`, `%${candidateQuery}%`, candidateQuery);

  if (interviews.length === 0) {
    console.log(`No interview record found for candidate matching "${candidateQuery}".`);
    process.exit(0);
  }

  for (const interview of interviews) {
    console.log(`Found interview ID: ${interview.id}`);
    console.log(`Candidate Name: ${interview.student_name || 'N/A'}`);
    console.log(`Candidate Student ID: ${interview.student_id}`);
    console.log(`Current Status: ${interview.status}`);
    console.log(`Started At: ${interview.started_at}`);

    // Clear suspicious log entries that triggered security termination
    const deletedLogs = db.prepare('DELETE FROM ai_suspicious_logs WHERE interview_id = ?').run(interview.id);
    console.log(`Cleared ${deletedLogs.changes} suspicious logs.`);

    // Reset status to STARTED and refresh started_at timestamp
    const nowIso = new Date().toISOString();
    db.prepare('UPDATE ai_interviews SET status = ?, started_at = ? WHERE id = ?').run('STARTED', nowIso, interview.id);
    console.log(`Successfully reset interview status to STARTED and updated start time to ${nowIso}!`);

    const responses = db.prepare('SELECT COUNT(*) as count FROM ai_responses WHERE interview_id = ?').get(interview.id);
    console.log(`Saved responses count preserved: ${responses.count}`);
    console.log(`Candidate ${interview.student_name || interview.student_id} can now log back into the portal and continue their assessment!`);
  }
} catch (err) {
  console.error('Error executing reset script:', err.message);
  process.exit(1);
}
