# Multi-stage build for optimal Docker image size

# Stage 1: Build the React application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Copy server configuration files
COPY --from=build /app/build/.htaccess /usr/share/nginx/html/
COPY --from=build /app/build/_redirects /usr/share/nginx/html/
COPY --from=build /app/build/web.config /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/deployment-test.html || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]