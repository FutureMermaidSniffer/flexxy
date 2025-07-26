# Header and Footer Components Integration Guide

## Overview
This guide explains how to integrate the newly created header and footer components into all 5 pages of the FlexJobs website. The components are designed with device-specific patterns for optimal mobile and desktop experiences.

## Component Structure
```
frontend/
├── components/
│   ├── header/
│   │   ├── header.html      # Header HTML structure
│   │   ├── header.css       # Header styles (mobile + desktop)
│   │   └── header.js        # Header functionality
│   └── footer/
│       ├── footer.html      # Footer HTML structure
│       ├── footer.css       # Footer styles (mobile + desktop)
│       └── footer.js        # Footer functionality
├── css/
│   └── components/
│       ├── header.css       # Symlinked to components/header/header.css
│       └── footer.css       # Symlinked to components/footer/footer.css
└── js/
    └── components/
        ├── header.js        # Symlinked to components/header/header.js
        └── footer.js        # Symlinked to components/footer/footer.js
```

## Integration Steps

### 1. Create Page Structure Template

Create this basic HTML structure for each page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - FlexJobs</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
    <!-- Component CSS -->
    <link rel="stylesheet" href="css/components/header.css">
    <link rel="stylesheet" href="css/components/footer.css">
</head>
<body>
    <!-- Header Component -->
    <div id="header-container"></div>
    
    <!-- Main Content -->
    <main>
        <!-- Page-specific content goes here -->
    </main>
    
    <!-- Footer Component -->
    <div id="footer-container"></div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Component JS -->
    <script src="js/components/header.js"></script>
    <script src="js/components/footer.js"></script>
    <!-- Page-specific JS -->
    <script>
        // Load header and footer components
        loadComponents();
    </script>
</body>
</html>
```

### 2. Create Component Loader Script

Add this script to load components dynamically:

```javascript
// Component Loader
async function loadComponents() {
    try {
        // Load header
        const headerResponse = await fetch('/components/header/header.html');
        const headerHTML = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHTML;
        
        // Load footer
        const footerResponse = await fetch('/components/footer/footer.html');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerHTML;
        
        // Initialize components after loading
        setTimeout(() => {
            if (window.headerInstance) {
                window.headerInstance.updateActiveNav();
            }
        }, 100);
        
    } catch (error) {
        console.error('Error loading components:', error);
        
        // Fallback: Create basic header/footer if loading fails
        createFallbackComponents();
    }
}

function createFallbackComponents() {
    // Basic fallback header
    const header = document.getElementById('header-container');
    header.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="/">FlexJobs</a>
                <div class="navbar-nav ms-auto">
                    <a class="nav-link" href="/remote-jobs">Jobs</a>
                    <a class="nav-link" href="/about">About</a>
                </div>
            </div>
        </nav>
    `;
    
    // Basic fallback footer
    const footer = document.getElementById('footer-container');
    footer.innerHTML = `
        <footer class="bg-dark text-light py-4">
            <div class="container text-center">
                <p>&copy; 2024 FlexJobs. All rights reserved.</p>
            </div>
        </footer>
    `;
}
```

### 3. Page-Specific Integration

#### Remote Jobs Page (remote-jobs.html)
```html
<!-- Add this to the head section -->
<link rel="stylesheet" href="css/components/header.css">
<link rel="stylesheet" href="css/components/footer.css">

<!-- Add this after the Bootstrap JS -->
<script src="js/components/header.js"></script>
<script src="js/components/footer.js"></script>
<script>
    loadComponents();
    
    // Set active navigation
    document.addEventListener('DOMContentLoaded', () => {
        if (window.headerInstance) {
            window.headerInstance.setActiveNav('remote-jobs');
        }
    });
</script>
```

#### About Page (about.html)
```html
<!-- Same CSS and JS includes as above -->
<script>
    loadComponents();
    
    document.addEventListener('DOMContentLoaded', () => {
        if (window.headerInstance) {
            window.headerInstance.setActiveNav('about');
        }
    });
</script>
```

#### Job Search & Career Advice Page (job-search-career-advice.html)
```html
<!-- Same CSS and JS includes as above -->
<script>
    loadComponents();
    
    document.addEventListener('DOMContentLoaded', () => {
        if (window.headerInstance) {
            window.headerInstance.setActiveNav('career-advice');
        }
    });
</script>
```

#### Events Page (events.html)
```html
<!-- Same CSS and JS includes as above -->
<script>
    loadComponents();
    
    document.addEventListener('DOMContentLoaded', () => {
        if (window.headerInstance) {
            window.headerInstance.setActiveNav('events');
        }
    });
</script>
```

#### Blog Page (blog.html)
```html
<!-- Same CSS and JS includes as above -->
<script>
    loadComponents();
    
    document.addEventListener('DOMContentLoaded', () => {
        if (window.headerInstance) {
            window.headerInstance.setActiveNav('blog');
        }
    });
</script>
```

### 4. Express.js Server Updates

Update your server to serve component files:

```javascript
// In server.js, add route for components
app.use('/components', express.static(path.join(__dirname, 'frontend/components')));

// Add specific routes for component files
app.get('/components/header/header.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/components/header/header.html'));
});

app.get('/components/footer/footer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/components/footer/footer.html'));
});
```

### 5. CSS Integration

Create symlinks or copy component CSS to the main CSS folder:

**Windows PowerShell:**
```powershell
# Create component CSS directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "frontend\css\components"

# Copy component CSS files
Copy-Item "frontend\components\header\header.css" "frontend\css\components\header.css"
Copy-Item "frontend\components\footer\footer.css" "frontend\css\components\footer.css"
```

**Or create symbolic links:**
```powershell
# Create symbolic links (requires admin privileges)
New-Item -ItemType SymbolicLink -Path "frontend\css\components\header.css" -Target "..\..\components\header\header.css"
New-Item -ItemType SymbolicLink -Path "frontend\css\components\footer.css" -Target "..\..\components\footer\footer.css"
```

### 6. JavaScript Integration

Similarly, link or copy JavaScript files:

```powershell
# Create component JS directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "frontend\js\components"

# Copy component JS files
Copy-Item "frontend\components\header\header.js" "frontend\js\components\header.js"
Copy-Item "frontend\components\footer\footer.js" "frontend\js\components\footer.js"
```

### 7. Page-Specific Customization

#### Customizing Header for Different Pages

```javascript
// Example: Customize header for job search page
document.addEventListener('DOMContentLoaded', () => {
    if (window.headerInstance) {
        // Set active navigation
        window.headerInstance.setActiveNav('remote-jobs');
        
        // Show search prominently on job pages
        window.headerInstance.expandSearchOnMobile();
        
        // Add page-specific search filters
        window.headerInstance.addCustomSearchFilters([
            { label: 'Remote Only', value: 'remote' },
            { label: 'Full Time', value: 'fulltime' }
        ]);
    }
});
```

#### Customizing Footer for Different Pages

```javascript
// Example: Customize footer for blog page
document.addEventListener('DOMContentLoaded', () => {
    if (window.footerInstance) {
        // Expand newsletter section on blog pages
        window.footerInstance.expandAccordionSection(3); // Newsletter section
        
        // Add blog-specific tracking
        window.footerInstance.trackEvent('blog_page_view');
    }
});
```

### 8. SEO and Meta Tags

Update each page with appropriate meta tags:

```html
<!-- Remote Jobs Page -->
<title>Remote Jobs - Find Flexible Work Opportunities | FlexJobs</title>
<meta name="description" content="Discover remote job opportunities across various industries. Find your perfect flexible work arrangement with FlexJobs.">
<meta name="keywords" content="remote jobs, flexible work, work from home, telecommute">

<!-- About Page -->
<title>About FlexJobs - Your Partner in Flexible Work | FlexJobs</title>
<meta name="description" content="Learn about FlexJobs' mission to help professionals find flexible, remote, and part-time job opportunities.">

<!-- Career Advice Page -->
<title>Job Search & Career Advice - FlexJobs</title>
<meta name="description" content="Get expert career advice, job search tips, and insights to advance your professional journey with FlexJobs.">

<!-- Events Page -->
<title>Career Events & Workshops - FlexJobs</title>
<meta name="description" content="Join FlexJobs career events, workshops, and networking opportunities to boost your professional development.">

<!-- Blog Page -->
<title>Career Blog - Tips & Insights | FlexJobs</title>
<meta name="description" content="Read the latest career advice, industry insights, and flexible work trends on the FlexJobs blog.">
```

### 9. Testing Integration

Test each page to ensure:

1. **Component Loading**: Header and footer load correctly
2. **Responsive Design**: Components adapt to mobile/desktop properly
3. **Navigation**: Active states work correctly
4. **Functionality**: Search, accordions, and interactions work
5. **Performance**: Components load efficiently

### 10. Maintenance Best Practices

1. **Version Control**: Keep component files in version control
2. **Documentation**: Document any customizations per page
3. **Testing**: Test components after any updates
4. **Fallbacks**: Ensure fallback components work if loading fails
5. **Performance**: Monitor loading times and optimize as needed

## Component API Reference

### Header Component Methods
```javascript
window.headerInstance.setActiveNav(page)          // Set active navigation
window.headerInstance.expandSearchOnMobile()      // Show mobile search
window.headerInstance.addCustomSearchFilters(filters) // Add search filters
window.headerInstance.updateCartCount(count)      // Update shopping cart
```

### Footer Component Methods
```javascript
window.footerInstance.expandAccordionSection(index)  // Expand accordion
window.footerInstance.collapseAllAccordions()        // Collapse all
window.footerInstance.showBackToTop()                // Show back-to-top
window.footerInstance.trackEvent(name, props)        // Track analytics
```

This integration approach ensures consistent header and footer components across all pages while maintaining the device-specific UX patterns and allowing for page-specific customizations.
