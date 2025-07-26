# AI Prompt Templates for CSS Maintainability

## Template 1: Before Adding New Styles

```
Before adding any new CSS to the FlexJobs project, please:

1. **Search existing patterns:**
   - Use grep_search to check for similar components in frontend/css/
   - Search for related class names and patterns
   - Check if mobile/desktop variants already exist

2. **Identify the correct location:**
   - Components (reusable across pages): frontend/css/components/
   - Page-specific styles: frontend/css/pages/
   - Utilities (helper classes): frontend/css/utilities/
   - Layout (header, footer, grid): frontend/css/layout/
   - Base styles (variables, typography): frontend/css/base/

3. **Use proper naming conventions:**
   - BEM methodology: .block__element--modifier
   - Device prefixes: .mobile-*, .pc-*, .desktop-only
   - Page prefixes: .page-remote-jobs-*, .page-about-*, .page-job-search-*, .page-events-*, .page-blog-*

4. **Consider both mobile and desktop variants**

5. **Document your additions in CSS comments**

Current project context:
- 5-page website (remote-jobs, about, job-search-career-advice, events, blog)
- Device-specific UI/UX patterns for mobile vs PC
- Existing comprehensive responsive framework
- Current CSS file: 8000+ lines (needs modularization)

Please proceed with: [YOUR SPECIFIC REQUEST]
```

## Template 2: When Modifying Existing Styles

```
I need to modify existing CSS in the FlexJobs project. Before making changes:

1. **Locate the existing styles:**
   - Search for the component/class name using grep_search
   - Check which file currently contains the styles
   - Identify any related mobile/desktop variants

2. **Assess impact:**
   - Will this change affect other pages?
   - Are there mobile and desktop versions that need updating?
   - Are there any dependent components?

3. **Make consistent changes:**
   - Update both mobile and desktop variants if applicable
   - Maintain naming conventions
   - Update related components if needed

Current request: [YOUR MODIFICATION REQUEST]

Please search first, then proceed with modifications.
```

## Template 3: For New Page Development

```
I'm developing a new page for the FlexJobs website. Please help while maintaining CSS architecture:

1. **Page context:**
   - Page name: [PAGE_NAME]
   - Main components needed: [LIST_COMPONENTS]
   - Mobile vs desktop requirements: [DESCRIBE_DIFFERENCES]

2. **Before creating styles:**
   - Check existing components that can be reused
   - Search for similar page patterns
   - Identify what's truly page-specific vs reusable

3. **Organization approach:**
   - Reusable components → frontend/css/components/
   - Page-specific styles → frontend/css/pages/[page-name].css
   - New utilities → frontend/css/utilities/

4. **Naming convention:**
   - Page-specific: .page-[name]__element
     - .page-remote-jobs__* (for remote-jobs page)
     - .page-about__* (for about page)  
     - .page-job-search__* (for job-search-career-advice page)
     - .page-events__* (for events page)
     - .page-blog__* (for blog page)
   - Components: .component-name__element--modifier
   - Mobile: .mobile-* | Desktop: .pc-*

5. **Device considerations:**
   - Mobile-first approach
   - Touch-friendly interactions for mobile
   - Enhanced hover effects for desktop
   - Different layouts/content density

Please proceed with: [SPECIFIC_PAGE_REQUEST]
```

## Template 4: For Component Creation

```
I need to create a new reusable component for FlexJobs. Please ensure maintainability:

1. **Component analysis:**
   - Component name: [COMPONENT_NAME]
   - Where it will be used: [LIST_PAGES]
   - Device-specific requirements: [MOBILE_VS_DESKTOP]

2. **Before creating:**
   - Search for similar existing components
   - Check if this can extend an existing component
   - Identify reusable patterns from current codebase

3. **Implementation approach:**
   - File location: frontend/css/components/[component-name].css
   - BEM naming: .[component]__element--modifier
   - Mobile variant: .mobile-[component]
   - Desktop variant: .pc-[component] (if different from mobile)

4. **Integration:**
   - Add import to main.css if new file
   - Document variants and usage examples
   - Consider accessibility and performance

Component request: [YOUR_COMPONENT_REQUEST]
```

## Template 5: For Debugging/Maintenance

```
I'm experiencing CSS issues in FlexJobs and need help debugging:

1. **Issue context:**
   - Specific problem: [DESCRIBE_ISSUE]
   - Affected pages: [LIST_PAGES]
   - Device(s) affected: [MOBILE/DESKTOP/BOTH]
   - Browser(s): [IF_SPECIFIC]

2. **Investigation approach:**
   - Search for related CSS patterns
   - Check for conflicting styles
   - Identify if it's a component, utility, or page-specific issue
   - Look for recent changes that might have caused this

3. **Current CSS architecture:**
   - Large monolithic style.css (8000+ lines)
   - Device-specific patterns (.mobile-*, .pc-*)
   - Responsive utilities and breakpoints
   - Component-based patterns

Please help debug: [SPECIFIC_ISSUE]
```

## Quick Reference Commands

### Search for existing patterns:
```
grep_search with query: "button|btn" and includePattern: "frontend/css/**"
grep_search with query: "mobile-|pc-" and includePattern: "frontend/css/**"
grep_search with query: "card|form|nav" and includePattern: "frontend/css/**"
```

### Check file structure:
```
file_search with query: "frontend/css/**/*.css"
list_dir with path: "c:/Users/user/Documents/flexjobs/frontend/css"
```

### Read specific sections:
```
read_file for targeted sections of style.css
semantic_search for finding related code patterns
```

## Example Usage

### Good Prompt:
```
Before adding a new job application modal, please:

1. Search for existing modal patterns in the CSS
2. Check if there are mobile vs desktop modal variants
3. Look for form components that can be reused
4. Identify the best location for the styles

Then create a responsive job application modal that:
- Uses touch-friendly buttons on mobile
- Has enhanced hover effects on desktop  
- Follows our BEM naming convention
- Works across all 5 pages of the site

Search first, then proceed.
```

### Poor Prompt:
```
Create a modal for job applications.
```

The key is always **searching first** to understand existing patterns, then building upon them consistently.
