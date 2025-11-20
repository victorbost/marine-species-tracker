import logging
import pytz
import time
from dateutil import parser
from django.contrib.gis.geos import Point
from species.models import CuratedObservation
from .obis_api import OBISAPIClient
from .worms_api import WoRMSAPIClient
from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)

obis_client = OBISAPIClient(
    base_url=getattr(settings, 'OBIS_API_BASE_URL', "https://api.obis.org/v3/"),
    default_size=getattr(settings, 'OBIS_API_DEFAULT_SIZE', 500),
    logger=logger
)
worms_client = WoRMSAPIClient(
    base_url=getattr(settings, 'WORMS_API_BASE_URL', "https://www.marinespecies.org/rest/"),
    logger=logger
)

def fetch_and_store_obis_data(geometry_wkt, taxonid=None, page=0, start_date=None, end_date=None):
    """
    Function to fetch a batch of OBIS data, enrich it, and store in the DB.
    :param start_date: Date string (YYYY-MM-DD) for fetching records.
    :param end_date: Date string (YYYY-MM-DD) for fetching records.
    """
    logger.info(f"Starting OBIS ETL for geometry: {geometry_wkt}, taxonid: {taxonid}, page: {page}, start_date: {start_date}, end_date: {end_date}")

    try:
        # Pass start_date and end_date to the OBIS client
        obis_records = obis_client.fetch_occurrences(geometry=geometry_wkt, taxonid=taxonid, page=page, start_date=start_date, end_date=end_date)

        if not obis_records:
            logger.info(f"No OBIS records found for geometry: {geometry_wkt}, taxonid: {taxonid}, page: {page}, start_date: {start_date}, end_date: {end_date}")
            return {'status': 'completed', 'records_processed': 0, 'new_records': 0, 'page': page}

        new_records_count = 0

        existing_obis_ids = set(CuratedObservation.objects.values_list('obis_id', flat=True))

        with transaction.atomic():
            for obs in obis_records:
                obis_id = obs.get("id")
                if not obis_id:
                    logger.warning(f"OBIS record missing 'id' field, skipping: {obs}")
                    continue

                if obis_id in existing_obis_ids:
                    logger.debug(f"Skipping duplicate OBIS record with ID: {obis_id}")
                    continue

                lon = obs.get("decimalLongitude")
                lat = obs.get("decimalLatitude")
                if lon is None or lat is None:
                    logger.warning(f"OBIS record {obis_id} missing coordinates, skipping.")
                    continue

                aphia_id = obs.get("aphiaID")
                common_name = worms_client.get_common_name_by_aphia_id(aphia_id)

                event_date_str = obs.get("eventDate")
                observation_datetime = None
                observation_date = None
            if event_date_str: # Only attempt to parse if the string exists
                try:
                    dt_obj = parser.parse(event_date_str)
                    if dt_obj.tzinfo is None or dt_obj.tzinfo.utcoffset(dt_obj) is None:
                        observation_datetime = pytz.utc.localize(dt_obj)
                    else:
                        observation_datetime = dt_obj.astimezone(pytz.utc)
                    observation_date = observation_datetime.date()
                except ValueError as ve:
                    # If parsing fails, log a warning, but keep date/datetime as None
                    if "offset must be a timedelta" in str(ve):
                        logger.warning(
                            f"OBIS record {obis_id}: 'eventDate' '{event_date_str}' has extreme timezone offset. "
                            "Date/time fields set to None for this record. Error: {ve}"
                        )
                    else:
                        logger.warning(f"OBIS record {obis_id}: 'eventDate' '{event_date_str}' could not be parsed. "
                                       "Date/time fields set to None for this record. Error: {ve}")
                except Exception:
                    # Catch any other unexpected parsing errors, keep date/datetime as None
                    logger.warning(f"OBIS record {obis_id}: Unexpected error parsing 'eventDate' '{event_date_str}'. "
                                   "Date/time fields set to None for this record. Error: {e}")
            else:
                logger.debug(f"OBIS record {obis_id} has no 'eventDate' string. Date/time fields will be None.")

                depth = obs.get("bathymetry")
                try:
                    depth = float(depth) if depth is not None else None
                except (TypeError, ValueError):
                    depth = None

                temperature = obs.get("sst")
                try:
                    temperature = float(temperature) if temperature is not None else None
                except (TypeError, ValueError):
                    temperature = None

                try:
                    CuratedObservation.objects.create(
                        obis_id=obis_id,
                        species_name=obs.get("scientificName") or "Unknown species",
                        common_name=common_name,
                        observation_date=observation_date,
                        observation_datetime=observation_datetime,
                        location=Point(float(lon), float(lat)),
                        location_name=obs.get("datasetName") or "OBIS record",
                        machine_observation=obs.get("basisOfRecord"),
                        validated="validated",
                        source="OBIS",
                        depth=depth,
                        temperature=temperature,
                        visibility=None,
                        notes=f"Imported from OBIS dataset: {obs.get('datasetName') or 'Unknown'}",
                        image=None,
                        user=None,
                        raw_data=obs
                    )
                    new_records_count += 1
                    logger.debug(f"Saved new record: {obis_id} - {obs.get('scientificName')}")
                except Exception as e:
                    logger.error(f"Failed to save OBIS record {obis_id}: {e}")
                    raise

        logger.info(f"Finished OBIS ETL for page {page}. Processed {len(obis_records)} records, added {new_records_count} new.")
        return {'status': 'completed', 'records_processed': len(obis_records), 'new_records': new_records_count, 'page': page}

    except Exception as e:
        logger.error(f"Unhandled error in fetch_and_store_obis_data for geometry {geometry_wkt}, page {page}, start_date: {start_date}, end_date: {end_date}: {e}", exc_info=True)
        raise

# Replace updated_since with start_date and end_date
def trigger_full_obis_refresh(geometry_wkt, taxonid=None, initial_total_pages=1, start_date=None, end_date=None):
    """
    Function to trigger a full or date-range refresh, fetching multiple pages.
    :param start_date: Date string (YYYY-MM-DD) for filtering. If None, no start date filter applied.
    :param end_date: Date string (YYYY-MM-DD) for filtering. If None, no end date filter applied.
    """
    if start_date or end_date:
        refresh_type = "date-range incremental"
    else:
        refresh_type = "full"
    print(f"Triggering {refresh_type} OBIS refresh for geometry: {geometry_wkt}, taxonid: {taxonid}, start_date: {start_date}, end_date: {end_date}")

    for page_num in range(initial_total_pages):
        # Pass start_date and end_date to fetch_and_store_obis_data
        fetch_and_store_obis_data(geometry_wkt, taxonid, page_num, start_date=start_date, end_date=end_date)
        time.sleep(1)

    print(f"Finished {refresh_type} OBIS refresh tasks.")
