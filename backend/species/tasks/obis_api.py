import json

import requests


class OBISAPIClient:
    def __init__(
        self,
        base_url="https://api.obis.org/v3/",
        default_size=100,
        logger=None,
    ):
        self.base_url = base_url
        self.default_size = default_size
        self.logger = logger or self._get_default_logger()

    def _get_default_logger(self):
        import logging

        logging.basicConfig(level=logging.INFO)
        return logging.getLogger(__name__)

    def fetch_occurrences(
        self,
        geometry,
        taxonid=None,
        size=None,
        page=0,
        start_date=None,
        end_date=None,
    ):
        """
        Fetches occurrence data from OBIS API.
        :param geometry: WKT polygon string e.g., "POLYGON((-80 30, -80 50, -30 50, -30 30, -80 30))"
        :param taxonid: OBIS taxon ID (optional)
        :param size: Number of results per page (max 500)
        :param page: Page number (for pagination)
        :param start_date: Date string (YYYY-MM-DD) to fetch records with eventDate >= this.
        :param end_date: Date string (YYYY-MM-DD) to fetch records with eventDate <= this.
        :return: List of occurrence records
        """
        endpoint = f"{self.base_url}occurrence"
        params = {
            "geometry": geometry,
            "size": size or self.default_size,
            "offset": page * (size or self.default_size),
        }
        if taxonid:
            params["taxonid"] = taxonid
        if start_date:  # Add this condition
            params["startdate"] = start_date
        if end_date:  # Add this condition
            params["enddate"] = end_date

        self.logger.info(
            f"Fetching OBIS data from {endpoint} with params: {params}"
        )
        try:
            response = requests.get(endpoint, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except requests.exceptions.RequestException as e:
            self.logger.error(f"OBIS API request failed: {e}")
            return []
        except json.JSONDecodeError:
            self.logger.error("Failed to decode JSON response from OBIS API.")
            return []
