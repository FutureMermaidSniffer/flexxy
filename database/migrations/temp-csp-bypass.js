// Temporary CSP bypass for Tawk.to testing
// Replace the helmet configuration in server.js with this:

app.use(helmet({
  contentSecurityPolicy: false, // Temporarily disable CSP
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// Once Tawk.to is working, you can re-enable CSP with proper configuration:
