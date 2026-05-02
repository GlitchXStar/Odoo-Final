const { query } = require('../config/db');

const DEFAULTS = {
  leave_request_submitted: true,
  leave_approved_rejected: true,
  payslip_generated: true,
  new_employee_onboarded: true,
  attendance_anomaly: false,
  payroll_processing_complete: true,
  daily_attendance_reminder: true,
  leave_balance_warning: false,
  birthday_anniversary: true,
};

const getSettings = async (companyId) => {
  const result = await query(
    'SELECT preferences FROM notification_settings WHERE company_id = $1',
    [companyId]
  );
  if (result.rows.length === 0) return DEFAULTS;
  return { ...DEFAULTS, ...result.rows[0].preferences };
};

const saveSettings = async (companyId, preferences) => {
  await query(
    `INSERT INTO notification_settings (company_id, preferences)
     VALUES ($1, $2)
     ON CONFLICT (company_id)
     DO UPDATE SET preferences = $2, updated_at = NOW()`,
    [companyId, JSON.stringify(preferences)]
  );
  return getSettings(companyId);
};

const ensureTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS notification_settings (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
      preferences JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

module.exports = { getSettings, saveSettings, ensureTable };
