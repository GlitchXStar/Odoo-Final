-- Seed default leave types for all companies that don't have any
-- Annual Leave: 15 days per year (paid, carry-forward allowed)
INSERT INTO leave_types (company_id, name, code, annual_quota, is_paid, carry_forward, max_carry_forward)
SELECT c.id, 'Annual Leave', 'AL', 15, true, true, 5
FROM companies c
WHERE c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM leave_types lt WHERE lt.company_id = c.id AND lt.code = 'AL'
  );
-- Update existing Annual Leave to 15 days
UPDATE leave_types SET annual_quota = 15 WHERE code = 'AL';

-- Sick Leave: 60 days per year (paid)
INSERT INTO leave_types (company_id, name, code, annual_quota, is_paid, carry_forward, max_carry_forward)
SELECT c.id, 'Sick Leave', 'SL', 60, true, false, 0
FROM companies c
WHERE c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM leave_types lt WHERE lt.company_id = c.id AND lt.code = 'SL'
  );
-- Update existing Sick Leave to 60 days
UPDATE leave_types SET annual_quota = 60 WHERE code = 'SL';

-- Deactivate Casual Leave
UPDATE leave_types SET is_active = false WHERE code = 'CL';

-- Paid Leave: 5 days per year
INSERT INTO leave_types (company_id, name, code, annual_quota, is_paid, carry_forward, max_carry_forward)
SELECT c.id, 'Paid Leave', 'PL', 5, true, false, 0
FROM companies c
WHERE c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM leave_types lt WHERE lt.company_id = c.id AND lt.code = 'PL'
  );
-- Update existing Paid Leave to 5 days
UPDATE leave_types SET annual_quota = 5 WHERE code = 'PL' AND is_active = true;

-- Unpaid Leave: 30 days per year (not paid)
INSERT INTO leave_types (company_id, name, code, annual_quota, is_paid, carry_forward, max_carry_forward)
SELECT c.id, 'Unpaid Leave', 'UL', 30, false, false, 0
FROM companies c
WHERE c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM leave_types lt WHERE lt.company_id = c.id AND lt.code = 'UL'
  );
-- Update existing Unpaid Leave to 30 days
UPDATE leave_types SET annual_quota = 30 WHERE code = 'UL';
