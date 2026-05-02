#!/usr/bin/env python3
"""
EmPay HRMS — Employee Demo Script
Logs in as the given admin, creates a new user + employee profile,
then exercises every employee-related interaction automatically.

Usage:
    python demo_employee.py
"""

import sys
import base64
import json as _json
import random
import string
from datetime import date, timedelta, datetime

import requests

# ── Colours ──────────────────────────────────────────────────────────────────
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

# ── Pre-set JWT (skip login) ──────────────────────────────────────────────────
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6Miwicm9sZUlkIjoxLCJpYXQiOjE3Nzc3MTEzMDMsImV4cCI6MTc3Nzc5NzcwM30.hRpQjSTAAri5qbB38jmfwR7Mew3Ec4Ivv20X9d-1-5k"

# ── Helpers ───────────────────────────────────────────────────────────────────
def rand(n=5):
    return "".join(random.choices(string.ascii_lowercase, k=n))

def step(title):
    print(f"\n{C.BOLD}{C.BLUE}── {title} {'─' * max(0, 52 - len(title))}{C.RESET}")

def ok(msg):   print(f"  {C.GREEN}✓{C.RESET}  {msg}")
def fail(msg): print(f"  {C.RED}✗{C.RESET}  {C.RED}{msg}{C.RESET}"); sys.exit(1)
def info(msg): print(f"  {C.DIM}{msg}{C.RESET}")

def call(s, method, path, **kwargs):
    try:
        resp = getattr(s, method)(f"{BASE}{path}", timeout=10, **kwargs)
        try:    body = resp.json()
        except: body = {}
        return resp.status_code, body
    except requests.exceptions.ConnectionError:
        fail("Cannot connect to server. Is it running?")

def show(body):
    data = body.get("data")
    if not data:
        return
    if isinstance(data, dict):
        for k, v in data.items():
            if k != "_status_code" and not isinstance(v, (dict, list)):
                print(f"    {C.CYAN}{k}{C.RESET}: {v}")
    elif isinstance(data, list):
        for item in data[:5]:
            if isinstance(item, dict):
                vals = "  |  ".join(f"{k}: {v}" for k, v in list(item.items())[:4] if k != "_status_code")
                print(f"    {C.DIM}• {vals}{C.RESET}")

# ═════════════════════════════════════════════════════════════════════════════
def _jwt_payload(token):
    """Decode JWT payload without verifying signature."""
    payload_b64 = token.split(".")[1]
    # Add padding
    payload_b64 += "=" * (-len(payload_b64) % 4)
    return _json.loads(base64.urlsafe_b64decode(payload_b64))

print(f"\n{C.BOLD}{C.BLUE}{'═'*60}")
print(f"  EmPay HRMS — Employee Demo")
print(f"  Using pre-set JWT token")
print(f"{'═'*60}{C.RESET}")

s = requests.Session()
s.headers.update({"Content-Type": "application/json"})
tag = rand(4).upper()
today = date.today().isoformat()

# ── 1. Inject token ───────────────────────────────────────────────────────────
step("1. Inject JWT Token")
payload = _jwt_payload(JWT_TOKEN)
user_id = payload.get("userId")
s.headers.update({"Authorization": f"Bearer {JWT_TOKEN}"})
ok(f"Token injected  (userId={user_id}, companyId={payload.get('companyId')})")
info(f"Expires: {datetime.fromtimestamp(payload.get('exp', 0))}")

# ── 2. My company ─────────────────────────────────────────────────────────────
step("2. My Company")
status, body = call(s, "get", "/companies/me")
if status == 200:
    c = body["data"]
    ok(f"{c.get('name')}  [{c.get('code')}]")
    info(f"City: {c.get('city', 'N/A')}  |  Email: {c.get('email', 'N/A')}")

# ── 3. Create a new user account ──────────────────────────────────────────────
step("3. Create New User Account")
emp_email = f"emp_{rand()}@demo.empay.dev"
status, body = call(s, "post", "/auth/create-user", json={
    "email":         emp_email,
    "firstName":     "Demo",
    "lastName":      f"Emp{tag}",
    "roleId":        4,
    "dateOfJoining": today,
})
if status != 201 or not body.get("success"):
    fail(f"Create user failed ({status}): {body.get('message')}")

new_user_id  = body["data"]["user"]["id"]
login_id     = body["data"]["credentials"]["loginId"]
temp_pass    = body["data"]["credentials"]["temporaryPassword"]
ok(f"User created  →  ID={new_user_id}")
info(f"Email: {emp_email}")
info(f"Login ID: {login_id}  |  Temp password: {temp_pass}")

# ── 4. Create employee profile ────────────────────────────────────────────────
step("4. Create Employee Profile")
status, body = call(s, "post", "/employees", json={
    "userId":         new_user_id,
    "employeeCode":   f"EMP{tag}",
    "department":     "Engineering",
    "designation":    "Software Engineer",
    "dateOfJoining":  today,
    "employmentType": "Full-Time",
    "gender":         "Male",
})
if status != 201 or not body.get("success"):
    fail(f"Create employee failed ({status}): {body.get('message')}")

emp_id = body["data"]["id"]
ok(f"Employee profile created  →  ID={emp_id}")
show(body)

# ── 5. Get employee by ID ─────────────────────────────────────────────────────
step("5. Fetch Employee Profile")
status, body = call(s, "get", f"/employees/{emp_id}")
if status == 200:
    ok("Fetched successfully")
    show(body)

# ── 6. List all employees ─────────────────────────────────────────────────────
step("6. List All Employees")
status, body = call(s, "get", "/employees", params={"limit": 10})
if status == 200:
    count = body.get("data", {}).get("total", "?")
    ok(f"Total employees: {count}")
    rows = body.get("data", {}).get("employees", [])
    for emp in rows[:5]:
        print(f"    {C.DIM}• [{emp.get('id')}] {emp.get('first_name')} {emp.get('last_name')}  |  "
              f"{emp.get('department', 'N/A')}  |  {emp.get('status', 'N/A')}{C.RESET}")

# ── 7. Update employee profile ────────────────────────────────────────────────
step("7. Update Employee Profile")
status, body = call(s, "put", f"/employees/{emp_id}", json={
    "department":  "Product",
    "designation": "Senior Engineer",
    "bankName":    "HDFC Bank",
    "bankIfsc":    "HDFC0001234",
})
if status == 200:
    ok("Profile updated  →  department=Product, designation=Senior Engineer")

# ── 8. Create + assign a shift ────────────────────────────────────────────────
step("8. Create & Assign Shift")
status, body = call(s, "post", "/shifts", json={
    "name": f"Day_{tag}", "startTime": "09:00", "endTime": "18:00", "graceMinutes": 10,
})
if status == 201:
    shift_id = body["data"]["id"]
    ok(f"Shift created  →  ID={shift_id}")

    status2, body2 = call(s, "post", "/employee-shifts", json={
        "userId": new_user_id, "shiftId": shift_id, "effectiveFrom": today,
    })
    if status2 == 201:
        ok(f"Shift assigned to employee")
    else:
        info(f"Shift assign: {status2} — {body2.get('message')}")

# ── 9. Create leave type + allocate balance ───────────────────────────────────
step("9. Leave Type + Balance Allocation")
status, body = call(s, "post", "/leave-types", json={
    "name": f"Annual_{tag}", "code": f"AL{tag}", "annualQuota": 20, "isPaid": True,
})
leave_type_id = None
if status == 201:
    leave_type_id = body["data"]["id"]
    ok(f"Leave type created  →  ID={leave_type_id}")

    status2, body2 = call(s, "post", "/leave-balances/allocate", json={
        "userId":         new_user_id,
        "leaveTypeId":    leave_type_id,
        "year":           date.today().year,
        "totalAllocated": 20,
    })
    if status2 in (200, 201):
        ok(f"20 days allocated to employee for {date.today().year}")

# ── 10. Apply leave ───────────────────────────────────────────────────────────
step("10. Apply Leave (as admin on behalf of employee)")
leave_req_id = None
if leave_type_id:
    future  = (date.today() + timedelta(days=5)).isoformat()
    future2 = (date.today() + timedelta(days=6)).isoformat()
    status, body = call(s, "post", "/leaves/apply", json={
        "leaveTypeId": leave_type_id,
        "startDate":   future,
        "endDate":     future2,
        "totalDays":   2,
        "reason":      "Demo leave request",
    })
    if status == 201:
        leave_req_id = body["data"]["id"]
        ok(f"Leave applied  →  ID={leave_req_id}  ({future} to {future2})")

# ── 11. Approve the leave ─────────────────────────────────────────────────────
step("11. Approve Leave")
if leave_req_id:
    status, body = call(s, "put", f"/leaves/{leave_req_id}/approve", json={})
    if status == 200:
        ok(f"Leave approved  →  status=Approved")

# ── 12. Create salary structure ───────────────────────────────────────────────
step("12. Create Salary Structure")
last_month_start = (date.today().replace(day=1) - timedelta(days=1)).replace(day=1)
status, body = call(s, "post", "/salary-structures", json={
    "userId":        new_user_id,
    "effectiveFrom": last_month_start.isoformat(),
    "basic":         60000,
    "hra":           15000,
    "allowances":    5000,
})
salary_id = None
if status == 201:
    salary_id = body["data"]["id"]
    ok(f"Salary structure created  →  ID={salary_id}  (basic=60000, hra=15000)")

# ── 13. Run payroll ───────────────────────────────────────────────────────────
step("13. Run Payroll")
payroll_id = None
if salary_id:
    lm = date.today().replace(day=1) - timedelta(days=1)
    status, body = call(s, "post", "/payroll/run", json={
        "userId": new_user_id,
        "month":  lm.month,
        "year":   lm.year,
    })
    if status == 201:
        payroll_id = body["data"]["id"]
        net = body["data"].get("net_salary", "?")
        ok(f"Payroll processed  →  ID={payroll_id}  net_salary=₹{net}")
    else:
        info(f"Payroll: {status} — {body.get('message')}")

# ── 14. View payslip ──────────────────────────────────────────────────────────
step("14. View Payslip")
if payroll_id:
    status, body = call(s, "get", f"/payslip/{payroll_id}")
    if status == 200:
        ps = body["data"]
        ok("Payslip fetched")
        emp_info = ps.get("employee", {})
        earnings = ps.get("earnings", {})
        deductions = ps.get("deductions", {})
        print(f"    {C.CYAN}Employee  :{C.RESET} {emp_info.get('name')}")
        print(f"    {C.CYAN}Gross     :{C.RESET} ₹{earnings.get('grossSalary')}")
        print(f"    {C.CYAN}Deductions:{C.RESET} ₹{deductions.get('totalDeductions')}")
        print(f"    {C.CYAN}Net Salary:{C.RESET} ₹{ps.get('netSalary')}")

# ── 15. Dashboard ─────────────────────────────────────────────────────────────
step("15. Company Dashboard")
status, body = call(s, "get", "/dashboard/stats")
if status == 200:
    d = body["data"]
    emp = d.get("employees", {})
    att = d.get("todayAttendance", {})
    lv  = d.get("monthlyLeaves", {})
    pr  = d.get("payrollSummary", {})
    ok("Dashboard stats")
    print(f"    {C.CYAN}Total Employees :{C.RESET} {emp.get('total_employees')}")
    print(f"    {C.CYAN}Active          :{C.RESET} {emp.get('active_employees')}")
    print(f"    {C.CYAN}Present Today   :{C.RESET} {att.get('present_today')}")
    print(f"    {C.CYAN}On Leave Today  :{C.RESET} {att.get('on_leave_today')}")
    print(f"    {C.CYAN}Pending Leaves  :{C.RESET} {lv.get('pending_leaves')}")
    print(f"    {C.CYAN}Total Payout    :{C.RESET} ₹{pr.get('total_payout', 0)}")

# ── Done ──────────────────────────────────────────────────────────────────────
print(f"\n{C.BOLD}{C.BLUE}{'═'*60}")
print(f"  Demo complete — employee EMP{tag} fully provisioned")
print(f"  User ID: {new_user_id}  |  Employee ID: {emp_id}")
print(f"  Login: {login_id}  |  Temp pass: {temp_pass}")
print(f"{'═'*60}{C.RESET}\n")
