"""Payroll and payslip commands."""

import os
from api import client
from utils import header, prompt, prompt_int, menu, print_response, info, ok, err


def run_payroll():
    header("Run Payroll (Admin/Payroll)")
    uid   = prompt_int("User ID (blank = bulk run for ALL employees)", required=False)
    month = prompt_int("Month (1–12)")
    year  = prompt_int("Year (e.g. 2025)")

    body = {"month": month, "year": year}
    if uid:
        body["userId"] = uid
        info(f"Running payroll for user {uid}, {month}/{year}…")
    else:
        confirm = prompt("Run payroll for ALL active employees? (yes/no)")
        if confirm.lower() != "yes":
            info("Cancelled.")
            return
        info(f"Running bulk payroll for {month}/{year}…")

    resp = client.post("/payroll/run", body)
    print_response(resp)


def view_payroll():
    header("View Payroll")
    params = {}
    uid   = prompt_int("User ID (blank = self)", required=False)
    month = prompt_int("Month (blank = all)", required=False)
    year  = prompt_int("Year (blank = all)", required=False)
    if uid:   params["userId"] = uid
    if month: params["month"]  = month
    if year:  params["year"]   = year
    resp = client.get("/payroll", params=params)
    print_response(resp)


def view_payslip():
    header("View Payslip (JSON)")
    pid = prompt_int("Payroll ID")
    resp = client.get(f"/payslip/{pid}")
    print_response(resp)


def download_payslip():
    header("Download Payslip PDF")
    pid  = prompt_int("Payroll ID")
    dest = prompt("Save path (e.g. payslip.pdf)", default=f"payslip_{pid}.pdf")
    ok_flag = client.download(f"/payslip/{pid}/download", dest)
    if ok_flag:
        ok(f"Saved to: {os.path.abspath(dest)}")
    else:
        err("Download failed — check the payroll ID and your permissions.")


def payroll_menu():
    while True:
        choice = menu("Payroll & Payslips", [
            "Run payroll (single or bulk)",
            "View payroll records",
            "View payslip (JSON)",
            "Download payslip PDF",
        ])
        if choice == 0:
            break
        elif choice == 1:
            run_payroll()
        elif choice == 2:
            view_payroll()
        elif choice == 3:
            view_payslip()
        elif choice == 4:
            download_payslip()
