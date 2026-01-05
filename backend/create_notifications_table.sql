-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "userType" VARCHAR(20) NOT NULL CHECK ("userType" IN ('student', 'admin')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "relatedEntityType" VARCHAR(50),
  "relatedEntityId" UUID,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId", "userType", "isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);

-- Add comment
COMMENT ON TABLE notifications IS 'Stores notifications for both students and admins';

