

document.addEventListener('DOMContentLoaded', function() {
    
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'FlexJobs Blog',
            subtitle: 'Expert career advice, remote work tips, and job search strategies'
        },
        onSearch: function(data) {
            
            console.log('Job search:', data.searchTerm, data.location);
            if (data.searchTerm || data.location) {
                const params = new URLSearchParams();
                if (data.searchTerm) params.append('q', data.searchTerm);
                if (data.location) params.append('location', data.location);
                
            }
        },
        container: '#main-header-container'
    });

    
    const navTabs = document.querySelectorAll('.nav-tab');
    const categoryFilter = document.getElementById('categoryFilter');
    const blogSearch = document.getElementById('blogSearch');
    const articlesGrid = document.getElementById('articlesGrid');

    
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

    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const activeTab = document.querySelector('.nav-tab.active')?.dataset.filter || 'latest';
            filterArticles(activeTab, this.value, blogSearch?.value);
        });
    }

    
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
            
            
            if (type !== 'latest') {
                const cardType = card.dataset.type;
                if (cardType !== type) {
                    show = false;
                }
            }
            
            
            if (category && show) {
                const cardCategory = card.dataset.category;
                if (cardCategory !== category) {
                    show = false;
                }
            }
            
            
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

    
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            console.log('Loading more articles...');
            
        });
    }
});
