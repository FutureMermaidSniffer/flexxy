// Companies Page JavaScript
class CompaniesManager {
    constructor() {
        this.companies = [];
        this.currentPage = 1;
        this.pageSize = 9;
        this.init();
    }

    async init() {
        try {
            await this.loadComponents();
            this.setupEventListeners();
            await this.loadCompanies();
        } catch (error) {
            console.error('Error initializing companies page:', error);
        }
    }

    async loadComponents() {
        try {
            // Load header
            const headerResponse = await fetch('components/main-header/main-header.html');
            const headerHtml = await headerResponse.text();
            document.getElementById('main-header-container').innerHTML = headerHtml;
            
            // Load footer
            const footerResponse = await fetch('components/main-footer/main-footer.html');
            const footerHtml = await footerResponse.text();
            document.getElementById('footer-container').innerHTML = footerHtml;
            
            // Initialize header
            if (typeof MainHeader !== 'undefined') {
                window.mainHeader = new MainHeader({
                    searchPlaceholder: 'Search companies...',
                    onSearch: (data) => this.handleSearch(data)
                });
            }
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    setupEventListeners() {
        const loadMoreBtn = document.getElementById('load-more-companies');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreCompanies();
            });
        }
    }

    async loadCompanies() {
        try {
            // For now, we'll use static data. In the future, this would fetch from an API
            this.companies = this.getStaticCompanies();
            this.renderCompanies();
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    }

    getStaticCompanies() {
        return [
            {
                id: 1,
                name: 'TechCorp',
                logo: 'images/company-logos/tech-corp.png',
                description: 'Leading technology company with 100% remote workforce',
                openPositions: 45,
                rating: 4.8,
                tags: ['Remote', 'Technology', 'Flexible Hours'],
                featured: true
            },
            {
                id: 2,
                name: 'Creative Design Studio',
                logo: 'images/company-logos/design-studio.png',
                description: 'Award-winning design agency with hybrid work model',
                openPositions: 12,
                rating: 4.6,
                tags: ['Hybrid', 'Design', 'Creative'],
                featured: true
            },
            {
                id: 3,
                name: 'Marketing Pro',
                logo: 'images/company-logos/marketing-pro.png',
                description: 'Digital marketing agency with flexible schedules',
                openPositions: 28,
                rating: 4.7,
                tags: ['Flexible', 'Marketing', 'Part-time'],
                featured: true
            },
            {
                id: 4,
                name: 'Data Analytics Inc',
                logo: 'images/company-logos/data-analytics.png',
                description: 'Cutting-edge data science company with remote-first culture',
                openPositions: 33,
                rating: 4.9,
                tags: ['Remote', 'Data Science', 'Analytics'],
                featured: false
            },
            {
                id: 5,
                name: 'Healthcare Solutions',
                logo: 'images/company-logos/healthcare.png',
                description: 'Healthcare technology company offering flexible work arrangements',
                openPositions: 18,
                rating: 4.5,
                tags: ['Healthcare', 'Technology', 'Hybrid'],
                featured: false
            },
            {
                id: 6,
                name: 'Financial Services Plus',
                logo: 'images/company-logos/financial.png',
                description: 'Modern financial services with work-life balance focus',
                openPositions: 22,
                rating: 4.6,
                tags: ['Finance', 'Remote', 'Benefits'],
                featured: false
            }
        ];
    }

    renderCompanies() {
        const companiesGrid = document.getElementById('companies-grid');
        if (!companiesGrid) return;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const companiesToShow = this.companies.slice(0, endIndex);

        companiesGrid.innerHTML = companiesToShow.map(company => this.createCompanyCard(company)).join('');

        // Update load more button
        const loadMoreBtn = document.getElementById('load-more-companies');
        if (loadMoreBtn) {
            if (endIndex >= this.companies.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

    createCompanyCard(company) {
        const tagsHtml = company.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="company-card">
                    <div class="company-logo">
                        <img src="${company.logo}" alt="${company.name}" class="img-fluid" onerror="this.src='images/company-placeholder.png'">
                    </div>
                    <div class="company-info">
                        <h5 class="company-name">${company.name}</h5>
                        <p class="company-description">${company.description}</p>
                        <div class="company-stats">
                            <span class="stat-item"><i class="fas fa-briefcase"></i> ${company.openPositions} Open Positions</span>
                            <span class="stat-item"><i class="fas fa-star"></i> ${company.rating} Rating</span>
                        </div>
                        <div class="company-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadMoreCompanies() {
        this.currentPage++;
        this.renderCompanies();
    }

    handleSearch(data) {
        // Implement company search functionality
        console.log('Searching companies:', data);
        // For now, redirect to job search with company filter
        window.location.href = `/job-search-results?company=${encodeURIComponent(data.searchTerm)}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.companiesManager = new CompaniesManager();
});
