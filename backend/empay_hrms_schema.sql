-- =====================================================
-- EmPay - Smart Human Resource Management System
-- PostgreSQL Database Schema
-- =====================================================
-- Version: 1.0
-- Description: Multi-tenant HRMS with attendance, leave, payroll, and tax management
-- =====================================================

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MULTI-COMPANY ARCHITECTURE
-- =====================================================

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(20),
    tax_id VARCHAR(100),
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE companies IS 'Multi-tenant company master table';
COMMENT ON COLUMN companies.code IS 'Unique company identifier code';

-- =====================================================
-- 2. ROLES & USERS
-- =====================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS 'Role-based access control definitions';
COMMENT ON COLUMN roles.permissions IS 'JSON object storing granular permissions';

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('Admin', 'Full system access', '{"all": true}'::jsonb),
('HR Officer', 'HR management access', '{"employees": true, "attendance": true, "leaves": true}'::jsonb),
('Payroll Officer', 'Payroll processing access', '{"payroll": true, "salary": true, "reports": true}'::jsonb),
('Employee', 'Basic employee access', '{"self_attendance": true, "self_leave": true, "self_payslip": true}'::jsonb);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

COMMENT ON TABLE users IS 'User authentication and basic information';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';

-- =====================================================
-- 3. EMPLOYEE PROFILES
-- =====================================================

CREATE TABLE employee_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    company_id INTEGER NOT NULL,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    date_of_joining DATE NOT NULL,
    date_of_leaving DATE,
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Intern')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned')),
    manager_id INTEGER,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    blood_group VARCHAR(5),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    permanent_address TEXT,
    current_address TEXT,
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_ifsc VARCHAR(20),
    profile_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE employee_profiles IS 'Detailed employee profile information (one-to-one with users)';
COMMENT ON COLUMN employee_profiles.employee_code IS 'Unique employee identifier within company';

-- =====================================================
-- 4. SHIFT MANAGEMENT
-- =====================================================

CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_minutes INTEGER DEFAULT 0,
    half_day_hours DECIMAL(4,2) DEFAULT 4.00,
    full_day_hours DECIMAL(4,2) DEFAULT 8.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shift_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT chk_grace_minutes CHECK (grace_minutes >= 0 AND grace_minutes <= 60)
);

COMMENT ON TABLE shifts IS 'Shift definitions for different work timings';
COMMENT ON COLUMN shifts.grace_minutes IS 'Grace period in minutes for late check-in';

CREATE TABLE employee_shifts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    shift_id INTEGER NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empshift_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_empshift_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_empshift_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT,
    CONSTRAINT uq_employee_shift_date UNIQUE (user_id, effective_from)
);

COMMENT ON TABLE employee_shifts IS 'Employee shift assignments with effective date tracking';
COMMENT ON COLUMN employee_shifts.effective_from IS 'Date from which this shift becomes active';

-- =====================================================
-- 5. ATTENDANCE SYSTEM
-- =====================================================

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    date DATE NOT NULL,
    shift_id INTEGER,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    late_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    work_hours DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'Absent' CHECK (status IN ('Present', 'Absent', 'Leave', 'Holiday', 'Half-Day', 'Week-Off')),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_date UNIQUE (user_id, date)
);

COMMENT ON TABLE attendance IS 'Daily attendance records with check-in/check-out tracking';
COMMENT ON COLUMN attendance.late_minutes IS 'Minutes late after grace period';
COMMENT ON COLUMN attendance.overtime_minutes IS 'Minutes worked beyond shift end time';

-- =====================================================
-- 6. LEAVE MANAGEMENT
-- =====================================================

CREATE TABLE leave_types (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    annual_quota INTEGER,
    is_paid BOOLEAN DEFAULT TRUE,
    carry_forward BOOLEAN DEFAULT FALSE,
    max_carry_forward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leavetype_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT uq_company_leave_code UNIQUE (company_id, code)
);

COMMENT ON TABLE leave_types IS 'Leave type definitions per company';
COMMENT ON COLUMN leave_types.annual_quota IS 'Number of leaves allowed per year';

CREATE TABLE leave_balances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_allocated DECIMAL(5,2) DEFAULT 0,
    used DECIMAL(5,2) DEFAULT 0,
    balance DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leavebal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_leavebal_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_leavebal_leavetype FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_leavetype_year UNIQUE (user_id, leave_type_id, year)
);

COMMENT ON TABLE leave_balances IS 'Annual leave balance tracking per employee';

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    leave_type_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    approved_by INTEGER,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leavereq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_leavereq_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_leavereq_leavetype FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_leavereq_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_total_days CHECK (total_days > 0)
);

COMMENT ON TABLE leave_requests IS 'Employee leave applications and approval tracking';
COMMENT ON COLUMN leave_requests.total_days IS 'Number of leave days (can be fractional for half-day)';

-- =====================================================
-- 7. HOLIDAY CALENDAR
-- =====================================================

CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) DEFAULT 'National' CHECK (type IN ('National', 'Optional', 'Company', 'Regional')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_holiday_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

COMMENT ON TABLE holidays IS 'Company-wide holiday calendar';
COMMENT ON COLUMN holidays.type IS 'Holiday classification for different applicability';

CREATE TABLE holiday_assignments (
    id SERIAL PRIMARY KEY,
    holiday_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_applicable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_holassign_holiday FOREIGN KEY (holiday_id) REFERENCES holidays(id) ON DELETE CASCADE,
    CONSTRAINT fk_holassign_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_holiday_user UNIQUE (holiday_id, user_id)
);

COMMENT ON TABLE holiday_assignments IS 'Optional: Individual holiday applicability for employees';

-- =====================================================
-- 8. SALARY STRUCTURE
-- =====================================================

CREATE TABLE salary_structure (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    basic DECIMAL(12,2) NOT NULL,
    hra DECIMAL(12,2) DEFAULT 0,
    conveyance_allowance DECIMAL(12,2) DEFAULT 0,
    medical_allowance DECIMAL(12,2) DEFAULT 0,
    special_allowance DECIMAL(12,2) DEFAULT 0,
    bonus DECIMAL(12,2) DEFAULT 0,
    other_allowances DECIMAL(12,2) DEFAULT 0,
    gross_salary DECIMAL(12,2) GENERATED ALWAYS AS (
        basic + hra + conveyance_allowance + medical_allowance + special_allowance + bonus + other_allowances
    ) STORED,
    currency VARCHAR(10) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_salary_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT chk_basic_positive CHECK (basic > 0)
);

COMMENT ON TABLE salary_structure IS 'Employee salary components with effective date tracking';
COMMENT ON COLUMN salary_structure.gross_salary IS 'Auto-calculated total of all salary components';

-- =====================================================
-- 9. TAX & DEDUCTIONS
-- =====================================================

CREATE TABLE tax_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    financial_year VARCHAR(10) NOT NULL,
    pf_percentage DECIMAL(5,2) DEFAULT 12.00,
    pf_employee_contribution DECIMAL(12,2) DEFAULT 0,
    pf_employer_contribution DECIMAL(12,2) DEFAULT 0,
    esi_percentage DECIMAL(5,2) DEFAULT 0.75,
    esi_employee_contribution DECIMAL(12,2) DEFAULT 0,
    esi_employer_contribution DECIMAL(12,2) DEFAULT 0,
    professional_tax DECIMAL(12,2) DEFAULT 0,
    income_tax DECIMAL(12,2) DEFAULT 0,
    tds DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    deduction_remarks JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tax_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tax_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_financial_year UNIQUE (user_id, financial_year),
    CONSTRAINT chk_pf_percentage CHECK (pf_percentage >= 0 AND pf_percentage <= 100),
    CONSTRAINT chk_esi_percentage CHECK (esi_percentage >= 0 AND esi_percentage <= 100)
);

COMMENT ON TABLE tax_details IS 'Employee tax configuration and statutory deductions';
COMMENT ON COLUMN tax_details.financial_year IS 'Format: YYYY-YYYY (e.g., 2024-2025)';

-- =====================================================
-- 10. PAYROLL SYSTEM
-- =====================================================

CREATE TABLE payroll (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000),
    salary_structure_id INTEGER,
    basic DECIMAL(12,2) NOT NULL,
    hra DECIMAL(12,2) DEFAULT 0,
    allowances DECIMAL(12,2) DEFAULT 0,
    bonus DECIMAL(12,2) DEFAULT 0,
    gross_salary DECIMAL(12,2) NOT NULL,
    pf_deduction DECIMAL(12,2) DEFAULT 0,
    esi_deduction DECIMAL(12,2) DEFAULT 0,
    professional_tax DECIMAL(12,2) DEFAULT 0,
    income_tax DECIMAL(12,2) DEFAULT 0,
    tds DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    working_days INTEGER DEFAULT 0,
    present_days DECIMAL(5,2) DEFAULT 0,
    leave_days DECIMAL(5,2) DEFAULT 0,
    absent_days DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(6,2) DEFAULT 0,
    overtime_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Processed', 'Approved', 'Paid', 'On Hold')),
    payment_date DATE,
    payment_mode VARCHAR(50),
    transaction_reference VARCHAR(100),
    generated_by INTEGER,
    approved_by INTEGER,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payroll_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_payroll_salary FOREIGN KEY (salary_structure_id) REFERENCES salary_structure(id) ON DELETE SET NULL,
    CONSTRAINT fk_payroll_generator FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_payroll_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_month_year UNIQUE (user_id, month, year)
);

COMMENT ON TABLE payroll IS 'Monthly payroll processing records';
COMMENT ON COLUMN payroll.net_salary IS 'Gross salary minus total deductions';

-- =====================================================
-- 11. PAYSLIPS
-- =====================================================

CREATE TABLE payslips (
    id SERIAL PRIMARY KEY,
    payroll_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payslip_payroll FOREIGN KEY (payroll_id) REFERENCES payroll(id) ON DELETE CASCADE,
    CONSTRAINT fk_payslip_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payslip_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

COMMENT ON TABLE payslips IS 'Generated payslip documents (one-to-one with payroll)';
COMMENT ON COLUMN payslips.file_url IS 'URL or path to the generated PDF payslip';

-- =====================================================
-- 12. AUDIT LOGS
-- =====================================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    company_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

COMMENT ON TABLE audit_logs IS 'System-wide audit trail for compliance and security';
COMMENT ON COLUMN audit_logs.entity_type IS 'Table name of the affected entity';
COMMENT ON COLUMN audit_logs.entity_id IS 'Primary key of the affected record';

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Companies
CREATE INDEX idx_companies_code ON companies(code);
CREATE INDEX idx_companies_active ON companies(is_active);

-- Users
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_company_active ON users(company_id, is_active);

-- Employee Profiles
CREATE INDEX idx_employee_user ON employee_profiles(user_id);
CREATE INDEX idx_employee_company ON employee_profiles(company_id);
CREATE INDEX idx_employee_code ON employee_profiles(employee_code);
CREATE INDEX idx_employee_status ON employee_profiles(status);
CREATE INDEX idx_employee_manager ON employee_profiles(manager_id);
CREATE INDEX idx_employee_company_status ON employee_profiles(company_id, status);

-- Shifts
CREATE INDEX idx_shifts_company ON shifts(company_id);
CREATE INDEX idx_shifts_active ON shifts(is_active);

-- Employee Shifts
CREATE INDEX idx_empshift_user ON employee_shifts(user_id);
CREATE INDEX idx_empshift_company ON employee_shifts(company_id);
CREATE INDEX idx_empshift_shift ON employee_shifts(shift_id);
CREATE INDEX idx_empshift_effective ON employee_shifts(effective_from, effective_to);

-- Attendance (Critical for performance)
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_company ON attendance(company_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_attendance_company_date ON attendance(company_id, date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_month ON attendance(user_id, date) WHERE EXTRACT(DAY FROM date) = 1;

-- Leave Types
CREATE INDEX idx_leavetype_company ON leave_types(company_id);
CREATE INDEX idx_leavetype_active ON leave_types(is_active);

-- Leave Balances
CREATE INDEX idx_leavebal_user ON leave_balances(user_id);
CREATE INDEX idx_leavebal_company ON leave_balances(company_id);
CREATE INDEX idx_leavebal_year ON leave_balances(year);

-- Leave Requests
CREATE INDEX idx_leavereq_user ON leave_requests(user_id);
CREATE INDEX idx_leavereq_company ON leave_requests(company_id);
CREATE INDEX idx_leavereq_status ON leave_requests(status);
CREATE INDEX idx_leavereq_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leavereq_approver ON leave_requests(approved_by);

-- Holidays
CREATE INDEX idx_holidays_company ON holidays(company_id);
CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_company_date ON holidays(company_id, date);

-- Salary Structure
CREATE INDEX idx_salary_user ON salary_structure(user_id);
CREATE INDEX idx_salary_company ON salary_structure(company_id);
CREATE INDEX idx_salary_effective ON salary_structure(effective_from, effective_to);
CREATE INDEX idx_salary_active ON salary_structure(is_active);

-- Tax Details
CREATE INDEX idx_tax_user ON tax_details(user_id);
CREATE INDEX idx_tax_company ON tax_details(company_id);
CREATE INDEX idx_tax_year ON tax_details(financial_year);

-- Payroll (Critical for performance)
CREATE INDEX idx_payroll_user ON payroll(user_id);
CREATE INDEX idx_payroll_company ON payroll(company_id);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);
CREATE INDEX idx_payroll_company_month_year ON payroll(company_id, month, year);
CREATE INDEX idx_payroll_status ON payroll(status);
CREATE INDEX idx_payroll_generator ON payroll(generated_by);

-- Payslips
CREATE INDEX idx_payslip_payroll ON payslips(payroll_id);
CREATE INDEX idx_payslip_user ON payslips(user_id);
CREATE INDEX idx_payslip_company ON payslips(company_id);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active employees with current shift
CREATE OR REPLACE VIEW v_active_employees AS
SELECT 
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.company_id,
    c.name AS company_name,
    ep.employee_code,
    ep.department,
    ep.designation,
    ep.employment_type,
    ep.date_of_joining,
    r.name AS role_name,
    s.name AS shift_name,
    s.start_time,
    s.end_time
FROM users u
INNER JOIN companies c ON u.company_id = c.id
INNER JOIN employee_profiles ep ON u.id = ep.user_id
INNER JOIN roles r ON u.role_id = r.id
LEFT JOIN LATERAL (
    SELECT shift_id 
    FROM employee_shifts 
    WHERE user_id = u.id 
    AND effective_from <= CURRENT_DATE 
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    ORDER BY effective_from DESC 
    LIMIT 1
) es ON TRUE
LEFT JOIN shifts s ON es.shift_id = s.id
WHERE u.is_active = TRUE AND ep.status = 'Active';

COMMENT ON VIEW v_active_employees IS 'Active employees with their current shift information';

-- Monthly attendance summary
CREATE OR REPLACE VIEW v_monthly_attendance_summary AS
SELECT 
    user_id,
    company_id,
    EXTRACT(YEAR FROM date) AS year,
    EXTRACT(MONTH FROM date) AS month,
    COUNT(*) FILTER (WHERE status = 'Present') AS present_days,
    COUNT(*) FILTER (WHERE status = 'Absent') AS absent_days,
    COUNT(*) FILTER (WHERE status = 'Leave') AS leave_days,
    COUNT(*) FILTER (WHERE status = 'Holiday') AS holiday_days,
    COUNT(*) FILTER (WHERE status = 'Half-Day') AS half_days,
    SUM(late_minutes) AS total_late_minutes,
    SUM(overtime_minutes) AS total_overtime_minutes,
    SUM(work_hours) AS total_work_hours
FROM attendance
GROUP BY user_id, company_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date);

COMMENT ON VIEW v_monthly_attendance_summary IS 'Monthly attendance aggregation per employee';

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp trigger to all tables
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_employee_profiles_updated_at BEFORE UPDATE ON employee_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_employee_shifts_updated_at BEFORE UPDATE ON employee_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_leave_types_updated_at BEFORE UPDATE ON leave_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_leave_balances_updated_at BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_salary_structure_updated_at BEFORE UPDATE ON salary_structure FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tax_details_updated_at BEFORE UPDATE ON tax_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payroll_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update leave balance after leave approval
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
        UPDATE leave_balances
        SET 
            used = used + NEW.total_days,
            balance = balance - NEW.total_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND leave_type_id = NEW.leave_type_id
        AND year = EXTRACT(YEAR FROM NEW.start_date);
    ELSIF NEW.status = 'Cancelled' AND OLD.status = 'Approved' THEN
        UPDATE leave_balances
        SET 
            used = used - NEW.total_days,
            balance = balance + NEW.total_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND leave_type_id = NEW.leave_type_id
        AND year = EXTRACT(YEAR FROM NEW.start_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leave_balance_update 
AFTER UPDATE ON leave_requests 
FOR EACH ROW 
EXECUTE FUNCTION update_leave_balance();

COMMENT ON FUNCTION update_leave_balance() IS 'Automatically updates leave balance when leave is approved or cancelled';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) FOR MULTI-TENANCY
-- =====================================================

-- Enable RLS on critical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structure ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see data from their company
CREATE POLICY company_isolation_users ON users
    USING (company_id = current_setting('app.current_company_id')::INTEGER);

CREATE POLICY company_isolation_employee_profiles ON employee_profiles
    USING (company_id = current_setting('app.current_company_id')::INTEGER);

CREATE POLICY company_isolation_attendance ON attendance
    USING (company_id = current_setting('app.current_company_id')::INTEGER);

CREATE POLICY company_isolation_leave_requests ON leave_requests
    USING (company_id = current_setting('app.current_company_id')::INTEGER);

CREATE POLICY company_isolation_payroll ON payroll
    USING (company_id = current_setting('app.current_company_id')::INTEGER);

CREATE POLICY company_isolation_salary_structure ON salary_structure
    USING (company_id = current_setting('app.current_company_id')::INTEGER);

COMMENT ON POLICY company_isolation_users ON users IS 'Ensures users can only access data from their own company';

-- =====================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- =====================================================

-- Insert sample company
INSERT INTO companies (name, code, email, phone, address, city, state, country, pincode)
VALUES ('Tech Solutions Pvt Ltd', 'TECH001', 'info@techsolutions.com', '+91-9876543210', 
        '123 Tech Park', 'Bangalore', 'Karnataka', 'India', '560001');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
