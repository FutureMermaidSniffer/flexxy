 # FlexJobs - Remote Job Board

A full-stack web application for finding and posting remote jobs, built with Node.js, Express, MySQL, and Bootstrap.

## Features

### For Job Seekers
- 🔍 **Advanced Job Search** - Filter by location, job type, remote options, experience level
- 💾 **Save Jobs** - Bookmark interesting positions for later
- 📝 **Easy Applications** - Apply directly through the platform
- 📊 **Application Tracking** - Monitor your application status
- 👤 **User Profile** - Manage your professional information

### For Employers
- 📋 **Post Jobs** - Create detailed job listings
- 🏢 **Company Profiles** - Showcase your organization
- 👥 **Manage Applications** - Review and respond to candidates
- 📈 **Analytics** - Track job performance and applications

### General Features
- 🔐 **Secure Authentication** - JWT-based user authentication
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized for speed
- 🛡️ **Security** - Rate limiting, input validation, and more

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **Bootstrap 5** - CSS framework
- **JavaScript (ES6+)** - Client-side logic
- **Font Awesome** - Icons

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd flexjobs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database named `flexjobs_db`
   - Run the SQL script to create tables:
     ```bash
     mysql -u your_username -p flexjobs_db < database/schema.sql
     ```

4. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret:
     ```env
     NODE_ENV=development
     PORT=3003
     
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=flexjobs_db
     
     JWT_SECRET=your_super_secret_jwt_key_here
     ```

5. **Start the application**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and go to `http://localhost:3003`

## Database Schema

### Core Tables

#### Users
- Stores user accounts (job seekers, employers, admins)
- Includes profile information and authentication data

#### Companies
- Company profiles created by employers
- Links to the user who owns the company

#### Jobs
- Job listings with detailed information
- Links to companies and categories
- Tracks views and applications

#### Applications
- Job applications submitted by users
- Tracks application status and includes cover letters

#### Categories
- Job categories for better organization
- Pre-populated with common job types

### Relationships
- **Users → Companies** (1:1) - Employers can create one company
- **Companies → Jobs** (1:N) - Companies can post multiple jobs
- **Jobs → Applications** (1:N) - Jobs can receive multiple applications
- **Users → Applications** (1:N) - Users can submit multiple applications
- **Users → Saved Jobs** (M:N) - Users can save multiple jobs

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/verify` - Verify JWT token

### Jobs
- `GET /api/jobs` - Get jobs with filtering and pagination
- `GET /api/jobs/:id` - Get single job details
- `POST /api/jobs` - Create new job (employers only)
- `PUT /api/jobs/:id` - Update job (employers only)
- `DELETE /api/jobs/:id` - Delete job (employers only)
- `GET /api/jobs/categories/list` - Get job categories

### Companies
- `GET /api/companies` - Get companies with pagination
- `GET /api/companies/:id` - Get single company details
- `POST /api/companies` - Create company (employers only)
- `PUT /api/companies/:id` - Update company (employers only)
- `GET /api/companies/featured/list` - Get featured companies

### Applications
- `POST /api/applications/apply` - Apply for a job
- `GET /api/applications/job/:jobId` - Get applications for a job (employers)
- `PUT /api/applications/:id/status` - Update application status (employers)
- `DELETE /api/applications/:id` - Withdraw application (job seekers)
- `POST /api/applications/save-job` - Save a job
- `DELETE /api/applications/save-job/:jobId` - Unsave a job

## Development

### Project Structure
```
flexjobs/
├── backend/
│   ├── routes/          # API route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models (future)
│   └── database.js      # Database connection and utilities
├── frontend/
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── images/         # Static images
│   └── index.html      # Main HTML file
├── database/
│   └── schema.sql      # Database schema
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

### Adding New Features

1. **Backend**: Add routes in `backend/routes/`
2. **Frontend**: Add functionality in `frontend/js/`
3. **Database**: Update schema in `database/schema.sql`
4. **Styling**: Add CSS in `frontend/css/style.css`

## Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - express-validator for all inputs
- **Rate Limiting** - Prevents brute force attacks
- **CORS Protection** - Configured for security
- **Helmet** - Sets various HTTP headers for security
- **SQL Injection Prevention** - Parameterized queries

## Performance Optimizations

- **Database Indexing** - Strategic indexes for common queries
- **Connection Pooling** - Efficient database connections
- **Pagination** - Large datasets are paginated
- **Caching Headers** - Static assets are cached
- **Minified Assets** - CSS and JS are optimized

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@flexjobs.com or create an issue in the repository.

## Roadmap

### Upcoming Features
- [ ] Email notifications for applications
- [ ] Advanced search filters
- [ ] Company reviews and ratings
- [ ] Resume upload and parsing
- [ ] Integration with LinkedIn
- [ ] Mobile app
- [ ] Analytics dashboard for employers
- [ ] Salary insights and trends

### Version History
- **v1.0.0** - Initial release with core functionality
