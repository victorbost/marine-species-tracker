import re
import logging
import pytz
from dateutil import parser

logger = logging.getLogger(__name__)


def clean_string_to_capital_capital(input_string):
    """
    Cleans a string to "Capital Capital" format.
    Handles camelCase, underscores, and fused lowercase words (e.g., humanobservation).

    Examples:
    - "humanobservation"     -> "Human Observation"
    - "machineobservation"   -> "Machine Observation"
    - "humanObservation"     -> "Human Observation"
    - "MachineObservation"   -> "Machine Observation"
    - "MATERIAL_SAMPLE"      -> "Material Sample"
    - "NomenclaturalChecklist" -> "Nomenclatural Checklist"
    - "All"                  -> "All"
    """
    if not input_string:
        return None

    s = str(input_string)

    # 1. Replace underscores/hyphens with spaces
    s = s.replace("_", " ").replace("-", " ")

    # 2. Add spaces before uppercase letters that follow a lowercase letter
    # This handles "humanObservation" -> "human Observation"
    # and "MachineObservation" -> "Machine Observation"
    s = re.sub(r"([a-z])([A-Z])", r"\1 \2", s)

    # 3. Add spaces before uppercase letters that follow a sequence of uppercase letters
    # This handles "MATERIALSAMPLE" -> "MATERIAL SAMPLE" or "NASAProject" -> "NASA Project"
    s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", s)

    # 4. Add spaces between a common short word and a longer word that follows
    s = re.sub(r"(human)(observation)", r"\1 \2", s, flags=re.IGNORECASE)
    s = re.sub(r"(machine)(observation)", r"\1 \2", s, flags=re.IGNORECASE)
    s = re.sub(r"(material)(sample)", r"\1 \2", s, flags=re.IGNORECASE)

    # 5. Remove any leading/trailing spaces and multiple internal spaces
    s = re.sub(r"\s+", " ", s).strip()

    # 6. Capitalize the first letter of each word (title case)
    cleaned_string = " ".join(
        [word.capitalize() for word in s.lower().split()]
    )

    return cleaned_string if cleaned_string else None


def to_float(value):
    """Safely converts a value to float, returns None if conversion fails."""
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def normalize_obis_depth(obs: dict):
    """
    Normalize OBIS depth fields (DarwinCore standard).

    Returns:
        depth_min, depth_max, bathymetry
    """

    raw_depth = obs.get("depth")
    raw_min = obs.get("minimumDepthInMeters")
    raw_max = obs.get("maximumDepthInMeters")
    raw_bathy = obs.get("bathymetry")

    depth = to_float(raw_depth)
    depth_min = to_float(raw_min)
    depth_max = to_float(raw_max)
    bathymetry = to_float(raw_bathy)

    if depth is not None:
        # If 'depth' exists, use it to fill min/max if they are missing
        depth_min = depth_min if depth_min is not None else depth
        depth_max = depth_max if depth_max is not None else depth

    if depth_min is not None and depth_max is None:
        depth_max = depth_min
    if depth_max is not None and depth_min is None:
        depth_min = depth_max

    return depth_min, depth_max, bathymetry


def get_harmonized_common_name(obis_record, worms_client):
    """
    Fetches and harmonizes the common name, prioritizing OBIS's vernacularName,
    then falling back to WoRMS API, and finally applying capitalization.
    """
    obis_vernacular_name = obis_record.get("vernacularName")

    if obis_vernacular_name:
        # If OBIS provides a vernacularName, use it and clean it
        return clean_string_to_capital_capital(obis_vernacular_name)
    else:
        # If OBIS vernacularName is not available, use WoRMS API
        aphia_id = obis_record.get("aphiaID")
        if aphia_id:
            worms_common_name = worms_client.get_common_name_by_aphia_id(
                aphia_id
            )
            return clean_string_to_capital_capital(worms_common_name)
    return None


def parse_obis_event_date(obis_id: str, event_date_str: str):
    """
    Parses an OBIS eventDate string into observation_datetime and observation_date.
    Handles timezone localization and logging for parsing errors.

    Returns:
        tuple: (observation_datetime, observation_date) or (None, None) if parsing fails.
    """
    observation_datetime = None
    observation_date = None

    if not event_date_str:
        logger.debug(
            f"OBIS record {obis_id} has no 'eventDate' string. Date/time"
            " fields will be None."
        )
        return None, None

    try:
        dt_obj = parser.parse(event_date_str)
        if dt_obj.tzinfo is None or dt_obj.tzinfo.utcoffset(dt_obj) is None:
            observation_datetime = pytz.utc.localize(dt_obj)
        else:
            observation_datetime = dt_obj.astimezone(pytz.utc)
        observation_date = observation_datetime.date()
    except ValueError as ve:
        if "offset must be a timedelta" in str(ve):
            logger.warning(
                f"OBIS record {obis_id}: 'eventDate' '{event_date_str}' has"
                " extreme timezone offset. Date/time fields set to None for"
                " this record. Error: {ve}"
            )
        else:
            logger.warning(
                f"OBIS record {obis_id}: 'eventDate' '{event_date_str}' could"
                " not be parsed. Date/time fields set to None for this"
                " record. Error: {ve}"
            )
    except Exception as e:
        logger.warning(
            f"OBIS record {obis_id}: Unexpected error parsing 'eventDate'"
            f" '{event_date_str}'. Date/time fields set to None for this"
            " record. Error: {e}"
        )

    return observation_datetime, observation_date


def standardize_sex(sex_value):
    """
    Standardizes the sex value to 'male', 'female', or 'unknown'.
    """
    if not sex_value:
        return "unknown"
    sex_value = str(sex_value).strip().lower()
    if sex_value in ["male", "m"]:
        return "male"
    elif sex_value in ["female", "f"]:
        return "female"
    else:
        return "unknown"
