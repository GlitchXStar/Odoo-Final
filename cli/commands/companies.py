"""Company commands."""

from api import client
from utils import header, prompt, menu, print_response, info


def get_my_company():
    header("My Company")
    resp = client.get("/companies/me")
    print_response(resp)


def update_my_company():
    header("Update My Company (Admin)")
    info("Leave blank to skip a field.")
    body = {}
    for field, label in [
        ("name", "Name"), ("email", "Email"), ("phone", "Phone"),
        ("address", "Address"), ("city", "City"), ("state", "State"),
        ("country", "Country"), ("pincode", "Pincode"), ("taxId", "Tax ID"),
    ]:
        val = prompt(label, required=False)
        if val:
            body[field] = val
    if not body:
        info("Nothing to update.")
        return
    resp = client.put("/companies/me", body)
    print_response(resp)


def companies_menu():
    while True:
        choice = menu("Companies", [
            "View my company",
            "Update my company",
        ])
        if choice == 0:
            break
        elif choice == 1:
            get_my_company()
        elif choice == 2:
            update_my_company()
