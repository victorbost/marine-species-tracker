#!/bin/bash
echo "Deploying backend to AWS EC2..."

# This is a template - customize for your EC2 instance
# ssh -i your-key.pem ubuntu@your-ec2-ip << 'ENDSSH'
# cd /var/www/marine-species-tracker/backend
# git pull origin main
# source venv/bin/activate
# pip install -r requirements.txt
# python manage.py migrate
# python manage.py collectstatic --noinput
# sudo systemctl restart gunicorn
# ENDSSH

echo "✓ Backend deployment complete"
