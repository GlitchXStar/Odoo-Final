-- =====================================================
-- Migration: Add login_id and is_first_login to users
-- =====================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS login_id VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);

COMMENT ON COLUMN users.login_id IS 'Auto-generated unique Login ID: [CompanyCode2][Initials4][Year4][Serial4]';
COMMENT ON COLUMN users.is_first_login IS 'Forces password change on first login';
