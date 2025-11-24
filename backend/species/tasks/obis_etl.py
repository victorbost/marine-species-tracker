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

from .utils.etl_cleaning import (
    clean_string_to_capital_capital,
    normalize_obis_depth,
    to_float,
    get_harmonized_common_name,
    parse_obis_event_date,
    standardize_sex,
)

logger = logging.getLogger(__name__)

obis_client = OBISAPIClient(
    base_url=getattr(
        settings, "OBIS_API_BASE_URL", "https://api.obis.org/v3/"
    ),
    default_size=getattr(settings, "OBIS_API_DEFAULT_SIZE", 500),
    logger=logger,
)
worms_client = WoRMSAPIClient(
    base_url=getattr(
        settings, "WORMS_API_BASE_URL", "https://www.marinespecies.org/rest/"
    ),
    logger=logger,
)


def fetch_and_store_obis_data(
    geometry_wkt, taxonid=None, page=0, start_date=None, end_date=None
):
    """
    Function to fetch a batch of OBIS data, enrich it, and store in the DB.
    :param start_date: Date string (YYYY-MM-DD) for fetching records.
    :param end_date: Date string (YYYY-MM-DD) for fetching records.
    """
    logger.info(
        f"Starting OBIS ETL for geometry: {geometry_wkt}, taxonid: {taxonid},"
        f" page: {page}, start_date: {start_date}, end_date: {end_date}"
    )

    try:
        obis_records = obis_client.fetch_occurrences(
            geometry=geometry_wkt,
            taxonid=taxonid,
            page=page,
            start_date=start_date,
            end_date=end_date,
        )

        if not obis_records:
            logger.info(
                f"No OBIS records found for geometry: {geometry_wkt}, taxonid:"
                f" {taxonid}, page: {page}, start_date: {start_date},"
                f" end_date: {end_date}"
            )
            return {
                "status": "completed",
                "records_processed": 0,
                "new_records": 0,
                "page": page,
            }

        new_records_count = 0

        existing_obis_ids = set(
            CuratedObservation.objects.values_list("obis_id", flat=True)
        )

        with transaction.atomic():
            for obs in obis_records:
                obis_id = obs.get("id")
                if not obis_id:
                    logger.warning(
                        "OBIS record missing 'id' field, skipping entire"
                        f" record due to missing key: {obs}"
                    )
                    continue

                if obis_id in existing_obis_ids:
                    logger.debug(
                        f"Skipping duplicate OBIS record with ID: {obis_id}"
                    )
                    continue

                lon = obs.get("decimalLongitude")
                lat = obs.get("decimalLatitude")
                if lon is None or lat is None:
                    logger.warning(
                        f"OBIS record {obis_id} missing coordinates, skipping"
                        " entire record."
                    )
                    continue

                common_name = get_harmonized_common_name(obs, worms_client)

                event_date_str = obs.get("eventDate")
                observation_datetime, observation_date = parse_obis_event_date(
                    obis_id, event_date_str
                )

                machine_observation_raw = obs.get("basisOfRecord")
                machine_observation = clean_string_to_capital_capital(
                    machine_observation_raw
                )

                # Call normalize_obis_depth to get the three depth fields
                depth_min, depth_max, bathymetry = normalize_obis_depth(obs)

                temperature_raw = obs.get("sst")
                temperature = to_float(
                    temperature_raw
                )  # Use to_float for robustness
                if (
                    temperature is None and temperature_raw is not None
                ):  # Log only if value was present but invalid
                    logger.warning(
                        f"OBIS record {obis_id}: Invalid 'sst' value"
                        f" '{temperature_raw}', temperature set to None."
                    )

                visibility = None
                notes = (
                    "Imported from OBIS dataset:"
                    f" {obs.get('datasetName') or 'Unknown'}"
                )
                image = None
                user = None
                validated = "validated"

                # New 'sex' field processing
                raw_sex = obs.get("sex")
                sex = standardize_sex(raw_sex)

                try:
                    CuratedObservation.objects.create(
                        obis_id=obis_id,
                        species_name=obs.get("scientificName")
                        or "Unknown species",
                        common_name=common_name,
                        observation_date=observation_date,
                        observation_datetime=observation_datetime,
                        location=Point(float(lon), float(lat)),
                        location_name=obs.get("datasetName") or "OBIS record",
                        machine_observation=machine_observation,
                        validated=validated,
                        source="OBIS",
                        depth_min=depth_min,
                        depth_max=depth_max,
                        bathymetry=bathymetry,
                        temperature=temperature,
                        visibility=visibility,
                        notes=notes,
                        image=image,
                        user=user,
                        sex=sex,
                        raw_data=obs,
                    )
                    new_records_count += 1
                    logger.debug(
                        f"Saved new record: {obis_id} -"
                        f" {obs.get('scientificName')}"
                    )
                except Exception as e:
                    logger.error(
                        f"Failed to save OBIS record {obis_id}: {e}",
                        exc_info=True,
                    )  # Added exc_info=True for full traceback in logs
                    raise

        logger.info(
            f"Finished OBIS ETL for page {page}. Processed"
            f" {len(obis_records)} records, added {new_records_count} new."
        )
        return {
            "status": "completed",
            "records_processed": len(obis_records),
            "new_records": new_records_count,
            "page": page,
        }

    except Exception as e:
        logger.error(
            "Unhandled error in fetch_and_store_obis_data for geometry"
            f" {geometry_wkt}, page {page}, start_date: {start_date},"
            f" end_date: {end_date}: {e}",
            exc_info=True,
        )
        raise


# The trigger_full_obis_refresh function follows here, no changes needed for its logic.
def trigger_full_obis_refresh(
    geometry_wkt,
    taxonid=None,
    initial_total_pages=1,
    start_date=None,
    end_date=None,
):
    """
    Function to trigger a full or date-range refresh, fetching multiple pages.
    :param start_date: Date string (YYYY-MM-DD) for filtering. If None, no start date filter applied.
    :param end_date: Date string (YYYY-MM-DD) for filtering. If None, no end date filter applied.
    """
    if start_date or end_date:
        refresh_type = "date-range incremental"
    else:
        refresh_type = "full"
    print(
        f"Triggering {refresh_type} OBIS refresh for geometry: {geometry_wkt},"
        f" taxonid: {taxonid}, start_date: {start_date}, end_date: {end_date}"
    )

    for page_num in range(initial_total_pages):
        fetch_and_store_obis_data(
            geometry_wkt,
            taxonid,
            page_num,
            start_date=start_date,
            end_date=end_date,
        )
        time.sleep(1)

    print(f"Finished {refresh_type} OBIS refresh tasks.")
