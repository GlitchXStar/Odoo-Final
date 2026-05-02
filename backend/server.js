require('dotenv').config();
const app  = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// ── ANSI helpers ─────────────────────────────────────────────────────────────
const R    = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM  = '\x1b[2m';
const c    = (code, s) => `\x1b[${code}m${s}${R}`;
const grn  = s => c(92, s);
const red  = s => c(91, s);
const yel  = s => c(93, s);
const blu  = s => c(94, s);
const cyn  = s => c(96, s);
const dim  = s => `${DIM}${s}${R}`;
const bold = s => `${BOLD}${s}${R}`;

// ── Route table ───────────────────────────────────────────────────────────────
const ROUTES = [
  // [method, path, note]
  ['POST', '/api/auth/register',                   'public — new admin + company'],
  ['POST', '/api/auth/login',                      'email or login_id'],
  ['POST', '/api/auth/request-otp',                'send OTP via email'],
  ['POST', '/api/auth/verify-otp',                 'verify OTP → JWT'],
  ['POST', '/api/auth/create-user',                'Admin/HR only'],
  ['POST', '/api/auth/change-password',            'authenticated'],
  [null],
  ['GET',  '/api/companies/me',                    'own company'],
  ['PUT',  '/api/companies/me',                    'Admin only'],
  [null],
  ['GET',  '/api/users',                           ''],
  ['GET',  '/api/users/:id',                       ''],
  ['PUT',  '/api/users/:id',                       ''],
  ['DELETE','/api/users/:id',                      'Admin only'],
  [null],
  ['GET',  '/api/employees',                       ''],
  ['GET',  '/api/employees/me',                    ''],
  ['GET',  '/api/employees/:id',                   ''],
  ['POST', '/api/employees',                       'Admin/HR'],
  ['PUT',  '/api/employees/:id',                   'Admin/HR'],
  [null],
  ['GET',  '/api/shifts',                          ''],
  ['POST', '/api/shifts',                          'Admin/HR'],
  ['PUT',  '/api/shifts/:id',                      'Admin/HR'],
  ['POST', '/api/shifts/assign',                   'Admin/HR'],
  [null],
  ['POST', '/api/attendance/check-in',             ''],
  ['POST', '/api/attendance/check-out',            ''],
  ['GET',  '/api/attendance',                      ''],
  [null],
  ['GET',  '/api/leave-types',                     ''],
  ['POST', '/api/leave-types',                     'Admin/HR'],
  ['PUT',  '/api/leave-types/:id',                 'Admin/HR'],
  ['DELETE','/api/leave-types/:id',               'Admin/HR'],
  [null],
  ['GET',  '/api/leave-balances',                  ''],
  ['POST', '/api/leave-balances/allocate',         'Admin/HR'],
  ['POST', '/api/leave-balances/bulk-allocate',    'Admin/HR'],
  [null],
  ['POST', '/api/leaves/apply',                    ''],
  ['GET',  '/api/leaves',                          ''],
  ['PUT',  '/api/leaves/:id/approve',              'Admin/HR'],
  ['PUT',  '/api/leaves/:id/reject',               'Admin/HR'],
  [null],
  ['GET',  '/api/holidays',                        ''],
  ['POST', '/api/holidays',                        'Admin/HR'],
  ['DELETE','/api/holidays/:id',                   'Admin/HR'],
  [null],
  ['GET',  '/api/salary-structures',               'Admin/HR/Payroll'],
  ['GET',  '/api/salary-structures/user/:id',      ''],
  ['GET',  '/api/salary-structures/user/:id/active',''],
  ['POST', '/api/salary-structures',               'Admin/Payroll'],
  ['PUT',  '/api/salary-structures/:id',           'Admin/Payroll'],
  [null],
  ['POST', '/api/payroll/run',                     'Admin/Payroll'],
  ['GET',  '/api/payroll',                         ''],
  ['GET',  '/api/payslip/:id',                     ''],
  ['GET',  '/api/payslip/:id/download',            'PDF'],
  [null],
  ['GET',  '/api/dashboard/stats',                 ''],
  ['GET',  '/api/dashboard/departments',           ''],
  ['GET',  '/api/dashboard/activity',              ''],
];

const METHOD_COLOR = { GET: 94, POST: 92, PUT: 93, DELETE: 91, PATCH: 95 };

function printRoutes() {
  for (const row of ROUTES) {
    if (!row[0]) { console.log(''); continue; }
    const [method, path, note] = row;
    const mc  = METHOD_COLOR[method] || 97;
    const m   = c(mc, method.padEnd(7));
    const p   = bold(path.padEnd(46));
    const n   = note ? dim(`  ${note}`) : '';
    console.log(`  ${m} ${p}${n}`);
  }
}

// ── Startup ───────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    const dbClient = await pool.connect();
    dbClient.release();

    app.listen(PORT, () => {
      const w = 65;
      const line = '═'.repeat(w);
      const env  = process.env.NODE_ENV || 'development';

      console.log('');
      console.log(blu(bold(line)));
      console.log(blu(bold(`  EmPay HRMS  —  API Server`)));
      console.log(blu(line));
      console.log('');
      console.log(`  ${grn('●')} ${bold('Status')}   ${grn('Running')}`);
      console.log(`  ${grn('●')} ${bold('Port')}     ${cyn(PORT)}`);
      console.log(`  ${grn('●')} ${bold('Env')}      ${cyn(env)}`);
      console.log(`  ${grn('●')} ${bold('Database')} ${grn('PostgreSQL connected')}`);
      console.log('');
      console.log(`  ${dim('Health')}   ${cyn(`http://localhost:${PORT}/health`)}`);
      console.log(`  ${dim('API')}      ${cyn(`http://localhost:${PORT}/api`)}`);
      console.log('');
      console.log(dim('─'.repeat(w)));
      console.log(`  ${bold(c(96, 'ENDPOINTS'))}`);
      console.log(dim('─'.repeat(w)));
      printRoutes();
      console.log('');
      console.log(blu(line));
      console.log('');
    });
  } catch (err) {
    console.error(`\n  ${red('✗')} Failed to start: ${bold(err.message)}\n`);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n  ${yel('◼')} ${dim(signal)} — shutting down gracefully…`);
  await pool.end();
  console.log(`  ${grn('✓')} Database pool closed\n`);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

startServer();
