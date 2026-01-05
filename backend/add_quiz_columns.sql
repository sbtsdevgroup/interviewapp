-- Add quiz-related columns to students table if they don't exist
-- This allows the system to store and display quiz scores separately from assessment scores

DO $$ 
BEGIN
    -- Add quizScore column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'quizScore'
    ) THEN
        ALTER TABLE students ADD COLUMN "quizScore" NUMERIC(5,2);
    END IF;

    -- Add quizStatus column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'quizStatus'
    ) THEN
        ALTER TABLE students ADD COLUMN "quizStatus" VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- If quiz scores don't exist but assessment scores do, we can optionally copy them
-- This is commented out - uncomment if you want to migrate existing assessment scores to quiz scores
-- UPDATE students 
-- SET "quizScore" = "assessmentScore", "quizStatus" = "assessmentStatus"
-- WHERE "quizScore" IS NULL AND "assessmentScore" IS NOT NULL;

