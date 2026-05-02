# EmPay HRMS

Smart Human Resource Management System — a production-ready, multi-company HRMS platform.

## Architecture

```
Odoo-Final/
├── backend/          # Node.js + Express API server
│   ├── src/
│   │   ├── config/         # DB pool, constants, tax slabs
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── middleware/     # Auth, RBAC, company scope, validation, error handler
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Business logic layer
│   │   └── validations/    # Joi request schemas
│   ├── migrations/         # SQL migration files
│   ├── server.js           # Entry point
│   └── .env                # Environment variables
└── README.md
```

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js                             |
| Framework   | Express.js                          |
| Database    | PostgreSQL                          |
| Auth        | JWT + bcrypt + OTP (email)          |
| Validation  | Joi                                 |
| Email       | Nodemailer (SMTP)                   |
| PDF         | PDFKit (payslips)                   |

## Features

- **Multi-Company Architecture** — Row-level data isolation via `company_id` on every query
- **Role-Based Access Control** — Admin, HR Officer, Payroll Officer, Employee
- **Employee Login ID Generation** — Auto-generated unique IDs: `[CompanyCode][Initials][Year][Serial]`
- **Auto Password Generation** — Crypto-secure temp passwords with forced change on first login
- **OTP Authentication** — 6-digit email OTP with 5-min expiry, max 3 attempts, single-use
- **Attendance Tracking** — Check-in/out with shift-based late/overtime calculation, holiday detection
- **Leave Management** — Apply/approve/reject with balance checks and overlap prevention
- **Payroll Engine** — PF, ESI, professional tax, income tax (Indian slabs), leave deductions, overtime pay
- **Payslip Generation** — JSON data + PDF download via PDFKit
- **Salary Structure** — Per-employee salary component management
- **Holiday Management** — Company-specific holiday calendar
- **Dashboard Analytics** — Employee stats, attendance summary, department breakdown, recent activity
- **Audit Logging** — All critical actions (payroll runs, leave approvals, user changes) logged

## API Endpoints

### Auth
| Method | Endpoint                    | Access      | Description                           |
|--------|-----------------------------|-------------|---------------------------------------|
| POST   | `/api/auth/login`           | Public      | Login with email or login_id          |
| POST   | `/api/auth/request-otp`     | Public      | Send OTP to registered email          |
| POST   | `/api/auth/verify-otp`      | Public      | Verify OTP and get JWT                |
| POST   | `/api/auth/create-user`     | Admin/HR    | Create user with auto-generated creds |
| POST   | `/api/auth/change-password` | Authenticated | Change password (required on first login) |

### Users
| Method | Endpoint            | Access   | Description       |
|--------|---------------------|----------|-------------------|
| GET    | `/api/users`        | Admin/HR | List all users    |
| GET    | `/api/users/:id`    | Auth     | Get user by ID    |
| PUT    | `/api/users/:id`    | Auth     | Update user       |
| DELETE | `/api/users/:id`    | Admin    | Delete user       |

### Employees
| Method | Endpoint              | Access   | Description              |
|--------|-----------------------|----------|--------------------------|
| GET    | `/api/employees`      | Admin/HR | List all employees       |
| GET    | `/api/employees/me`   | Auth     | Get own profile          |
| GET    | `/api/employees/:id`  | Admin/HR | Get employee by ID       |
| POST   | `/api/employees`      | Admin/HR | Create employee profile  |
| PUT    | `/api/employees/:id`  | Admin/HR | Update employee profile  |

### Shifts
| Method | Endpoint                | Access   | Description        |
|--------|-------------------------|----------|--------------------|
| POST   | `/api/shifts`           | Admin/HR | Create shift       |
| GET    | `/api/shifts`           | Auth     | List all shifts    |
| PUT    | `/api/shifts/:id`       | Admin/HR | Update shift       |
| POST   | `/api/employee-shifts`  | Admin/HR | Assign shift       |

### Attendance
| Method | Endpoint                    | Access | Description         |
|--------|-----------------------------|--------|---------------------|
| POST   | `/api/attendance/check-in`  | Auth   | Clock in            |
| POST   | `/api/attendance/check-out` | Auth   | Clock out           |
| GET    | `/api/attendance`           | Auth   | Get attendance logs |

### Leave
| Method | Endpoint                      | Access          | Description      |
|--------|-------------------------------|-----------------|------------------|
| POST   | `/api/leaves/apply`           | Auth            | Apply for leave  |
| GET    | `/api/leaves`                 | Auth            | List leaves      |
| PUT    | `/api/leaves/:id/approve`     | Admin/HR/Payroll| Approve leave    |
| PUT    | `/api/leaves/:id/reject`      | Admin/HR/Payroll| Reject leave     |

### Leave Types & Balances
| Method | Endpoint                          | Access   | Description              |
|--------|-----------------------------------|----------|--------------------------|
| GET    | `/api/leave-types`                | Auth     | List leave types         |
| POST   | `/api/leave-types`                | Admin/HR | Create leave type        |
| PUT    | `/api/leave-types/:id`            | Admin/HR | Update leave type        |
| DELETE | `/api/leave-types/:id`            | Admin/HR | Deactivate leave type    |
| GET    | `/api/leave-balances`             | Auth     | View balances            |
| POST   | `/api/leave-balances/allocate`    | Admin/HR | Allocate to one employee |
| POST   | `/api/leave-balances/bulk-allocate`| Admin/HR | Allocate to all active  |

### Holidays
| Method | Endpoint              | Access   | Description      |
|--------|-----------------------|----------|------------------|
| POST   | `/api/holidays`       | Admin/HR | Create holiday   |
| GET    | `/api/holidays`       | Auth     | List holidays    |
| DELETE | `/api/holidays/:id`   | Admin/HR | Delete holiday   |

### Payroll & Payslips
| Method | Endpoint                          | Access        | Description        |
|--------|-----------------------------------|---------------|--------------------|
| POST   | `/api/payroll/run`                | Admin/Payroll | Run payroll        |
| GET    | `/api/payroll`                    | Auth          | Get payroll records|
| GET    | `/api/payslip/:payroll_id`        | Auth          | Get payslip data   |
| GET    | `/api/payslip/:payroll_id/download`| Auth         | Download PDF       |

### Salary Structures
| Method | Endpoint                                    | Access           | Description              |
|--------|---------------------------------------------|------------------|--------------------------|
| GET    | `/api/salary-structures`                    | Admin/HR/Payroll | List all structures      |
| GET    | `/api/salary-structures/user/:userId`       | Admin/HR/Payroll | Get user's history       |
| GET    | `/api/salary-structures/user/:userId/active`| Admin/HR/Payroll | Get active structure     |
| POST   | `/api/salary-structures`                    | Admin/Payroll    | Create salary structure  |
| PUT    | `/api/salary-structures/:id`                | Admin/Payroll    | Update salary structure  |

### Companies & Dashboard
| Method | Endpoint                    | Access | Description              |
|--------|-----------------------------|--------|--------------------------|
| GET    | `/api/companies`            | Public | List companies           |
| GET    | `/api/companies/:id`        | Public | Get company details      |
| POST   | `/api/companies`            | Admin  | Create company           |
| PUT    | `/api/companies/:id`        | Admin  | Update company           |
| GET    | `/api/dashboard/stats`      | Auth   | Summary statistics       |
| GET    | `/api/dashboard/departments`| Auth   | Department breakdown     |
| GET    | `/api/dashboard/activity`   | Auth   | Recent audit activity    |

## Setup

```bash
cd backend
npm install
```

### Environment Variables

Create `backend/.env`:

```env
# PostgreSQL
PGHOST=localhost
PGPORT=5432
PGDATABASE=empay
PGUSER=your_user
PGPASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3000

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_smtp_password
```

### Database

```bash
# Load full schema
node upload_schema.js

# Run migrations (incremental)
node run_migration.js
```

### Start

```bash
node server.js
# or
npx nodemon server.js
```

Server runs at `http://localhost:3000`. Health check at `/health`.

## Auth Flow

1. **Admin/HR** creates user → `POST /api/auth/create-user` → auto-generated `login_id` + temp password
2. **Employee** logs in via password (`POST /api/auth/login`) or OTP (`POST /api/auth/request-otp` → `POST /api/auth/verify-otp`)
3. On first login → forced password change via `POST /api/auth/change-password`

