-- Create table for interview recordings and AI analysis
CREATE TABLE IF NOT EXISTS interview_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    interview_date TIMESTAMP NOT NULL,
    recording_url TEXT,
    recording_duration FLOAT, -- Duration in seconds
    transcript TEXT,
    transcript_segments JSONB, -- Array of segments with timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create table for AI analysis results
CREATE TABLE IF NOT EXISTS interview_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL REFERENCES interview_recordings(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2),
    communication_score NUMERIC(5,2),
    technical_knowledge_score NUMERIC(5,2),
    confidence_score NUMERIC(5,2),
    clarity_score NUMERIC(5,2),
    strengths JSONB, -- Array of strengths
    weaknesses JSONB, -- Array of weaknesses
    recommendations JSONB, -- Array of recommendations
    summary TEXT,
    sentiment VARCHAR(20), -- positive, neutral, negative
    analysis_data JSONB, -- Full analysis response from AI
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interview_recordings_student_id ON interview_recordings(student_id);
CREATE INDEX IF NOT EXISTS idx_interview_recordings_interview_date ON interview_recordings(interview_date);
CREATE INDEX IF NOT EXISTS idx_interview_ai_analysis_recording_id ON interview_ai_analysis(recording_id);

-- Add comment
COMMENT ON TABLE interview_recordings IS 'Stores interview recordings and transcripts';
COMMENT ON TABLE interview_ai_analysis IS 'Stores AI analysis results for interviews';

