import { Module, Global } from '@nestjs/common';
import Database = require('better-sqlite3');
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            schedule_date TEXT NOT NULL,
            instructions TEXT,
            status TEXT DEFAULT 'PENDING',
            started_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            student_name TEXT,
            student_email TEXT,
            student_phone TEXT,
            student_track TEXT
          );

          CREATE TABLE IF NOT EXISTS ai_questions (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            type TEXT DEFAULT 'long-text',
            category TEXT,
            options TEXT, -- JSON string array
            criteria TEXT NOT NULL,
            is_published INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS ai_responses (
            id TEXT PRIMARY KEY,
            interview_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            student_answer TEXT NOT NULL,
            ai_score INTEGER,
            ai_feedback TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (interview_id) REFERENCES ai_interviews (id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS ai_admins (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Migration: Add columns to ai_interviews if they don't exist
        try {
          const columns = db.prepare("PRAGMA table_info(ai_interviews)").all() as any[];
          const columnNames = columns.map(c => c.name);
          
          if (!columnNames.includes('student_name')) {
            db.exec("ALTER TABLE ai_interviews ADD COLUMN student_name TEXT");
          }
          if (!columnNames.includes('student_email')) {
            db.exec("ALTER TABLE ai_interviews ADD COLUMN student_email TEXT");
          }
          if (!columnNames.includes('student_phone')) {
            db.exec("ALTER TABLE ai_interviews ADD COLUMN student_phone TEXT");
          }
          if (!columnNames.includes('student_track')) {
            db.exec("ALTER TABLE ai_interviews ADD COLUMN student_track TEXT");
          }
        } catch (err) {
          console.error('Migration error for ai_interviews:', err);
        }

        // Seed default admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@dbi.edu.ng';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        const existingAdmin = db.prepare('SELECT id FROM ai_admins WHERE email = ?').get(adminEmail);
        if (!existingAdmin) {
          const adminId = uuidv4();
          const hashedPassword = bcrypt.hashSync(adminPassword, 10);
          db.prepare('INSERT INTO ai_admins (id, email, password) VALUES (?, ?, ?)').run(adminId, adminEmail, hashedPassword);
          console.log(`Default admin seeded: ${adminEmail} (ID: ${adminId})`);
        }
        
        console.log('SQLite database initialized at:', dbPath);
        return db;
      },
    },
  ],
  exports: ['AI_DATABASE'],
})
export class AiDatabaseModule {}
