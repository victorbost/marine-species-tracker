import threading
from django.core.management.base import BaseCommand
from django.conf import settings
from species.tasks.obis_etl import trigger_full_obis_refresh

class Command(BaseCommand):
    help = "Triggers the refresh of OBIS data in a separate thread."

    def add_arguments(self, parser):
        parser.add_argument(
            '--geometry',
            type=str,
            help='WKT geometry for OBIS query (e.g., "POLYGON((-80 30, -80 50, -30 50, -30 30, -80 30))")',
            default=getattr(settings, 'OBIS_DEFAULT_GEOMETRY', "POLYGON((-180 -90, 180 -90, 180 90, -180 90, -180 -90))") # Global default
        )
        parser.add_argument(
            '--taxonid',
            type=str,
            help='OBIS taxon ID',
            default=None
        )
        parser.add_argument(
            '--pages',
            type=int,
            help='Number of pages to fetch',
            default=getattr(settings, 'OBIS_DEFAULT_FETCH_PAGES', 1)
        )

    def handle(self, *args, **options):
        geometry_wkt = options['geometry']
        taxonid = options['taxonid']
        pages = options['pages']

        self.stdout.write("Starting OBIS data refresh in a background thread...")

        etl_thread = threading.Thread(
            target=trigger_full_obis_refresh,
            args=(geometry_wkt, taxonid, pages),
            # REMOVE daemon=True
        )
        etl_thread.start()
        etl_thread.join() # <--- ADD THIS LINE to wait for the thread to complete

        self.stdout.write(self.style.SUCCESS("OBIS refresh command completed."))
        self.stdout.write(self.style.WARNING("All ETL logs should be visible above."))
