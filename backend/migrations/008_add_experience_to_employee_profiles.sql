-- Add experience column to employee_profiles (stored as JSONB array)
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]';
