"""Shift management commands."""

from api import client
from utils import header, prompt, prompt_int, prompt_float, menu, print_response, info


def list_shifts():
    header("All Shifts")
    resp = client.get("/shifts")
    print_response(resp)


def create_shift():
    header("Create Shift (Admin/HR)")
    body = {
        "name":         prompt("Shift Name"),
        "startTime":    prompt("Start Time (HH:MM:SS, e.g. 09:00:00)"),
        "endTime":      prompt("End Time (HH:MM:SS, e.g. 18:00:00)"),
        "graceMinutes": prompt_int("Grace Minutes", default=0),
        "halfDayHours": prompt_float("Half-Day Hours", default=4.0),
        "fullDayHours": prompt_float("Full-Day Hours", default=8.0),
    }
    resp = client.post("/shifts", body)
    print_response(resp)


def update_shift():
    header("Update Shift (Admin/HR)")
    sid = prompt_int("Shift ID")
    info("Leave blank to skip.")
    body = {}
    for field, label in [
        ("name", "Name"), ("startTime", "Start Time (HH:MM:SS)"),
        ("endTime", "End Time (HH:MM:SS)"), ("graceMinutes", "Grace Minutes"),
        ("halfDayHours", "Half-Day Hours"), ("fullDayHours", "Full-Day Hours"),
        ("isActive", "Is Active (true/false)"),
    ]:
        val = prompt(label, required=False)
        if val:
            if field in ("graceMinutes",):
                body[field] = int(val)
            elif field in ("halfDayHours", "fullDayHours"):
                body[field] = float(val)
            elif field == "isActive":
                body[field] = val.lower() == "true"
            else:
                body[field] = val
    if not body:
        info("Nothing to update.")
        return
    resp = client.put(f"/shifts/{sid}", body)
    print_response(resp)


def assign_shift():
    header("Assign Shift to Employee")
    body = {
        "userId":        prompt_int("User ID"),
        "shiftId":       prompt_int("Shift ID"),
        "effectiveFrom": prompt("Effective From (YYYY-MM-DD)"),
        "effectiveTo":   prompt("Effective To (YYYY-MM-DD, blank=indefinite)", required=False) or None,
    }
    resp = client.post("/employee-shifts", body)
    print_response(resp)


def shifts_menu():
    while True:
        choice = menu("Shifts", [
            "List shifts",
            "Create shift",
            "Update shift",
            "Assign shift to employee",
        ])
        if choice == 0:
            break
        elif choice == 1:
            list_shifts()
        elif choice == 2:
            create_shift()
        elif choice == 3:
            update_shift()
        elif choice == 4:
            assign_shift()
