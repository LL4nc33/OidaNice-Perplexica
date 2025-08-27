#!/bin/sh
set -e

echo "Starting migration..."
node migrate.js

echo "Starting server..."
exec node server.js