# Device-Specific UI/UX Framework for FlexJobs

This framework provides a comprehensive solution for creating different user interfaces and experiences for mobile and PC versions of the same page, while maintaining a single codebase.

## Framework Overview

### Core Philosophy
- **Mobile-First Design**: Start with mobile layout and progressively enhance for larger screens
- **Content Parity**: Same content, different presentation and interaction patterns
- **Performance Optimized**: Only load relevant CSS and JS for each device type
- **Accessibility First**: Touch-friendly on mobile, keyboard-friendly on PC

## CSS Class System

### Display Utilities

#### Basic Responsive Classes
```css
.mobile-only     /* Visible only on mobile (< 992px) */
.tablet-only     /* Visible only on tablet (768px - 991px) */
.desktop-only    /* Visible only on desktop (≥ 992px) */
```

#### Advanced Display Controls
```css
.mobile-flex     /* Flex display on mobile only */
.mobile-grid     /* Grid display on mobile only */
.pc-flex         /* Flex display on PC only */
.pc-grid         /* Grid display on PC only */
```

### Layout Utilities

#### Flexbox Controls
```css
/* Mobile-specific */
.mobile-flex-column
.mobile-flex-row
.mobile-justify-center
.mobile-align-center

/* PC-specific */
.pc-flex-column
.pc-flex-row
.pc-justify-between
.pc-align-center
```

#### Spacing Controls
```css
/* Mobile spacing (smaller) */
.mobile-p-1, .mobile-p-2, .mobile-p-3
.mobile-m-1, .mobile-m-2, .mobile-m-3

/* PC spacing (larger) */
.pc-p-2, .pc-p-3, .pc-p-4, .pc-p-5
.pc-m-2, .pc-m-3, .pc-m-4, .pc-m-5
```

### Interaction Utilities

#### Touch vs Mouse Optimizations
```css
.mobile-touch-friendly  /* 44px min touch targets */
.pc-hover-effects      /* Hover animations for mouse users */
```

## Component Patterns

### 1. Navigation Patterns

#### Mobile Navigation (Bottom Tab Bar)
```html
<div class="mobile-nav mobile-only">
    <a href="#" class="mobile-nav-item active">
        <i class="fas fa-home"></i>
        <span>Home</span>
    </a>
    <!-- More nav items -->
</div>
```

#### PC Navigation (Top Horizontal)
```html
<nav class="pc-nav desktop-only">
    <div class="container">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <img src="logo.png" alt="Logo">
                <a href="#" class="pc-nav-item active">Home</a>
                <!-- More nav items -->
            </div>
        </div>
    </div>
</nav>
```

### 2. Search Patterns

#### Mobile Search (Sticky Top)
```html
<div class="mobile-search mobile-only">
    <div class="mobile-search-input">
        <input type="text" placeholder="Search...">
        <i class="fas fa-search search-icon"></i>
    </div>
    <div class="mobile-search-filters">
        <a href="#" class="mobile-filter-chip active">All</a>
        <!-- More filters -->
    </div>
</div>
```

#### PC Search (Advanced Form)
```html
<div class="pc-search desktop-only">
    <div class="pc-search-form">
        <div class="pc-search-input">
            <label>Job Title</label>
            <input type="text" placeholder="e.g. Software Engineer">
        </div>
        <!-- More inputs -->
        <button class="pc-search-btn">Search</button>
    </div>
</div>
```

### 3. Content Cards

#### Mobile Cards (Compact)
```html
<div class="mobile-card mobile-only">
    <div class="mobile-card-header">
        <h3>Title</h3>
    </div>
    <div class="mobile-card-body">
        <p>Content</p>
    </div>
</div>
```

#### PC Cards (Rich)
```html
<div class="pc-card desktop-only">
    <div class="pc-card-header">
        <h3>Title</h3>
        <p>Subtitle</p>
    </div>
    <div class="pc-card-body">
        <p>Detailed content with more information</p>
    </div>
    <div class="pc-card-footer">
        <button class="pc-job-btn primary">Action</button>
    </div>
</div>
```

### 4. Form Patterns

#### Mobile Forms (Full Width, Touch-Friendly)
```html
<div class="mobile-form mobile-only">
    <div class="form-group">
        <input type="text" class="form-control" placeholder="Input">
    </div>
    <button class="btn btn-primary">Submit</button>
</div>
```

#### PC Forms (Multi-Column, Enhanced)
```html
<div class="pc-form desktop-only">
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label class="form-label">Label</label>
                <input type="text" class="form-control">
            </div>
        </div>
    </div>
    <button class="btn btn-primary">Submit</button>
</div>
```

## Implementation Guidelines

### 1. Content Strategy

#### Mobile Content
- **Concise**: Shorter headlines and descriptions
- **Scannable**: Use bullet points and short paragraphs
- **Action-Oriented**: Clear, prominent CTAs
- **Progressive**: Show less initially, expand on demand

#### PC Content
- **Detailed**: More comprehensive information
- **Rich Media**: Larger images, videos, infographics
- **Context**: Additional explanations and details
- **Multi-Column**: Utilize horizontal space effectively

### 2. Interaction Patterns

#### Mobile Interactions
```javascript
// Touch-specific interactions
if (window.innerWidth < 992) {
    // Add touch feedback
    item.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    // Swipe gestures
    // Pull-to-refresh
    // Bottom sheet modals
}
```

#### PC Interactions
```javascript
// Mouse and keyboard interactions
if (window.innerWidth >= 992) {
    // Hover effects
    item.addEventListener('mouseenter', function() {
        // Enhanced hover animations
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === '/') {
            // Focus search
        }
    });
    
    // Context menus
    // Drag and drop
}
```

### 3. Performance Optimization

#### Conditional Loading
```javascript
// Load device-specific resources
if (window.innerWidth < 992) {
    // Load mobile-specific JS libraries
    import('./mobile-specific.js');
} else {
    // Load PC-specific JS libraries
    import('./pc-specific.js');
}
```

#### CSS Optimization
```css
/* Critical mobile styles in main CSS */
@media (max-width: 991px) {
    /* Essential mobile styles */
}

/* PC enhancements loaded separately */
@media (min-width: 992px) {
    /* PC-specific enhancements */
}
```

## Device-Specific Features

### Mobile Features
- **Bottom Navigation**: Easy thumb access
- **Pull-to-Refresh**: Native mobile gesture
- **Infinite Scroll**: Touch-friendly pagination
- **Swipe Actions**: Delete, save, share
- **Bottom Sheets**: Modal alternatives
- **Touch Gestures**: Tap, long press, swipe

### PC Features
- **Hover States**: Rich feedback on mouse over
- **Keyboard Navigation**: Full keyboard accessibility
- **Multi-Column Layouts**: Utilize horizontal space
- **Drag & Drop**: Advanced interactions
- **Context Menus**: Right-click functionality
- **Tooltips**: Detailed hover information

## Breakpoint Strategy

```css
/* Mobile First (320px+) */
.mobile-only { display: block; }

/* Tablet (768px+) */
@media (min-width: 768px) {
    .tablet-only { display: block; }
    .mobile-only { display: none; }
}

/* Desktop (992px+) */
@media (min-width: 992px) {
    .desktop-only { display: block; }
    .tablet-only { display: none; }
    .mobile-only { display: none; }
}
```

## Best Practices

### 1. Content Hierarchy
- **Mobile**: Single column, vertical flow
- **PC**: Multi-column, grid-based layouts

### 2. Typography
- **Mobile**: Larger text for readability (16px minimum)
- **PC**: Varied text sizes for hierarchy

### 3. Images
- **Mobile**: Optimize for smaller screens, lazy loading
- **PC**: High-resolution images, multiple formats

### 4. Forms
- **Mobile**: One field per row, large touch targets
- **PC**: Multi-column layouts, keyboard shortcuts

### 5. Navigation
- **Mobile**: Bottom tab bar or hamburger menu
- **PC**: Top horizontal navigation with dropdowns

## Testing Strategy

### Device Testing
```javascript
// Responsive testing
function testResponsive() {
    const breakpoints = [320, 768, 992, 1200];
    breakpoints.forEach(width => {
        window.resizeTo(width, 800);
        // Test functionality at each breakpoint
    });
}
```

### Feature Detection
```javascript
// Touch vs mouse detection
const isTouchDevice = 'ontouchstart' in window;
const hasHover = window.matchMedia('(hover: hover)').matches;

if (isTouchDevice) {
    document.body.classList.add('touch-device');
} else {
    document.body.classList.add('mouse-device');
}
```

This framework ensures your FlexJobs application provides optimal user experiences across all device types while maintaining code efficiency and consistency.
