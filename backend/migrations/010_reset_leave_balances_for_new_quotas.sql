-- Reset leave balances so auto-allocation re-creates them with updated quotas
-- This clears all existing balances for the current year to trigger fresh allocation
DELETE FROM leave_balances WHERE year = EXTRACT(YEAR FROM CURRENT_DATE);

-- Deactivate Casual Leave across all companies
UPDATE leave_types SET is_active = false WHERE code = 'CL';

-- Update existing leave type quotas to match new defaults
UPDATE leave_types SET annual_quota = 15 WHERE code = 'AL' AND is_active = true;
UPDATE leave_types SET annual_quota = 5  WHERE code = 'PL' AND is_active = true;
UPDATE leave_types SET annual_quota = 60 WHERE code = 'SL' AND is_active = true;
UPDATE leave_types SET annual_quota = 30 WHERE code = 'UL';
