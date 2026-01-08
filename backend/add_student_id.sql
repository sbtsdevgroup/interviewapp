ALTER TABLE interviews
ADD COLUMN "student_id" UUID;

ALTER TABLE interviews
ADD CONSTRAINT fk_interviews_student
FOREIGN KEY (student_id)
REFERENCES students(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_interviews_student_id ON interviews(student_id);
