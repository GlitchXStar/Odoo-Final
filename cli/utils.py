"""
Shared UI helpers: printing, prompts, tables.
"""

import json
from typing import Any, Dict, List, Optional


# ── ANSI colours ────────────────────────────────────────────────────────────

class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    RED    = "\033[91m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    CYAN   = "\033[96m"
    WHITE  = "\033[97m"
    DIM    = "\033[2m"
    BLUE   = "\033[94m"


def ok(msg: str):
    print(f"{C.GREEN}✓ {msg}{C.RESET}")


def err(msg: str):
    print(f"{C.RED}✗ {msg}{C.RESET}")


def info(msg: str):
    print(f"{C.CYAN}ℹ {msg}{C.RESET}")


def warn(msg: str):
    print(f"{C.YELLOW}⚠ {msg}{C.RESET}")


def header(title: str):
    width = 54
    print(f"\n{C.BOLD}{C.BLUE}{'─' * width}{C.RESET}")
    print(f"{C.BOLD}{C.BLUE}  {title}{C.RESET}")
    print(f"{C.BOLD}{C.BLUE}{'─' * width}{C.RESET}")


def section(title: str):
    print(f"\n{C.BOLD}{C.CYAN}  {title}{C.RESET}")
    print(f"{C.DIM}  {'─' * (len(title) + 2)}{C.RESET}")


def print_response(resp: Dict[str, Any], compact: bool = False):
    """Pretty-print an API response dict."""
    code = resp.get("_status_code", "?")
    success = resp.get("success", False)

    if success:
        ok(f"HTTP {code} — {resp.get('message', 'OK')}")
    else:
        err(f"HTTP {code} — {resp.get('message', 'Error')}")
        if "errors" in resp:
            for e in resp["errors"]:
                print(f"   {C.RED}• {e.get('field','')}: {e.get('message','')}{C.RESET}")

    data = resp.get("data")
    if data is None:
        return

    if compact:
        print(json.dumps(data, indent=2, default=str))
        return

    if isinstance(data, dict):
        _print_dict(data)
    elif isinstance(data, list):
        _print_list(data)


def _print_dict(d: Dict, indent: int = 2):
    pad = " " * indent
    for k, v in d.items():
        if k == "_status_code":
            continue
        if isinstance(v, (dict, list)):
            print(f"{pad}{C.BOLD}{k}{C.RESET}:")
            if isinstance(v, dict):
                _print_dict(v, indent + 4)
            else:
                for item in v:
                    if isinstance(item, dict):
                        _print_dict(item, indent + 4)
                        print(f"{' ' * (indent + 4)}{C.DIM}{'·' * 20}{C.RESET}")
                    else:
                        print(f"{pad}    {item}")
        else:
            print(f"{pad}{C.BOLD}{k}{C.RESET}: {C.WHITE}{v}{C.RESET}")


def _print_list(lst: List, max_rows: int = 30):
    if not lst:
        info("(empty list)")
        return
    if isinstance(lst[0], dict):
        print_table(lst, max_rows=max_rows)
    else:
        for item in lst[:max_rows]:
            print(f"  • {item}")


def print_table(rows: List[Dict], max_rows: int = 30):
    if not rows:
        info("No records.")
        return
    rows = rows[:max_rows]
    keys = list(rows[0].keys())
    skip = {"_status_code", "permissions"}
    keys = [k for k in keys if k not in skip]

    col_w = {}
    for k in keys:
        col_w[k] = max(len(str(k)), max(len(_trunc(str(r.get(k, "")))) for r in rows))
        col_w[k] = min(col_w[k], 30)

    header_row = "  " + "  ".join(str(k).ljust(col_w[k]) for k in keys)
    print(f"\n{C.BOLD}{C.CYAN}{header_row}{C.RESET}")
    print(f"  {'  '.join('─' * col_w[k] for k in keys)}")
    for row in rows:
        line = "  " + "  ".join(_trunc(str(row.get(k, ""))).ljust(col_w[k]) for k in keys)
        print(line)
    print()


def _trunc(s: str, n: int = 30) -> str:
    return s[:n - 1] + "…" if len(s) > n else s


# ── Input helpers ───────────────────────────────────────────────────────────

def prompt(label: str, default: str = "", required: bool = True, secret: bool = False) -> str:
    import getpass
    suffix = f" [{default}]" if default else ""
    star   = " *" if required else ""
    while True:
        try:
            if secret:
                val = getpass.getpass(f"  {C.BOLD}{label}{star}{suffix}: {C.RESET}")
            else:
                val = input(f"  {C.BOLD}{label}{star}{suffix}: {C.RESET}").strip()
        except (KeyboardInterrupt, EOFError):
            print()
            return default
        if not val and default:
            return default
        if not val and required:
            warn("This field is required.")
            continue
        return val


def prompt_int(label: str, default: Optional[int] = None, required: bool = True) -> Optional[int]:
    d = str(default) if default is not None else ""
    while True:
        raw = prompt(label, default=d, required=required)
        if not raw:
            return default
        try:
            return int(raw)
        except ValueError:
            warn("Please enter a valid integer.")


def prompt_float(label: str, default: Optional[float] = None) -> Optional[float]:
    d = str(default) if default is not None else ""
    while True:
        raw = prompt(label, default=d, required=False)
        if not raw:
            return default
        try:
            return float(raw)
        except ValueError:
            warn("Please enter a valid number.")


def prompt_choice(label: str, choices: List[str], default: str = "") -> str:
    opts = "/".join(choices)
    while True:
        val = prompt(f"{label} ({opts})", default=default).strip().lower()
        if val in [c.lower() for c in choices]:
            return val
        warn(f"Choose one of: {opts}")


def menu(title: str, options: List[str]) -> int:
    """Show a numbered menu, return 1-based index. 0 = back/quit."""
    section(title)
    for i, opt in enumerate(options, 1):
        print(f"  {C.CYAN}{i:2}{C.RESET}. {opt}")
    print(f"  {C.DIM} 0. ← Back{C.RESET}")
    while True:
        raw = input(f"\n  {C.BOLD}Choice: {C.RESET}").strip()
        try:
            val = int(raw)
            if 0 <= val <= len(options):
                return val
        except ValueError:
            pass
        warn(f"Enter a number between 0 and {len(options)}.")
