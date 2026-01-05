-- Create interviews table for admin interview records
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fullName" VARCHAR(255) NOT NULL,
    "agentName" VARCHAR(255),
    "interviewDate" DATE DEFAULT CURRENT_DATE,
    "interviewer" VARCHAR(255),
    "track" VARCHAR(50) DEFAULT 'Voice',
    "values" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create index for search
CREATE INDEX IF NOT EXISTS idx_interviews_fullname ON interviews("fullName");
CREATE INDEX IF NOT EXISTS idx_interviews_agentname ON interviews("agentName");
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer ON interviews("interviewer");
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews("interviewDate");
