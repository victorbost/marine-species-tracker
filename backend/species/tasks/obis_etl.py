import logging
import pytz
import time
from dateutil import parser
from django.contrib.gis.geos import Point
from species.models import CuratedObservation
from .obis_api import OBISAPIClient
from .worms_api import WoRMSAPIClient
from django.conf import settings

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

def fetch_and_store_obis_data(geometry_wkt, taxonid=None, page=0, total_pages=None):
    """
    Celery task to fetch a batch of OBIS data, enrich it, and store in the DB.
    Can be called for specific pages to handle pagination.
    """
    logger.info(f"Starting OBIS ETL for geometry: {geometry_wkt}, taxonid: {taxonid}, page: {page}")

    try:
        obis_records = obis_client.fetch_occurrences(geometry=geometry_wkt, taxonid=taxonid, page=page)

        if not obis_records:
            logger.info(f"No OBIS records found for geometry: {geometry_wkt}, taxonid: {taxonid}, page: {page}")
            return {'status': 'completed', 'records_processed': 0, 'new_records': 0, 'page': page}

        new_records_count = 0
        existing_obis_ids = set(CuratedObservation.objects.values_list('obis_id', flat=True))

        for obs in obis_records:
            obis_id = obs.get("id")
            if not obis_id:
                logger.warning(f"OBIS record missing 'id' field, skipping: {obs}")
                continue

            if obis_id in existing_obis_ids:
                logger.debug(f"Skipping duplicate OBIS record with ID: {obis_id}")
                continue

            # Robust parsing and defaults
            lon = obs.get("decimalLongitude")
            lat = obs.get("decimalLatitude")
            if lon is None or lat is None:
                logger.warning(f"OBIS record {obis_id} missing coordinates, skipping.")
                continue

            aphia_id = obs.get("aphiaID")
            common_name = worms_client.get_common_name_by_aphia_id(aphia_id)

            #Dates
            event_date_str = obs.get("eventDate")
            observation_datetime = None
            observation_date = None
            if event_date_str:
                try:
                    dt_obj = parser.parse(event_date_str)
                    # Make the datetime timezone-aware, typically UTC if no TZ info
                    if dt_obj.tzinfo is None or dt_obj.tzinfo.utcoffset(dt_obj) is None:
                        # If naive, assume UTC (OBIS often implies UTC even if not explicit)
                        observation_datetime = pytz.utc.localize(dt_obj)
                    else:
                        # If already timezone-aware, convert to UTC for consistency
                        observation_datetime = dt_obj.astimezone(pytz.utc)

                    observation_date = observation_datetime.date()
                except ValueError as ve:
                    if "offset must be a timedelta" in str(ve):
                        logger.warning(
                            f"Skipping eventDate '{event_date_str}' for OBIS ID {obis_id} due to extreme timezone offset. "
                            "Date/time fields set to None for this record. Error: {ve}"
                        )
                    else:
                        logger.warning(f"Could not parse eventDate '{event_date_str}' for OBIS ID {obis_id}: {ve}")
                except Exception as e:
                    logger.warning(f"Could not parse eventDate '{event_date_str}' for OBIS ID {obis_id}: {e}")

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
                    validated="validated", # This might need more sophisticated logic
                    source="OBIS",
                    depth=depth,
                    temperature=temperature,
                    visibility=None, # Not directly from OBIS
                    notes=f"Imported from OBIS dataset: {obs.get('datasetName') or 'Unknown'}",
                    image=None, # Not directly from OBIS
                    user=None, # Not directly from OBIS
                    raw_data=obs
                )
                new_records_count += 1
                logger.debug(f"Saved new record: {obis_id} - {obs.get('scientificName')}")
            except Exception as e:
                logger.error(f"Failed to save OBIS record {obis_id}: {e}")

        logger.info(f"Finished OBIS ETL for page {page}. Processed {len(obis_records)} records, added {new_records_count} new.")
        return {'status': 'completed', 'records_processed': len(obis_records), 'new_records': new_records_count, 'page': page}

    except Exception as e:
        logger.error(f"Unhandled error in fetch_and_store_obis_data for geometry {geometry_wkt}, page {page}: {e}", exc_info=True)
        raise
def trigger_full_obis_refresh(geometry_wkt, taxonid=None, initial_total_pages=1):
    """
    Celery task to trigger a full refresh, possibly fetching multiple pages.
    This task would typically be scheduled by Celery Beat.
    """
    logger.info(f"Triggering full OBIS refresh for geometry: {geometry_wkt}, taxonid: {taxonid}")

    # You would typically query OBIS for total records and then fan out tasks
    # For now, let's just trigger a few pages or a single page
    # In a real scenario, you'd make an initial call to get total matches/pages
    # and then spawn fetch_and_store_obis_data.s(..., page=i) for each page.

    # Example: Just fetch the first few pages
    # Or, if you have a way to get total pages, iterate: range(initial_total_pages)
    for page_num in range(initial_total_pages):
        fetch_and_store_obis_data(geometry_wkt, taxonid, page_num)
        # Add a small delay between triggering if needed to avoid overwhelming broker or OBIS
        time.sleep(0.1)

    logger.info("Finished triggering OBIS refresh tasks.")
