/**
 * Career Advice Page JavaScript
 * Initializes the main header component and handles page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main header
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'Job Search Career Advice',
            subtitle: 'Expert guidance to help you find and land your dream flexible job'
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

    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // Handle newsletter subscription
            console.log('Newsletter subscription:', email);
            alert('Thank you for subscribing to our newsletter!');
        });
    }
});
