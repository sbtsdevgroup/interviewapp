const Database = require('better-sqlite3');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = join(__dirname, '..', 'data', 'ai_interviews.db');
const db = new Database(dbPath);

const newQuestions = [
  {
    text: "What is Phishing, and how do you verify if an email is legitimate?",
    type: "long-text",
    category: "Section 3: Customer Service & Behavioral Skills",
    criteria: "Look for checking sender domain address, avoiding clicking suspicious links, verifying through secondary channels, and reporting suspicious emails.",
    options: null,
    is_published: 0
  },
  {
    text: "A customer is demanding an immediate refund that is against company policy. How would you handle this refusal politely and professionally in 3-4 sentences?",
    type: "long-text",
    category: "Section 3: Customer Service & Behavioral Skills",
    criteria: "Evaluate empathy, clear explanation of policy without using negative words, offering alternative solutions, and maintaining a polite tone.",
    options: null,
    is_published: 0
  },
  {
    text: "Identify the sentence that uses correct subject-verb agreement:",
    type: "multiple-choice",
    category: "Section 2: Communication & English Proficiency",
    criteria: "Correct: B (Neither of the options is correct.)",
    options: JSON.stringify([
      "Neither of the options are correct.",
      "Neither of the options is correct.",
      "Both of the options is correct.",
      "Everyone have done their work."
    ]),
    is_published: 0
  },
  {
    text: "You receive a call from a customer who is speaking a language you do not understand. Describe the steps you would take to resolve this professionally.",
    type: "long-text",
    category: "Section 4: BPO Readiness & Work Ethic",
    criteria: "Evaluate active listening, language line translation service utilization, polite hold procedure, and supervisor escalation if needed.",
    options: null,
    is_published: 0
  },
  {
    text: "Please read the following passage aloud: 'She sells seashells by the seashore. The shells she sells are surely seashells. So if she sells seashells on the seashore, I'm sure she sells seashore shells.'",
    type: "accent",
    category: "Part B: Accent & Pronunciation Assessment",
    criteria: "Focus on clear pronunciation of sibilants (s vs sh), pacing, and tone.",
    options: null,
    is_published: 0
  }
];

function run() {
  console.log('Inserting new draft questions into database...');
  const stmt = db.prepare(`
    INSERT INTO ai_questions (id, text, type, criteria, category, options, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  let count = 0;
  for (const q of newQuestions) {
    const existing = db.prepare('SELECT id FROM ai_questions WHERE text = ?').get(q.text);
    if (!existing) {
      stmt.run(uuidv4(), q.text, q.type, q.criteria, q.category, q.options, q.is_published);
      count++;
    }
  }
  console.log(`Successfully inserted ${count} new draft questions.`);
}

run();
