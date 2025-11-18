#!/bin/sh
set -e

# Run Django database migrations
python manage.py migrate

# Start Celery worker
celery -A core worker -l info
