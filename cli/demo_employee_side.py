#!/usr/bin/env python3
"""
EmPay HRMS — Employee-Side Interaction Demo
Logs in as the employee created by demo_employee.py and exercises
every endpoint an employee can access.

Usage:
    python demo_employee_side.py
    python demo_employee_side.py --login INTADEEM20260003 --password ysZ9VqAdq#J8
"""

import sys
import argparse
import base64
import json as _json
from datetime import date, timedelta, datetime

import requests

# ── Colours ───────────────────────────────────────────────────────────────────
class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    RED    = "\033[91m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    CYAN   = "\033[96m"
    BLUE   = "\033[94m"
    DIM    = "\033[2m"

BASE = "http://localhost:3000/api"

# ── Helpers ───────────────────────────────────────────────────────────────────
def step(title):
    print(f"\n{C.BOLD}{C.BLUE}── {title} {'─' * max(0, 52 - len(title))}{C.RESET}")

def ok(msg):    print(f"  {C.GREEN}✓{C.RESET}  {msg}")
def fail(msg):  print(f"  {C.RED}✗{C.RESET}  {C.RED}{msg}{C.RESET}"); sys.exit(1)
def warn(msg):  print(f"  {C.YELLOW}⚠{C.RESET}  {C.YELLOW}{msg}{C.RESET}")
def info(msg):  print(f"  {C.DIM}{msg}{C.RESET}")

def call(s, method, path, **kwargs):
    try:
        resp = getattr(s, method)(f"{BASE}{path}", timeout=10, **kwargs)
        try:    body = resp.json()
        except: body = {}
        return resp.status_code, body
    except requests.exceptions.ConnectionError:
        fail("Cannot connect to server.")

def show_dict(d, indent=4):
    pad = " " * indent
    for k, v in d.items():
        if k == "_status_code" or isinstance(v, (dict, list)):
            continue
        print(f"{pad}{C.CYAN}{k}{C.RESET}: {v}")

def show_list(rows, max_rows=5):
    for row in rows[:max_rows]:
        if isinstance(row, dict):
            vals = "  |  ".join(
                f"{k}: {v}" for k, v in list(row.items())[:5]
                if k != "_status_code" and not isinstance(v, (dict, list))
            )
            print(f"    {C.DIM}• {vals}{C.RESET}")

def _jwt_payload(token):
    p = token.split(".")[1]
    p += "=" * (-len(p) % 4)
    return _json.loads(base64.urlsafe_b64decode(p))

# ── Args ──────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--login",    default="INTADEEM20260003")
parser.add_argument("--password", default="ysZ9VqAdq#J8")
parser.add_argument("--url",      default=BASE)
args = parser.parse_args()
BASE = args.url.rstrip("/")

s = requests.Session()
s.headers.update({"Content-Type": "application/json"})
today = date.today().isoformat()

print(f"\n{C.BOLD}{C.BLUE}{'═'*60}")
print(f"  EmPay HRMS — Employee-Side Demo")
print(f"  Login : {args.login}")
print(f"{'═'*60}{C.RESET}")

# ═════════════════════════════════════════════════════════════════════════════
# 1. Login as employee
# ═════════════════════════════════════════════════════════════════════════════
step("1. Employee Login")
status, body = call(s, "post", "/auth/login", json={
    "identifier": args.login,
    "password":   args.password,
})
if status != 200 or not body.get("success"):
    fail(f"Login failed ({status}): {body.get('message')}")

token   = body["data"]["token"]
user    = body["data"]["user"]
user_id = user["id"]
s.headers.update({"Authorization": f"Bearer {token}"})
ok(f"Logged in as {user.get('first_name')} {user.get('last_name')}  (ID={user_id})")
info(f"Role: {user.get('role_name')}  |  Company ID: {user.get('company_id')}")
info(f"First login required: {user.get('is_first_login')}")

# ═════════════════════════════════════════════════════════════════════════════
# 2. Change password (first login flow)
# ═════════════════════════════════════════════════════════════════════════════
step("2. Change Password (first-login)")
NEW_PASS = "EmpNew@2026"
status, body = call(s, "post", "/auth/change-password", json={
    "currentPassword": args.password,
    "newPassword":     NEW_PASS,
})
if status == 200:
    ok(f"Password changed to: {NEW_PASS}")
    # Re-login with new password
    status2, body2 = call(s, "post", "/auth/login", json={
        "identifier": args.login, "password": NEW_PASS,
    })
    if status2 == 200:
        token = body2["data"]["token"]
        s.headers.update({"Authorization": f"Bearer {token}"})
        ok("Re-logged in with new password")
else:
    warn(f"Password change: {status} — {body.get('message')} (continuing with original)")

# ═════════════════════════════════════════════════════════════════════════════
# 3. My employee profile
# ═════════════════════════════════════════════════════════════════════════════
step("3. My Employee Profile")
status, body = call(s, "get", "/employees/me")
if status == 200 and body.get("data"):
    emp = body["data"]
    ok(f"Profile found  →  Code: {emp.get('employee_code')}")
    show_dict(emp)
else:
    warn("No employee profile found yet.")

# ═════════════════════════════════════════════════════════════════════════════
# 4. My company info
# ═════════════════════════════════════════════════════════════════════════════
step("4. My Company")
status, body = call(s, "get", "/companies/me")
if status == 200:
    c = body["data"]
    ok(f"{c.get('name')}  [{c.get('code')}]")
    info(f"City: {c.get('city', 'N/A')}  |  Country: {c.get('country', 'N/A')}")

# ═════════════════════════════════════════════════════════════════════════════
# 5. Attendance — check in
# ═════════════════════════════════════════════════════════════════════════════
step("5. Attendance — Check In")
status, body = call(s, "post", "/attendance/check-in", json={})
if status == 201:
    att = body["data"]
    ok(f"Checked in  →  ID={att.get('id')}  time={att.get('check_in_time')}")
elif status == 409:
    warn("Already checked in today.")
else:
    warn(f"Check-in: {status} — {body.get('message')}")

# ═════════════════════════════════════════════════════════════════════════════
# 6. Attendance — check out
# ═════════════════════════════════════════════════════════════════════════════
step("6. Attendance — Check Out")
status, body = call(s, "post", "/attendance/check-out", json={})
if status == 200:
    att = body["data"]
    ok(f"Checked out  →  check_out={att.get('check_out_time')}  status={att.get('status')}")
else:
    warn(f"Check-out: {status} — {body.get('message')}")

# ═════════════════════════════════════════════════════════════════════════════
# 7. View my attendance
# ═════════════════════════════════════════════════════════════════════════════
step("7. My Attendance Records")
status, body = call(s, "get", "/attendance", params={"limit": 5})
if status == 200:
    rows = body.get("data", {}).get("attendance", body.get("data", []))
    if isinstance(rows, list):
        ok(f"Attendance records ({len(rows)} shown)")
        show_list(rows)
    else:
        ok("Fetched")
        show_dict(rows)

# ═════════════════════════════════════════════════════════════════════════════
# 8. View my shifts
# ═════════════════════════════════════════════════════════════════════════════
step("8. My Shifts")
status, body = call(s, "get", "/shifts")
if status == 200:
    rows = body.get("data", [])
    if isinstance(rows, list) and rows:
        ok(f"{len(rows)} shift(s) found")
        show_list(rows)
    else:
        info("No shifts found.")

# ═════════════════════════════════════════════════════════════════════════════
# 9. Leave types available
# ═════════════════════════════════════════════════════════════════════════════
step("9. Available Leave Types")
status, body = call(s, "get", "/leave-types")
leave_type_id = None
if status == 200:
    rows = body.get("data", [])
    ok(f"{len(rows)} leave type(s)")
    show_list(rows)
    if rows:
        leave_type_id = rows[0].get("id")

# ═════════════════════════════════════════════════════════════════════════════
# 10. My leave balance
# ═════════════════════════════════════════════════════════════════════════════
step("10. My Leave Balance")
status, body = call(s, "get", "/leave-balances", params={"userId": user_id})
if status == 200:
    rows = body.get("data", [])
    if rows:
        ok(f"{len(rows)} balance record(s)")
        show_list(rows)
    else:
        warn("No leave balance allocated yet.")

# ═════════════════════════════════════════════════════════════════════════════
# 11. Apply for leave
# ═════════════════════════════════════════════════════════════════════════════
step("11. Apply for Leave")
leave_req_id = None
if leave_type_id:
    future  = (date.today() + timedelta(days=7)).isoformat()
    future2 = (date.today() + timedelta(days=8)).isoformat()
    status, body = call(s, "post", "/leaves/apply", json={
        "leaveTypeId": leave_type_id,
        "startDate":   future,
        "endDate":     future2,
        "totalDays":   2,
        "reason":      "Personal work",
    })
    if status == 201:
        leave_req_id = body["data"]["id"]
        ok(f"Leave applied  →  ID={leave_req_id}  ({future} to {future2})")
    else:
        warn(f"Leave apply: {status} — {body.get('message')}")
else:
    warn("No leave type available — skipping.")

# ═════════════════════════════════════════════════════════════════════════════
# 12. View my leave requests
# ═════════════════════════════════════════════════════════════════════════════
step("12. My Leave Requests")
status, body = call(s, "get", "/leaves", params={"limit": 10})
if status == 200:
    rows = body.get("data", {}).get("leaves", body.get("data", []))
    if isinstance(rows, list):
        ok(f"{len(rows)} request(s)")
        show_list(rows)
    else:
        show_dict(rows)

# ═════════════════════════════════════════════════════════════════════════════
# 13. View holidays
# ═════════════════════════════════════════════════════════════════════════════
step("13. Company Holidays")
status, body = call(s, "get", "/holidays")
if status == 200:
    rows = body.get("data", [])
    ok(f"{len(rows)} holiday(s)")
    show_list(rows)

# ═════════════════════════════════════════════════════════════════════════════
# 14. View my payroll / payslip
# ═════════════════════════════════════════════════════════════════════════════
step("14. My Payroll Records")
status, body = call(s, "get", "/payroll", params={"userId": user_id})
if status == 200:
    rows = body.get("data", [])
    if isinstance(rows, list) and rows:
        ok(f"{len(rows)} payroll record(s)")
        show_list(rows)
        payroll_id = rows[0].get("id")

        # View payslip
        step("14b. My Payslip")
        status2, body2 = call(s, "get", f"/payslip/{payroll_id}")
        if status2 == 200:
            ps = body2["data"]
            emp_info   = ps.get("employee", {})
            earnings   = ps.get("earnings", {})
            deductions = ps.get("deductions", {})
            attendance = ps.get("attendance", {})
            ok("Payslip fetched")
            print(f"    {C.CYAN}Employee    :{C.RESET} {emp_info.get('name')}")
            print(f"    {C.CYAN}Department  :{C.RESET} {emp_info.get('department', 'N/A')}")
            print(f"    {C.CYAN}Designation :{C.RESET} {emp_info.get('designation', 'N/A')}")
            print(f"    {C.CYAN}Basic       :{C.RESET} ₹{earnings.get('basic')}")
            print(f"    {C.CYAN}HRA         :{C.RESET} ₹{earnings.get('hra')}")
            print(f"    {C.CYAN}Gross       :{C.RESET} ₹{earnings.get('grossSalary')}")
            print(f"    {C.CYAN}Deductions  :{C.RESET} ₹{deductions.get('totalDeductions')}")
            print(f"    {C.CYAN}Net Salary  :{C.RESET} {C.BOLD}₹{ps.get('netSalary')}{C.RESET}")
            print(f"    {C.CYAN}Present Days:{C.RESET} {attendance.get('presentDays')}")
    else:
        warn("No payroll records found yet.")

# ═════════════════════════════════════════════════════════════════════════════
# 15. Access denied checks — employee must NOT see other employees' data
# ═════════════════════════════════════════════════════════════════════════════
step("15. Security — Employee Cannot Access Admin Endpoints")

# Try to create a user (should be 403)
status, body = call(s, "post", "/auth/create-user", json={
    "email": "hack@test.com", "firstName": "H", "lastName": "A", "roleId": 1,
})
if status in (403, 401):
    ok(f"POST /auth/create-user → {status} (blocked ✓)")
else:
    warn(f"POST /auth/create-user → {status} — should be 403!")

# Try to run payroll (should be 403)
status, body = call(s, "post", "/payroll/run", json={"month": 4, "year": 2026})
if status in (403, 401):
    ok(f"POST /payroll/run → {status} (blocked ✓)")
else:
    warn(f"POST /payroll/run → {status} — should be 403!")

# Try to delete a user (should be 403)
status, body = call(s, "delete", "/users/1")
if status in (403, 401, 404):
    ok(f"DELETE /users/1 → {status} (blocked ✓)")
else:
    warn(f"DELETE /users/1 → {status} — should be 403!")

# ── Done ──────────────────────────────────────────────────────────────────────
print(f"\n{C.BOLD}{C.BLUE}{'═'*60}")
print(f"  Employee-side demo complete")
print(f"  Logged in as: {args.login}")
print(f"{'═'*60}{C.RESET}\n")
