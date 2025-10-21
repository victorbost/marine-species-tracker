from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from observations.models import Observation
import datetime

User = get_user_model()

class ObservationAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='user@test.com', username='usertest', password='StrongPassword123'
        )
        self.login_url = reverse('token_obtain_pair')
        self.observations_url = reverse('user-observations')

    def authenticate(self):
        response = self.client.post(
            self.login_url,
            {
                'email': 'user@test.com',
                'username': 'usertest',
                'password': 'StrongPassword123'
            },
            format='json'
        )
        token = response.data.get('access')
        assert token is not None, f"Login failed or no token. Response data: {response.data}"
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

    def test_auth_required_for_observation_list_create(self):
        response = self.client.get(self.observations_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        response = self.client.post(self.observations_url, {})
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_create_observation(self):
        self.authenticate()
        data = {
            "species_name": "Shark",
            "latitude": 14.404,
            "longitude": 52.505,
            "observation_datetime": "2025-10-21T13:45:00Z",
            "location_name": "Pacific Point",
            "depth": 30,
            "temperature": 20.5,
            "visibility": 10,
            "notes": "Saw dorsal fin."
        }
        response = self.client.post(self.observations_url, data, format='json')
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
            latitude=1.23,
            longitude=4.56,
            observation_datetime=datetime.datetime.now(datetime.timezone.utc),
            location_name="Deep Bay",
            depth=100,
            temperature=3.5,
            visibility=25,
            notes="Big splash"
        )
        response = self.client.get(self.observations_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['species_name'], "Whale")

    def test_missing_required_fields_fails(self):
        self.authenticate()
        data = { "species_name": "", "latitude": "", "longitude": "" }
        response = self.client.post(self.observations_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
