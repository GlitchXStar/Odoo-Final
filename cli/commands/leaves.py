"""Leave management commands."""

from api import client
from utils import header, prompt, prompt_int, prompt_float, menu, print_response, info


# ── Leave Types ──────────────────────────────────────────────────────────────

def list_leave_types():
    header("Leave Types")
    resp = client.get("/leave-types")
    print_response(resp)


def create_leave_type():
    header("Create Leave Type (Admin/HR)")
    body = {
        "name":          prompt("Name (e.g. Casual Leave)"),
        "code":          prompt("Code (e.g. CL, unique within company)"),
        "annualQuota":   prompt_int("Annual Quota (days)", required=False),
        "isPaid":        prompt("Is Paid? (true/false)", default="true"),
        "carryForward":  prompt("Carry Forward? (true/false)", default="false"),
        "maxCarryForward": prompt_int("Max Carry Forward Days", default=0),
    }
    body["isPaid"]       = body["isPaid"].lower() == "true"
    body["carryForward"] = body["carryForward"].lower() == "true"
    resp = client.post("/leave-types", body)
    print_response(resp)


def update_leave_type():
    header("Update Leave Type (Admin/HR)")
    ltid = prompt_int("Leave Type ID")
    info("Leave blank to skip.")
    body = {}
    for field, label in [
        ("name", "Name"), ("annualQuota", "Annual Quota"),
        ("isPaid", "Is Paid (true/false)"), ("carryForward", "Carry Forward (true/false)"),
        ("maxCarryForward", "Max Carry Forward"), ("isActive", "Is Active (true/false)"),
    ]:
        val = prompt(label, required=False)
        if val:
            if field in ("isPaid", "carryForward", "isActive"):
                body[field] = val.lower() == "true"
            elif field in ("annualQuota", "maxCarryForward"):
                body[field] = int(val)
            else:
                body[field] = val
    if not body:
        info("Nothing to update.")
        return
    resp = client.put(f"/leave-types/{ltid}", body)
    print_response(resp)


def delete_leave_type():
    header("Delete Leave Type (Admin/HR)")
    ltid = prompt_int("Leave Type ID")
    resp = client.delete(f"/leave-types/{ltid}")
    print_response(resp)


# ── Leave Balances ────────────────────────────────────────────────────────────

def view_leave_balances():
    header("Leave Balances")
    params = {}
    uid  = prompt_int("User ID (blank = all)", required=False)
    year = prompt_int("Year (blank = all)", required=False)
    if uid:  params["userId"] = uid
    if year: params["year"]   = year
    resp = client.get("/leave-balances", params=params)
    print_response(resp)


def allocate_balance():
    header("Allocate Leave Balance (Admin/HR)")
    body = {
        "userId":         prompt_int("User ID"),
        "leaveTypeId":    prompt_int("Leave Type ID"),
        "year":           prompt_int("Year"),
        "totalAllocated": prompt_float("Total Days to Allocate"),
    }
    resp = client.post("/leave-balances/allocate", body)
    print_response(resp)


def bulk_allocate():
    header("Bulk Allocate Leave Balance (Admin/HR)")
    body = {
        "leaveTypeId":    prompt_int("Leave Type ID"),
        "year":           prompt_int("Year"),
        "totalAllocated": prompt_float("Total Days to Allocate (all employees)"),
    }
    resp = client.post("/leave-balances/bulk-allocate", body)
    print_response(resp)


# ── Leave Requests ────────────────────────────────────────────────────────────

def apply_leave():
    header("Apply for Leave")
    body = {
        "leaveTypeId": prompt_int("Leave Type ID"),
        "startDate":   prompt("Start Date (YYYY-MM-DD)"),
        "endDate":     prompt("End Date (YYYY-MM-DD)"),
        "totalDays":   prompt_float("Total Days"),
        "reason":      prompt("Reason", required=False),
    }
    resp = client.post("/leaves/apply", body)
    print_response(resp)


def list_leaves():
    header("View Leave Requests")
    params = {}
    uid    = prompt_int("User ID (blank = self/all)", required=False)
    status = prompt("Status (Pending/Approved/Rejected/Cancelled/blank)", required=False)
    page   = prompt_int("Page", default=1)
    limit  = prompt_int("Limit", default=20)
    if uid:    params["userId"] = uid
    if status: params["status"] = status
    params["page"]  = page
    params["limit"] = limit
    resp = client.get("/leaves", params=params)
    print_response(resp)


def approve_leave():
    header("Approve Leave (Admin/HR/Payroll)")
    lid = prompt_int("Leave Request ID")
    resp = client.put(f"/leaves/{lid}/approve")
    print_response(resp)


def reject_leave():
    header("Reject Leave (Admin/HR/Payroll)")
    lid    = prompt_int("Leave Request ID")
    reason = prompt("Rejection Reason", required=False)
    resp = client.put(f"/leaves/{lid}/reject", {"rejectionReason": reason})
    print_response(resp)


def leaves_menu():
    while True:
        choice = menu("Leaves", [
            "─ Leave Types ─",
            "List leave types",
            "Create leave type",
            "Update leave type",
            "Delete leave type",
            "─ Leave Balances ─",
            "View leave balances",
            "Allocate balance (single)",
            "Bulk allocate (all employees)",
            "─ Leave Requests ─",
            "Apply for leave",
            "View leave requests",
            "Approve leave",
            "Reject leave",
        ])
        if choice == 0:
            break
        elif choice == 1:
            pass  # section header
        elif choice == 2:
            list_leave_types()
        elif choice == 3:
            create_leave_type()
        elif choice == 4:
            update_leave_type()
        elif choice == 5:
            delete_leave_type()
        elif choice == 6:
            pass  # section header
        elif choice == 7:
            view_leave_balances()
        elif choice == 8:
            allocate_balance()
        elif choice == 9:
            bulk_allocate()
        elif choice == 10:
            pass  # section header
        elif choice == 11:
            apply_leave()
        elif choice == 12:
            list_leaves()
        elif choice == 13:
            approve_leave()
        elif choice == 14:
            reject_leave()
