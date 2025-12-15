#!/usr/bin/env python
"""
Script to mark all existing active users as email verified.
Run with: python manage.py shell < scripts/mark_existing_users_verified.py
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Configure Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from users.models import User


def mark_existing_users_verified():
    """Mark all active users as email verified"""

    # Get all active users who aren't already verified
    users_to_update = User.objects.filter(is_active=True, email_verified=False)

    count = users_to_update.count()
    print(f"Found {count} active users who need email verification")

    if count == 0:
        print("No users need updating!")
        return

    # Show some examples
    print("Sample users to be updated:")
    for user in users_to_update[:5]:
        print(
            f"  - {user.username} ({user.email}) - Created: {user.created_at}"
        )

    if count > 5:
        print(f"  ... and {count - 5} more users")

    # Ask for confirmation
    response = input(f"\nUpdate {count} users? (y/N): ").strip().lower()

    if response == "y" or response == "yes":
        # Update all users
        updated_count = users_to_update.update(email_verified=True)
        print(
            f"✅ Successfully marked {updated_count} users as email verified!"
        )
    else:
        print("Operation cancelled.")


if __name__ == "__main__":
    mark_existing_users_verified()
