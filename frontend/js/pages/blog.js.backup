/**
 * Blog Page JavaScript
 * Initializes the main header component and handles blog functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main header
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'FlexJobs Blog',
            subtitle: 'Expert career advice, remote work tips, and job search strategies'
        },
        onSearch: function(data) {
            // Handle job search
            console.log('Job search:', data.searchTerm, data.location);
            if (data.searchTerm || data.location) {
                const params = new URLSearchParams();
                if (data.searchTerm) params.append('q', data.searchTerm);
                if (data.location) params.append('location', data.location);
                // window.location.href = `/browse-jobs?${params.toString()}`;
            }
        },
        container: '#main-header-container'
    });

    // Blog navigation functionality
    const navTabs = document.querySelectorAll('.nav-tab');
    const categoryFilter = document.getElementById('categoryFilter');
    const blogSearch = document.getElementById('blogSearch');
    const articlesGrid = document.getElementById('articlesGrid');

    // Tab switching
    if (navTabs) {
        navTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                navTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                filterArticles(filter, categoryFilter?.value, blogSearch?.value);
            });
        });
    }

    // Category filtering
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const activeTab = document.querySelector('.nav-tab.active')?.dataset.filter || 'latest';
            filterArticles(activeTab, this.value, blogSearch?.value);
        });
    }

    // Search functionality
    if (blogSearch) {
        blogSearch.addEventListener('input', function() {
            const activeTab = document.querySelector('.nav-tab.active')?.dataset.filter || 'latest';
            filterArticles(activeTab, categoryFilter?.value, this.value);
        });
    }

    function filterArticles(type, category, searchTerm) {
        if (!articlesGrid) return;
        
        const articleCards = articlesGrid.querySelectorAll('.col-lg-4');
        
        articleCards.forEach(card => {
            let show = true;
            
            // Filter by type (latest, trending, popular)
            if (type !== 'latest') {
                const cardType = card.dataset.type;
                if (cardType !== type) {
                    show = false;
                }
            }
            
            // Filter by category
            if (category && show) {
                const cardCategory = card.dataset.category;
                if (cardCategory !== category) {
                    show = false;
                }
            }
            
            // Filter by search term
            if (searchTerm && show) {
                const title = card.querySelector('.article-title a')?.textContent.toLowerCase() || '';
                const excerpt = card.querySelector('.article-excerpt')?.textContent.toLowerCase() || '';
                if (!title.includes(searchTerm.toLowerCase()) && !excerpt.includes(searchTerm.toLowerCase())) {
                    show = false;
                }
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }

    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            console.log('Newsletter signup:', email);
            alert('Thank you for subscribing! You\'ll receive our latest articles weekly.');
            this.reset();
        });
    }

    // Load more articles
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            console.log('Loading more articles...');
            // Implement load more functionality
        });
    }
});
