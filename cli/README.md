# EmPay HRMS — CLI Test Tool

Interactive terminal frontend for testing every API endpoint.

## Setup

```bash
cd cli
pip install -r requirements.txt
```

## Run

```bash
# default: connects to http://localhost:3000/api
python main.py

# custom URL
python main.py --url http://192.168.1.10:3000/api
```

## Features

| Module | Endpoints covered |
|---|---|
| **Auth** | Login (password/OTP), change password, create user |
| **Companies** | List, get, create, update |
| **Users** | List, get, update, delete |
| **Employees** | List, my profile, get by ID, create, update |
| **Shifts** | List, create, update, assign to employee |
| **Attendance** | Check-in, check-out, view records |
| **Leaves** | Leave types CRUD, balance allocation (single + bulk), apply/view/approve/reject |
| **Holidays** | List, create, delete |
| **Salary Structures** | List, get by user, get active, create, update |
| **Payroll** | Run (single/bulk), view, payslip JSON, download PDF |
| **Dashboard** | Stats, department breakdown, recent activity |

## Tips

- **Login first** (Auth → Login with Password or OTP) — the JWT token is stored in memory for the session.
- Use **0** at any menu to go back.
- Press **Ctrl+C** at any prompt to cancel and return to the parent menu.
- `--url` flag is useful when the backend runs on a different host/port.
