# EmPay HRMS — CLI Tool

A Python terminal toolkit for the EmPay HRMS API. Includes an interactive menu-driven client, an automated endpoint health-check script, and demo scripts for both admin and employee workflows.

---

## Requirements

- Python 3.9+
- EmPay HRMS backend running (default: `http://localhost:3000`)

## Setup

```bash
cd cli
pip install -r requirements.txt
```

`requirements.txt` includes: `requests`

---

## Scripts

### `main.py` — Interactive CLI

A full menu-driven terminal client covering every API endpoint.

```bash
# Default — connects to http://localhost:3000/api
python main.py

# Custom backend URL
python main.py --url http://192.168.1.10:3000/api
```

**Flow:**
1. Start the script → see the main menu
2. Go to **Auth → Login with Password** — enter your email or Login ID + password
3. JWT token is stored in memory for all subsequent requests
4. Navigate any module from the main menu
5. Press `0` at any menu to go back; `Ctrl+C` to cancel a prompt

---

### `check_endpoints.py` — Automated Health Check

Spins up a full test run against a live backend — registers a fresh company + admin, then exercises every endpoint in sequence and prints a pass/fail summary.

```bash
python check_endpoints.py

# Custom backend URL
python check_endpoints.py --url http://localhost:3000/api
```

Each run uses a random 4-letter tag (e.g. `XPVO`) to generate unique emails and company codes — no manual cleanup needed. Exits with code `0` if all pass, `1` if any fail.

**What it covers (51 endpoints):**

| Section | Endpoints |
|---|---|
| Auth (public) | Register, Login, Request OTP, Verify OTP |
| Auth (authenticated) | Create user, Change password |
| Companies | GET /me, PUT /me |
| Users | List, Get, Update, Delete |
| Employees | List, My profile, Create, Get, Update |
| Shifts | Create, List, Update, Assign (`/employee-shifts`) |
| Attendance | Check-in, Check-out, List |
| Leave Types | Create, List, Update |
| Leave Balances | Allocate, Bulk allocate, List |
| Leave Requests | Apply, List, Approve, Reject |
| Holidays | Create, List, Delete |
| Salary Structures | Create, List, Get by user, Get active, Update |
| Payroll | Run, List, Payslip JSON, Payslip PDF download |
| Dashboard | Stats, Department breakdown, Activity |
| Security | Cross-company isolation checks (must 404) |

---

### `demo_employee.py` — Admin Creates an Employee

Logs in as an admin using a pre-set JWT token, then automatically:

1. Fetches company info
2. Creates a new user account (Employee role)
3. Creates an employee profile
4. Assigns a shift
5. Creates a leave type and allocates balance
6. Applies and approves a leave
7. Creates a salary structure
8. Runs payroll for last month
9. Fetches and displays the payslip
10. Shows dashboard stats

```bash
python demo_employee.py
```

The JWT token is hardcoded at the top of the file — replace `JWT_TOKEN` with a valid token for your session.

**Output includes:**
- New employee's Login ID and temporary password
- Full payslip breakdown (Basic, HRA, Gross, Deductions, Net Salary)
- Dashboard summary

---

### `demo_employee_side.py` — Employee Self-Service

Logs in as the employee created by `demo_employee.py` and exercises all employee-facing endpoints.

```bash
python demo_employee_side.py

# Custom credentials
python demo_employee_side.py --login INTADEEM20260003 --password ysZ9VqAdq#J8
```

**What it does:**
1. Logs in + changes password (first-login flow)
2. Views own employee profile
3. Views company info
4. Checks in and checks out (attendance)
5. Views attendance records
6. Views assigned shifts
7. Views available leave types
8. Views own leave balance
9. Applies for leave
10. Views own leave requests
11. Views company holidays
12. Views own payroll records + payslip
13. **Security checks** — verifies employee is blocked (403) from admin endpoints:
    - `POST /auth/create-user`
    - `POST /payroll/run`
    - `DELETE /users/:id`

---

## Module Coverage

| Module | File |
|---|---|
| Auth (login, OTP, create user, change password) | `commands/auth.py` |
| Companies | `commands/companies.py` |
| Users | `commands/users.py` |
| Employees | `commands/employees.py` |
| Shifts + Assignment | `commands/shifts.py` |
| Attendance | `commands/attendance.py` |
| Leaves (types, balances, requests) | `commands/leaves.py` |
| Holidays | `commands/holidays.py` |
| Salary Structures | `commands/salary.py` |
| Payroll + Payslip | `commands/payroll.py` |
| Dashboard | `commands/dashboard.py` |

---

## Role Permissions (enforced by backend)

| Action | Admin | HR Officer | Payroll Officer | Employee |
|---|:---:|:---:|:---:|:---:|
| Create user | ✓ | ✓ | | |
| Manage employees | ✓ | ✓ | | |
| Manage shifts | ✓ | ✓ | | |
| Manage leave types/balances | ✓ | ✓ | | |
| Approve/reject leaves | ✓ | ✓ | ✓ | |
| Run payroll | ✓ | | ✓ | |
| View own profile/payslip | ✓ | ✓ | ✓ | ✓ |
| Attendance check-in/out | ✓ | ✓ | ✓ | ✓ |

---

## Architecture

```
cli/
├── main.py                  # Interactive menu entry point
├── api.py                   # Shared HTTP client (APIClient singleton)
├── utils.py                 # Colour helpers, prompt, menu utilities
├── check_endpoints.py       # Automated health check (51 endpoints)
├── demo_employee.py         # Admin workflow demo
├── demo_employee_side.py    # Employee self-service demo
├── requirements.txt
├── README.md
└── commands/
    ├── auth.py
    ├── companies.py
    ├── users.py
    ├── employees.py
    ├── shifts.py
    ├── attendance.py
    ├── leaves.py
    ├── holidays.py
    ├── salary.py
    ├── payroll.py
    └── dashboard.py
```
