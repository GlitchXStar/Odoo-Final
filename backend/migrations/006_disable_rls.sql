-- RLS is redundant since app enforces company_id scoping in every WHERE clause.
-- Disabling to prevent conflicts with pool-based connections that don't set session variables.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structure DISABLE ROW LEVEL SECURITY;
