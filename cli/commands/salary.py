"""Salary structure commands."""

from api import client
from utils import header, prompt, prompt_int, prompt_float, menu, print_response, info


def list_salary_structures():
    header("All Salary Structures (Admin/HR/Payroll)")
    resp = client.get("/salary-structures")
    print_response(resp)


def get_salary_by_user():
    header("Salary Structure by User")
    uid = prompt_int("User ID")
    resp = client.get(f"/salary-structures/user/{uid}")
    print_response(resp)


def get_active_salary():
    header("Active Salary Structure for User")
    uid = prompt_int("User ID")
    resp = client.get(f"/salary-structures/user/{uid}/active")
    print_response(resp)


def create_salary_structure():
    header("Create Salary Structure (Admin/Payroll)")
    body = {
        "userId":               prompt_int("User ID"),
        "effectiveFrom":        prompt("Effective From (YYYY-MM-DD)"),
        "effectiveTo":          prompt("Effective To (YYYY-MM-DD, blank=indefinite)", required=False) or None,
        "basic":                prompt_float("Basic Salary"),
        "hra":                  prompt_float("HRA", default=0.0),
        "conveyanceAllowance":  prompt_float("Conveyance Allowance", default=0.0),
        "medicalAllowance":     prompt_float("Medical Allowance", default=0.0),
        "specialAllowance":     prompt_float("Special Allowance", default=0.0),
        "bonus":                prompt_float("Bonus", default=0.0),
        "otherAllowances":      prompt_float("Other Allowances", default=0.0),
        "currency":             prompt("Currency", default="INR"),
    }
    body = {k: v for k, v in body.items() if v is not None}
    resp = client.post("/salary-structures", body)
    print_response(resp)


def update_salary_structure():
    header("Update Salary Structure (Admin/Payroll)")
    ssid = prompt_int("Salary Structure ID")
    info("Leave blank to skip.")
    body = {}
    for field, label in [
        ("basic", "Basic"), ("hra", "HRA"),
        ("conveyanceAllowance", "Conveyance Allowance"),
        ("medicalAllowance", "Medical Allowance"),
        ("specialAllowance", "Special Allowance"),
        ("bonus", "Bonus"), ("otherAllowances", "Other Allowances"),
        ("effectiveTo", "Effective To (YYYY-MM-DD)"),
        ("isActive", "Is Active (true/false)"),
    ]:
        val = prompt(label, required=False)
        if val:
            if field in ("basic", "hra", "conveyanceAllowance", "medicalAllowance",
                         "specialAllowance", "bonus", "otherAllowances"):
                body[field] = float(val)
            elif field == "isActive":
                body[field] = val.lower() == "true"
            else:
                body[field] = val
    if not body:
        info("Nothing to update.")
        return
    resp = client.put(f"/salary-structures/{ssid}", body)
    print_response(resp)


def salary_menu():
    while True:
        choice = menu("Salary Structures", [
            "List all salary structures",
            "Get by user ID",
            "Get active structure for user",
            "Create salary structure",
            "Update salary structure",
        ])
        if choice == 0:
            break
        elif choice == 1:
            list_salary_structures()
        elif choice == 2:
            get_salary_by_user()
        elif choice == 3:
            get_active_salary()
        elif choice == 4:
            create_salary_structure()
        elif choice == 5:
            update_salary_structure()
