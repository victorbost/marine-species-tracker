import datetime

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from observations.models import Observation

User = get_user_model()


class ObservationAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@test.com",
            username="usertest",
            password="StrongPassword123",
        )
        self.login_url = reverse("token_obtain_pair")
        self.observations_url = reverse("user-observations")

    def authenticate(self):
        response = self.client.post(
            self.login_url,
            {
                "email": "user@test.com",
                "username": "usertest",
                "password": "StrongPassword123",
            },
            format="json",
        )
        token = response.data.get("access")
        assert (
            token is not None
        ), f"Login failed or no token. Response data: {response.data}"
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

    def test_auth_required_for_observation_list_create(self):
        response = self.client.get(self.observations_url)
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
        response = self.client.post(self.observations_url, {})
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_create_observation(self):
        self.authenticate()
        data = {
            "species_name": "Shark",
            "location": {"type": "Point", "coordinates": [52.505, 14.404]},
            "observation_datetime": "2025-10-21T13:45:00Z",
            "location_name": "Pacific Point",
            "depth": 30,
            "temperature": 20.5,
            "visibility": 10,
            "notes": "Saw dorsal fin.",
        }
        response = self.client.post(self.observations_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Observation.objects.count(), 1)
        obs = Observation.objects.get()
        self.assertEqual(obs.species_name, "Shark")
        self.assertEqual(obs.user, self.user)

    def test_list_observations_returns_only_user_observations(self):
        self.authenticate()
        Observation.objects.create(
            user=self.user,
            species_name="Whale",
            location=Point(4.56, 1.23),
            observation_datetime=datetime.datetime.now(datetime.timezone.utc),
            location_name="Deep Bay",
            depth=100,
            temperature=3.5,
            visibility=25,
            notes="Big splash",
        )
        response = self.client.get(self.observations_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        features = response.data["results"]["features"]
        self.assertEqual(len(features), 1)
        self.assertEqual(features[0]["properties"]["species_name"], "Whale")

    def test_missing_required_fields_fails(self):
        self.authenticate()
        data = {"species_name": "", "latitude": "", "longitude": ""}
        response = self.client.post(self.observations_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def create_user_with_role(
        self, email, username, password, role=None, is_staff=False
    ):
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=role or User.HOBBYIST,
        )
        if role:
            user.role = role
        user.is_staff = is_staff
        user.save()
        return user

    def authenticate_as(self, user):
        response = self.client.post(
            self.login_url,
            {
                "email": user.email,
                "username": user.username,
                "password": "StrongPassword123",
            },
            format="json",
        )
        token = response.data.get("access")
        assert (
            token is not None
        ), f"Login failed or no token. Response data: {response.data}"
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

    def make_observation(self, user=None):
        return Observation.objects.create(
            user=user or self.user,
            species_name="Dolphin",
            location=Point(0, 0),
            observation_datetime=datetime.datetime.now(datetime.timezone.utc),
            location_name="Blue Sea",
            depth=15,
            temperature=21,
            visibility=30,
            notes="note",
        )

    def test_hobbyist_cannot_validate_observation(self):
        self.authenticate()
        obs = self.make_observation(self.user)
        url = reverse("observation-validate", kwargs={"pk": obs.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)
        obs.refresh_from_db()
        self.assertNotEqual(obs.validated, "validated")

    def test_admin_can_validate_observation(self):
        admin_user = self.create_user_with_role(
            email="admin@test.com",
            username="admintest",
            password="StrongPassword123",
            is_staff=True,
        )
        obs = self.make_observation(admin_user)
        self.authenticate_as(admin_user)
        url = reverse("observation-validate", kwargs={"pk": obs.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        obs.refresh_from_db()
        self.assertEqual(obs.validated, "validated")

    def test_researcher_can_validate_observation(self):
        researcher_user = self.create_user_with_role(
            email="researcher@test.com",
            username="researchertest",
            password="StrongPassword123",
            role="researcher",
        )
        obs = self.make_observation(researcher_user)
        self.authenticate_as(researcher_user)
        url = reverse("observation-validate", kwargs={"pk": obs.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        obs.refresh_from_db()
        self.assertEqual(obs.validated, "validated")

    def test_validate_nonexistent_observation_returns_404(self):
        admin_user = self.create_user_with_role(
            email="admin2@test.com",
            username="admintest2",
            password="StrongPassword123",
            is_staff=True,
        )
        self.authenticate_as(admin_user)
        url = reverse("observation-validate", kwargs={"pk": 9999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 404)
