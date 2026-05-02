#!/bin/bash

# EmPay HRMS - Linux Deployment Script
# This script clones the repository and sets up the complete application with SSL

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_DOMAIN="your-domain.com"
DEFAULT_EMAIL="admin@your-domain.com"
DEFAULT_REPO_URL="https://github.com/GlitchXStar/Odoo-Final.git"
DEFAULT_INSTALL_DIR="/opt/empay-hrms"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons."
        print_error "Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_status "Installing git..."
        sudo apt-get update && sudo apt-get install -y git
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_warning "Please log out and log back in to use Docker without sudo"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_status "Installing certbot for SSL certificates..."
        sudo apt-get update && sudo apt-get install -y certbot
    fi
    
    print_success "System requirements check completed"
}

# Function to get user input
get_user_input() {
    echo -e "\n${BLUE}=== EmPay HRMS Deployment Configuration ===${NC}\n"
    
    # Get domain
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    DOMAIN=${DOMAIN:-$DEFAULT_DOMAIN}
    
    # Get email
    read -p "Enter your email for SSL certificate: " EMAIL
    EMAIL=${EMAIL:-$DEFAULT_EMAIL}
    
    # Get repository URL
    read -p "Enter GitHub repository URL [$DEFAULT_REPO_URL]: " REPO_URL
    REPO_URL=${REPO_URL:-$DEFAULT_REPO_URL}
    
    # Get installation directory
    read -p "Enter installation directory [$DEFAULT_INSTALL_DIR]: " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}
    
    # Confirm configuration
    echo -e "\n${YELLOW}=== Configuration Summary ===${NC}"
    echo "Domain: $DOMAIN"
    echo "Email: $EMAIL"
    echo "Repository: $REPO_URL"
    echo "Install Directory: $INSTALL_DIR"
    echo ""
    
    read -p "Continue with this configuration? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
}

# Function to clone repository
clone_repository() {
    print_status "Cloning repository from GitHub..."
    
    # Create installation directory if it doesn't exist
    sudo mkdir -p $INSTALL_DIR
    sudo chown $USER:$USER $INSTALL_DIR
    
    # Clone the repository
    if [[ -d "$INSTALL_DIR/.git" ]]; then
        print_status "Repository already exists, pulling latest changes..."
        cd $INSTALL_DIR
        git pull origin main
    else
        git clone $REPO_URL $INSTALL_DIR
        cd $INSTALL_DIR
    fi
    
    print_success "Repository cloned successfully"
}

# Function to configure domain
configure_domain() {
    print_status "Configuring domain settings..."
    
    # Update nginx configuration
    sed -i "s/your-domain.com/$DOMAIN/g" frontend/nginx.conf
    
    # Update docker-compose.yml
    sed -i "s/your-domain.com/$DOMAIN/g" docker-compose.yml
    sed -i "s/http:\/\/localhost/https:\/\/$DOMAIN/g" docker-compose.yml
    
    print_success "Domain configuration updated"
}

# Function to setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates for $DOMAIN..."
    
    # Create SSL directory
    mkdir -p ./ssl
    
    # Stop any running containers to free port 80
    docker-compose down 2>/dev/null || true
    
    # Get SSL certificate
    print_status "Obtaining SSL certificate from Let's Encrypt..."
    sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email --non-interactive
    
    if [[ $? -ne 0 ]]; then
        print_error "Failed to obtain SSL certificate"
        print_error "Please ensure:"
        print_error "1. Domain $DOMAIN points to this server's IP"
        print_error "2. Port 80 is not blocked by firewall"
        print_error "3. Domain DNS is properly configured"
        exit 1
    fi
    
    # Copy certificates
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
    sudo chown -R $USER:$USER ./ssl/
    
    print_success "SSL certificates setup completed"
}

# Function to setup SSL configuration
setup_ssl_config() {
    print_status "Setting up SSL configuration..."
    
    # Update nginx.conf for SSL
    cat > frontend/nginx.conf << EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    root /usr/share/nginx/html;
    index index.html;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;

    # API proxy to backend (internal only)
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /health {
        proxy_pass http://backend:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto https;
    }

    # SPA fallback — serve index.html for all routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # Update docker-compose.yml for SSL
    cat > docker-compose.yml << EOF
services:
  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: empay-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./backend:/app
      - /app/node_modules

  # Frontend (Nginx + Vite build)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://$DOMAIN
    container_name: empay-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
EOF
    
    print_success "SSL configuration updated"
}

# Function to build and start containers
build_and_start() {
    print_status "Building and starting Docker containers..."
    
    # Build and start containers
    docker-compose down
    docker-compose up -d --build
    
    # Wait for containers to start
    print_status "Waiting for containers to start..."
    sleep 10
    
    # Check container status
    if docker-compose ps | grep -q "Up"; then
        print_success "Containers started successfully"
    else
        print_error "Failed to start containers"
        docker-compose logs
        exit 1
    fi
}

# Function to setup auto-renewal
setup_autorenewal() {
    print_status "Setting up SSL certificate auto-renewal..."
    
    # Create renewal script
    cat > renew-ssl.sh << EOF
#!/bin/bash
# Auto-renewal script for SSL certificates

cd $INSTALL_DIR
sudo certbot renew --quiet
docker-compose restart frontend
EOF
    
    chmod +x renew-ssl.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 12 * * * $INSTALL_DIR/renew-ssl.sh") | crontab -
    
    print_success "Auto-renewal setup completed"
}

# Function to display final information
display_final_info() {
    echo -e "\n${GREEN}=== Deployment Completed Successfully! ===${NC}\n"
    
    echo -e "${BLUE}Access Information:${NC}"
    echo -e "🌐 Website: ${YELLOW}https://$DOMAIN${NC}"
    echo -e "🔧 API: ${YELLOW}https://$DOMAIN/api/${NC}"
    echo -e "❤️  Health Check: ${YELLOW}https://$DOMAIN/health${NC}"
    
    echo -e "\n${BLUE}Important Notes:${NC}"
    echo -e "• Backend API is only accessible through nginx proxy"
    echo -e "• HTTP requests are automatically redirected to HTTPS"
    echo -e "• SSL certificates auto-renew daily at 12:00 PM"
    
    echo -e "\n${BLUE}Useful Commands:${NC}"
    echo -e "• View logs: ${YELLOW}cd $INSTALL_DIR && docker-compose logs -f${NC}"
    echo -e "• Restart services: ${YELLOW}cd $INSTALL_DIR && docker-compose restart${NC}"
    echo -e "• Update application: ${YELLOW}cd $INSTALL_DIR && git pull && docker-compose up -d --build${NC}"
    echo -e "• Manual SSL renewal: ${YELLOW}sudo certbot renew && docker-compose restart frontend${NC}"
    
    echo -e "\n${BLUE}Configuration Files:${NC}"
    echo -e "• Nginx config: ${YELLOW}$INSTALL_DIR/frontend/nginx.conf${NC}"
    echo -e "• Docker config: ${YELLOW}$INSTALL_DIR/docker-compose.yml${NC}"
    echo -e "• SSL certificates: ${YELLOW}$INSTALL_DIR/ssl/${NC}"
    
    echo -e "\n${GREEN}🎉 Your EmPay HRMS is now live at https://$DOMAIN${NC}\n"
}

# Main execution function
main() {
    echo -e "${BLUE}=== EmPay HRMS Linux Deployment Script ===${NC}\n"
    
    check_root
    check_requirements
    get_user_input
    clone_repository
    configure_domain
    setup_ssl
    setup_ssl_config
    build_and_start
    setup_autorenewal
    display_final_info
}

# Run main function
main "$@"
