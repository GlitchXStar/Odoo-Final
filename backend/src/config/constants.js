const ROLES = {
  ADMIN: 'Admin',
  HR_OFFICER: 'HR Officer',
  PAYROLL_OFFICER: 'Payroll Officer',
  EMPLOYEE: 'Employee',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  HOLIDAY: 'Holiday',
  HALF_DAY: 'Half-Day',
  WEEK_OFF: 'Week-Off',
};

const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const PAYROLL_STATUS = {
  DRAFT: 'Draft',
  PROCESSED: 'Processed',
  APPROVED: 'Approved',
  PAID: 'Paid',
  ON_HOLD: 'On Hold',
};

const EMPLOYMENT_TYPE = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

const EMPLOYEE_STATUS = ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'];

// Indian income tax slabs (New Regime FY 2024-25)
const INCOME_TAX_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 700000, rate: 5 },
  { min: 700001, max: 1000000, rate: 10 },
  { min: 1000001, max: 1200000, rate: 15 },
  { min: 1200001, max: 1500000, rate: 20 },
  { min: 1500001, max: Infinity, rate: 30 },
];

// Professional tax slabs (Maharashtra example)
const PROFESSIONAL_TAX_SLABS = [
  { min: 0, max: 7500, amount: 0 },
  { min: 7501, max: 10000, amount: 175 },
  { min: 10001, max: Infinity, amount: 200 },
];

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  LEAVE_STATUS,
  PAYROLL_STATUS,
  EMPLOYMENT_TYPE,
  EMPLOYEE_STATUS,
  INCOME_TAX_SLABS,
  PROFESSIONAL_TAX_SLABS,
};
