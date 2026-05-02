require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('✓ PostgreSQL connected successfully');
    client.release();

    app.listen(PORT, () => {
      console.log(`✓ EmPay HRMS API server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API base URL: http://localhost:${PORT}/api`);
      console.log('──────────────────────────────────────');
      console.log('Available endpoints:');
      console.log('  POST   /api/auth/login           (email OR login_id)');
      console.log('  POST   /api/auth/create-user     (Admin/HR only)');
      console.log('  POST   /api/auth/change-password  (first-login required)');
      console.log('  POST   /api/auth/request-otp      (send OTP via email)');
      console.log('  POST   /api/auth/verify-otp       (verify OTP → JWT)');
      console.log('  GET    /api/users');
      console.log('  GET    /api/users/:id');
      console.log('  PUT    /api/users/:id');
      console.log('  DELETE /api/users/:id');
      console.log('  GET    /api/employees');
      console.log('  GET    /api/employees/me');
      console.log('  POST   /api/employees');
      console.log('  PUT    /api/employees/:id');
      console.log('  POST   /api/shifts');
      console.log('  GET    /api/shifts');
      console.log('  PUT    /api/shifts/:id');
      console.log('  POST   /api/employee-shifts');
      console.log('  POST   /api/attendance/check-in');
      console.log('  POST   /api/attendance/check-out');
      console.log('  GET    /api/attendance');
      console.log('  POST   /api/leaves/apply');
      console.log('  GET    /api/leaves');
      console.log('  PUT    /api/leaves/:id/approve');
      console.log('  PUT    /api/leaves/:id/reject');
      console.log('  POST   /api/holidays');
      console.log('  GET    /api/holidays');
      console.log('  DELETE /api/holidays/:id');
      console.log('  POST   /api/payroll/run');
      console.log('  GET    /api/payroll');
      console.log('  GET    /api/payslip/:payroll_id');
      console.log('  GET    /api/payslip/:payroll_id/download');
      console.log('  GET    /api/dashboard/stats');
      console.log('  GET    /api/dashboard/departments');
      console.log('  GET    /api/dashboard/activity');
      console.log('  GET    /api/companies');
      console.log('  GET    /api/companies/:id');
      console.log('  POST   /api/companies');
      console.log('  PUT    /api/companies/:id');
      console.log('  GET    /api/salary-structures');
      console.log('  GET    /api/salary-structures/user/:userId');
      console.log('  GET    /api/salary-structures/user/:userId/active');
      console.log('  POST   /api/salary-structures');
      console.log('  PUT    /api/salary-structures/:id');
      console.log('  GET    /api/leave-types');
      console.log('  POST   /api/leave-types');
      console.log('  PUT    /api/leave-types/:id');
      console.log('  DELETE /api/leave-types/:id');
      console.log('  GET    /api/leave-balances');
      console.log('  POST   /api/leave-balances/allocate');
      console.log('  POST   /api/leave-balances/bulk-allocate');
      console.log('──────────────────────────────────────');
    });
  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

startServer();
