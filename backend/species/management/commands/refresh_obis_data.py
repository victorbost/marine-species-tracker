import threading
from datetime import date, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand

from species.tasks.obis_etl import trigger_full_obis_refresh


class Command(BaseCommand):
    help = (
        "Triggers the refresh of OBIS data in a separate thread. Supports full"
        " or date-range refresh."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--geometry",
            type=str,
            help=(
                'WKT geometry for OBIS query (e.g., "POLYGON((-80 30, -80 50,'
                ' -30 50, -30 30, -80 30))")'
            ),
            default=getattr(
                settings,
                "OBIS_DEFAULT_GEOMETRY",
                "POLYGON((-180 -90, 180 -90, 180 90, -180 90, -180 -90))",
            ),
        )
        parser.add_argument(
            "--taxonid", type=str, help="OBIS taxon ID", default=None
        )
        parser.add_argument(
            "--pages",
            type=int,
            help="Number of pages to fetch (per date range if applicable)",
            default=getattr(settings, "OBIS_DEFAULT_FETCH_PAGES", 1),
        )
        parser.add_argument(
            "--mode",
            type=str,
            choices=["full", "incremental"],
            default="incremental",  # Default to incremental for monthly runs
            help=(
                'Refresh mode: "full" (all data) or "incremental" (using date'
                " range, typically last month)."
            ),
        )
        parser.add_argument(
            "--start-date",
            type=str,
            help=(
                "Start date in YYYY-MM-DD format for filtering records. Used"
                " with --mode incremental. Defaults to 1 month ago if --mode"
                " incremental and not specified."
            ),
        )
        parser.add_argument(
            "--end-date",
            type=str,
            help=(
                "End date in YYYY-MM-DD format for filtering records. Used"
                " with --mode incremental. Defaults to today if --mode"
                " incremental and --start-date specified but not this."
            ),
        )

    def handle(self, *args, **options):
        geometry_wkt = options["geometry"]
        taxonid = options["taxonid"]
        pages = options["pages"]
        mode = options["mode"]
        start_date_arg = options["start_date"]
        end_date_arg = options["end_date"]

        final_start_date = None
        final_end_date = None

        if mode == "incremental":
            current_date = date.today()
            if start_date_arg:
                final_start_date = start_date_arg
            else:
                # Default to 1 month ago for incremental mode if not specified
                one_month_ago = current_date - timedelta(days=30)
                final_start_date = one_month_ago.strftime("%Y-%m-%d")

            if end_date_arg:
                final_end_date = end_date_arg
            else:
                # Default to today if incremental and end_date not specified
                final_end_date = current_date.strftime("%Y-%m-%d")

            self.stdout.write(
                "Running in INCREMENTAL mode, fetching data with eventDate"
                f" from {final_start_date} to {final_end_date}"
            )
        else:  # mode == 'full'
            self.stdout.write(
                "Running in FULL REFRESH mode (no date filters applied)."
            )

        self.stdout.write(
            "Starting OBIS data refresh in a background thread..."
        )

        etl_thread = threading.Thread(
            target=trigger_full_obis_refresh,
            args=(
                geometry_wkt,
                taxonid,
                pages,
                final_start_date,
                final_end_date,
            ),
        )
        etl_thread.start()
        etl_thread.join()

        self.stdout.write(
            self.style.SUCCESS("OBIS refresh command completed.")
        )
        self.stdout.write(
            self.style.WARNING("All ETL logs should be visible above.")
        )
