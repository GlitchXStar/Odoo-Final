#!/usr/bin/env python3
"""
EmPay HRMS — CLI Testing Tool
Interactive terminal frontend for every API endpoint.

Usage:
    python main.py [--url http://localhost:3000]
"""

import sys
import argparse

from api import client
from utils import C, header, info, warn, ok, err, menu, prompt

from commands.auth       import auth_menu
from commands.companies  import companies_menu
from commands.users      import users_menu
from commands.employees  import employees_menu
from commands.shifts     import shifts_menu
from commands.attendance import attendance_menu
from commands.leaves     import leaves_menu
from commands.holidays   import holidays_menu
from commands.salary     import salary_menu
from commands.payroll    import payroll_menu
from commands.dashboard  import dashboard_menu


BANNER = f"""
{C.BOLD}{C.BLUE}╔══════════════════════════════════════════════╗
║        EmPay HRMS  —  CLI Test Tool          ║
║        v1.0  |  All endpoints covered        ║
╚══════════════════════════════════════════════╝{C.RESET}
"""


def status_bar():
    if client.token:
        print(f"  {C.GREEN}● Authenticated{C.RESET}   "
              f"{C.DIM}Base URL: {client.base_url}{C.RESET}")
    else:
        print(f"  {C.YELLOW}○ Not logged in{C.RESET}   "
              f"{C.DIM}Base URL: {client.base_url}{C.RESET}")


def change_base_url():
    new_url = prompt("New base URL", default=client.base_url)
    client.set_base_url(new_url)
    ok(f"Base URL set to {client.base_url}")


def health_check():
    import requests as _req
    try:
        resp = _req.get(f"{client.base_url.replace('/api', '')}/health", timeout=5)
        data = resp.json()
        ok(f"Server healthy — {data.get('service', '')}  [{data.get('timestamp', '')}]")
    except Exception as exc:
        err(f"Health check failed: {exc}")


def logout():
    client.clear_token()
    ok("Token cleared — logged out.")


def main():
    parser = argparse.ArgumentParser(description="EmPay HRMS CLI")
    parser.add_argument("--url", default="http://localhost:3000/api",
                        help="API base URL (default: http://localhost:3000/api)")
    args = parser.parse_args()
    client.set_base_url(args.url)

    print(BANNER)
    status_bar()

    TOP_MENU = [
        "Auth         (login, OTP, change password, create user)",
        "Companies    (list, create, update)",
        "Users        (list, get, update, delete)",
        "Employees    (profiles, my profile)",
        "Shifts       (create, list, update, assign)",
        "Attendance   (check-in, check-out, view)",
        "Leaves       (types, balances, requests, approve/reject)",
        "Holidays     (list, create, delete)",
        "Salary       (structures: create, view, update)",
        "Payroll      (run, view, payslip, download PDF)",
        "Dashboard    (stats, departments, activity)",
        "─────────────────────────────────────────────",
        "Health check",
        "Change base URL",
        "Logout (clear token)",
    ]

    HANDLERS = {
        1:  auth_menu,
        2:  companies_menu,
        3:  users_menu,
        4:  employees_menu,
        5:  shifts_menu,
        6:  attendance_menu,
        7:  leaves_menu,
        8:  holidays_menu,
        9:  salary_menu,
        10: payroll_menu,
        11: dashboard_menu,
        12: None,          # separator — handled below
        13: health_check,
        14: change_base_url,
        15: logout,
    }

    while True:
        print()
        status_bar()
        choice = menu("Main Menu", TOP_MENU)

        if choice == 0:
            print(f"\n{C.DIM}Goodbye!{C.RESET}\n")
            sys.exit(0)

        handler = HANDLERS.get(choice)
        if handler is None:
            continue  # separator row
        try:
            handler()
        except KeyboardInterrupt:
            print(f"\n{C.DIM}  (interrupted — back to main menu){C.RESET}")
        except Exception as exc:
            err(f"Unexpected error: {exc}")


if __name__ == "__main__":
    main()
