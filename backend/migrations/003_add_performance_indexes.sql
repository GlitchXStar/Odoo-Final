-- Performance indexes for frequently queried columns

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_id ON companies(id);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

-- Auth middleware: users JOIN roles WHERE u.id = $1
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_id ON roles(id);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);

-- Employee queries
CREATE INDEX IF NOT EXISTS idx_employee_profiles_id ON employee_profiles(id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_company_id ON employee_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON employee_profiles(user_id);

-- Salary structure queries
CREATE INDEX IF NOT EXISTS idx_salary_structure_user_id ON salary_structure(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_structure_company_id ON salary_structure(company_id);
CREATE INDEX IF NOT EXISTS idx_salary_structure_is_active ON salary_structure(is_active);

-- Payroll queries
CREATE INDEX IF NOT EXISTS idx_payroll_user_id ON payroll(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_company_id ON payroll(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);

-- Attendance queries
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_company_id ON attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Leave queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_company_id ON leave_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
