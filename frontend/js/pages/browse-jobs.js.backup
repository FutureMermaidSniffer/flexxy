/**
 * Browse Jobs Page JavaScript
 * Initializes the main header component for the browse jobs page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main header with search functionality
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'Find the Best Jobs for You',
            subtitle: ''
        },
        onSearch: function(data) {
            // Handle job search
            console.log('Job search:', data.searchTerm, data.location);
            // In real implementation, redirect to search results
            if (data.searchTerm || data.location) {
                const params = new URLSearchParams();
                if (data.searchTerm) params.append('q', data.searchTerm);
                if (data.location) params.append('location', data.location);
                // window.location.href = `/search?${params.toString()}`;
            }
        },
        container: '#main-header-container'
    });
});
