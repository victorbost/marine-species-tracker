import requests
import json
from time import sleep

class OBISAPIClient:
    def __init__(self, base_url="https://api.obis.org/v3/", default_size=100, logger=None):
        self.base_url = base_url
        self.default_size = default_size
        self.logger = logger or self._get_default_logger()

    def _get_default_logger(self):
        import logging
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger(__name__)

    def fetch_occurrences(self, geometry, taxonid=None, size=None, page=0):
        """
        Fetches occurrence data from OBIS API.
        :param geometry: WKT polygon string e.g., "POLYGON((-80 30, -80 50, -30 50, -30 30, -80 30))"
        :param taxonid: OBIS taxon ID (optional)
        :param size: Number of results per page (max 500)
        :param page: Page number (for pagination)
        :return: List of occurrence records
        """
        endpoint = f"{self.base_url}occurrence"
        params = {
            "geometry": geometry,
            "size": size or self.default_size,
            "offset": page * (size or self.default_size)
        }
        if taxonid:
            params["taxonid"] = taxonid

        self.logger.info(f"Fetching OBIS data from {endpoint} with params: {params}")
        try:
            response = requests.get(endpoint, params=params, timeout=30)
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
            data = response.json()
            return data.get("results", [])
        except requests.exceptions.RequestException as e:
            self.logger.error(f"OBIS API request failed: {e}")
            return []
        except json.JSONDecodeError:
            self.logger.error("Failed to decode JSON response from OBIS API.")
            return []

    # Add more methods for other OBIS endpoints if needed
