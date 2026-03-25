import { Module, Global } from '@nestjs/common';
import Database = require('better-sqlite3');
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Global()
@Module({
  providers: [
    {
      provide: 'AI_DATABASE',
      useFactory: () => {
        const dataDir = join(process.cwd(), 'data');
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir);
        }
        
        const dbPath = join(dataDir, 'ai_interviews.db');
        const db = new Database(dbPath);
        
        // Initialize schema
        db.exec(`
          CREATE TABLE IF NOT EXISTS ai_interviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            schedule_date TEXT NOT NULL,
            instructions TEXT,
            status TEXT DEFAULT 'PENDING',
            started_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS ai_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interview_id INTEGER NOT NULL,
            question_id TEXT NOT NULL,
            student_answer TEXT,
            ai_score INTEGER,
            ai_feedback TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (interview_id) REFERENCES ai_interviews (id) ON DELETE CASCADE
          );
        `);
        
        console.log('SQLite database initialized at:', dbPath);
        return db;
      },
    },
  ],
  exports: ['AI_DATABASE'],
})
export class AiDatabaseModule {}
