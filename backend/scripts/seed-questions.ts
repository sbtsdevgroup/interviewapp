import Database from 'better-sqlite3';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = join(process.cwd(), 'data', 'ai_interviews.db');
const db = new Database(dbPath);

const questions = [
  // Cybersecurity
  {
    text: "Explain the difference between symmetric and asymmetric encryption. When would you use one over the other?",
    criteria: "Look for mentions of shared keys vs public/private key pairs, performance differences, and key distribution challenges.",
    category: "Cybersecurity",
    difficulty: "intermediate"
  },
  {
    text: "What is a Man-in-the-Middle (MitM) attack, and how can SSL/TLS help prevent it?",
    criteria: "The answer should cover interception of communication, certificate authorities, and data encryption.",
    category: "Cybersecurity",
    difficulty: "intermediate"
  },
  {
    text: "What are the common signs of a SQL injection vulnerability in a web application?",
    criteria: "Look for mention of unsanitized input, database error disclosure, and bypass of authentication logic.",
    category: "Cybersecurity",
    difficulty: "advanced"
  },

  // Software Engineering
  {
    text: "What are the SOLID principles in object-oriented design? Pick one and explain it in detail.",
    criteria: "Check for Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.",
    category: "Software Engineering",
    difficulty: "intermediate"
  },
  {
    text: "Explain the concept of 'Technical Debt'. How do you balance speed of delivery with code quality?",
    criteria: "Should mention refactoring, long-term maintenance costs, and intentional vs unintentional debt.",
    category: "Software Engineering",
    difficulty: "intermediate"
  },
  {
    text: "What is the difference between a Microservices architecture and a Monolithic architecture?",
    criteria: "Look for scalability, deployment independence, complexity, and network latency considerations.",
    category: "Software Engineering",
    difficulty: "advanced"
  },

  // Data Science
  {
    text: "Explain the difference between supervised and unsupervised learning.",
    criteria: "Mention labeled vs unlabeled data and common algorithms (e.g., Regression vs Clustering).",
    category: "Data Science",
    difficulty: "beginner"
  },
  {
    text: "What is 'Overfitting' in a machine learning model, and how can you prevent it?",
    criteria: "Check for high variance, training vs testing performance, and techniques like regularization or cross-validation.",
    category: "Data Science",
    difficulty: "advanced"
  },

  // UI/UX Design
  {
    text: "What is 'Accessibility' in web design, and why is it important?",
    criteria: "Look for screen readers, keyboard navigation, color contrast, and inclusive design principles.",
    category: "UI/UX Design",
    difficulty: "beginner"
  },
  {
    text: "Explain the difference between 'User Experience' (UX) and 'User Interface' (UI).",
    criteria: "Should distinguish between the overall journey/feeling vs the visual appearance/elements.",
    category: "UI/UX Design",
    difficulty: "beginner"
  }
];

function seed() {
  console.log('Seeding AI interview questions...');
  
  const insert = db.prepare(`
    INSERT INTO ai_questions (id, text, criteria, category, is_published)
    VALUES (?, ?, ?, ?, ?)
  `);

  const countStmt = db.prepare('SELECT COUNT(*) as count FROM ai_questions');
  const initialCount = (countStmt.get() as any).count;
  console.log(`Current questions count: ${initialCount}`);

  let insertedCount = 0;
  
  const transaction = db.transaction((qs) => {
    for (const q of qs) {
      // Avoid duplicates based on text
      const check = db.prepare('SELECT id FROM ai_questions WHERE text = ?').get(q.text);
      if (!check) {
        insert.run(uuidv4(), q.text, q.criteria, q.category, 1); // 1 for is_published
        insertedCount++;
      }
    }
  });

  transaction(questions);

  console.log(`Seed completed. Inserted ${insertedCount} new questions.`);
  const finalCount = (countStmt.get() as any).count;
  console.log(`Total questions count: ${finalCount}`);
  
  db.close();
}

try {
  seed();
} catch (error) {
  console.error('Seed failed:', error);
  process.exit(1);
}
