/**
 * 404 Error Handler Middleware
 * Handles different types of 404 errors for API routes and static content
 */

const path = require('path');
const fs = require('fs');

class Error404Handler {
    /**
     * Handle API 404 errors
     */
    static handleApiNotFound(req, res, next) {
        // Log the 404 attempt for analytics
        console.log(`API 404: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
        
        // Return structured JSON error for API requests
        res.status(404).json({
            error: 'Not Found',
            message: 'The requested API endpoint does not exist',
            endpoint: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString(),
            suggestions: Error404Handler.getApiSuggestions(req.originalUrl)
        });
    }

    /**
     * Handle static file 404 errors
     */
    static handleStaticNotFound(req, res, next) {
        const requestedPath = req.path;
        
        // Log the 404 attempt
        console.log(`Static 404: ${requestedPath} - IP: ${req.ip} - Referrer: ${req.get('Referrer') || 'Direct'}`);
        
        // Check if it's a component request
        if (requestedPath.startsWith('/components/')) {
            return res.status(404).json({
                error: 'Component Not Found',
                message: 'The requested component does not exist',
                component: requestedPath,
                timestamp: new Date().toISOString()
            });
        }

        // Check if it's an asset request
        const ext = path.extname(requestedPath);
        const assetExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
        
        if (assetExtensions.includes(ext.toLowerCase())) {
            return res.status(404).json({
                error: 'Asset Not Found',
                message: 'The requested asset does not exist',
                asset: requestedPath,
                timestamp: new Date().toISOString()
            });
        }

        // For all other requests, serve the 404 HTML page
        const fourOhFourPath = path.join(process.cwd(), 'frontend', '404.html');
        
        if (fs.existsSync(fourOhFourPath)) {
            res.status(404).sendFile(fourOhFourPath);
        } else {
            // Fallback if 404.html doesn't exist
            res.status(404).send(Error404Handler.getFallbackHtml(requestedPath));
        }
    }

    /**
     * Get API suggestions based on the requested URL
     */
    static getApiSuggestions(requestedUrl) {
        const suggestions = [];
        
        // Common API endpoints and their corrections
        const apiMappings = {
            '/api/job': '/api/jobs',
            '/api/user': '/api/users',
            '/api/company': '/api/companies',
            '/api/application': '/api/applications',
            '/api/agent': '/api/agents',
            '/api/subscription': '/api/subscriptions',
            '/api/payment': '/api/payment-methods',
            '/api/admin': '/api/admin'
        };

        // Check for close matches
        for (const [pattern, suggestion] of Object.entries(apiMappings)) {
            if (requestedUrl.includes(pattern.replace('/api/', ''))) {
                suggestions.push(suggestion);
            }
        }

        // If no specific suggestions, provide general ones
        if (suggestions.length === 0) {
            suggestions.push('/api/jobs', '/api/users', '/api/companies', '/api/applications');
        }

        return suggestions.slice(0, 3); // Return max 3 suggestions
    }

    /**
     * Get fallback HTML for 404 errors when 404.html doesn't exist
     */
    static getFallbackHtml(requestedPath) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page Not Found - FlexJobs</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 50px 20px;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    max-width: 600px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                h1 {
                    font-size: 4rem;
                    margin: 0 0 20px 0;
                    font-weight: 900;
                }
                h2 {
                    font-size: 2rem;
                    margin: 0 0 20px 0;
                    font-weight: 300;
                }
                p {
                    font-size: 1.2rem;
                    margin: 0 0 30px 0;
                    opacity: 0.9;
                }
                .button {
                    display: inline-block;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    margin: 10px;
                }
                .button:hover {
                    background: #0056b3;
                    transform: translateY(-2px);
                }
                .path {
                    font-family: monospace;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 10px;
                    border-radius: 5px;
                    margin: 20px 0;
                    word-break: break-all;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <div class="path">${requestedPath}</div>
                <a href="/" class="button">Go Home</a>
                <a href="/browse-jobs.html" class="button">Browse Jobs</a>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Log 404 errors for analysis
     */
    static log404Error(req, type = 'unknown') {
        const errorData = {
            timestamp: new Date().toISOString(),
            type: type,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            referrer: req.get('Referrer') || 'Direct'
        };

        // In production, you might want to send this to a logging service
        console.log('404 Error:', JSON.stringify(errorData));
        
        // You could also store in database or send to analytics service
        // await analytics.track404Error(errorData);
    }

    /**
     * Middleware factory for different types of 404 handling
     */
    static createHandler(type = 'page') {
        return (req, res, next) => {
            Error404Handler.log404Error(req, type);
            
            switch (type) {
                case 'api':
                    return Error404Handler.handleApiNotFound(req, res, next);
                case 'static':
                    return Error404Handler.handleStaticNotFound(req, res, next);
                default:
                    return Error404Handler.handleStaticNotFound(req, res, next);
            }
        };
    }
}

module.exports = Error404Handler;
