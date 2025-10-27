import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestUserAuth:

    register_url = "/api/v1/auth/register/"
    login_url = "/api/v1/auth/login/"
    user_url = "/api/v1/auth/user/"
    refresh_url = "/api/v1/auth/refresh/"

    @pytest.fixture
    def client(self):
        return APIClient()

    @pytest.fixture
    def register_user(self, client):
        payload = {
            "email": "user@example.com",
            "username": "diverbob",
            "password": "testpassword123",
            "role": "hobbyist"
        }
        response = client.post(self.register_url, payload, format="json")
        assert response.status_code == 200 or response.status_code == 201
        return response.data

    def test_register(self, client):
        # Registration should return id, email, username
        resp = client.post(self.register_url, {
            "email": "user@example.com",
            "username": "diverbob",
            "password": "testpassword123",
            "role": "hobbyist"
        }, format="json")
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "id" in data
        assert data["email"] == "user@example.com"
        assert data["username"] == "diverbob"
        assert data["role"] == "hobbyist"

    def test_login_missing_field(self, client, register_user):
        # Login missing username: should return error
        resp = client.post(self.login_url, {
            "email": "user@example.com",
            "password": "testpassword123",
            "role": "hobbyist"
        }, format="json")
        assert resp.status_code == 400
        assert "username" in resp.data

    def test_login_invalid_username(self, client, register_user):
        # Wrong username: should return "No active account found with the given credentials"
        resp = client.post(self.login_url, {
            "username": "lol",
            "email": "user@example.com",
            "password": "testpassword123",
            "role": "hobbyist"
        }, format="json")
        assert resp.status_code == 401 or resp.status_code == 400
        assert "detail" in resp.data

    def test_login_success(self, client, register_user):
        # Right username, email, password: should return refresh & access
        resp = client.post(self.login_url, {
            "username": "diverbob",
            "email": "user@example.com",
            "password": "testpassword123",
            "role": "hobbyist"
        }, format="json")
        assert resp.status_code == 200
        assert "refresh" in resp.data and "access" in resp.data
        self.tokens = resp.data

    def test_patch_user(self, client, register_user):
        # Update user username with PATCH and Bearer token
        resp = client.post(self.login_url, {
            "username": "diverbob",
            "email": "user@example.com",
            "password": "testpassword123",
            "role": "hobbyist"
        }, format="json")
        token = resp.data["access"]
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        patch_resp = client.patch(self.user_url, {"username": "diveralice"}, format="json")
        assert patch_resp.status_code == 200
        data = patch_resp.data
        assert data["username"] == "diveralice"

    def test_register_invalid_role(self, client):
        resp = client.post(self.register_url, {
            "email": "baduser@example.com",
            "username": "invalidrole",
            "password": "testpassword123",
            "role": "pirate"
        }, format="json")
        assert resp.status_code == 400
        assert "role" in resp.data or "role" in resp.json()

    def test_refresh_token(self, client, register_user):
        # Login first
        resp = client.post(self.login_url, {
            "username": "diverbob",
            "email": "user@example.com",
            "password": "testpassword123",
            "role": "hobbyist"
        }, format="json")
        refresh = resp.data["refresh"]

        refresh_resp = client.post(self.refresh_url, {"refresh": refresh}, format="json")
        assert refresh_resp.status_code == 200
        # Access token must be present
        assert "access" in refresh_resp.data

        # Second refresh (simulate refresh chain)
        refresh_resp2 = client.post(self.refresh_url, {"refresh": refresh}, format="json")
        assert refresh_resp2.status_code == 200
        assert "access" in refresh_resp2.data
