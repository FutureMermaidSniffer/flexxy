# SSL Certificate Generation Script for FlexJobs Local Development (Windows)
# This script creates self-signed SSL certificates for local HTTPS testing

Write-Host "🔐 Generating SSL certificates for FlexJobs local development..." -ForegroundColor Green

# Create SSL directory
if (!(Test-Path "nginx\ssl")) {
    New-Item -ItemType Directory -Path "nginx\ssl" -Force
}

# Check if OpenSSL is available
try {
    $null = Get-Command openssl -ErrorAction Stop
    Write-Host "✅ OpenSSL found" -ForegroundColor Green
} catch {
    Write-Host "❌ OpenSSL not found. Please install OpenSSL:" -ForegroundColor Red
    Write-Host "   1. Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    Write-Host "   2. Or install via Chocolatey: choco install openssl" -ForegroundColor Yellow
    Write-Host "   3. Or use Git Bash which includes OpenSSL" -ForegroundColor Yellow
    exit 1
}

# Generate private key
Write-Host "📄 Generating private key..." -ForegroundColor Cyan
openssl genrsa -out nginx\ssl\flexjobs.key 2048

# Create temporary config file for certificate
$configContent = @"
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = CO
L = Denver
O = FlexJobs
OU = Development Team
CN = flexjobs.local
emailAddress = admin@flexjobs.local

[v3_req]
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = flexjobs.local
DNS.2 = www.flexjobs.local
DNS.3 = api.flexjobs.local
DNS.4 = *.flexjobs.local
IP.1 = 127.0.0.1
IP.2 = ::1
"@

$configContent | Out-File -FilePath "nginx\ssl\temp.conf" -Encoding UTF8

# Generate certificate signing request
Write-Host "📄 Generating certificate signing request..." -ForegroundColor Cyan
openssl req -new -key nginx\ssl\flexjobs.key -out nginx\ssl\flexjobs.csr -config nginx\ssl\temp.conf

# Generate self-signed certificate
Write-Host "📄 Generating self-signed certificate..." -ForegroundColor Cyan
openssl x509 -req -in nginx\ssl\flexjobs.csr -signkey nginx\ssl\flexjobs.key -out nginx\ssl\flexjobs.crt -days 365 -extensions v3_req -extfile nginx\ssl\temp.conf

# Clean up temporary files
Remove-Item nginx\ssl\flexjobs.csr -Force
Remove-Item nginx\ssl\temp.conf -Force

Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
Write-Host "📁 Certificate location: nginx\ssl\" -ForegroundColor White
Write-Host "🔑 Private key: nginx\ssl\flexjobs.key" -ForegroundColor White
Write-Host "📜 Certificate: nginx\ssl\flexjobs.crt" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: These are self-signed certificates for development only." -ForegroundColor Yellow
Write-Host "💡 You'll need to accept the security warning in your browser." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Add these entries to your hosts file (C:\Windows\System32\drivers\etc\hosts):" -ForegroundColor Cyan
Write-Host "127.0.0.1 flexjobs.local" -ForegroundColor White
Write-Host "127.0.0.1 www.flexjobs.local" -ForegroundColor White
Write-Host "127.0.0.1 api.flexjobs.local" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Run with: docker-compose -f docker-compose.nginx.yml up -d" -ForegroundColor Green
