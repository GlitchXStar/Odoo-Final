"""Holiday calendar commands."""

from api import client
from utils import header, prompt, prompt_int, menu, print_response


def list_holidays():
    header("Holidays")
    params = {}
    year = prompt_int("Year (blank = all)", required=False)
    if year:
        params["year"] = year
    resp = client.get("/holidays", params=params)
    print_response(resp)


def create_holiday():
    header("Create Holiday (Admin/HR)")
    body = {
        "name":        prompt("Holiday Name"),
        "date":        prompt("Date (YYYY-MM-DD)"),
        "type":        prompt("Type (National/Optional/Company/Regional)", default="National"),
        "description": prompt("Description", required=False),
    }
    body = {k: v for k, v in body.items() if v}
    resp = client.post("/holidays", body)
    print_response(resp)


def delete_holiday():
    header("Delete Holiday (Admin/HR)")
    hid = prompt_int("Holiday ID")
    resp = client.delete(f"/holidays/{hid}")
    print_response(resp)


def holidays_menu():
    while True:
        choice = menu("Holidays", [
            "List holidays",
            "Create holiday",
            "Delete holiday",
        ])
        if choice == 0:
            break
        elif choice == 1:
            list_holidays()
        elif choice == 2:
            create_holiday()
        elif choice == 3:
            delete_holiday()
