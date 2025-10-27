import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

OBSERVATION_URL = "/api/observations/"

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def auth_user(client):
    reg_resp = client.post("/api/v1/auth/register/", {
        "email": "geomap@example.com",
        "username": "geomapper",
        "password": "GeoMap$123",
        "role": "hobbyist"
    }, format="json")
    assert reg_resp.status_code in (200, 201)
    login_resp = client.post("/api/v1/auth/login/", {
        "email": "geomap@example.com",
        "username": "geomapper",
        "password": "GeoMap$123",
        "role": "hobbyist"
    }, format="json")
    assert login_resp.status_code == 200
    token = login_resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION="Bearer " + token)
    return client

def make_observation(client, location, notes=""):
    data = {
        "species_name": "TestFish",
        "observation_datetime": "2025-11-01T12:00:00Z",
        "location_name": "Test Water",
        "depth": 20,
        "temperature": 18.5,
        "visibility": 12,
        "notes": notes,
        "location": { "type": "Point", "coordinates": location },
    }
    resp = client.post(OBSERVATION_URL, data, format="json")
    assert resp.status_code in (200, 201)
    return resp.data

def test_bbox_geo_filter_includes_correct_obs(auth_user):
    """
    Ensure only the observation inside the bounding box is returned.
    """
    inside = [30.0, 30.0]
    outside = [90.0, 88.0]
    make_observation(auth_user, inside, notes="Inside Box")
    make_observation(auth_user, outside, notes="Far Away")

    resp = auth_user.get(f"{OBSERVATION_URL}?in_bbox=29,29,32,32")
    assert resp.status_code == 200
    geojson = resp.json()["results"]
    assert isinstance(geojson, dict)
    assert geojson["type"] == "FeatureCollection"
    found = [feat["properties"]["notes"] for feat in geojson["features"]]
    assert "Inside Box" in found
    assert "Far Away" not in found

def test_bbox_geo_filter_empty_when_no_match(auth_user):
    """
    BBox returns empty FeatureCollection if no points within.
    """
    make_observation(auth_user, [30.0, 30.0], notes="Only in Asia")
    resp = auth_user.get(f"{OBSERVATION_URL}?in_bbox=0,0,1,1")
    assert resp.status_code == 200
    geojson = resp.json()["results"]
    assert geojson["type"] == "FeatureCollection"
    assert geojson["features"] == []

def test_all_geo_observations_returned_without_filter(auth_user):
    """
    Endpoint returns all created geo features for user if no bbox param.
    """
    make_observation(auth_user, [11.5, 47.5], notes="Low Lat")
    make_observation(auth_user, [89.5, 20.8], notes="High Lon")
    resp = auth_user.get(OBSERVATION_URL)
    assert resp.status_code == 200
    geojson = resp.json()["results"]
    assert len(geojson["features"]) >= 2
    for feat in geojson["features"]:
        assert feat["geometry"]["type"] == "Point"
        assert len(feat["geometry"]["coordinates"]) == 2

def test_geojson_output_fields(auth_user):
    """
    Output should include required geojson keys.
    """
    make_observation(auth_user, [10.0, 20.0])
    resp = auth_user.get(OBSERVATION_URL)
    geojson = resp.json()["results"]
    feature = geojson["features"][0]
    assert "geometry" in feature
    assert "properties" in feature
    assert feature["geometry"]["type"] == "Point"
