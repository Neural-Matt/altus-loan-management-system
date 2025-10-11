# 🐳 Altus Loan Management System - Docker Deployment

This directory contains Docker configuration files for containerized deployment of the Altus Loan Management System.

## 📁 Docker Files

- **`Dockerfile`** - Multi-stage build configuration
- **`docker-compose.yml`** - Service orchestration
- **`nginx.conf`** - Production web server configuration
- **`.dockerignore`** - Files excluded from Docker build context

## 🚀 Quick Start

### Prerequisites
- Docker installed on your system
- Docker Compose (included with Docker Desktop)

### Build and Run

```bash
# Clone or extract the project files
cd altus-loan-management-system

# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at:
- **HTTP**: http://localhost
- **Health Check**: http://localhost/health
- **Test Page**: http://localhost/deployment-test.html

### Stop the Application

```bash
# Stop services
docker-compose down

# Stop and remove volumes (if any)
docker-compose down -v
```

## 🐳 Docker Configuration Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Build Stage**: Uses Node.js to build the React application
2. **Production Stage**: Uses Nginx Alpine to serve the static files

### Container Features

- ✅ **Optimized Size**: Alpine Linux base (~50MB total)
- ✅ **Production Ready**: Nginx with proper configurations
- ✅ **Health Checks**: Built-in health monitoring
- ✅ **Security Headers**: XSS, CSRF, and frame protection
- ✅ **Gzip Compression**: Automatic asset compression
- ✅ **Caching**: Optimized cache headers for static assets
- ✅ **SPA Routing**: Proper handling of React Router

### Environment Variables

You can customize the deployment using environment variables:

```yaml
environment:
  - NODE_ENV=production
  - REACT_APP_API_BASE_URL=https://your-api.com
  - REACT_APP_VERSION=1.2.0
```

## 🔧 Advanced Configuration

### Custom Nginx Configuration

To modify Nginx settings, edit `nginx.conf`:

```nginx
# Add custom headers
add_header X-Custom-Header "Altus-System" always;

# Modify cache settings
location /api/ {
    proxy_pass http://backend:3001;
    proxy_cache_bypass 1;
}
```

### SSL/HTTPS Setup

For HTTPS, uncomment the nginx-proxy service in `docker-compose.yml` and add SSL certificates:

```bash
# Create SSL directory
mkdir ssl

# Add your certificates
cp your-cert.pem ssl/
cp your-key.pem ssl/
```

### Development Mode

For development with hot reload:

```dockerfile
# Add to Dockerfile for development
FROM node:18-alpine as development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Container Management

### View Logs

```bash
# View application logs
docker-compose logs -f altus-app

# View specific service logs
docker logs altus-loan-management
```

### Monitor Performance

```bash
# Check container stats
docker stats altus-loan-management

# Monitor health status
docker inspect --format='{{.State.Health.Status}}' altus-loan-management
```

### Scale Services

```bash
# Scale to multiple instances
docker-compose up --scale altus-app=3
```

## 🛠️ Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check Docker daemon
docker info

# Check port availability
netstat -tulpn | grep :80
```

**Build failures:**
```bash
# Clean Docker cache
docker system prune -a

# Force rebuild
docker-compose build --no-cache
```

**Permission issues:**
```bash
# Fix file permissions
chmod +x nginx.conf
chown -R $USER:$USER .
```

### Health Check Endpoints

- **Application**: `http://localhost/`
- **Health Status**: `http://localhost/health`
- **Nginx Status**: Check container logs

## 🔐 Security Considerations

- Container runs as non-root user
- Security headers enabled
- No sensitive data in image layers
- Regular base image updates recommended

## 📈 Production Deployment

For production deployment:

1. **Use Docker Swarm or Kubernetes**
2. **Set up proper logging and monitoring**
3. **Configure load balancing**
4. **Implement backup strategies**
5. **Use secrets management**

### Example Production Compose

```yaml
version: '3.8'
services:
  altus-app:
    image: your-registry/altus-app:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.altus.rule=Host(`altus.yourdomain.com`)"
```

## 🎯 Performance Optimization

- **Multi-stage builds** reduce image size
- **Nginx caching** improves response times
- **Gzip compression** reduces bandwidth
- **Health checks** ensure reliability
- **Resource limits** prevent resource exhaustion

---

**Ready for containerized deployment!** 🚀

The Docker configuration provides a production-ready, scalable deployment solution for the Altus Loan Management System.