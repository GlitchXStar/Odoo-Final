"""Dashboard commands."""

from api import client
from utils import header, prompt_int, menu, print_response


def stats():
    header("Dashboard — Company Stats")
    resp = client.get("/dashboard/stats")
    print_response(resp)


def departments():
    header("Dashboard — Department Breakdown")
    resp = client.get("/dashboard/departments")
    print_response(resp)


def activity():
    header("Dashboard — Recent Activity (Audit Log)")
    limit = prompt_int("Number of records", default=20)
    resp = client.get("/dashboard/activity", params={"limit": limit})
    print_response(resp)


def dashboard_menu():
    while True:
        choice = menu("Dashboard", [
            "Company stats",
            "Department breakdown",
            "Recent activity (audit log)",
        ])
        if choice == 0:
            break
        elif choice == 1:
            stats()
        elif choice == 2:
            departments()
        elif choice == 3:
            activity()
