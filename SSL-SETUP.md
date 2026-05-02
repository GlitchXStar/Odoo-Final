# SSL/HTTPS Setup Guide

This guide shows how to configure your EmPay HRMS application with a custom domain and SSL certificates using Let's Encrypt.

## Prerequisites

1. A custom domain name (e.g., `your-domain.com`)
2. Domain DNS pointing to your server's IP address
3. Ports 80 and 443 open on your firewall
4. Docker and Docker Compose installed

## Step 1: Update Domain Configuration

Replace `your-domain.com` with your actual domain in these files:

1. **frontend/nginx.conf** (lines 4, 11, 25)
2. **docker-compose.yml** (line 25)

## Step 2: Get SSL Certificates

### Option A: Using the Setup Script (Recommended)

**For Linux/macOS:**
```bash
chmod +x ssl-setup.sh
./ssl-setup.sh
```

**For Windows:**
```powershell
.\ssl-setup.ps1
```

### Option B: Manual Certbot Setup

1. Install certbot: https://certbot.eff.org/
2. Stop the frontend container:
   ```bash
   docker-compose stop frontend
   ```
3. Get certificates:
   ```bash
   certbot certonly --standalone -d your-domain.com -d www.your-domain.com
   ```
4. Copy certificates:
   ```bash
   mkdir -p ./ssl
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
   sudo chown -R $USER:$USER ./ssl/
   ```

## Step 3: Rebuild and Start Containers

```bash
docker-compose down
docker-compose up -d --build
```

## Step 4: Verify SSL Setup

1. **HTTP Access**: `http://your-domain.com` → redirects to HTTPS
2. **HTTPS Access**: `https://your-domain.com` → secure site
3. **API Access**: `https://your-domain.com/api/health` → backend health check

## Step 5: Auto-Renewal (Important!)

SSL certificates expire every 90 days. Set up auto-renewal:

### Linux/macOS (Crontab)
```bash
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart frontend
```

### Windows (Task Scheduler)
Create a scheduled task to run:
```powershell
certbot renew --quiet && docker-compose restart frontend
```

## Security Features Enabled

- ✅ HTTP to HTTPS redirect
- ✅ Modern TLS 1.2/1.3 protocols
- ✅ Strong cipher suites
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ XSS Protection headers
- ✅ Frame options protection
- ✅ Content type protection
- ✅ Secure referrer policy

## Troubleshooting

### Certificate Issues
```bash
# Check certificate status
certbot certificates

# Force renew
certbot renew --force-renewal

# Check nginx configuration
docker exec empay-frontend nginx -t
```

### Port Conflicts
Make sure ports 80 and 443 are not being used by other services:
```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### DNS Issues
Verify your domain points to the correct IP:
```bash
nslookup your-domain.com
dig your-domain.com
```

## Files Modified

- `frontend/nginx.conf` - Added SSL configuration
- `docker-compose.yml` - Added SSL volume and port 443
- `ssl-setup.sh` - Linux/macOS SSL setup script
- `ssl-setup.ps1` - Windows SSL setup script

## Next Steps

1. Replace `your-domain.com` with your actual domain
2. Run the SSL setup script
3. Rebuild and start containers
4. Test HTTPS access
5. Set up certificate auto-renewal
