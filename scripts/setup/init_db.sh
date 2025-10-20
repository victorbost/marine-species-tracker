#!/bin/bash
echo "Initializing PostgreSQL database with PostGIS..."

psql -U postgres << SQL
CREATE DATABASE marine_tracker;
\c marine_tracker
CREATE EXTENSION postgis;
SQL

echo "✓ Database initialized with PostGIS extension"
