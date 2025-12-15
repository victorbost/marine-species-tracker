from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = "Mark all existing active users as email verified"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be updated without actually updating",
        )
        parser.add_argument(
            "--created-before",
            type=str,
            help="Only update users created before this date (YYYY-MM-DD)",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        # Base queryset for active users
        queryset = User.objects.filter(is_active=True)

        # Filter by creation date if specified
        if options["created_before"]:
            from django.utils import timezone
            from datetime import datetime

            try:
                cutoff_date = timezone.make_aware(
                    datetime.strptime(options["created_before"], "%Y-%m-%d")
                )
                queryset = queryset.filter(created_at__lt=cutoff_date)
                self.stdout.write(
                    "Filtering users created before:"
                    f' {options["created_before"]}'
                )
            except ValueError:
                self.stderr.write("Invalid date format. Use YYYY-MM-DD")
                return

        # Count users that need updating
        users_to_update = queryset.filter(email_verified=False)

        if dry_run:
            self.stdout.write(
                f"DRY RUN: Would update {users_to_update.count()} users"
            )
            for user in users_to_update[:10]:  # Show first 10
                self.stdout.write(f"  - {user.username} ({user.email})")
            if users_to_update.count() > 10:
                self.stdout.write(
                    f"  ... and {users_to_update.count() - 10} more"
                )
        else:
            updated_count = users_to_update.update(email_verified=True)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully marked {updated_count} existing users as"
                    " email verified"
                )
            )
