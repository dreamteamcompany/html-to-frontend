-- Add soft removal column for applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for filtering removed applications
CREATE INDEX IF NOT EXISTS idx_applications_deleted_at ON applications(deleted_at);
