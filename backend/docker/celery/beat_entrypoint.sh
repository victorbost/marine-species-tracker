#!/bin/sh
set -e

# Run Django database migrations (ensure it's up to date)
python manage.py migrate

# Remove any stale Celery Beat schedule file
rm -f celerybeat.pid

# Start Celery Beat
celery -A core beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
