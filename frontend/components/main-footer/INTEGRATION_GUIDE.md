# Main Footer Component Integration Guide

This guide explains how to integrate the Main Footer component into your FlexJobs pages.

## Files Structure

```
frontend/components/main-footer/
├── main-footer.html         # Footer HTML structure
├── main-footer.css          # Footer styles (desktop & mobile)
├── main-footer.js           # Footer JavaScript functionality
└── INTEGRATION_GUIDE.md     # This integration guide
```

## Quick Integration

### 1. Include CSS and JavaScript

Add these lines to your HTML `<head>` section:

```html
<!-- Main Footer Styles -->
<link rel="stylesheet" href="components/main-footer/main-footer.css">

<!-- Font Awesome for icons (if not already included) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

Add this line before the closing `</body>` tag:

```html
<!-- Main Footer JavaScript -->
<script src="components/main-footer/main-footer.js"></script>
```

### 2. Include the Footer HTML

Add the footer component to your page by including the HTML content from `main-footer.html` or using server-side includes:

```html
<!-- Include main footer -->
<?php include 'components/main-footer/main-footer.html'; ?>
```

Or copy the entire footer HTML content and paste it before the closing `</body>` tag.

## Features

### Desktop Layout
- **4-column layout** with comprehensive link organization
- **Social media icons** with hover effects
- **Reviews section** with star ratings and Sitejabber integration
- **App download buttons** for iOS and Android
- **Partner sites** section
- **Professional disclaimer** at the bottom

### Mobile Layout
- **Collapsible accordion sections** for better mobile UX
- **Centered logo and description**
- **Mobile-optimized social media buttons**
- **Touch-friendly app download buttons**
- **Responsive design** that adapts to screen size

### Interactive Features
- **Mobile accordion** with smooth expand/collapse
- **Back to top button** that appears on scroll
- **Newsletter subscription** with validation
- **Social media tracking** (console logging for now)
- **App download tracking** (console logging for now)

## Customization

### Modifying Links

Edit the `main-footer.html` file to update footer links:

```html
<!-- Example: Adding a new link -->
<li><a href="/new-page" class="main-footer__link">New Page</a></li>
```

### Changing Colors

Update the CSS variables in `main-footer.css`:

```css
.main-footer {
    background-color: #your-color; /* Change background */
}

.main-footer__link:hover {
    color: #your-brand-color; /* Change hover color */
}
```

### Adding New Social Media Icons

Add new social media links in both desktop and mobile sections:

```html
<a href="#" class="main-footer__social-link" aria-label="New Platform">
    <i class="fab fa-new-platform"></i>
</a>
```

### Customizing Mobile Accordion

Add new accordion sections by following this pattern:

```html
<div class="main-footer__mobile-section">
    <button class="main-footer__mobile-header" data-bs-toggle="collapse" data-bs-target="#mobileNewSection">
        <span>New Section</span>
        <i class="fas fa-chevron-down"></i>
    </button>
    <div class="collapse" id="mobileNewSection">
        <div class="main-footer__mobile-content">
            <a href="#" class="main-footer__mobile-link">Link 1</a>
            <a href="#" class="main-footer__mobile-link">Link 2</a>
        </div>
    </div>
</div>
```

## Dependencies

### Required
- **Bootstrap 5** - Used for responsive grid and collapse functionality
- **Font Awesome 6** - Used for icons throughout the footer

### Optional
- **Bootstrap JavaScript** - Required for mobile accordion functionality
- **jQuery** - Not required, pure vanilla JavaScript implementation

## Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+
- **Mobile browsers** - Responsive design works on all modern mobile browsers

## Performance Notes

- **CSS is optimized** with minimal unused styles
- **JavaScript is vanilla** for better performance
- **Images should be optimized** (app store badges, logos)
- **Font Awesome icons** are loaded via CDN for better caching

## Accessibility Features

- **ARIA labels** on interactive elements
- **Keyboard navigation** support
- **Screen reader friendly** structure
- **High contrast mode** support
- **Reduced motion** support for accessibility preferences

## SEO Considerations

- **Semantic HTML structure** with proper heading hierarchy
- **Internal linking** helps with site navigation
- **Footer links** provide additional crawlable content
- **Schema markup** can be added for organization information

## Analytics Integration

The JavaScript includes placeholder functions for tracking:

```javascript
// Social media click tracking
trackSocialClick(platform);

// App download tracking  
trackAppDownload(store);
```

Replace these with your actual analytics implementation (Google Analytics, Adobe Analytics, etc.).

## Testing Checklist

### Desktop Testing
- [ ] All 4 columns display correctly
- [ ] Social media links work and open in new tabs
- [ ] App download buttons work
- [ ] Newsletter form validation works
- [ ] Hover effects work on all interactive elements

### Mobile Testing
- [ ] Footer switches to mobile layout below 992px
- [ ] Accordion sections expand/collapse properly
- [ ] Only one accordion section can be open at a time
- [ ] Social media buttons are touch-friendly
- [ ] App download buttons work on mobile
- [ ] Back to top button appears and works

### Cross-browser Testing
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test on iOS Safari and Android Chrome
- [ ] Verify all icons display correctly
- [ ] Check responsive breakpoints

## Troubleshooting

### Common Issues

1. **Icons not displaying**
   - Ensure Font Awesome is loaded
   - Check for CSS conflicts

2. **Mobile accordion not working**
   - Verify Bootstrap JavaScript is loaded
   - Check for JavaScript errors in console

3. **Layout breaking on mobile**
   - Check CSS media queries
   - Verify Bootstrap grid classes

4. **Social media links not working**
   - Update href attributes with actual URLs
   - Ensure links open in new tabs with `target="_blank"`

### Debug Mode

Enable debug mode by adding this to your JavaScript:

```javascript
// Add to main-footer.js for debugging
console.log('Main Footer initialized');
```

## Future Enhancements

- **Newsletter API integration** for actual subscriptions
- **Real analytics tracking** implementation
- **Dark mode support** with CSS custom properties
- **Internationalization** support for multiple languages
- **Dynamic content loading** from CMS or API

## Support

For technical support or questions about this component, refer to the main FlexJobs development documentation or contact the development team.
