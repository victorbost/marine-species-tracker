import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

pytestmark = pytest.mark.django_db

MAP_OBS_URL = "/api/v1/map/observations/"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def auth_user(client):
    reg_payload = {
        "email": "geomap2@example.com",
        "username": "geomapper2",
        "password": "GeoMap$123",
        "role": "hobbyist",
    }
    reg_resp = client.post(
        "/api/v1/auth/register/",
        reg_payload,
        format="json",
    )
    assert reg_resp.status_code in (200, 201)

    # Activate the user
    user_obj = User.objects.get(email=reg_payload["email"])
    user_obj.is_active = True
    user_obj.email_verified = True
    user_obj.save()

    token_resp = client.post(
        "/api/v1/auth/login/",
        {
            "email": "geomap2@example.com",
            "password": "GeoMap$123",
        },
        format="json",
    )
    assert token_resp.status_code == 200
    token = token_resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION="Bearer " + token)
    return client


def make_observation(client, coords, notes=""):
    obs_url = "/api/v1/observations/"
    data = {
        "speciesName": "TestFish",
        "observationDatetime": "2025-11-01T12:00:00Z",
        "locationName": notes or "Test Water",
        "temperature": 18.5,
        "visibility": 12,
        "notes": notes,
        "location": {"type": "Point", "coordinates": coords},
    }
    resp = client.post(obs_url, data, format="json")
    assert resp.status_code in (200, 201)
    return resp.data


def test_map_query_returns_observation_in_circle(auth_user):
    """
    Observation within circle should be included, outside should not.
    """
    paris_coords = [2.35, 48.85]  # Paris
    london_coords = [-0.13, 51.51]  # London
    make_observation(auth_user, paris_coords, notes="Paris")
    make_observation(auth_user, london_coords, notes="London")

    # 50km from Paris (should include Paris, not London)
    resp = auth_user.get(f"{MAP_OBS_URL}?lat=48.85&lng=2.35&radius=50")
    assert resp.status_code == 200
    features = resp.json()["features"]
    notes = [f["properties"]["notes"] for f in features]
    assert "Paris" in notes
    assert "London" not in notes


def test_map_query_returns_both_in_larger_radius(auth_user):
    """
    Both Paris and London within a 400km radius.
    """
    paris_coords = [2.35, 48.85]
    london_coords = [-0.13, 51.51]
    make_observation(auth_user, paris_coords, notes="Paris")
    make_observation(auth_user, london_coords, notes="London")

    # 400km radius from Paris (covers both)
    resp = auth_user.get(f"{MAP_OBS_URL}?lat=48.85&lng=2.35&radius=400")
    assert resp.status_code == 200
    features = resp.json()["features"]
    notes = [f["properties"]["notes"] for f in features]
    assert "Paris" in notes
    assert "London" in notes


def test_map_query_with_invalid_params(auth_user):
    """
    Invalid lat/lng should return 400 error.
    """
    resp = auth_user.get(f"{MAP_OBS_URL}?lat=notanumber&lng=2.35&radius=50")
    assert resp.status_code == 400


def test_map_query_empty_if_no_matches(auth_user):
    """
    Area without any observation should return empty features.
    """
    tokyo_coords = [139.76, 35.68]  # Tokyo
    make_observation(auth_user, tokyo_coords, notes="Tokyo")
    # Query near Paris, should not find Tokyo
    resp = auth_user.get(f"{MAP_OBS_URL}?lat=48.85&lng=2.35&radius=10")
    assert resp.status_code == 200
    features = resp.json()["features"]
    assert features == []


def test_map_query_no_params_returns_all(auth_user):
    """
    Omitting lat/lng/radius returns all observations.
    """
    make_observation(auth_user, [2.35, 48.85], notes="Paris")
    make_observation(auth_user, [139.76, 35.68], notes="Tokyo")
    resp = auth_user.get(MAP_OBS_URL)
    assert resp.status_code == 200
    notes = [f["properties"]["notes"] for f in resp.json()["features"]]
    assert "Paris" in notes
    assert "Tokyo" in notes
