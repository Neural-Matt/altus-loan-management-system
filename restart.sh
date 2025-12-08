#!/bin/sh
cd /opt/altus-app/current
echo "Stopping container..."
docker-compose down --timeout 15
echo "Waiting..."
sleep 2
echo "Starting container..."
docker-compose up -d
echo "Waiting for container to be ready..."
sleep 5
echo "Done"
