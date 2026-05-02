# EmPay HRMS - Linux Deployment Guide

This guide provides a complete automated deployment solution for EmPay HRMS on Linux servers with domain and SSL configuration.

## 🚀 Quick Start

### One-Command Deployment

```bash
curl -fsSL https://raw.githubusercontent.com/GlitchXStar/Odoo-Final/main/deploy.sh | bash
```

### Manual Deployment

1. Download the deployment script:
   ```bash
   wget https://raw.githubusercontent.com/GlitchXStar/Odoo-Final/main/deploy.sh
   chmod +x deploy.sh
   ```

2. Run the deployment:
   ```bash
   ./deploy.sh
   ```

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / Debian 10+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **Network**: Internet connection for downloading dependencies

### Domain Requirements
- **Domain Name**: A registered domain (e.g., `example.com`)
- **DNS Configuration**: A record pointing to your server's IP
- **Ports**: 80 and 443 must be open and accessible

### User Permissions
- Regular user with `sudo` privileges
- **Do not run as root** (script will refuse)

## 🔧 What the Script Does

### 1. System Setup
- Updates package repositories
- Installs required dependencies:
  - Git (for cloning repository)
  - Docker & Docker Compose (for containerization)
  - Certbot (for SSL certificates)

### 2. Repository Management
- Clones the latest code from GitHub
- Sets up the installation directory
- Configures proper file permissions

### 3. Domain Configuration
- Updates nginx configuration with your domain
- Configures Docker Compose for SSL
- Sets up proper API endpoints

### 4. SSL Certificate Setup
- Obtains Let's Encrypt SSL certificate
- Configures automatic HTTPS redirection
- Sets up certificate auto-renewal

### 5. Application Deployment
- Builds Docker containers
- Starts all services (frontend, backend, database)
- Configures secure backend access (internal only)

### 6. Security Hardening
- Implements security headers
- Restricts backend access to internal network
- Sets up SSL certificate auto-renewal

## 🌐 Architecture After Deployment

```
Internet → HTTPS (443) → Frontend (nginx) → Backend (internal) → External Database
           ↓                ↓                    ↓
        SSL/TLS         Public Access        Private Access Only
```

## 📁 Installation Structure

```
/opt/empay-hrms/
├── backend/                 # Node.js backend application
├── frontend/               # React frontend application
├── ssl/                    # SSL certificates
├── docker-compose.yml      # Docker configuration
├── deploy.sh              # Deployment script
├── renew-ssl.sh           # SSL renewal script
└── DEPLOYMENT.md          # This documentation
```

## 🔍 Configuration Options

During deployment, you'll be prompted for:

| Option | Default | Description |
|--------|---------|-------------|
| Domain | `your-domain.com` | Your registered domain name |
| Email | `admin@your-domain.com` | Email for SSL certificate |
| Repository | `https://github.com/GlitchXStar/Odoo-Final.git` | GitHub repository URL |
| Install Directory | `/opt/empay-hrms` | Where to install the application |

## 🛠️ Post-Deployment Management

### Useful Commands

```bash
# Navigate to installation directory
cd /opt/empay-hrms

# View application logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Update application
git pull && docker-compose up -d --build

# Check service status
docker-compose ps

# Manual SSL renewal
sudo certbot renew && docker-compose restart frontend
```

### Configuration Files

- **Nginx Config**: `/opt/empay-hrms/frontend/nginx.conf`
- **Docker Config**: `/opt/empay-hrms/docker-compose.yml`
- **SSL Certificates**: `/opt/empay-hrms/ssl/`
- **Backend Environment**: `/opt/empay-hrms/backend/.env`

## 🔒 Security Features

### Implemented Security Measures
- ✅ **HTTPS Only**: Automatic HTTP to HTTPS redirection
- ✅ **SSL/TLS**: Modern TLS 1.2/1.3 with strong ciphers
- ✅ **Backend Isolation**: Backend only accessible through nginx proxy
- ✅ **Security Headers**: HSTS, XSS Protection, Frame Options
- ✅ **Auto-Renewal**: SSL certificates auto-renew daily
- ✅ **Rate Limiting**: Nginx can handle rate limiting configuration

### Network Security
- Backend API is not exposed to the internet
- All traffic goes through nginx reverse proxy
- Database connection uses external PostgreSQL with secure credentials

## 🔧 Troubleshooting

### Common Issues

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check nginx configuration
docker exec empay-frontend nginx -t
```

#### Container Issues
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

#### Port Conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Stop conflicting services
sudo systemctl stop nginx  # if nginx is running on host
```

#### DNS Issues
```bash
# Verify domain points to server
nslookup your-domain.com
dig your-domain.com

# Test from external source
curl -I http://your-domain.com
```

### Log Locations
- **Application Logs**: `docker-compose logs`
- **Nginx Logs**: `docker exec empay-frontend tail -f /var/log/nginx/access.log`
- **SSL Logs**: `/var/log/letsencrypt/`

## 🔄 Updates and Maintenance

### Application Updates
```bash
cd /opt/empay-hrms
git pull origin main
docker-compose down
docker-compose up -d --build
```

### SSL Certificate Renewal
- **Automatic**: Daily at 12:00 PM via cron
- **Manual**: `sudo certbot renew && docker-compose restart frontend`

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

## 📊 Monitoring

### Health Checks
- **Application**: `https://your-domain.com/health`
- **SSL Certificate**: Check expiration in browser or `sudo certbot certificates`
- **Container Status**: `docker-compose ps`

### Performance Monitoring
Consider setting up:
- **Uptime monitoring** (UptimeRobot, Pingdom)
- **Performance monitoring** (New Relic, DataDog)
- **Log aggregation** (ELK Stack, Graylog)

## 🆘 Support

### Getting Help
1. Check this documentation first
2. Review application logs: `docker-compose logs`
3. Check GitHub Issues: https://github.com/GlitchXStar/Odoo-Final/issues
4. Create new issue with detailed information

### Information to Include in Support Requests
- Operating system and version
- Domain name
- Error messages from logs
- Steps to reproduce the issue
- Any custom configurations made

## 📝 License

This deployment script is part of the EmPay HRMS project. Please refer to the main project license for usage terms.

---

## 🎉 Deployment Complete!

After running the script, your EmPay HRMS will be available at:
- **Main Application**: `https://your-domain.com`
- **API Endpoints**: `https://your-domain.com/api/`
- **Health Check**: `https://your-domain.com/health`

Enjoy your secure, containerized HRMS application!
