"""User management commands."""

from api import client
from utils import header, prompt, prompt_int, menu, print_response, info


def list_users():
    header("List Users")
    page    = prompt_int("Page", default=1)
    limit   = prompt_int("Limit", default=20)
    active  = prompt("Filter is_active (true/false/blank)", required=False)
    role_id = prompt_int("Filter by Role ID (blank = all)", required=False)

    params = {"page": page, "limit": limit}
    if active:
        params["isActive"] = active
    if role_id:
        params["roleId"] = role_id

    resp = client.get("/users", params=params)
    print_response(resp)


def get_user():
    header("Get User by ID")
    uid = prompt_int("User ID")
    resp = client.get(f"/users/{uid}")
    print_response(resp)


def update_user():
    header("Update User")
    uid = prompt_int("User ID")
    info("Leave blank to skip a field.")
    body = {}
    for field, label in [
        ("firstName", "First Name"), ("lastName", "Last Name"),
        ("phone", "Phone"), ("roleId", "Role ID (integer)"),
        ("isActive", "Is Active (true/false)"),
    ]:
        val = prompt(label, required=False)
        if val:
            if field == "roleId":
                body[field] = int(val)
            elif field == "isActive":
                body[field] = val.lower() == "true"
            else:
                body[field] = val
    if not body:
        info("Nothing to update.")
        return
    resp = client.put(f"/users/{uid}", body)
    print_response(resp)


def delete_user():
    header("Delete User (Admin only)")
    uid = prompt_int("User ID")
    confirm = prompt(f"Type 'yes' to confirm deleting user {uid}", required=True)
    if confirm.lower() != "yes":
        info("Cancelled.")
        return
    resp = client.delete(f"/users/{uid}")
    print_response(resp)


def users_menu():
    while True:
        choice = menu("Users", [
            "List users",
            "Get user by ID",
            "Update user",
            "Delete user",
        ])
        if choice == 0:
            break
        elif choice == 1:
            list_users()
        elif choice == 2:
            get_user()
        elif choice == 3:
            update_user()
        elif choice == 4:
            delete_user()
