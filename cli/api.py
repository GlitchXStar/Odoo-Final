"""
HTTP client wrapper for the EmPay HRMS API.
Stores the JWT token and base URL for the session.
"""

import json
import requests
from typing import Any, Dict, Optional

BASE_URL = "http://localhost:3000/api"


class APIClient:
    def __init__(self):
        self.base_url = BASE_URL
        self.token: Optional[str] = None
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def set_token(self, token: str):
        self.token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    def clear_token(self):
        self.token = None
        self.session.headers.pop("Authorization", None)

    def set_base_url(self, url: str):
        self.base_url = url.rstrip("/")

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _handle(self, resp: requests.Response) -> Dict[str, Any]:
        try:
            data = resp.json()
        except Exception:
            data = {"success": False, "message": resp.text or "No response body"}
        data["_status_code"] = resp.status_code
        return data

    def get(self, path: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        resp = self.session.get(self._url(path), params=params)
        return self._handle(resp)

    def post(self, path: str, body: Optional[Dict] = None) -> Dict[str, Any]:
        resp = self.session.post(self._url(path), json=body or {})
        return self._handle(resp)

    def put(self, path: str, body: Optional[Dict] = None) -> Dict[str, Any]:
        resp = self.session.put(self._url(path), json=body or {})
        return self._handle(resp)

    def delete(self, path: str) -> Dict[str, Any]:
        resp = self.session.delete(self._url(path))
        return self._handle(resp)

    def download(self, path: str, save_path: str) -> bool:
        resp = self.session.get(self._url(path), stream=True)
        if resp.status_code == 200:
            with open(save_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        return False


# Shared singleton used by all command modules
client = APIClient()
