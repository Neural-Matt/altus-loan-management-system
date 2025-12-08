#!/bin/bash
# Copy new nginx config into container and reload
docker exec altus-loan-container sh -c 'cat /opt/altus-app/current/nginx.conf > /etc/nginx/nginx.conf && nginx -s reload && echo "Nginx reloaded" || echo "Reload failed"'
echo "Done"
