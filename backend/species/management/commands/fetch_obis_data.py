import requests
from time import sleep
from dateutil import parser
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from species.models import CuratedObservation

class Command(BaseCommand):
    help = "Fetch OBIS data, enrich with WoRMS info, and store curated observations"

    def get_common_name_from_worms(self, aphia_id):
        if not aphia_id:
            return None
        worms_url = f"https://www.marinespecies.org/rest/AphiaVernacularsByAphiaID/{aphia_id}"
        try:
            r = requests.get(worms_url, timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data:
                    # prefer preferred name, then first English, then first record
                    preferred = next((d for d in data if d.get("isPreferredName") == 1), None)
                    if preferred:
                        return preferred.get("vernacular")
                    english = next((d for d in data if d.get("language") == 'English'), None)
                    if english:
                        return english.get("vernacular")
                    return data[0].get("vernacular")
            return None
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Error fetching common name for AphiaID {aphia_id}: {e}"))
            return None

    def handle(self, *args, **options):
        OBIS_API_ENDPOINT = "https://api.obis.org/v3/occurrence"
        params = {
            "geometry": "POLYGON((-80 30, -80 50, -30 50, -30 30, -80 30))",  # Change for your AOI
            "size": 100,  # Change/loop for more records if wanted
        }
        r = requests.get(OBIS_API_ENDPOINT, params=params)
        r.raise_for_status()
        obis_results = r.json().get("results", [])
        self.stdout.write(self.style.SUCCESS(f"Fetched {len(obis_results)} OBIS records."))

        new_objs = 0

        for obs in obis_results:
            # Robust parsing and defaults
            lon = obs.get("decimalLongitude")
            lat = obs.get("decimalLatitude")
            if lon is None or lat is None:
                continue

            aphia_id = obs.get("aphiaID")
            common_name = self.get_common_name_from_worms(aphia_id)

            # Dates
            event_date = obs.get("eventDate")
            observation_datetime = None
            observation_date = None
            if event_date:
                try:
                    observation_datetime = parser.parse(event_date)
                    observation_date = observation_datetime.date()
                except Exception:
                    pass

            # Other fields (using .get and defaulting types)
            location_name = obs.get("datasetName") or "OBIS record"
            depth = obs.get("bathymetry")
            try:
                depth = float(depth)
            except (TypeError, ValueError):
                depth = None

            temperature = obs.get("sst")
            try:
                temperature = float(temperature)
            except (TypeError, ValueError):
                temperature = None

            visibility = None  # OBIS doesn't provide

            notes = f"Imported from OBIS dataset: {location_name}"
            image = None  # OBIS does not provide a direct image field

            machine_observation = obs.get("basisOfRecord")
            validated = "validated"
            user = None  # Not available from OBIS

            try:
                obj, created = CuratedObservation.objects.get_or_create(
                    obis_id=obs.get("id"),
                    defaults={
                        "species_name": obs.get("scientificName") or "Unknown species",
                        "common_name": common_name,
                        "observation_date": observation_date,
                        "observation_datetime": observation_datetime,
                        "location": Point(float(lon), float(lat)),
                        "location_name": location_name,
                        "machine_observation": machine_observation,
                        "validated": validated,
                        "source": "OBIS",
                        "depth": depth,
                        "temperature": temperature,
                        "visibility": visibility,
                        "notes": notes,
                        "image": image,
                        "user": user,
                        "raw_data": obs  # Always keep the full thing for backup/audit
                    }
                )
                if created:
                    new_objs += 1
                    self.stdout.write(self.style.SUCCESS(
                        f"Saved: {obj.species_name} ({common_name or ''}) at ({lat:.3f},{lon:.3f})"
                    ))
                else:
                    self.stdout.write(f"Skipped duplicate: {obj.species_name} ({obj.obis_id})")
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error saving record: {e}"))
            sleep(0.2)

        self.stdout.write(self.style.SUCCESS(f"Done. New curated observations added: {new_objs}"))
