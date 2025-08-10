

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
            
            if (validateEmail(email)) {
                console.log('Newsletter signup:', email);
                showNotification('Thank you for subscribing! You\'ll receive our weekly career insights and work tips.', 'success', 'Subscription Successful');
                this.reset();
            } else {
                showNotification('Please enter a valid email address.', 'error', 'Invalid Email');
            }
        });
    }

    
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            console.log('Loading more articles...');
            
            // Show loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading More...';
            this.disabled = true;
            
            // Simulate loading
            setTimeout(() => {
                // Reset button
                this.innerHTML = '<i class="fas fa-plus"></i> Load More Articles';
                this.disabled = false;
                
                // Show completion message
                showNotification('You\'ve reached the end of our current articles. Check back soon for new content!', 'info', 'All Articles Loaded');
            }, 1500);
        });
    }
});

// Helper functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info', title = null) {
    // Check if modal exists, if not create it
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        createNotificationModal();
        modal = document.getElementById('notificationModal');
    }
    
    const titleElement = document.getElementById('notificationModalLabel');
    const messageElement = document.getElementById('notificationMessage');
    const iconElement = document.getElementById('notificationIcon');
    
    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
    };
    
    titleElement.textContent = title || defaultTitles[type] || 'Notification';
    messageElement.textContent = message;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    iconElement.className = `notification-icon ${type}`;
    iconElement.querySelector('i').className = iconMap[type] || iconMap.info;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Ensure proper cleanup when modal is hidden
    modal.addEventListener('hidden.bs.modal', function() {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }, { once: true });
}

function createNotificationModal() {
    const modalHTML = `
    <div class="modal fade" id="notificationModal" tabindex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <div class="d-flex align-items-center w-100">
                        <div class="notification-icon me-3" id="notificationIcon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <h5 class="modal-title mb-0" id="notificationModalLabel">Notification</h5>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-2">
                    <p id="notificationMessage" class="mb-0">Your message will appear here.</p>
                </div>
                <div class="modal-footer border-0 pt-2">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
