# Optimized Dockerfile - Uses pre-built application
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy pre-built React application
COPY build /usr/share/nginx/html

# Fix permissions for nginx to read static files
RUN chmod -R 755 /usr/share/nginx/html

# Expose ports 80 and 443
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
