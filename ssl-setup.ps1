# SSL Certificate Setup Script for Let's Encrypt (Windows PowerShell)
# Replace your-domain.com with your actual domain

$Domain = "your-domain.com"
$Email = "admin@your-domain.com"

# Create SSL directory
New-Item -ItemType Directory -Path ".\ssl" -Force

# Check if certbot is installed
if (-not (Get-Command certbot -ErrorAction SilentlyContinue)) {
    Write-Host "Installing certbot..."
    # Install certbot using chocolatey or scoop
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install certbot
    } elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        scoop install certbot
    } else {
        Write-Host "Please install certbot manually from https://certbot.eff.org/"
        exit 1
    }
}

# Stop frontend container to free port 80
Write-Host "Stopping frontend container..."
docker-compose stop frontend

# Get SSL certificate
Write-Host "Getting SSL certificate for $Domain..."
certbot certonly --standalone -d $Domain -d www.$Domain --email $Email --agree-tos --no-eff-email

# Copy certificates to ssl directory
Write-Host "Copying certificates..."
Copy-Item "C:\Certbot\live\$Domain\fullchain.pem" ".\ssl\" -Force
Copy-Item "C:\Certbot\live\$Domain\privkey.pem" ".\ssl\" -Force

Write-Host "SSL certificates setup complete!"
Write-Host "Files copied to .\ssl\"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update 'your-domain.com' in nginx.conf and docker-compose.yml to your actual domain"
Write-Host "2. Run: docker-compose up -d --build"
Write-Host ""
Write-Host "To auto-renew certificates, set up a scheduled task to run:"
Write-Host "certbot renew --quiet && docker-compose restart frontend"
