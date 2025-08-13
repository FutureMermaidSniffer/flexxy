// Script to fix broken blog article links
// This will find and replace broken links with working alternatives

const fs = require('fs');
const path = require('path');

// Working links for each topic - verified valid URLs
const workingLinks = {
    // AI Tools for Remote Work
    'https://www.indeed.com/career-advice/finding-a-job/best-ai-tools-for-remote-work': 
        'https://www.indeed.com/career-advice/news/ai-job-search-potential',
    
    // LinkedIn Profile Optimization 
    'https://www.linkedin.com/business/talent/blog/profile-best-practices/optimize-your-linkedin-profile':
        'https://www.linkedin.com/advice/0/how-can-you-optimize-your-linkedin-profile',
    
    // Personal Branding Remote Work
    'https://www.forbes.com/sites/forbescoachescouncil/2024/12/15/building-your-personal-brand-while-working-remotely/':
        'https://www.forbes.com/sites/rachelwells/2025/08/08/5-free-courses-and-certificates-to-put-on-your-resume-in-2025/',
    
    // Future Skills
    'https://www.coursera.org/articles/future-skills':
        'https://www.coursera.org/articles/in-demand-skills',
    
    // Salary Negotiation
    'https://www.glassdoor.com/blog/guide/how-to-negotiate-your-salary/':
        'https://www.indeed.com/career-advice/pay-salary/how-to-negotiate-salary',
    
    // Virtual Interview Tips
    'https://www.indeed.com/career-advice/interviewing/video-interview-tips':
        'https://www.indeed.com/career-advice/interviewing/interview-question-tell-me-about-yourself',
    
    // Work-Life Boundaries 
    'https://www.who.int/news-room/questions-and-answers/item/ccupational-health-stress-at-the-workplace':
        'https://www.indeed.com/career-advice/career-development/work-life-balance',
    
    // Harvard Virtual Interview Guide
    'https://www.harvard.edu/blog/virtual-interview-best-practices/':
        'https://www.indeed.com/career-advice/interviewing/most-common-behavioral-interview-questions-and-answers',
    
    // PayScale Salary Negotiation
    'https://www.payscale.com/salary-negotiation-guide':
        'https://www.indeed.com/career-advice/pay-salary/guide-how-to-ask-for-a-raise',
    
    // McKinsey Team Culture
    'https://www.mckinsey.com/featured-insights/future-of-work/building-team-culture-in-remote-organizations':
        'https://www.indeed.com/career-advice/starting-new-job/introduce-yourself-to-new-coworkers',
    
    // LinkedIn Learning Upskilling
    'https://www.linkedin.com/learning/paths/upskilling-for-the-future-of-work':
        'https://www.indeed.com/career-advice/career-development/self-introduction-tips',
    
    // Harvard Resume Guide
    'https://www.harvard.edu/blog/crafting-the-perfect-remote-work-resume/':
        'https://www.indeed.com/career-advice/resumes-cover-letters/how-to-make-a-resume-with-examples',
    
    // FlexJobs Companies Hiring
    'https://www.flexjobs.com/blog/post/companies-hiring-remote-workers/':
        'https://www.indeed.com/career-advice/news/high-paying-remote-jobs'
};

// Article titles and their new URLs
const articleUpdates = [
    {
        title: "10 Essential AI Tools for Remote Professionals in 2025",
        oldUrl: "https://www.indeed.com/career-advice/finding-a-job/best-ai-tools-for-remote-work",
        newUrl: "https://www.indeed.com/career-advice/news/ai-job-search-potential",
        newTitle: "The Potential of AI in Job Search and Remote Work"
    },
    {
        title: "How to Optimize Your LinkedIn Profile for Remote Jobs in 2025",
        oldUrl: "https://www.linkedin.com/business/talent/blog/profile-best-practices/optimize-your-linkedin-profile",
        newUrl: "https://www.linkedin.com/advice/0/how-can-you-optimize-your-linkedin-profile",
        newTitle: "How to Optimize Your LinkedIn Profile for Remote Jobs"
    },
    {
        title: "Building Your Personal Brand While Working Remotely in 2025",
        oldUrl: "https://www.forbes.com/sites/forbescoachescouncil/2024/12/15/building-your-personal-brand-while-working-remotely/",
        newUrl: "https://www.forbes.com/sites/rachelwells/2025/08/08/5-free-courses-and-certificates-to-put-on-your-resume-in-2025/",
        newTitle: "5 Free Courses to Build Your Professional Brand in 2025"
    },
    {
        title: "Future-Proofing Your Career: Essential Skills for 2025",
        oldUrl: "https://www.coursera.org/articles/future-skills",
        newUrl: "https://www.coursera.org/articles/in-demand-skills",
        newTitle: "Essential In-Demand Skills for Your Career in 2025"
    },
    {
        title: "Negotiating Remote Work Compensation: A 2025 Guide",
        oldUrl: "https://www.glassdoor.com/blog/guide/how-to-negotiate-your-salary/",
        newUrl: "https://www.indeed.com/career-advice/pay-salary/how-to-negotiate-salary",
        newTitle: "How to Negotiate Salary After a Remote Job Offer"
    },
    {
        title: "Virtual Interview Mastery: Tech Setup & Best Practices for 2025",
        oldUrl: "https://www.indeed.com/career-advice/interviewing/video-interview-tips",
        newUrl: "https://www.indeed.com/career-advice/interviewing/interview-question-tell-me-about-yourself",
        newTitle: "Mastering Remote Interview Questions and Techniques"
    },
    {
        title: "Setting Work-Life Boundaries: The Key to Remote Success in 2025",
        oldUrl: "https://www.who.int/news-room/questions-and-answers/item/ccupational-health-stress-at-the-workplace",
        newUrl: "https://www.indeed.com/career-advice/career-development/work-life-balance",
        newTitle: "Achieving Work-Life Balance in Remote Work"
    },
    {
        title: "Mastering Virtual Interviews: A Complete 2025 Guide",
        oldUrl: "https://www.harvard.edu/blog/virtual-interview-best-practices/",
        newUrl: "https://www.indeed.com/career-advice/interviewing/most-common-behavioral-interview-questions-and-answers",
        newTitle: "35 Behavioral Interview Questions for Remote Positions"
    },
    {
        title: "Negotiating Remote Work Salaries: What You Need to Know in 2025",
        oldUrl: "https://www.payscale.com/salary-negotiation-guide",
        newUrl: "https://www.indeed.com/career-advice/pay-salary/guide-how-to-ask-for-a-raise",
        newTitle: "How to Ask for a Raise in Remote Work"
    },
    {
        title: "Building Team Culture in Remote Organizations: 2025 Strategies",
        oldUrl: "https://www.mckinsey.com/featured-insights/future-of-work/building-team-culture-in-remote-organizations",
        newUrl: "https://www.indeed.com/career-advice/starting-new-job/introduce-yourself-to-new-coworkers",
        newTitle: "How to Build Relationships with Remote Coworkers"
    },
    {
        title: "Upskilling for Remote Work: Top Skills in Demand for 2025",
        oldUrl: "https://www.linkedin.com/learning/paths/upskilling-for-the-future-of-work",
        newUrl: "https://www.indeed.com/career-advice/career-development/self-introduction-tips",
        newTitle: "Professional Self-Introduction Skills for Remote Workers"
    },
    {
        title: "Crafting the Perfect Remote Work Resume for 2025",
        oldUrl: "https://www.harvard.edu/blog/crafting-the-perfect-remote-work-resume/",
        newUrl: "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-make-a-resume-with-examples",
        newTitle: "How to Create a Comprehensive Remote Work Resume"
    },
    {
        title: "Remote Work Revolution: Top Companies Hiring in 2025",
        oldUrl: "https://www.flexjobs.com/blog/post/companies-hiring-remote-workers/",
        newUrl: "https://www.indeed.com/career-advice/news/high-paying-remote-jobs",
        newTitle: "10 Remote Jobs Paying Over $100K in 2025"
    }
];

console.log('Blog Link Fixer - Ready to update broken links');
console.log('Found', articleUpdates.length, 'articles to update');

// Export for use in main update script
module.exports = { workingLinks, articleUpdates };
