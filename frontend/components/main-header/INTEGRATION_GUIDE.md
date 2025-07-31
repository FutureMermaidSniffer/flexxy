# Main Header Component Integration Guide

The Main Header component provides a consistent, reusable header across all pages with the FlexJobs logo, search functionality, and dynamic content area.

## Files Structure
```
components/main-header/
├── main-header.html     # HTML template
├── main-header.css      # Component styles
├── main-header.js       # Component logic
└── INTEGRATION_GUIDE.md # This guide
```

## Basic Integration

### 1. Include Required Files
Add these to your HTML head section:

```html
<!-- Include Main Header CSS -->
<link rel="stylesheet" href="components/main-header/main-header.css">

<!-- Include Main Header JS before closing body tag -->
<script src="components/main-header/main-header.js"></script>
```

### 2. Basic Implementation
```javascript
// Initialize with default settings
const header = new MainHeader();
```

## Configuration Options

### Content Types

#### 1. Job Match Content
```javascript
const header = new MainHeader({
    contentType: 'match',
    content: {
        jobCount: '12,020'
    }
});
```

#### 2. Page Title Content
```javascript
const header = new MainHeader({
    contentType: 'title',
    content: {
        title: 'Upload Your Resume',
        subtitle: 'Let employers find you with the perfect job match'
    }
});
```

#### 3. Custom Content
```javascript
const header = new MainHeader({
    contentType: 'custom',
    content: {
        html: '<div class="custom-header">Your custom HTML here</div>'
    }
});
```

### Advanced Options
```javascript
const header = new MainHeader({
    logoPath: 'images/FlexJobs_logo-1.png',  // Custom logo path
    searchPlaceholder: 'Search for Jobs...', // Custom placeholder
    showSearch: true,                        // Show/hide search bar
    container: 'main',                       // Target container selector
    onSearch: (data) => {                   // Custom search handler
        console.log('Search:', data.searchTerm, data.location);
        // Your custom search logic here
    }
});
```

## Methods

### Content Management
```javascript
// Update content dynamically
header.updateContent('title', {
    title: 'New Page Title',
    subtitle: 'New subtitle'
});

// Update search values
header.updateSearch('javascript developer', 'remote');

// Get current search values
const searchData = header.getSearchValues();
```

### Search Control
```javascript
// Show/hide search bar
header.toggleSearch(false); // Hide
header.toggleSearch(true);  // Show
```

### Cleanup
```javascript
// Remove component when no longer needed
header.destroy();
```

## Page-Specific Examples

### Registration Page
```javascript
const header = new MainHeader({
    contentType: 'match',
    content: {
        jobCount: '12,020'
    }
});
```

### Upload Resume Page
```javascript
const header = new MainHeader({
    contentType: 'title',
    content: {
        title: 'Upload Your Resume',
        subtitle: 'Get discovered by top employers'
    }
});
```

### Job Preferences Page
```javascript
const header = new MainHeader({
    contentType: 'title',
    content: {
        title: 'Tell Us About Your Ideal Job',
        subtitle: 'Help us find the perfect matches for you'
    }
});
```

### Salary Preferences Page
```javascript
const header = new MainHeader({
    contentType: 'title',
    content: {
        title: 'Salary & Benefits',
        subtitle: 'Set your compensation expectations'
    }
});
```

### Experience Level Page
```javascript
const header = new MainHeader({
    contentType: 'title',
    content: {
        title: 'Your Experience Level',
        subtitle: 'Help us match you with the right opportunities'
    }
});
```

## CSS Customization

### Override Default Styles
```css
/* Custom header background */
.main-header {
    background: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
}

/* Custom content area styles */
.header-content .custom-title {
    font-size: 2rem;
    font-weight: 700;
    color: white;
}
```

### Responsive Adjustments
The component includes responsive breakpoints:
- Mobile: < 768px
- Tablet: 768px - 991px
- Desktop: ≥ 992px

## Analytics Integration

The component automatically tracks search events when `window.gtag` is available:
```javascript
// Automatic tracking on search
gtag('event', 'search', {
    search_term: 'javascript',
    location: 'remote',
    page_path: '/current-page'
});
```

## Browser Support
- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- ES6+ features used (async/await, template literals, arrow functions)

## Troubleshooting

### Component Not Loading
1. Check file paths in script/link tags
2. Ensure main-header.html is accessible via fetch
3. Check browser console for errors

### Search Not Working
1. Verify `onSearch` callback is defined
2. Check search button and input elements exist
3. Ensure event listeners are properly attached

### Styling Issues
1. Make sure main-header.css is loaded after Bootstrap
2. Check for CSS conflicts with existing styles
3. Use browser dev tools to inspect computed styles

## Migration from Existing Headers

### Step 1: Backup Current Implementation
Save your current header HTML and CSS.

### Step 2: Replace Header Section
Remove existing header HTML and replace with:
```javascript
const header = new MainHeader({
    // Your configuration
});
```

### Step 3: Update Page-Specific Content
Use the appropriate content type and configuration for each page.

### Step 4: Test Functionality
Verify search, responsive behavior, and styling work correctly.
