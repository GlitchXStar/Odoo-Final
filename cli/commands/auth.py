"""Auth commands: register, login, OTP login, change password, create user."""

from api import client
from utils import header, section, ok, err, info, warn, prompt, prompt_int, menu, print_response


def register_admin():
    header("Register New Admin + Company")
    info("This creates your company and your Admin account in one step.")
    info("Use the password you set here to log in immediately after.")
    print()

    print("  ── Admin Details ──────────────────────────────")
    first  = prompt("First Name")
    last   = prompt("Last Name")
    email  = prompt("Email")
    phone  = prompt("Phone", required=False)
    pw     = prompt("Password (min 8, upper/lower/digit/symbol)", secret=True)
    pw2    = prompt("Confirm Password", secret=True)
    if pw != pw2:
        err("Passwords do not match.")
        return

    print()
    print("  ── Company Details ────────────────────────────")
    c_name    = prompt("Company Name")
    c_code    = prompt("Company Code (unique, alphanumeric, e.g. TECH01)")
    c_email   = prompt("Company Email", required=False)
    c_phone   = prompt("Company Phone", required=False)
    c_address = prompt("Address", required=False)
    c_city    = prompt("City", required=False)
    c_state   = prompt("State", required=False)
    c_country = prompt("Country", default="India", required=False)
    c_pin     = prompt("Pincode", required=False)

    body = {
        "firstName": first, "lastName": last,
        "email": email, "password": pw,
        "companyName": c_name, "companyCode": c_code,
        "companyCountry": c_country or "India",
    }
    for key, val in [
        ("phone", phone), ("companyEmail", c_email), ("companyPhone", c_phone),
        ("companyAddress", c_address), ("companyCity", c_city),
        ("companyState", c_state), ("companyPincode", c_pin),
    ]:
        if val:
            body[key] = val

    resp = client.post("/auth/register", body)
    print_response(resp)
    if resp.get("success"):
        data = resp.get("data", {})
        info(f"Login ID : {data.get('loginId')}")
        info(f"Email    : {data.get('email')}")
        info(f"Company  : {data.get('company', {}).get('name')} [{data.get('company', {}).get('code')}]")
        ok("You can now log in using Auth → Login with Password.")


def login_password():
    header("Login with Password")
    identifier = prompt("Email or Login ID")
    password   = prompt("Password", secret=True)
    resp = client.post("/auth/login", {"identifier": identifier, "password": password})
    print_response(resp)
    if resp.get("success"):
        token = resp["data"].get("token")
        if token:
            client.set_token(token)
            ok("Token stored — you are now authenticated.")
        if resp.get("requirePasswordChange"):
            warn("First login detected — please change your password (Auth → Change Password).")
    return resp.get("success", False)


def login_otp():
    header("Login with OTP")
    identifier = prompt("Email or Login ID")

    info("Requesting OTP…")
    resp = client.post("/auth/request-otp", {"identifier": identifier})
    print_response(resp)
    if not resp.get("success"):
        return

    otp = prompt("Enter the 6-digit OTP from your email")
    resp2 = client.post("/auth/verify-otp", {"identifier": identifier, "otp": otp})
    print_response(resp2)
    if resp2.get("success"):
        token = resp2["data"].get("token")
        if token:
            client.set_token(token)
            ok("Token stored — you are now authenticated.")


def change_password():
    header("Change Password")
    current = prompt("Current Password", secret=True)
    new_pw  = prompt("New Password (min 8 chars, upper/lower/digit/symbol)", secret=True)
    resp = client.post("/auth/change-password", {
        "currentPassword": current,
        "newPassword": new_pw,
    })
    print_response(resp)


def create_user():
    header("Create User (Admin / HR)")
    email     = prompt("Email")
    firstName = prompt("First Name")
    lastName  = prompt("Last Name")
    phone     = prompt("Phone", required=False)
    roleId    = prompt_int("Role ID")
    companyId = prompt_int("Company ID (leave blank = your company)", required=False)
    doj       = prompt("Date of Joining (YYYY-MM-DD)", required=False)

    body = {
        "email": email,
        "firstName": firstName,
        "lastName": lastName,
        "phone": phone or None,
        "roleId": roleId,
    }
    if companyId:
        body["companyId"] = companyId
    if doj:
        body["dateOfJoining"] = doj

    resp = client.post("/auth/create-user", body)
    print_response(resp)
    if resp.get("success"):
        creds = resp["data"].get("credentials", {})
        info(f"Login ID:  {creds.get('loginId')}")
        info(f"Temp Pass: {creds.get('temporaryPassword')}")


def auth_menu():
    while True:
        choice = menu("Auth", [
            "Register (new admin + company setup)",
            "Login with Password",
            "Login with OTP",
            "Change Password",
            "Create User (Admin/HR only)",
        ])
        if choice == 0:
            break
        elif choice == 1:
            register_admin()
        elif choice == 2:
            login_password()
        elif choice == 3:
            login_otp()
        elif choice == 4:
            change_password()
        elif choice == 5:
            create_user()
