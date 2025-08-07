// Comprehensive Job Database for FlexJobs
// This will be the central source for all job data across the site

const JOBS_DATABASE = [
    // Job 1 - Microsoft
    {
        id: 1,
        title: "Senior Software Engineer - Remote",
        company_name: "Microsoft",
        company_logo: "images/companies/microsoft.webp",
        location: "Remote, USA",
        salary_min: 120000,
        salary_max: 180000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Senior",
        category: "Computer & IT",
        skills: ["JavaScript", "React", "Node.js", "Azure", "TypeScript"],
        description: "Join Microsoft's engineering team to build cutting-edge cloud solutions. Work with modern technologies and contribute to products used by millions worldwide. Competitive benefits, flexible work arrangements, and opportunities for professional growth.",
        requirements: [
            "5+ years of software development experience",
            "Strong proficiency in JavaScript/TypeScript",
            "Experience with cloud platforms (preferably Azure)",
            "Bachelor's degree in Computer Science or related field"
        ],
        benefits: ["Health Insurance", "401k Matching", "Stock Options", "Flexible PTO", "Home Office Stipend"],
        created_at: "2025-08-05T10:00:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://careers.microsoft.com/apply",
        views_count: 2847
    },

    // Job 2 - Google
    {
        id: 2,
        title: "Product Marketing Manager - Flexible",
        company_name: "Google",
        company_logo: "images/companies/google.webp",
        location: "Mountain View, CA / Remote",
        salary_min: 140000,
        salary_max: 200000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Marketing",
        skills: ["Product Marketing", "Analytics", "Go-to-Market", "Strategy", "Communication"],
        description: "Drive product marketing initiatives for Google's enterprise solutions. Collaborate with cross-functional teams to launch products that impact millions of users. Hybrid work model with flexible scheduling options.",
        requirements: [
            "4+ years of product marketing experience",
            "Experience with B2B software products",
            "Strong analytical and communication skills",
            "MBA or equivalent experience preferred"
        ],
        benefits: ["Comprehensive Health Coverage", "Retirement Plan", "Stock Program", "Learning Stipend", "Wellness Programs"],
        created_at: "2025-08-04T14:30:00Z",
        is_featured: false,
        is_new: true,
        application_url: "https://careers.google.com/apply",
        views_count: 1923
    },

    // Job 3 - CDOT Database (Product Engagement Associate)
    {
        id: 3,
        title: "Product Engagement Associate",
        company_name: "CDOT Database",
        company_logo: "images/companies/CDOT.png",
        location: "Denver, CO / Remote",
        salary_min: 65000,
        salary_max: 85000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Entry-level",
        category: "Product Management",
        skills: ["Customer Engagement", "Product Analytics", "CRM", "Data Analysis", "Communication"],
        description: "Join CDOT Database's growing product team as a Product Engagement Associate. You'll work directly with customers to understand their needs, analyze product usage patterns, and help drive product improvements that enhance user experience.",
        requirements: [
            "1-3 years of customer-facing experience",
            "Strong analytical and communication skills",
            "Experience with CRM systems and data analysis",
            "Bachelor's degree preferred"
        ],
        benefits: ["Health Insurance", "Dental & Vision", "401k", "Flexible Work Hours", "Professional Development"],
        created_at: "2025-08-04T09:15:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://cdotdatabase.com/careers/apply",
        views_count: 856
    },

    // Job 4 - Amazon
    {
        id: 4,
        title: "Content Writer - Remote Opportunities",
        company_name: "Amazon",
        company_logo: "images/companies/amazon.webp",
        location: "Remote, USA",
        salary_min: 55000,
        salary_max: 75000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Mid-level",
        category: "Writing & Editing",
        skills: ["Content Writing", "SEO", "Research", "Editing", "Content Strategy"],
        description: "Create compelling content for Amazon's various business units. Work remotely while collaborating with teams across different time zones. Opportunity to impact millions of customers through your writing.",
        requirements: [
            "3+ years of content writing experience",
            "Portfolio of published work",
            "SEO knowledge and best practices",
            "Excellent research and editing skills"
        ],
        benefits: ["Medical Coverage", "Stock Purchase Plan", "Career Development", "Remote Work Stipend"],
        created_at: "2025-08-03T16:45:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://amazon.jobs/apply",
        views_count: 1456
    },

    // Job 5 - Salesforce
    {
        id: 5,
        title: "Customer Success Manager - SaaS",
        company_name: "Salesforce",
        company_logo: "images/companies/salesforce-logo.png",
        location: "San Francisco, CA / Remote",
        salary_min: 80000,
        salary_max: 110000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Customer Service",
        skills: ["Customer Success", "SaaS", "Account Management", "Salesforce CRM", "Relationship Building"],
        description: "Drive customer success and growth for Salesforce's enterprise clients. Manage a portfolio of accounts and help customers maximize their ROI with our platform. Flexible work arrangement with occasional travel.",
        requirements: [
            "3+ years in customer success or account management",
            "Experience with SaaS products",
            "Strong communication and presentation skills",
            "Salesforce certification preferred"
        ],
        benefits: ["Health & Wellness", "Equity Program", "Volunteer Time Off", "Learning Budget", "Flexible Work"],
        created_at: "2025-08-03T11:20:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://salesforce.wd1.myworkdayjobs.com/apply",
        views_count: 1234
    },

    // Job 6 - CDOT Database (Product Engagement Advisor)
    {
        id: 6,
        title: "Product Engagement Advisor",
        company_name: "CDOT Database",
        company_logo: "images/companies/CDOT.png",
        location: "Remote, USA",
        salary_min: 75000,
        salary_max: 95000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Mid-level",
        category: "Consulting",
        skills: ["Product Strategy", "Customer Advisory", "Stakeholder Management", "Analytics", "Presentation"],
        description: "As a Product Engagement Advisor at CDOT Database, you'll serve as a strategic partner to our key clients, helping them optimize their use of our database solutions. You'll provide expert guidance on product features, implementation best practices, and strategic roadmap planning.",
        requirements: [
            "3-5 years of consulting or advisory experience",
            "Strong presentation and communication skills",
            "Experience with database technologies",
            "Ability to work independently in remote environment"
        ],
        benefits: ["Full Remote Work", "Health Insurance", "401k Match", "Annual Bonus", "Tech Stipend"],
        created_at: "2025-08-02T13:30:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://cdotdatabase.com/careers/advisor",
        views_count: 723
    },

    // Job 7 - Meta
    {
        id: 7,
        title: "Data Analyst - Growth Team",
        company_name: "Meta",
        company_logo: "images/companies/meta-logo.png",
        location: "Menlo Park, CA / Remote",
        salary_min: 95000,
        salary_max: 135000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Data Entry",
        skills: ["SQL", "Python", "Data Visualization", "Statistical Analysis", "A/B Testing"],
        description: "Join Meta's Growth team to analyze user behavior and drive product improvements. Work with massive datasets to uncover insights that impact billions of users across our family of apps.",
        requirements: [
            "2+ years of data analysis experience",
            "Proficiency in SQL and Python",
            "Experience with statistical analysis",
            "Strong problem-solving skills"
        ],
        benefits: ["Health Coverage", "Stock Options", "Meal Credits", "Gym Membership", "Learning Budget"],
        created_at: "2025-08-02T08:45:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://www.metacareers.com/apply",
        views_count: 1876
    },

    // Job 8 - Shopify
    {
        id: 8,
        title: "UX Designer - E-commerce Platform",
        company_name: "Shopify",
        company_logo: "images/companies/shopify-logo.png",
        location: "Ottawa, ON / Remote",
        salary_min: 85000,
        salary_max: 115000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Mid-level",
        category: "Art & Creative",
        skills: ["UX Design", "Figma", "User Research", "Prototyping", "Design Systems"],
        description: "Shape the future of e-commerce by designing intuitive experiences for Shopify's platform. Work with a distributed team to create solutions that empower entrepreneurs worldwide.",
        requirements: [
            "3+ years of UX design experience",
            "Portfolio demonstrating design process",
            "Experience with design tools (Figma, Sketch)",
            "Understanding of e-commerce principles"
        ],
        benefits: ["Health & Dental", "Stock Options", "Learning Fund", "Flexible Schedule", "Equipment Allowance"],
        created_at: "2025-08-01T15:20:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://www.shopify.com/careers/apply",
        views_count: 1567
    },

    // Job 9 - CDOT Database (Product Insurance Officer)
    {
        id: 9,
        title: "Product Insurance Officer",
        company_name: "CDOT Database",
        company_logo: "images/companies/CDOT.png",
        location: "Denver, CO / Hybrid",
        salary_min: 70000,
        salary_max: 90000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Insurance",
        skills: ["Risk Assessment", "Insurance Products", "Compliance", "Data Analysis", "Client Relations"],
        description: "Oversee insurance coverage for CDOT Database's product portfolio. Ensure comprehensive risk management while developing innovative insurance solutions for our technology products and client implementations.",
        requirements: [
            "2-4 years of insurance industry experience",
            "Knowledge of technology risk assessment",
            "Strong analytical and communication skills",
            "Insurance certification preferred"
        ],
        benefits: ["Health Insurance", "Life Insurance", "401k", "Hybrid Work", "Professional Development"],
        created_at: "2025-08-01T10:15:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://cdotdatabase.com/careers/insurance",
        views_count: 645
    },

    // Job 10 - Netflix
    {
        id: 10,
        title: "Content Operations Specialist",
        company_name: "Netflix",
        company_logo: "images/companies/netflix-logo.png",
        location: "Los Angeles, CA / Remote",
        salary_min: 75000,
        salary_max: 105000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Media & Entertainment",
        skills: ["Content Management", "Project Coordination", "Quality Assurance", "Data Analysis", "Communication"],
        description: "Support Netflix's global content operations by managing content workflows, ensuring quality standards, and coordinating with international teams. Be part of the team that brings entertainment to 200+ million members worldwide.",
        requirements: [
            "2+ years in content or media operations",
            "Strong project management skills",
            "Attention to detail and quality focus",
            "Experience with content management systems"
        ],
        benefits: ["Unlimited PTO", "Health Coverage", "Stock Options", "Content Allowance", "Flexible Work"],
        created_at: "2025-07-31T14:30:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://jobs.netflix.com/apply",
        views_count: 1345
    },

    // Job 11 - Atlassian
    {
        id: 11,
        title: "Technical Writer - Developer Documentation",
        company_name: "Atlassian",
        company_logo: "images/companies/atlassian-logo.png",
        location: "Sydney, AU / Remote",
        salary_min: 70000,
        salary_max: 95000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Mid-level",
        category: "Writing & Editing",
        skills: ["Technical Writing", "API Documentation", "Markdown", "Git", "Developer Tools"],
        description: "Create comprehensive documentation for Atlassian's developer tools and APIs. Work remotely with engineering teams to translate complex technical concepts into clear, actionable documentation.",
        requirements: [
            "3+ years of technical writing experience",
            "Experience documenting APIs and developer tools",
            "Familiarity with Git and Markdown",
            "Strong collaboration skills"
        ],
        benefits: ["Health & Wellness", "Equity Program", "Learning Budget", "Remote Work Setup", "Flexible Hours"],
        created_at: "2025-07-31T09:45:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://www.atlassian.com/company/careers/apply",
        views_count: 1123
    },

    // Job 12 - CDOT Database (Senior Product Engagement Specialist)
    {
        id: 12,
        title: "Senior Product Engagement Specialist",
        company_name: "CDOT Database",
        company_logo: "images/companies/CDOT.png",
        location: "Remote, USA",
        salary_min: 85000,
        salary_max: 110000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Senior",
        category: "Product Management",
        skills: ["Product Strategy", "User Engagement", "Analytics", "Team Leadership", "Cross-functional Collaboration"],
        description: "Lead product engagement initiatives across CDOT Database's entire product suite. Drive user adoption, retention, and satisfaction through data-driven strategies and cross-functional collaboration. Mentor junior team members and shape our engagement methodology.",
        requirements: [
            "5+ years of product or engagement experience",
            "Leadership and mentoring experience",
            "Strong analytical and strategic thinking",
            "Experience with engagement platforms and tools"
        ],
        benefits: ["Competitive Salary", "Full Remote", "Equity Package", "Health Benefits", "Leadership Development"],
        created_at: "2025-07-30T16:20:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://cdotdatabase.com/careers/senior-specialist",
        views_count: 892
    },

    // Job 13 - Spotify
    {
        id: 13,
        title: "Data Engineer - Music Intelligence",
        company_name: "Spotify",
        company_logo: "images/companies/spotify-logo.png",
        location: "Stockholm, SE / Remote",
        salary_min: 90000,
        salary_max: 125000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Computer & IT",
        skills: ["Python", "Apache Spark", "Data Pipeline", "Machine Learning", "SQL"],
        description: "Build data pipelines that power Spotify's music recommendation algorithms. Work with petabytes of data to help millions of users discover their next favorite song.",
        requirements: [
            "3+ years of data engineering experience",
            "Proficiency in Python and Spark",
            "Experience with large-scale data processing",
            "Knowledge of machine learning concepts"
        ],
        benefits: ["Health Insurance", "Spotify Premium", "Wellness Allowance", "Parental Leave", "Flexible Work"],
        created_at: "2025-07-30T11:15:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://www.lifeatspotify.com/apply",
        views_count: 1567
    },

    // Job 14 - Zoom
    {
        id: 14,
        title: "Sales Development Representative",
        company_name: "Zoom",
        company_logo: "images/companies/zoom-logo.png",
        location: "San Jose, CA / Remote",
        salary_min: 50000,
        salary_max: 70000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Entry-level",
        category: "Sales",
        skills: ["Lead Generation", "Cold Calling", "CRM", "Sales Prospecting", "Communication"],
        description: "Generate qualified leads for Zoom's enterprise sales team. Develop relationships with potential customers and help them understand how Zoom can transform their business communications.",
        requirements: [
            "1+ year of sales or business development experience",
            "Strong communication and interpersonal skills",
            "Experience with CRM systems",
            "Self-motivated and goal-oriented"
        ],
        benefits: ["Base + Commission", "Health Coverage", "Stock Purchase Plan", "Career Development", "Remote First"],
        created_at: "2025-07-29T13:40:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://zoom.wd5.myworkdayjobs.com/apply",
        views_count: 934
    },

    // Job 15 - CDOT Database (Product Engagement Manager)
    {
        id: 15,
        title: "Product Engagement Manager",
        company_name: "CDOT Database",
        company_logo: "images/companies/CDOT.png",
        location: "Denver, CO / Remote",
        salary_min: 95000,
        salary_max: 125000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Senior",
        category: "Management",
        skills: ["Team Management", "Product Strategy", "Customer Success", "Analytics", "Stakeholder Management"],
        description: "Lead CDOT Database's Product Engagement team to drive customer success and product adoption. Develop engagement strategies, manage team performance, and work closely with product and engineering teams to enhance user experience.",
        requirements: [
            "5+ years of product or customer success management",
            "Experience managing teams of 3-5 people",
            "Strong analytical and strategic thinking skills",
            "Excellent communication and leadership abilities"
        ],
        benefits: ["Management Bonus", "Health Benefits", "Hybrid Work", "Stock Options", "Leadership Training"],
        created_at: "2025-07-29T08:25:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://cdotdatabase.com/careers/manager",
        views_count: 756
    },

    // Job 16 - Stripe
    {
        id: 16,
        title: "Financial Analyst - Revenue Operations",
        company_name: "Stripe",
        company_logo: "images/companies/stripe-logo.png",
        location: "San Francisco, CA / Remote",
        salary_min: 85000,
        salary_max: 115000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Accounting & Finance",
        skills: ["Financial Analysis", "Excel", "SQL", "Revenue Recognition", "Financial Modeling"],
        description: "Analyze financial data to support Stripe's revenue operations and strategic decision-making. Work with large datasets to provide insights that drive business growth.",
        requirements: [
            "2+ years of financial analysis experience",
            "Strong Excel and SQL skills",
            "Experience with revenue recognition",
            "CPA or finance degree preferred"
        ],
        benefits: ["Competitive Salary", "Equity Package", "Health Coverage", "Commuter Benefits", "Learning Budget"],
        created_at: "2025-07-28T15:50:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://stripe.com/jobs/apply",
        views_count: 1245
    },

    // Job 17 - Slack
    {
        id: 17,
        title: "Customer Support Specialist - Enterprise",
        company_name: "Slack",
        company_logo: "images/companies/slack-logo.png",
        location: "Remote, Global",
        salary_min: 55000,
        salary_max: 75000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Mid-level",
        category: "Customer Service",
        skills: ["Customer Support", "Technical Troubleshooting", "Enterprise Software", "Communication", "Problem Solving"],
        description: "Provide exceptional support to Slack's enterprise customers. Help solve complex technical issues and ensure customers get maximum value from our platform.",
        requirements: [
            "2+ years of customer support experience",
            "Experience with enterprise software",
            "Strong technical troubleshooting skills",
            "Excellent written and verbal communication"
        ],
        benefits: ["Global Remote", "Health Benefits", "Professional Development", "Flexible Schedule", "Slack Credits"],
        created_at: "2025-07-28T10:30:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://slack.com/careers/apply",
        views_count: 1089
    },

    // Job 18 - CDOT Database (Junior Product Engagement Analyst)
    {
        id: 18,
        title: "Junior Product Engagement Analyst",
        company_name: "CDOT Database",
        company_logo: "images/companies/CDOT.png",
        location: "Remote, USA",
        salary_min: 55000,
        salary_max: 70000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Entry-level",
        category: "Data Entry",
        skills: ["Data Analysis", "Excel", "SQL", "Product Analytics", "Reporting"],
        description: "Start your career in product analytics with CDOT Database. Analyze user engagement data, create reports, and support data-driven decision making across our product teams. Great opportunity for recent graduates or career changers.",
        requirements: [
            "0-2 years of data analysis experience",
            "Strong Excel and basic SQL skills",
            "Analytical mindset and attention to detail",
            "Bachelor's degree in relevant field"
        ],
        benefits: ["Entry-level Friendly", "Full Remote", "Mentorship Program", "Health Benefits", "Growth Opportunities"],
        created_at: "2025-07-27T14:15:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://cdotdatabase.com/careers/junior-analyst",
        views_count: 623
    },

    // Job 19 - Airbnb
    {
        id: 19,
        title: "Community Manager - Host Relations",
        company_name: "Airbnb",
        company_logo: "images/companies/airbnb-logo.png",
        location: "San Francisco, CA / Remote",
        salary_min: 70000,
        salary_max: 95000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Communications",
        skills: ["Community Management", "Social Media", "Content Creation", "Relationship Building", "Communication"],
        description: "Build and nurture relationships with Airbnb's host community. Create engaging content, manage online communities, and help hosts succeed on our platform.",
        requirements: [
            "3+ years of community management experience",
            "Strong social media and content skills",
            "Experience in hospitality or travel industry preferred",
            "Excellent communication skills"
        ],
        benefits: ["Travel Credits", "Health Coverage", "Flexible Work", "Professional Development", "Equity Program"],
        created_at: "2025-07-27T09:40:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://careers.airbnb.com/apply",
        views_count: 1456
    },

    // Job 20 - Tesla
    {
        id: 20,
        title: "Operations Coordinator - Remote Manufacturing Support",
        company_name: "Tesla",
        company_logo: "images/companies/tesla-logo.png",
        location: "Austin, TX / Remote",
        salary_min: 65000,
        salary_max: 85000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "hybrid",
        experience_level: "Mid-level",
        category: "Operations",
        skills: ["Operations Management", "Data Analysis", "Project Coordination", "Process Improvement", "Communication"],
        description: "Support Tesla's manufacturing operations remotely by coordinating projects, analyzing production data, and implementing process improvements. Help accelerate the world's transition to sustainable energy.",
        requirements: [
            "2+ years of operations or manufacturing experience",
            "Strong analytical and problem-solving skills",
            "Experience with project management",
            "Knowledge of manufacturing processes preferred"
        ],
        benefits: ["Stock Purchase Plan", "Health Coverage", "Flexible Work", "Learning Opportunities", "Mission-Driven Work"],
        created_at: "2025-07-26T16:25:00Z",
        is_featured: false,
        is_new: false,
        application_url: "https://www.tesla.com/careers/apply",
        views_count: 1789
    },

    // Job 21 - CDOT Database (Product Engagement Coordinator)
    {
        id: 21,
        title: "Product Engagement Coordinator",
        company_name: "CDOT Database",
        company_logo: "images/companies/CDOT.png",
        location: "Remote, USA",
        salary_min: 60000,
        salary_max: 75000,
        salary_type: "annual",
        job_type: "Full-time",
        remote_type: "fully_remote",
        experience_level: "Entry-level",
        category: "Project Management",
        skills: ["Project Coordination", "Customer Communication", "Data Tracking", "Process Documentation", "Team Collaboration"],
        description: "Coordinate product engagement initiatives across CDOT Database's customer base. Support senior team members in executing engagement strategies, managing customer communications, and tracking success metrics.",
        requirements: [
            "1-2 years of project coordination experience",
            "Strong organizational and communication skills",
            "Experience with project management tools",
            "Customer service background preferred"
        ],
        benefits: ["Full Remote Work", "Health Insurance", "Professional Development", "Mentorship", "Career Growth Path"],
        created_at: "2025-07-26T11:50:00Z",
        is_featured: true,
        is_new: true,
        application_url: "https://cdotdatabase.com/careers/coordinator",
        views_count: 567
    }
];

// Helper functions for job data management
const JobsDatabase = {
    // Get all jobs
    getAllJobs() {
        return JOBS_DATABASE;
    },

    // Get jobs with pagination
    getJobsPaginated(page = 1, limit = 12) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const jobs = JOBS_DATABASE.slice(startIndex, endIndex);
        
        return {
            jobs,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(JOBS_DATABASE.length / limit),
                total_jobs: JOBS_DATABASE.length,
                jobs_per_page: limit,
                has_next: endIndex < JOBS_DATABASE.length,
                has_previous: page > 1
            }
        };
    },

    // Get job by ID
    getJobById(id) {
        return JOBS_DATABASE.find(job => job.id === parseInt(id));
    },

    // Get jobs by company
    getJobsByCompany(companyName) {
        return JOBS_DATABASE.filter(job => 
            job.company_name.toLowerCase() === companyName.toLowerCase()
        );
    },

    // Get featured jobs
    getFeaturedJobs(limit = 6) {
        return JOBS_DATABASE.filter(job => job.is_featured).slice(0, limit);
    },

    // Get recent jobs
    getRecentJobs(limit = 10) {
        return JOBS_DATABASE
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    },

    // Search jobs
    searchJobs(query, filters = {}) {
        let results = JOBS_DATABASE;

        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(job =>
                job.title.toLowerCase().includes(searchTerm) ||
                job.company_name.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm) ||
                job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
            );
        }

        // Apply filters
        if (filters.category) {
            results = results.filter(job => job.category === filters.category);
        }

        if (filters.remote_type) {
            results = results.filter(job => job.remote_type === filters.remote_type);
        }

        if (filters.experience_level) {
            results = results.filter(job => job.experience_level === filters.experience_level);
        }

        if (filters.salary_min) {
            results = results.filter(job => job.salary_min >= parseInt(filters.salary_min));
        }

        if (filters.location) {
            results = results.filter(job => 
                job.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        return results;
    },

    // Get unique categories
    getCategories() {
        const categories = [...new Set(JOBS_DATABASE.map(job => job.category))];
        return categories.sort();
    },

    // Get unique locations
    getLocations() {
        const locations = [...new Set(JOBS_DATABASE.map(job => job.location))];
        return locations.sort();
    },

    // Get unique companies
    getCompanies() {
        const companies = [...new Set(JOBS_DATABASE.map(job => job.company_name))];
        return companies.sort();
    },

    // Get CDOT Database jobs specifically
    getCDOTJobs() {
        return JOBS_DATABASE.filter(job => job.company_name === "CDOT Database");
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JOBS_DATABASE, JobsDatabase };
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.JOBS_DATABASE = JOBS_DATABASE;
    window.JobsDatabase = JobsDatabase;
}
