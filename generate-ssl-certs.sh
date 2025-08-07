#!/bin/bash

# SSL Certificate Generation Script for FlexJobs Local Development
# This script creates self-signed SSL certificates for local HTTPS testing

echo "🔐 Generating SSL certificates for FlexJobs local development..."

# Create SSL directory
mkdir -p nginx/ssl

# Generate private key
echo "📄 Generating private key..."
openssl genrsa -out nginx/ssl/flexjobs.key 2048

# Generate certificate signing request
echo "📄 Generating certificate signing request..."
openssl req -new -key nginx/ssl/flexjobs.key -out nginx/ssl/flexjobs.csr -subj "/C=US/ST=CO/L=Denver/O=FlexJobs/OU=Development/CN=flexjobs.local/emailAddress=admin@flexjobs.local"

# Generate self-signed certificate
echo "📄 Generating self-signed certificate..."
openssl x509 -req -in nginx/ssl/flexjobs.csr -signkey nginx/ssl/flexjobs.key -out nginx/ssl/flexjobs.crt -days 365 -extensions v3_req -config <(
cat <<EOF
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
EOF
)

# Set proper permissions
chmod 600 nginx/ssl/flexjobs.key
chmod 644 nginx/ssl/flexjobs.crt

# Clean up CSR file
rm nginx/ssl/flexjobs.csr

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificate location: nginx/ssl/"
echo "🔑 Private key: nginx/ssl/flexjobs.key"
echo "📜 Certificate: nginx/ssl/flexjobs.crt"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "💡 You'll need to accept the security warning in your browser."
echo ""
echo "🌐 Add this to your hosts file (/etc/hosts or C:\\Windows\\System32\\drivers\\etc\\hosts):"
echo "127.0.0.1 flexjobs.local"
echo "127.0.0.1 www.flexjobs.local"
echo "127.0.0.1 api.flexjobs.local"
