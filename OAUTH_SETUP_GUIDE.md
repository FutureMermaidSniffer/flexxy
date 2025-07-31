# OAuth Integration Setup Guide

This guide will help you set up Google and Apple OAuth authentication for your FlexJobs application.

## Prerequisites

1. Google Developer Account
2. Apple Developer Account (for Apple Sign In)
3. Domain verification (for production)

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3003/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`

### 2. Configure Environment Variables

Add to your `.env` file:
```env
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3003/api/auth/google/callback
```

## Apple Sign In Setup

### 1. Configure Apple Developer Account

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new App ID with "Sign In with Apple" capability
4. Create a Services ID for web authentication
5. Configure domains and return URLs:
   - Development: `http://localhost:3003`
   - Production: `https://yourdomain.com`

### 2. Generate Apple Private Key

1. In Apple Developer Portal, go to "Keys"
2. Create a new key with "Sign In with Apple" enabled
3. Download the .p8 private key file
4. Note the Key ID and Team ID

### 3. Configure Environment Variables

Add to your `.env` file:
```env
APPLE_CLIENT_ID=your.apple.client.id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY_PATH=path/to/apple/private/key.p8
```

## Database Setup

Run the OAuth migration to add required fields:

```sql
-- Add OAuth fields to users table
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) UNIQUE,
ADD COLUMN apple_id VARCHAR(255) UNIQUE,
ADD COLUMN avatar_url TEXT,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_apple_id ON users(apple_id);

-- Update existing users (optional)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
```

## Session Configuration

Add session secret to your `.env` file:
```env
SESSION_SECRET=your-very-secure-session-secret-here-min-32-characters
```

## Frontend Configuration

### Update Client IDs

In `frontend/js/login.js`, update the Apple client ID:
```javascript
AppleID.auth.init({
    clientId: 'your.apple.client.id', // Replace with your actual Apple client ID
    scope: 'name email',
    redirectURI: window.location.origin + '/login',
    state: 'apple-signin',
    usePopup: true
});
```

## Testing

### Development Testing

1. Start your server: `npm run dev`
2. Navigate to `/login.html`
3. Click "Log in with Google" or "Log in with Apple"
4. Complete OAuth flow
5. Verify user is created/updated in database

### Production Deployment

1. Update all URLs to use HTTPS
2. Configure proper CORS settings
3. Set secure session cookies
4. Verify domain ownership with OAuth providers

## Security Considerations

1. **Environment Variables**: Keep all OAuth credentials secure and never commit to version control
2. **HTTPS**: Always use HTTPS in production for OAuth flows
3. **Session Security**: Use secure session configuration in production
4. **Token Validation**: Implement proper token validation for Apple ID tokens
5. **Rate Limiting**: Apply rate limiting to OAuth endpoints

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure redirect URIs in OAuth provider settings match exactly
2. **CORS Errors**: Configure CORS to allow your domain
3. **Session Issues**: Verify session configuration and secure cookies
4. **Apple Sign In Not Loading**: Check Apple SDK loading and client ID configuration

### Debug Steps

1. Check browser developer tools for console errors
2. Verify OAuth provider settings
3. Test redirect URIs manually
4. Check server logs for authentication errors

## Flow Overview

### Google OAuth Flow
1. User clicks "Log in with Google"
2. Redirect to Google OAuth consent screen
3. User grants permissions
4. Google redirects to `/api/auth/google/callback`
5. Server verifies and creates/updates user
6. JWT token generated and user redirected to frontend
7. Frontend stores token and redirects to dashboard

### Apple Sign In Flow
1. User clicks "Log in with Apple"
2. Apple Sign In popup/modal appears
3. User completes Apple authentication
4. Frontend receives Apple ID token
5. Frontend posts token to `/api/auth/apple/callback`
6. Server verifies and creates/updates user
7. JWT token returned to frontend
8. Frontend stores token and redirects to dashboard

## Support

For additional help:
1. Check OAuth provider documentation
2. Review server logs for detailed error messages
3. Test with OAuth playground tools
4. Verify environment variable configuration
