"""Attendance commands."""

from api import client
from utils import header, prompt, prompt_int, menu, print_response


def check_in():
    header("Check In")
    resp = client.post("/attendance/check-in")
    print_response(resp)


def check_out():
    header("Check Out")
    resp = client.post("/attendance/check-out")
    print_response(resp)


def get_attendance():
    header("View Attendance")
    params = {}
    uid   = prompt_int("User ID (blank = self)", required=False)
    date  = prompt("Specific Date (YYYY-MM-DD, blank = all)", required=False)
    month = prompt_int("Month (1-12, blank = all)", required=False)
    year  = prompt_int("Year (e.g. 2025, blank = all)", required=False)
    page  = prompt_int("Page", default=1)
    limit = prompt_int("Limit", default=50)

    if uid:   params["userId"] = uid
    if date:  params["date"]   = date
    if month: params["month"]  = month
    if year:  params["year"]   = year
    params["page"]  = page
    params["limit"] = limit

    resp = client.get("/attendance", params=params)
    print_response(resp)


def attendance_menu():
    while True:
        choice = menu("Attendance", [
            "Check In",
            "Check Out",
            "View attendance records",
        ])
        if choice == 0:
            break
        elif choice == 1:
            check_in()
        elif choice == 2:
            check_out()
        elif choice == 3:
            get_attendance()
