from django.core.management.base import BaseCommand
from django.conf import settings
from species.tasks.obis_etl import trigger_full_obis_refresh

class Command(BaseCommand):
    help = "Triggers the Celery task to refresh OBIS data."

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
            help='Number of pages to fetch (for testing/limited runs)',
            default=getattr(settings, 'OBIS_DEFAULT_FETCH_PAGES', 1)
        )
        parser.add_argument(
            '--sync',
            action='store_true',
            help='Run the task synchronously (for testing/debugging)',
        )

    def handle(self, *args, **options):
        geometry_wkt = options['geometry']
        taxonid = options['taxonid']
        pages = options['pages']
        sync_mode = options['sync']

        self.stdout.write(f"Triggering OBIS data refresh for geometry: {geometry_wkt}, taxonid: {taxonid}, pages: {pages}")

        if sync_mode:
            self.stdout.write(self.style.WARNING("Running OBIS refresh synchronously (for debugging)..."))
            # When running synchronously, directly call the task function
            # Note: For multiple pages, you'd iterate and call fetch_and_store_obis_data directly
            for page_num in range(pages):
                trigger_full_obis_refresh.apply(args=(geometry_wkt, taxonid, pages)).get()
        else:
            # Dispatch the task to Celery
            trigger_full_obis_refresh.delay(geometry_wkt, taxonid, pages)
            self.stdout.write(self.style.SUCCESS("OBIS refresh task dispatched to Celery."))
