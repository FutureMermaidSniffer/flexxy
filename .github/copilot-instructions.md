<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# FlexJobs Project - GitHub Copilot Instructions

This is a full-stack remote job board application built with Node.js, Express, MySQL, and Bootstrap.

## Project Architecture

### Backend
- **Framework**: Express.js with Node.js
- **Database**: MySQL with connection pooling
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Security**: Helmet, CORS, rate limiting, input validation
- **File Structure**: 
  - `server.js` - Main server entry point
  - `backend/database.js` - Database connection and utilities
  - `backend/routes/` - API route handlers
  - `backend/middleware/` - Custom middleware (auth, validation)

### Frontend
- **Framework**: Vanilla JavaScript with Bootstrap 5
- **Architecture**: Class-based modules (Auth, Jobs, etc.)
- **File Structure**:
  - `frontend/index.html` - Main SPA
  - `frontend/js/auth.js` - Authentication handling
  - `frontend/js/jobs.js` - Job listings and search
  - `frontend/js/main.js` - Utilities and global functions
  - `frontend/css/style.css` - Custom styles

### Database Schema
- **Users**: Authentication and profile data
- **Companies**: Employer company profiles
- **Jobs**: Job listings with full details
- **Applications**: Job applications and status tracking
- **Categories**: Job categorization
- **Saved Jobs**: User bookmarks

## Development Guidelines

### Code Style
- Use async/await for database operations
- Implement proper error handling with try/catch
- Follow RESTful API conventions
- Use parameterized queries to prevent SQL injection
- Implement proper validation with express-validator

### Authentication & Authorization
- JWT tokens stored in localStorage
- Protected routes require Bearer token
- Role-based access (job_seeker, employer, admin)
- Always verify user permissions for operations

### Database Operations
- Use the helper functions in `database.js` (getOne, getMany, insertOne, updateOne, deleteOne)
- Implement proper pagination for list endpoints
- Use database indexes for performance
- Handle foreign key constraints properly

### Frontend Development
- Use Bootstrap classes for styling
- Implement responsive design principles
- Handle loading states and error messages
- Use modern JavaScript features (ES6+)
- Implement proper form validation

### Security Best Practices
- Validate and sanitize all user inputs
- Use prepared statements for database queries
- Implement rate limiting on sensitive endpoints
- Hash passwords with bcryptjs
- Secure JWT secret in environment variables

### API Design
- Use proper HTTP status codes
- Return consistent JSON response formats
- Implement proper error messages
- Include pagination metadata in responses
- Use query parameters for filtering and searching

## Common Patterns

### Database Query Pattern
```javascript
// Get single record
const user = await getOne('SELECT * FROM users WHERE id = ?', [userId]);

// Get multiple records with pagination
const jobs = await getMany('SELECT * FROM jobs WHERE is_active = ? LIMIT ? OFFSET ?', [true, limit, offset]);

// Insert record
const jobId = await insertOne('jobs', jobData);

// Update record
await updateOne('jobs', updateData, 'id = ?', [jobId]);
```

### API Response Pattern
```javascript
// Success response
res.json({ 
  message: 'Operation successful',
  data: result 
});

// Error response
res.status(400).json({ 
  message: 'Error description',
  errors: validationErrors 
});
```

### Frontend API Call Pattern
```javascript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: auth.getAuthHeaders(),
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (response.ok) {
    // Handle success
  } else {
    auth.showAlert(result.message, 'danger');
  }
} catch (error) {
  auth.showAlert('Network error', 'danger');
}
```

## Feature Implementation Notes

### Job Search & Filtering
- Implement full-text search on job titles and descriptions
- Support multiple filter combinations
- Use proper SQL indexing for performance
- Include company information in job listings

### User Authentication Flow
- Registration creates user account with email verification
- Login returns JWT token and user data
- Frontend stores token and user info in localStorage
- All protected API calls include Authorization header

### Application Process
- Job seekers can apply with optional cover letter
- Employers can view and manage applications
- Track application status changes
- Prevent duplicate applications

### Company Management
- Employers can create and manage one company profile
- Company profiles include logo, description, and stats
- Link jobs to companies for proper attribution

## Testing Guidelines
- Test all API endpoints with various input scenarios
- Verify authentication and authorization flows
- Test responsive design on different screen sizes
- Validate error handling and edge cases
- Check SQL injection and XSS prevention

## Deployment Considerations
- Set proper environment variables for production
- Use HTTPS in production
- Configure proper CORS origins
- Set up database connection pooling
- Implement proper logging for debugging
