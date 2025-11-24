import requests
import json
from time import sleep


class WoRMSAPIClient:
    def __init__(
        self, base_url="https://www.marinespecies.org/rest/", logger=None
    ):
        self.base_url = base_url
        self.logger = logger or self._get_default_logger()

    def _get_default_logger(self):
        import logging

        logging.basicConfig(level=logging.INFO)
        return logging.getLogger(__name__)

    def get_common_name_by_aphia_id(self, aphia_id):
        """
        Fetches common names for a given AphiaID from WoRMS.
        :param aphia_id: The AphiaID (integer)
        :return: Preferred common name (string) or None
        """
        if not aphia_id:
            return None

        endpoint = f"{self.base_url}AphiaVernacularsByAphiaID/{aphia_id}"
        self.logger.debug(f"Fetching WoRMS common name from {endpoint}")
        try:
            response = requests.get(endpoint, timeout=10)
            response.raise_for_status()
            data = response.json()
            if data:
                # Only return English common names
                english_names = [
                    d.get("vernacular")
                    for d in data
                    if d.get("language") == "English" and d.get("vernacular")
                ]
                if english_names:
                    # Prioritize preferred English name, otherwise take the first available English name
                    preferred_english = next(
                        (
                            d.get("vernacular")
                            for d in data
                            if d.get("language") == "English"
                            and d.get("isPreferredName") == 1
                            and d.get("vernacular")
                        ),
                        None,
                    )
                    return (
                        preferred_english
                        if preferred_english
                        else english_names[0]
                    )
            return None
        except requests.exceptions.RequestException as e:
            self.logger.warning(
                f"WoRMS API request failed for AphiaID {aphia_id}: {e}"
            )
            return None
        except json.JSONDecodeError:
            self.logger.warning(
                "Failed to decode JSON response from WoRMS API for AphiaID"
                f" {aphia_id}."
            )
            return None
