#!/usr/bin/env python3
"""
EmPay HRMS — Endpoint Health Check Script
Runs through every API endpoint automatically and reports pass/fail.

Usage:
    python check_endpoints.py --url http://localhost:3000/api \
                               --email admin@example.com \
                               --password YourPass1!

The script performs a full flow:
  1. Register a test company + admin
  2. Login
  3. Exercise every authenticated endpoint
  4. Cleanup (delete test user / company where possible)
  5. Print summary table
"""

import sys
import time
import argparse
import random
import string
import requests
from datetime import date, timedelta

# ── Colours ──────────────────────────────────────────────────────────────────
class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    RED    = "\033[91m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    CYAN   = "\033[96m"
    DIM    = "\033[2m"
    BLUE   = "\033[94m"


# ── Result tracking ───────────────────────────────────────────────────────────
results: list[dict] = []

def record(method: str, path: str, status: int, passed: bool, note: str = ""):
    results.append({
        "method": method, "path": path,
        "status": status, "passed": passed, "note": note,
    })
    icon  = f"{C.GREEN}PASS{C.RESET}" if passed else f"{C.RED}FAIL{C.RESET}"
    color = C.GREEN if passed else C.RED
    print(f"  {icon}  {C.BOLD}{method:<6}{C.RESET} {color}{path:<50}{C.RESET}  "
          f"{C.DIM}{status}  {note}{C.RESET}")


# ── HTTP helpers ──────────────────────────────────────────────────────────────
def call(session, method, url, **kwargs):
    try:
        resp = getattr(session, method)(url, timeout=10, **kwargs)
        try:
            body = resp.json()
        except Exception:
            body = {}
        return resp.status_code, body
    except requests.exceptions.ConnectionError:
        return 0, {}
    except requests.exceptions.Timeout:
        return 408, {}


def rand(n=6):
    return "".join(random.choices(string.ascii_lowercase, k=n))


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="EmPay endpoint health check")
    parser.add_argument("--url",      default="http://localhost:3000/api")
    parser.add_argument("--email",    default=f"test2_{rand()}@empay-check.dev")
    parser.add_argument("--password", default="CheckPass1!")
    args = parser.parse_args()

    BASE = args.url.rstrip("/")
    EMAIL    = args.email
    PASSWORD = args.password
    tag      = rand(4).upper()

    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})

    print(f"\n{C.BOLD}{C.BLUE}{'═'*65}")
    print(f"  EmPay HRMS — Endpoint Health Check")
    print(f"  Base URL : {BASE}")
    print(f"  Test tag : {tag}")
    print(f"{'═'*65}{C.RESET}\n")

    # ── Track IDs across steps ────────────────────────────────────────────────
    token        = None
    company_id   = None
    user_id      = None
    admin_login_id = None
    employee_id  = None
    created_user_id = None
    shift_id     = None
    leave_type_id = None
    leave_req_id = None
    payroll_id   = None
    salary_id    = None
    holiday_id   = None

    today      = date.today().isoformat()
    last_month = (date.today().replace(day=1) - timedelta(days=1))
    month      = last_month.month
    year       = last_month.year

    # ═══════════════════════════════════════════════════════════════════════════
    # 1. AUTH — public
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"{C.BOLD}{C.CYAN}── Auth (public) ──{C.RESET}")

    # POST /auth/register
    status, body = call(s, "post", f"{BASE}/auth/register", json={
        "firstName":   "Test",
        "lastName":    f"Admin{tag}",
        "email":       EMAIL,
        "password":    PASSWORD,
        "companyName": f"TestCo {tag}",
        "companyCode": f"TC{tag}",
    })
    passed = status == 201 and body.get("success")
    record("POST", "/auth/register", status, passed)
    if passed:
        admin_login_id = body["data"]["loginId"]
        company_id     = body["data"]["company"]["id"]

    # POST /auth/login
    status, body = call(s, "post", f"{BASE}/auth/login", json={
        "identifier": EMAIL, "password": PASSWORD,
    })
    passed = status == 200 and body.get("success")
    record("POST", "/auth/login", status, passed)
    if passed:
        token   = body["data"]["token"]
        user_id = body["data"]["user"]["id"]
        s.headers.update({"Authorization": f"Bearer {token}"})

    # POST /auth/request-otp  (valid user → should return 200)
    status, body = call(s, "post", f"{BASE}/auth/request-otp", json={"identifier": EMAIL})
    record("POST", "/auth/request-otp", status, status == 200)

    # POST /auth/verify-otp  (wrong OTP → expect 401/400, not 500)
    status, body = call(s, "post", f"{BASE}/auth/verify-otp", json={"identifier": EMAIL, "otp": "000000"})
    record("POST", "/auth/verify-otp (bad otp→4xx)", status, status in (400, 401, 429))

    if not token:
        print(f"\n{C.RED}Login failed — cannot continue authenticated tests.{C.RESET}\n")
        _summary()
        sys.exit(1)

    # ═══════════════════════════════════════════════════════════════════════════
    # 2. AUTH — authenticated
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Auth (authenticated) ──{C.RESET}")

    # POST /auth/create-user
    status, body = call(s, "post", f"{BASE}/auth/create-user", json={
        "email":       f"emp_{rand()}@empay-check.dev",
        "firstName":   "Emp",
        "lastName":    f"User{tag}",
        "roleId":      4,   # Employee role
        "dateOfJoining": today,
    })
    passed = status == 201 and body.get("success")
    record("POST", "/auth/create-user", status, passed)
    if passed:
        created_user_id = body["data"]["user"]["id"]

    # POST /auth/change-password  (wrong current → expect 401)
    status, _ = call(s, "post", f"{BASE}/auth/change-password", json={
        "currentPassword": "WrongPass9!", "newPassword": "NewPass2@",
    })
    record("POST", "/auth/change-password (wrong→401)", status, status == 401)

    # ═══════════════════════════════════════════════════════════════════════════
    # 3. COMPANIES
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Companies ──{C.RESET}")

    status, body = call(s, "get", f"{BASE}/companies/me")
    record("GET", "/companies/me", status, status == 200 and body.get("success"))

    status, body = call(s, "put", f"{BASE}/companies/me", json={"city": "TestCity"})
    record("PUT", "/companies/me", status, status == 200 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 4. USERS
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Users ──{C.RESET}")

    status, body = call(s, "get", f"{BASE}/users")
    record("GET", "/users", status, status == 200 and body.get("success"))

    if user_id:
        status, body = call(s, "get", f"{BASE}/users/{user_id}")
        record("GET", f"/users/:id", status, status == 200 and body.get("success"))

        status, body = call(s, "put", f"{BASE}/users/{user_id}", json={"phone": "9999999999"})
        record("PUT", f"/users/:id", status, status == 200 and body.get("success"))

    # DELETE a created user (not self)
    if created_user_id:
        status, _ = call(s, "delete", f"{BASE}/users/{created_user_id}")
        record("DELETE", "/users/:id", status, status == 200)

    # ═══════════════════════════════════════════════════════════════════════════
    # 5. EMPLOYEES
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Employees ──{C.RESET}")

    status, body = call(s, "get", f"{BASE}/employees")
    record("GET", "/employees", status, status == 200 and body.get("success"))

    status, body = call(s, "get", f"{BASE}/employees/me")
    record("GET", "/employees/me", status, status == 200 and body.get("success"))

    # Create employee profile for admin user
    status, body = call(s, "post", f"{BASE}/employees", json={
        "userId":         user_id,
        "employeeCode":   f"EMP{tag}",
        "department":     "Engineering",
        "designation":    "Admin",
        "dateOfJoining":  today,
        "employmentType": "Full-Time",
    })
    passed = status == 201 and body.get("success")
    record("POST", "/employees", status, passed)
    if passed:
        employee_id = body["data"]["id"]

    if employee_id:
        status, body = call(s, "get", f"{BASE}/employees/{employee_id}")
        record("GET", "/employees/:id", status, status == 200 and body.get("success"))

        status, body = call(s, "put", f"{BASE}/employees/{employee_id}", json={"department": "Operations"})
        record("PUT", "/employees/:id", status, status == 200 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 6. SHIFTS
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Shifts ──{C.RESET}")

    status, body = call(s, "post", f"{BASE}/shifts", json={
        "name": f"Morning_{tag}", "startTime": "09:00", "endTime": "18:00",
    })
    passed = status == 201 and body.get("success")
    record("POST", "/shifts", status, passed)
    if passed:
        shift_id = body["data"]["id"]

    status, body = call(s, "get", f"{BASE}/shifts")
    record("GET", "/shifts", status, status == 200 and body.get("success"))

    if shift_id:
        status, body = call(s, "put", f"{BASE}/shifts/{shift_id}", json={"graceMinutes": 10})
        record("PUT", "/shifts/:id", status, status == 200 and body.get("success"))

        if user_id:
            status, body = call(s, "post", f"{BASE}/employee-shifts", json={
                "userId": user_id, "shiftId": shift_id, "effectiveFrom": today,
            })
            record("POST", "/employee-shifts", status, status == 201 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 7. ATTENDANCE
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Attendance ──{C.RESET}")

    status, body = call(s, "post", f"{BASE}/attendance/check-in", json={})
    # May fail if already checked in today — both 201 and 409 are acceptable
    record("POST", "/attendance/check-in", status, status in (201, 409))

    status, body = call(s, "post", f"{BASE}/attendance/check-out", json={})
    record("POST", "/attendance/check-out", status, status in (200, 400, 404))

    status, body = call(s, "get", f"{BASE}/attendance")
    record("GET", "/attendance", status, status == 200 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 8. LEAVE TYPES
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Leave Types ──{C.RESET}")

    status, body = call(s, "post", f"{BASE}/leave-types", json={
        "name": f"Annual_{tag}", "code": f"AL{tag}", "annualQuota": 12,
    })
    passed = status == 201 and body.get("success")
    record("POST", "/leave-types", status, passed)
    if passed:
        leave_type_id = body["data"]["id"]

    status, body = call(s, "get", f"{BASE}/leave-types")
    record("GET", "/leave-types", status, status == 200 and body.get("success"))

    if leave_type_id:
        status, body = call(s, "put", f"{BASE}/leave-types/{leave_type_id}", json={"annualQuota": 15})
        record("PUT", "/leave-types/:id", status, status == 200 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 9. LEAVE BALANCES
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Leave Balances ──{C.RESET}")

    if leave_type_id and user_id:
        status, body = call(s, "post", f"{BASE}/leave-balances/allocate", json={
            "userId": user_id, "leaveTypeId": leave_type_id,
            "year": year, "totalAllocated": 12,
        })
        record("POST", "/leave-balances/allocate", status, status in (200, 201) and body.get("success"))

        status, body = call(s, "post", f"{BASE}/leave-balances/bulk-allocate", json={
            "leaveTypeId": leave_type_id, "year": year, "totalAllocated": 12,
        })
        record("POST", "/leave-balances/bulk-allocate", status, status in (200, 201) and body.get("success"))

    status, body = call(s, "get", f"{BASE}/leave-balances")
    record("GET", "/leave-balances", status, status == 200 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 10. LEAVE REQUESTS
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Leave Requests ──{C.RESET}")

    # Allocate balance directly to the admin user before applying
    if leave_type_id and user_id:
        call(s, "post", f"{BASE}/leave-balances/allocate", json={
            "userId": user_id, "leaveTypeId": leave_type_id,
            "year": date.today().year, "totalAllocated": 12,
        })

    if leave_type_id:
        future = (date.today() + timedelta(days=3)).isoformat()
        future2 = (date.today() + timedelta(days=4)).isoformat()
        status, body = call(s, "post", f"{BASE}/leaves/apply", json={
            "leaveTypeId": leave_type_id,
            "startDate": future, "endDate": future2,
            "totalDays": 2,
            "reason": "Automated test leave",
        })
        passed = status == 201 and body.get("success")
        record("POST", "/leaves/apply", status, passed)
        if passed:
            leave_req_id = body["data"]["id"]

    status, body = call(s, "get", f"{BASE}/leaves")
    record("GET", "/leaves", status, status == 200 and body.get("success"))

    if leave_req_id:
        status, body = call(s, "put", f"{BASE}/leaves/{leave_req_id}/approve", json={})
        record("PUT", "/leaves/:id/approve", status, status == 200 and body.get("success"))

        # Reject a freshly-applied one for coverage
        status2, body2 = call(s, "post", f"{BASE}/leaves/apply", json={
            "leaveTypeId": leave_type_id,
            "startDate": (date.today() + timedelta(days=10)).isoformat(),
            "endDate":   (date.today() + timedelta(days=11)).isoformat(),
            "totalDays": 2,
            "reason":    "Test reject",
        })
        if status2 == 201:
            rej_id = body2["data"]["id"]
            status3, body3 = call(s, "put", f"{BASE}/leaves/{rej_id}/reject", json={"rejectionReason": "Test"})
            record("PUT", "/leaves/:id/reject", status3, status3 == 200 and body3.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 11. HOLIDAYS
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Holidays ──{C.RESET}")

    status, body = call(s, "post", f"{BASE}/holidays", json={
        "name": f"TestHoliday_{tag}", "date": today, "type": "National",
    })
    passed = status == 201 and body.get("success")
    record("POST", "/holidays", status, passed)
    if passed:
        holiday_id = body["data"]["id"]

    status, body = call(s, "get", f"{BASE}/holidays")
    record("GET", "/holidays", status, status == 200 and body.get("success"))

    if holiday_id:
        status, _ = call(s, "delete", f"{BASE}/holidays/{holiday_id}")
        record("DELETE", "/holidays/:id", status, status == 200)

    # ═══════════════════════════════════════════════════════════════════════════
    # 12. SALARY STRUCTURES
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Salary Structures ──{C.RESET}")

    if user_id:
        # effectiveFrom must be within last month so payroll can find it
        last_month_start = date.today().replace(day=1) - timedelta(days=1)
        salary_effective = last_month_start.replace(day=1).isoformat()
        status, body = call(s, "post", f"{BASE}/salary-structures", json={
            "userId": user_id, "effectiveFrom": salary_effective,
            "basic": 50000, "hra": 10000,
        })
        passed = status == 201 and body.get("success")
        record("POST", "/salary-structures", status, passed)
        if passed:
            salary_id = body["data"]["id"]

        status, body = call(s, "get", f"{BASE}/salary-structures/user/{user_id}")
        record("GET", "/salary-structures/user/:id", status, status == 200 and body.get("success"))

        status, body = call(s, "get", f"{BASE}/salary-structures/user/{user_id}/active")
        record("GET", "/salary-structures/user/:id/active", status, status == 200 and body.get("success"))

    status, body = call(s, "get", f"{BASE}/salary-structures")
    record("GET", "/salary-structures", status, status == 200 and body.get("success"))

    if salary_id:
        status, body = call(s, "put", f"{BASE}/salary-structures/{salary_id}", json={"bonus": 5000})
        record("PUT", "/salary-structures/:id", status, status == 200 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 13. PAYROLL
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Payroll ──{C.RESET}")

    if user_id and salary_id:
        status, body = call(s, "post", f"{BASE}/payroll/run", json={
            "userId": user_id, "month": month, "year": year,
        })
        passed = status == 201 and body.get("success")
        record("POST", "/payroll/run", status, passed)
        if passed:
            payroll_id = body["data"]["id"]

    status, body = call(s, "get", f"{BASE}/payroll")
    record("GET", "/payroll", status, status == 200 and body.get("success"))

    if payroll_id:
        status, body = call(s, "get", f"{BASE}/payslip/{payroll_id}")
        record("GET", "/payslip/:id", status, status == 200 and body.get("success"))

        status, body = call(s, "get", f"{BASE}/payslip/{payroll_id}/download", stream=True)
        record("GET", "/payslip/:id/download", status, status == 200)

    # ═══════════════════════════════════════════════════════════════════════════
    # 14. DASHBOARD
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Dashboard ──{C.RESET}")

    status, body = call(s, "get", f"{BASE}/dashboard/stats")
    record("GET", "/dashboard/stats", status, status == 200 and body.get("success"))

    status, body = call(s, "get", f"{BASE}/dashboard/departments")
    record("GET", "/dashboard/departments", status, status == 200 and body.get("success"))

    status, body = call(s, "get", f"{BASE}/dashboard/activity")
    record("GET", "/dashboard/activity", status, status == 200 and body.get("success"))

    # ═══════════════════════════════════════════════════════════════════════════
    # 15. SECURITY CHECKS — cross-company access must be denied
    # ═══════════════════════════════════════════════════════════════════════════
    print(f"\n{C.BOLD}{C.CYAN}── Security (cross-company must be 404/403) ──{C.RESET}")

    # Try accessing user id=1 — if it's from a different company it must 404
    status, body = call(s, "get", f"{BASE}/users/1")
    if user_id != 1:
        record("GET", "/users/1 (cross-company isolation)", status,
               status == 404 or (status == 200 and body.get("data", {}).get("company_id") == company_id),
               "must 404 or belong to same company")

    # Try accessing employee id=1
    status, body = call(s, "get", f"{BASE}/employees/1")
    if employee_id != 1:
        record("GET", "/employees/1 (cross-company isolation)", status,
               status == 404 or (status == 200 and body.get("data", {}).get("company_id") == company_id),
               "must 404 or belong to same company")

    # ─────────────────────────────────────────────────────────────────────────
    _summary()


def _summary():
    total  = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed

    print(f"\n{C.BOLD}{C.BLUE}{'═'*65}")
    print(f"  SUMMARY:  {C.GREEN}{passed} passed{C.RESET}{C.BOLD}{C.BLUE}  "
          f"{C.RED}{failed} failed{C.RESET}{C.BOLD}{C.BLUE}  "
          f"/ {total} total")
    print(f"{'═'*65}{C.RESET}")

    if failed:
        print(f"\n{C.BOLD}{C.RED}Failed endpoints:{C.RESET}")
        for r in results:
            if not r["passed"]:
                print(f"  {C.RED}✗ {r['method']:<6} {r['path']:<50}  "
                      f"HTTP {r['status']}  {r['note']}{C.RESET}")

    print()
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
