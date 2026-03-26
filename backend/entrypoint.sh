#!/bin/bash
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
while ! nc -z mysql 3307; do
  sleep 1
done
echo "MySQL is ready!"

# Run migrations
python manage.py migrate

# Start the application
exec "$@"
!/bin/bash
!/bin/bash
