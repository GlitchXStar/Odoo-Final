-- Add skills column to employee_profiles (stored as JSON array of strings)
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
