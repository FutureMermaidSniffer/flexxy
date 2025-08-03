


function showNotification(message, type = 'info', title = null) {
    const modal = document.getElementById('notificationModal');
    const titleElement = document.getElementById('notificationModalLabel');
    const messageElement = document.getElementById('notificationMessage');
    const iconElement = document.getElementById('notificationIcon');
    
    
    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        danger: 'Error',
        warning: 'Warning',
        info: 'Information'
    };
    
    
    const normalizedType = type === 'danger' ? 'error' : type;
    
    
    titleElement.textContent = title || defaultTitles[normalizedType] || 'Notification';
    
    
    messageElement.textContent = message;
    
    
    iconElement.className = `notification-icon ${normalizedType}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    iconElement.querySelector('i').className = iconMap[normalizedType] || iconMap.info;
    
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

document.addEventListener('DOMContentLoaded', function() {
    
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'Career Events & Webinars',
            subtitle: 'Join free events to advance your career and connect with industry experts'
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

    
    const filterTabs = document.querySelectorAll('.filter-tab');
    const categoryFilter = document.getElementById('categoryFilter');
    const sectionTitle = document.getElementById('sectionTitle');
    const upcomingEvents = document.getElementById('upcomingEvents');
    const pastEvents = document.getElementById('pastEvents');
    const recordingsEvents = document.getElementById('recordingsEvents');

    
    if (filterTabs) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                
                filterTabs.forEach(t => t.classList.remove('active'));
                
                this.classList.add('active');
                
                
                const filter = this.dataset.filter;
                console.log('Filter changed to:', filter);
                
                
                if (upcomingEvents) upcomingEvents.style.display = 'none';
                if (pastEvents) pastEvents.style.display = 'none';
                if (recordingsEvents) recordingsEvents.style.display = 'none';
                
                
                switch(filter) {
                    case 'upcoming':
                        if (upcomingEvents) {
                            upcomingEvents.style.display = 'flex';
                            upcomingEvents.className = 'row events-container';
                        }
                        if (sectionTitle) sectionTitle.textContent = 'Upcoming Events';
                        break;
                    case 'past':
                        if (pastEvents) {
                            pastEvents.style.display = 'flex';
                            pastEvents.className = 'row events-container';
                        }
                        if (sectionTitle) sectionTitle.textContent = 'Past Events';
                        break;
                    case 'recordings':
                        if (recordingsEvents) {
                            recordingsEvents.style.display = 'flex';
                            recordingsEvents.className = 'row events-container';
                        }
                        if (sectionTitle) sectionTitle.textContent = 'Event Recordings';
                        break;
                }
                
                
                if (categoryFilter) {
                    categoryFilter.value = '';
                }
            });
        });
    }

    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            console.log('Category filter changed to:', category);
            
            
            const activeContainer = document.querySelector('.events-container[style*="flex"]') || upcomingEvents;
            
            if (activeContainer) {
                const eventCards = activeContainer.querySelectorAll('.col-lg-4');
                
                eventCards.forEach(card => {
                    if (!category || card.dataset.category === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }

    
    const registerBtns = document.querySelectorAll('.register-btn');
    const watchBtns = document.querySelectorAll('.watch-btn');
    
    
    registerBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            
            if (this.tagName === 'A') {
                console.log('Navigating to registration page:', this.href);
                return;
            }
            
            
            e.preventDefault();
            console.log('Register for event');
            alert('You will be redirected to the registration page.');
        });
    });
    
    
    watchBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            
            if (this.tagName === 'A') {
                console.log('Navigating to recording:', this.href);
                return;
            }
            
            
            e.preventDefault();
            console.log('Watch recording');
            alert('You will be redirected to the video recording.');
        });
    });

    
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            console.log('Newsletter signup:', email);
            alert('Thank you for subscribing! You\'ll be notified about upcoming events.');
            this.reset();
        });
    }

    
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            console.log('Loading more events...');
            
            
            const activeTab = document.querySelector('.filter-tab.active');
            const currentFilter = activeTab ? activeTab.dataset.filter : 'upcoming';
            
            
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;
            
            
            setTimeout(() => {
                
                this.innerHTML = '<i class="fas fa-plus"></i> Load More Events';
                this.disabled = false;
                
                
                let message = '';
                switch(currentFilter) {
                    case 'upcoming':
                        message = "That's all the upcoming events for now.";
                        break;
                    case 'past':
                        message = "That's all the past events for now.";
                        break;
                    case 'recordings':
                        message = "That's all the event recordings for now.";
                        break;
                    default:
                        message = "That's all the events for now.";
                }
                
                showNotification(message, 'info');
            }, 1500);
        });
    }
    
    
    if (upcomingEvents) {
        upcomingEvents.style.display = 'flex';
        upcomingEvents.className = 'row events-container';
    }
    if (pastEvents) {
        pastEvents.style.display = 'none';
    }
    if (recordingsEvents) {
        recordingsEvents.style.display = 'none';
    }
    
    
    const defaultTab = document.querySelector('.filter-tab[data-filter="upcoming"]');
    if (defaultTab) {
        defaultTab.classList.add('active');
    }
    
    console.log('Events page initialized with three tabs: upcoming, past, and recordings');
});
