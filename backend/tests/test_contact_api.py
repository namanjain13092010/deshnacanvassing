"""Backend API tests for Deshna Canvassing contact endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://golden-distribution.preview.emergentagent.com").rstrip("/")


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "running"
        assert "Deshna" in data.get("message", "")


# ---------- Contact ----------
class TestContact:
    def test_create_contact_full_payload(self, api_client):
        payload = {
            "name": "TEST_John Doe",
            "email": "TEST_john@example.com",
            "phone": "9999999999",
            "company": "TEST Co",
            "message": "TEST_Interested in distribution partnership.",
        }
        r = api_client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["phone"] == payload["phone"]
        assert data["company"] == payload["company"]
        assert data["message"] == payload["message"]
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data

        # verify persistence via GET
        list_r = api_client.get(f"{BASE_URL}/api/contact")
        assert list_r.status_code == 200
        items = list_r.json()
        assert any(item["id"] == data["id"] for item in items)

    def test_create_contact_minimum_required(self, api_client):
        payload = {
            "name": "TEST_Min",
            "email": "TEST_min@example.com",
            "message": "TEST_minimum fields",
        }
        r = api_client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["phone"] is None
        assert data["company"] is None

    def test_create_contact_invalid_email(self, api_client):
        payload = {"name": "TEST_X", "email": "not-an-email", "message": "msg"}
        r = api_client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 422

    def test_create_contact_missing_required(self, api_client):
        # missing message
        payload = {"name": "TEST_X", "email": "ok@x.com"}
        r = api_client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 422

    def test_list_contacts(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/contact")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # _id should NOT leak from mongo
        if data:
            for item in data:
                assert "_id" not in item
                assert "id" in item
                assert "email" in item
