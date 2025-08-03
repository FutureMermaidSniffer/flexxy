

document.addEventListener('DOMContentLoaded', function() {
    
    const header = new MainHeader({
        contentType: 'title',
        content: {
            title: 'Find the Best Jobs for You',
            subtitle: ''
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
});
