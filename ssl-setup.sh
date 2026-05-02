#!/bin/bash

# SSL Certificate Setup Script for Let's Encrypt
# Replace your-domain.com with your actual domain

DOMAIN="your-domain.com"
EMAIL="admin@your-domain.com"

# Create SSL directory
mkdir -p ./ssl

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Stop any running nginx on port 80 to allow certbot to use it
echo "Stopping any services on port 80..."
sudo docker-compose down frontend 2>/dev/null || true

# Get SSL certificate using standalone mode
echo "Getting SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email

# Copy certificates to ssl directory
echo "Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
sudo chown -R $USER:$USER ./ssl/

echo "SSL certificates setup complete!"
echo "Files copied to ./ssl/"
echo ""
echo "Next steps:"
echo "1. Update 'your-domain.com' in nginx.conf and docker-compose.yml to your actual domain"
echo "2. Run: docker-compose up -d --build"
echo ""
echo "To auto-renew certificates, add this to crontab:"
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart frontend"
