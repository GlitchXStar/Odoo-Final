"""Employee profile commands."""

from api import client
from utils import header, prompt, prompt_int, menu, print_response, info


def list_employees():
    header("List Employees")
    params = {
        "page":  prompt_int("Page", default=1),
        "limit": prompt_int("Limit", default=20),
    }
    status = prompt("Status filter (Active/Inactive/On Leave/blank)", required=False)
    dept   = prompt("Department filter (blank = all)", required=False)
    if status:
        params["status"] = status
    if dept:
        params["department"] = dept
    resp = client.get("/employees", params=params)
    print_response(resp)


def my_profile():
    header("My Employee Profile")
    resp = client.get("/employees/me")
    print_response(resp)


def get_employee():
    header("Get Employee by Profile ID")
    eid = prompt_int("Employee Profile ID")
    resp = client.get(f"/employees/{eid}")
    print_response(resp)


def create_employee():
    header("Create Employee Profile (Admin/HR)")
    body = {
        "userId":        prompt_int("User ID"),
        "employeeCode":  prompt("Employee Code (unique within company)"),
        "department":    prompt("Department", required=False),
        "designation":   prompt("Designation", required=False),
        "dateOfJoining": prompt("Date of Joining (YYYY-MM-DD)"),
        "employmentType": prompt("Employment Type (Full-Time/Part-Time/Contract/Intern)", default="Full-Time"),
        "status":         prompt("Status", default="Active", required=False),
    }
    for field, label in [
        ("managerId", "Manager User ID (int, blank=none)"),
    ]:
        val = prompt(label, required=False)
        if val:
            body[field] = int(val)

    for field, label in [
        ("dateOfBirth", "Date of Birth (YYYY-MM-DD)"),
        ("gender", "Gender (Male/Female/Other)"),
        ("bloodGroup", "Blood Group"),
        ("emergencyContactName", "Emergency Contact Name"),
        ("emergencyContactPhone", "Emergency Contact Phone"),
        ("permanentAddress", "Permanent Address"),
        ("currentAddress", "Current Address"),
        ("panNumber", "PAN Number"),
        ("aadharNumber", "Aadhar Number"),
        ("bankAccountNumber", "Bank Account Number"),
        ("bankName", "Bank Name"),
        ("bankIfsc", "Bank IFSC"),
    ]:
        val = prompt(label, required=False)
        if val:
            body[field] = val

    body = {k: v for k, v in body.items() if v is not None and v != ""}
    resp = client.post("/employees", body)
    print_response(resp)


def update_employee():
    header("Update Employee Profile (Admin/HR)")
    eid  = prompt_int("Employee Profile ID")
    info("Leave blank to skip.")
    body = {}
    for field, label in [
        ("department", "Department"),
        ("designation", "Designation"),
        ("employmentType", "Employment Type"),
        ("status", "Status"),
        ("dateOfLeaving", "Date of Leaving (YYYY-MM-DD)"),
        ("gender", "Gender"),
        ("bloodGroup", "Blood Group"),
        ("emergencyContactName", "Emergency Contact Name"),
        ("emergencyContactPhone", "Emergency Contact Phone"),
        ("permanentAddress", "Permanent Address"),
        ("currentAddress", "Current Address"),
        ("panNumber", "PAN"),
        ("aadharNumber", "Aadhar"),
        ("bankAccountNumber", "Bank Account"),
        ("bankName", "Bank Name"),
        ("bankIfsc", "Bank IFSC"),
    ]:
        val = prompt(label, required=False)
        if val:
            body[field] = val
    if not body:
        info("Nothing to update.")
        return
    resp = client.put(f"/employees/{eid}", body)
    print_response(resp)


def employees_menu():
    while True:
        choice = menu("Employees", [
            "List employees",
            "My profile",
            "Get employee by ID",
            "Create employee profile",
            "Update employee profile",
        ])
        if choice == 0:
            break
        elif choice == 1:
            list_employees()
        elif choice == 2:
            my_profile()
        elif choice == 3:
            get_employee()
        elif choice == 4:
            create_employee()
        elif choice == 5:
            update_employee()
