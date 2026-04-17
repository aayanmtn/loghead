#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z loghead-db 5432; do
  sleep 1
done
echo "Database is ready!"

# Start the application
echo "Starting application..."
exec node server.js
