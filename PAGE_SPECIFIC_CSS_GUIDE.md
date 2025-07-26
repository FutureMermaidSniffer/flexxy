# FlexJobs Page-Specific CSS Organization Guide

## Page Structure Overview

Your FlexJobs website consists of 5 main pages, each with unique content and styling requirements:

### 1. **Remote Jobs Page** (`remote-jobs.html`)
**Purpose**: Main job search and listing functionality
**File**: `frontend/css/pages/remote-jobs.css`

#### Key Components Likely Needed:
```css
/* Remote Jobs Page Specific */
.page-remote-jobs__hero-search { }
.page-remote-jobs__advanced-filters { }
.page-remote-jobs__job-grid { }
.page-remote-jobs__pagination { }
.page-remote-jobs__sort-controls { }
.page-remote-jobs__results-count { }
.page-remote-jobs__save-search { }

/* Mobile variants */
.mobile-remote-jobs__quick-filters { }
.mobile-remote-jobs__swipe-cards { }

/* Desktop variants */
.pc-remote-jobs__sidebar-filters { }
.pc-remote-jobs__detailed-view { }
```

#### Reusable Components:
- Job cards (from `components/cards.css`)
- Search forms (from `components/search.css`)
- Filter components (from `components/filters.css`)
- Pagination (from `components/pagination.css`)

---

### 2. **About Page** (`about.html`)
**Purpose**: Company information, mission, team
**File**: `frontend/css/pages/about.css`

#### Key Components Likely Needed:
```css
/* About Page Specific */
.page-about__hero-banner { }
.page-about__mission-statement { }
.page-about__team-grid { }
.page-about__company-stats { }
.page-about__timeline { }
.page-about__values-section { }
.page-about__testimonials { }

/* Mobile variants */
.mobile-about__team-carousel { }
.mobile-about__stats-vertical { }

/* Desktop variants */
.pc-about__parallax-sections { }
.pc-about__team-hover-effects { }
```

#### Reusable Components:
- Team member cards (from `components/cards.css`)
- Statistics counters (from `components/counters.css`)
- Timeline component (from `components/timeline.css`)

---

### 3. **Job Search Career Advice Page** (`job-search-career-advice.html`)
**Purpose**: Career guidance, tips, resources
**File**: `frontend/css/pages/job-search-career-advice.css`

#### Key Components Likely Needed:
```css
/* Job Search Career Advice Page Specific */
.page-job-search__resources-grid { }
.page-job-search__tips-categories { }
.page-job-search__featured-articles { }
.page-job-search__resource-filters { }
.page-job-search__download-section { }
.page-job-search__expert-advice { }
.page-job-search__success-stories { }

/* Mobile variants */
.mobile-job-search__accordion-tips { }
.mobile-job-search__swipe-resources { }

/* Desktop variants */
.pc-job-search__sidebar-nav { }
.pc-job-search__interactive-tools { }
```

#### Reusable Components:
- Article cards (from `components/cards.css`)
- Resource download buttons (from `components/buttons.css`)
- Category filters (from `components/filters.css`)

---

### 4. **Events Page** (`events.html`)
**Purpose**: Job fairs, webinars, networking events
**File**: `frontend/css/pages/events.css`

#### Key Components Likely Needed:
```css
/* Events Page Specific */
.page-events__calendar-view { }
.page-events__upcoming-list { }
.page-events__event-filters { }
.page-events__featured-event { }
.page-events__registration-form { }
.page-events__past-events { }
.page-events__event-categories { }

/* Mobile variants */
.mobile-events__date-picker { }
.mobile-events__swipe-calendar { }

/* Desktop variants */
.pc-events__interactive-calendar { }
.pc-events__multi-view-toggle { }
```

#### Reusable Components:
- Event cards (from `components/cards.css`)
- Calendar component (from `components/calendar.css`)
- Registration forms (from `components/forms.css`)

---

### 5. **Blog Page** (`blog.html`)
**Purpose**: Articles, industry news, company updates
**File**: `frontend/css/pages/blog.css`

#### Key Components Likely Needed:
```css
/* Blog Page Specific */
.page-blog__post-grid { }
.page-blog__featured-post { }
.page-blog__category-filters { }
.page-blog__search-bar { }
.page-blog__pagination { }
.page-blog__sidebar { }
.page-blog__article-content { }
.page-blog__author-bio { }
.page-blog__related-posts { }

/* Mobile variants */
.mobile-blog__infinite-scroll { }
.mobile-blog__category-chips { }

/* Desktop variants */
.pc-blog__multi-column-layout { }
.pc-blog__sticky-sidebar { }
```

#### Reusable Components:
- Article cards (from `components/cards.css`)
- Author avatars (from `components/avatars.css`)
- Share buttons (from `components/social.css`)

---

## Implementation Strategy

### Step 1: Identify Current Page-Specific Styles
```bash
# Search for existing page-specific patterns in your current style.css
grep -n "remote-jobs\|about\|job-search\|events\|blog" frontend/css/style.css
```

### Step 2: Extract Page-Specific Styles
For each page, create a dedicated CSS file and move relevant styles:

```css
/* Example: pages/remote-jobs.css */

/* Import required components */
@import '../components/cards.css';
@import '../components/search.css';
@import '../components/filters.css';

/* Page-specific styles */
.page-remote-jobs__hero-search {
    background: linear-gradient(135deg, #0891b2 0%, #0066cc 100%);
    padding: 4rem 0;
    position: relative;
}

/* Mobile-specific styles for this page */
@media (max-width: 991px) {
    .page-remote-jobs__hero-search {
        padding: 2rem 0;
    }
    
    .mobile-remote-jobs__quick-filters {
        display: flex;
        overflow-x: auto;
        gap: 0.5rem;
        padding: 1rem;
    }
}

/* Desktop-specific styles for this page */
@media (min-width: 992px) {
    .pc-remote-jobs__sidebar-filters {
        position: sticky;
        top: 2rem;
        max-height: calc(100vh - 4rem);
        overflow-y: auto;
    }
}
```

### Step 3: Update Your AI Prompts

When working on specific pages, use this template:

```
I'm working on the [PAGE_NAME] page of FlexJobs. Before adding any styles:

1. Search for existing patterns in:
   - frontend/css/pages/[page-name].css
   - frontend/css/components/ (for reusable elements)
   - frontend/css/utilities/ (for device-specific utilities)

2. Current page context:
   - Page: [remote-jobs|about|job-search-career-advice|events|blog]
   - Components needed: [list specific components]
   - Mobile vs desktop differences: [describe differences]

3. Use naming convention:
   - Page-specific: .page-[page-name]__element
   - Mobile: .mobile-[page-name]__element
   - Desktop: .pc-[page-name]__element

Please search first, then proceed with: [your request]
```

### Step 4: Component Reuse Matrix

| Component | Remote Jobs | About | Job Search | Events | Blog |
|-----------|-------------|-------|------------|--------|------|
| Job Cards | ✅ Primary | ❌ | ✅ Examples | ❌ | ✅ Related |
| Article Cards | ❌ | ✅ Team | ✅ Primary | ❌ | ✅ Primary |
| Event Cards | ❌ | ❌ | ❌ | ✅ Primary | ❌ |
| Search/Filters | ✅ Primary | ❌ | ✅ Resources | ✅ Events | ✅ Posts |
| Forms | ✅ Apply | ✅ Contact | ✅ Newsletter | ✅ Register | ✅ Newsletter |
| Navigation | ✅ All Pages | ✅ All Pages | ✅ All Pages | ✅ All Pages | ✅ All Pages |

This matrix helps you identify which components can be shared and which need page-specific variants.

## Maintenance Checklist

### Before Adding Page-Specific Styles:
- [ ] Check if similar functionality exists on other pages
- [ ] Identify reusable components
- [ ] Plan mobile vs desktop differences
- [ ] Use consistent naming conventions
- [ ] Document any page-specific requirements

### After Adding Page-Specific Styles:
- [ ] Test across all device sizes
- [ ] Verify no conflicts with other pages
- [ ] Update component documentation
- [ ] Consider if any patterns should be extracted to components
- [ ] Update this guide if new patterns emerge

This organization ensures your FlexJobs website remains maintainable as each page develops its own unique requirements while sharing common components efficiently.
