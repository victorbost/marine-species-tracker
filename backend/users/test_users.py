import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestUserAuth:

    register_url = "/api/v1/auth/register/"
    login_url = "/api/v1/auth/login/"
    user_url = "/api/v1/auth/user/"
    refresh_url = "/api/v1/auth/refresh/"
    profile_me_url = "/api/v1/auth/profiles/me/"

    @pytest.fixture
    def client(self):
        return APIClient()

    @pytest.fixture
    def register_user(self, client):
        payload = {
            "email": "user@example.com",
            "username": "diverbob",
            "password": "testpassword123",
            "role": "hobbyist",
        }
        response = client.post(self.register_url, payload, format="json")
        assert response.status_code == 200 or response.status_code == 201
        return response.data

    def test_register(self, client):
        # Registration should return id, email, username
        resp = client.post(
            self.register_url,
            {
                "email": "user@example.com",
                "username": "diverbob",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "id" in data
        assert data["email"] == "user@example.com"
        assert data["username"] == "diverbob"
        assert data["role"] == "hobbyist"

    def test_login_missing_field(self, client, register_user):
        # Login missing username: should return error
        resp = client.post(
            self.login_url,
            {
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        assert resp.status_code == 400
        assert "username" in resp.data

    def test_login_invalid_username(self, client, register_user):
        # Wrong username: should return "No active account found with the given credentials"
        resp = client.post(
            self.login_url,
            {
                "username": "lol",
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        assert resp.status_code == 401 or resp.status_code == 400
        assert "detail" in resp.data

    def test_login_success(self, client, register_user):
        # Right username, email, password: should return refresh & access
        resp = client.post(
            self.login_url,
            {
                "username": "diverbob",
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        assert resp.status_code == 200
        assert "refresh" in resp.data and "access" in resp.data
        self.tokens = resp.data

    def test_patch_user(self, client, register_user):
        # Update user username with PATCH and Bearer token
        resp = client.post(
            self.login_url,
            {
                "username": "diverbob",
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        token = resp.data["access"]
        client.credentials(HTTP_AUTHORIZATION="Bearer " + token)
        patch_resp = client.patch(
            self.user_url, {"username": "diveralice"}, format="json"
        )
        assert patch_resp.status_code == 200
        data = patch_resp.data
        assert data["username"] == "diveralice"

    def test_register_invalid_role(self, client):
        resp = client.post(
            self.register_url,
            {
                "email": "baduser@example.com",
                "username": "invalidrole",
                "password": "testpassword123",
                "role": "pirate",
            },
            format="json",
        )
        assert resp.status_code == 400
        assert "role" in resp.data or "role" in resp.json()

    def test_refresh_token(self, client, register_user):
        # Login first
        resp = client.post(
            self.login_url,
            {
                "username": "diverbob",
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        refresh = resp.data["refresh"]

        refresh_resp = client.post(
            self.refresh_url, {"refresh": refresh}, format="json"
        )
        assert refresh_resp.status_code == 200
        # Access token must be present
        assert "access" in refresh_resp.data

        # Second refresh (simulate refresh chain)
        refresh_resp2 = client.post(
            self.refresh_url, {"refresh": refresh}, format="json"
        )
        assert refresh_resp2.status_code == 200
        assert "access" in refresh_resp2.data

    def create_observation_for_user(
        self, client, token, payload_override=None
    ):
        """
        Helper to create an observation for the current authenticated user.
        You may need to adjust this based on your /observations/ endpoint structure.
        """
        obs_url = "/api/v1/observations/"
        payload = {
            "species_name": "Test Fish",
            "observation_datetime": "2024-10-29T12:00:00Z",
            "location": "POINT(1.0 2.0)",
            "location_name": "Test Reef",
            "depth": 5.0,
            "temperature": 20.2,
            "visibility": 15.1,
            "notes": "Test observation note",
        }
        if payload_override:
            payload.update(payload_override)
        client.credentials(HTTP_AUTHORIZATION="Bearer " + token)
        resp = client.post(obs_url, payload, format="json")
        assert resp.status_code in (200, 201)
        return resp.data

    def test_profile_me_requires_auth(self, client):
        resp = client.get(self.profile_me_url)
        assert resp.status_code in (401, 403)

    def test_profile_me_no_observations(self, client, register_user):
        login = client.post(
            self.login_url,
            {
                "username": "diverbob",
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        token = login.data["access"]
        client.credentials(HTTP_AUTHORIZATION="Bearer " + token)
        resp = client.get(self.profile_me_url)
        assert resp.status_code == 200
        data = resp.json()
        assert "observation_count" in data
        assert data["observation_count"] == 0
        assert "observations" in data
        features = data["observations"]["features"]
        assert features == []

    def test_profile_me_with_observations(self, client, register_user):
        login = client.post(
            self.login_url,
            {
                "username": "diverbob",
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        token = login.data["access"]
        self.create_observation_for_user(client, token)
        resp = client.get(self.profile_me_url)
        assert resp.status_code == 200
        data = resp.json()
        assert data["observation_count"] == 1
        features = data["observations"]["features"]
        assert len(features) == 1
        obs_props = features[0]["properties"]
        assert obs_props["species_name"] == "Test Fish"
        assert obs_props["location_name"] == "Test Reef"

    def test_profile_me_multiple_observations(self, client, register_user):
        login = client.post(
            self.login_url,
            {
                "username": "diverbob",
                "email": "user@example.com",
                "password": "testpassword123",
                "role": "hobbyist",
            },
            format="json",
        )
        token = login.data["access"]
        self.create_observation_for_user(client, token)
        self.create_observation_for_user(
            client, token, payload_override={"species_name": "Shark"}
        )
        resp = client.get(self.profile_me_url)
        assert resp.status_code == 200
        data = resp.json()
        assert data["observation_count"] == 2
        features = data["observations"]["features"]
        observed_species = [f["properties"]["species_name"] for f in features]
        assert "Test Fish" in observed_species
        assert "Shark" in observed_species
