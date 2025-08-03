

document.addEventListener('DOMContentLoaded', function() {
    
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'Job Search Career Advice',
            subtitle: 'Expert guidance to help you find and land your dream flexible job'
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

    
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            console.log('Newsletter subscription:', email);
            alert('Thank you for subscribing to our newsletter!');
        });
    }
});
