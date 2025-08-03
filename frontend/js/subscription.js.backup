// Subscription Page JavaScript
class SubscriptionManager {
    constructor() {
        this.selectedPlan = null;
        this.currentSubscription = null;
        this.plans = [];
        this.init();
    }

    async init() {
        try {
            // Load components
            await this.loadComponents();
            
            // Load subscription plans
            await this.loadPlans();
            
            // Load current subscription if user is logged in
            await this.loadCurrentSubscription();
            
            // Render plans
            this.renderPlans();
            
            // Set up event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error initializing subscription page:', error);
            this.showAlert('Error loading subscription information', 'danger');
        }
    }

    async loadComponents() {
        try {
            // Load main header
            const headerResponse = await fetch('components/main-header/main-header.html');
            const headerHtml = await headerResponse.text();
            document.getElementById('main-header-container').innerHTML = headerHtml;
            
            // Load footer
            const footerResponse = await fetch('components/main-footer/main-footer.html');
            const footerHtml = await footerResponse.text();
            document.getElementById('footer-container').innerHTML = footerHtml;
            
            // Initialize main header
            if (typeof MainHeader !== 'undefined') {
                window.mainHeader = new MainHeader();
            }
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    async loadPlans() {
        try {
            const response = await fetch('/api/subscriptions/plans');
            const data = await response.json();
            
            if (response.ok) {
                this.plans = data.data;
            } else {
                throw new Error(data.message || 'Failed to load plans');
            }
        } catch (error) {
            console.error('Error loading plans:', error);
            this.showAlert('Error loading subscription plans', 'danger');
        }
    }

    async loadCurrentSubscription() {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/api/subscriptions/current', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentSubscription = data.data;
                this.showCurrentSubscription();
            }
        } catch (error) {
            console.error('Error loading current subscription:', error);
        }
    }

    showCurrentSubscription() {
        if (!this.currentSubscription) return;

        const section = document.getElementById('currentSubscriptionSection');
        const details = document.getElementById('currentSubscriptionDetails');
        
        let statusBadge = '';
        if (this.currentSubscription.status === 'active') {
            statusBadge = '<span class="current-plan-badge">Active</span>';
        } else {
            statusBadge = `<span class="badge bg-warning">${this.currentSubscription.status}</span>`;
        }

        details.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h6 class="mb-1">${this.currentSubscription.plan_name} ${statusBadge}</h6>
                    <p class="text-muted mb-0">
                        Next billing: ${new Date(this.currentSubscription.next_billing_date).toLocaleDateString()}
                    </p>
                </div>
                <div class="col-md-4 text-md-end">
                    <strong>$${this.currentSubscription.price}/${this.currentSubscription.billing_period}</strong>
                </div>
            </div>
            ${this.renderUsageStats()}
        `;

        section.style.display = 'block';
    }

    renderUsageStats() {
        if (!this.currentSubscription.usage) return '';

        const usage = this.currentSubscription.usage;
        let statsHtml = '<div class="usage-progress">';
        
        if (usage.applications !== undefined) {
            const percentage = this.currentSubscription.plan_features?.job_applications_limit 
                ? (usage.applications / this.currentSubscription.plan_features.job_applications_limit) * 100
                : 0;
            
            statsHtml += `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span>Job Applications</span>
                        <span>${usage.applications}${this.currentSubscription.plan_features?.job_applications_limit ? ` / ${this.currentSubscription.plan_features.job_applications_limit}` : ''}</span>
                    </div>
                    <div class="progress-bar-custom">
                        <div class="progress-fill bg-primary" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
            `;
        }

        if (usage.agent_consultations !== undefined) {
            const percentage = this.currentSubscription.plan_features?.agent_consultations_limit 
                ? (usage.agent_consultations / this.currentSubscription.plan_features.agent_consultations_limit) * 100
                : 0;
            
            statsHtml += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span>Agent Consultations</span>
                        <span>${usage.agent_consultations}${this.currentSubscription.plan_features?.agent_consultations_limit ? ` / ${this.currentSubscription.plan_features.agent_consultations_limit}` : ''}</span>
                    </div>
                    <div class="progress-bar-custom">
                        <div class="progress-fill bg-success" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
            `;
        }

        statsHtml += '</div>';
        return statsHtml;
    }

    renderPlans() {
        const container = document.getElementById('pricingPlans');
        if (!container) return;

        container.innerHTML = '';

        this.plans.forEach(plan => {
            const isCurrentPlan = this.currentSubscription && 
                                 this.currentSubscription.plan_id === plan.id;
            
            const isFeatured = plan.name.toLowerCase().includes('professional');
            
            const card = document.createElement('div');
            card.className = 'col-lg-4 col-md-6 mb-4';
            
            card.innerHTML = `
                <div class="card pricing-card ${isFeatured ? 'featured' : ''} h-100">
                    <div class="card-body text-center">
                        <h5 class="card-title">${plan.name}</h5>
                        <div class="plan-price">
                            <span class="plan-currency">$</span>${plan.price}
                            <span class="plan-period">/${plan.billing_period}</span>
                        </div>
                        <p class="text-muted">${plan.description}</p>
                        
                        <ul class="plan-features">
                            ${this.renderPlanFeatures(plan)}
                        </ul>
                        
                        <div class="mt-auto">
                            ${isCurrentPlan 
                                ? '<button class="btn btn-outline-primary w-100" disabled>Current Plan</button>'
                                : `<button class="btn btn-primary w-100" onclick="subscription.selectPlan(${plan.id})">${plan.price > 0 ? 'Subscribe Now' : 'Get Started'}</button>`
                            }
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    renderPlanFeatures(plan) {
        const features = [];
        
        // Job applications
        if (plan.features?.job_applications_limit) {
            if (plan.features.job_applications_limit === -1) {
                features.push('<li class="feature-included"><i class="fas fa-check"></i> Unlimited job applications</li>');
            } else {
                features.push(`<li class="feature-included"><i class="fas fa-check"></i> ${plan.features.job_applications_limit} job applications/month</li>`);
            }
        } else {
            features.push('<li class="feature-included"><i class="fas fa-check"></i> 10 job applications/month</li>');
        }

        // Saved jobs
        if (plan.features?.saved_jobs_limit) {
            if (plan.features.saved_jobs_limit === -1) {
                features.push('<li class="feature-included"><i class="fas fa-check"></i> Unlimited saved jobs</li>');
            } else {
                features.push(`<li class="feature-included"><i class="fas fa-check"></i> ${plan.features.saved_jobs_limit} saved jobs</li>`);
            }
        } else {
            features.push('<li class="feature-included"><i class="fas fa-check"></i> Up to 10 saved jobs</li>');
        }

        // Advanced filters
        if (plan.features?.advanced_filters) {
            features.push('<li class="feature-included"><i class="fas fa-check"></i> Advanced search filters</li>');
        } else {
            features.push('<li class="feature-not-included"><i class="fas fa-times"></i> Advanced search filters</li>');
        }

        // Agent consultations
        if (plan.features?.agent_consultations_limit) {
            if (plan.features.agent_consultations_limit === -1) {
                features.push('<li class="feature-included"><i class="fas fa-check"></i> Unlimited agent consultations</li>');
            } else {
                features.push(`<li class="feature-included"><i class="fas fa-check"></i> ${plan.features.agent_consultations_limit} agent consultation/month</li>`);
            }
        } else {
            features.push('<li class="feature-not-included"><i class="fas fa-times"></i> Agent consultations</li>');
        }

        // Resume templates
        if (plan.features?.resume_templates) {
            features.push('<li class="feature-included"><i class="fas fa-check"></i> Professional resume templates</li>');
        } else {
            features.push('<li class="feature-not-included"><i class="fas fa-times"></i> Resume templates</li>');
        }

        // Career coaching
        if (plan.features?.career_coaching) {
            features.push('<li class="feature-included"><i class="fas fa-check"></i> Career coaching resources</li>');
        } else {
            features.push('<li class="feature-not-included"><i class="fas fa-times"></i> Career coaching resources</li>');
        }

        // Priority support
        if (plan.features?.priority_support) {
            features.push('<li class="feature-included"><i class="fas fa-check"></i> Priority customer support</li>');
        } else {
            features.push('<li class="feature-not-included"><i class="fas fa-times"></i> Priority support</li>');
        }

        return features.join('');
    }

    selectPlan(planId) {
        this.selectedPlan = this.plans.find(plan => plan.id === planId);
        
        if (!this.selectedPlan) {
            this.showAlert('Invalid plan selected', 'danger');
            return;
        }

        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login page
            this.showAlert('Please log in to subscribe to a plan', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html#login';
            }, 2000);
            return;
        }

        // Show payment modal for paid plans
        if (this.selectedPlan.price > 0) {
            this.showPaymentModal();
        } else {
            // Subscribe to free plan directly
            this.subscribeToPlan();
        }
    }

    showPaymentModal() {
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        const details = document.getElementById('selectedPlanDetails');
        
        details.innerHTML = `
            <div class="text-center">
                <h6>${this.selectedPlan.name}</h6>
                <div class="plan-price mb-3">
                    <span class="plan-currency">$</span>${this.selectedPlan.price}
                    <span class="plan-period">/${this.selectedPlan.billing_period}</span>
                </div>
                <p class="text-muted">${this.selectedPlan.description}</p>
            </div>
        `;
        
        modal.show();
    }

    async subscribeToPlan(paymentData = null) {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan_id: this.selectedPlan.id,
                    payment_data: paymentData
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showAlert('Successfully subscribed to plan!', 'success');
                
                // Close modal if open
                const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                if (modal) modal.hide();
                
                // Reload current subscription
                await this.loadCurrentSubscription();
                
                // Re-render plans
                this.renderPlans();
                
            } else {
                throw new Error(data.message || 'Subscription failed');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            this.showAlert(error.message || 'Failed to process subscription', 'danger');
        }
    }

    setupEventListeners() {
        // Payment form validation
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');

        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
            });
        }

        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
            });
        }

        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
            });
        }
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
}

// Global function for payment processing
async function processPayment() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholderName').value;

    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        subscription.showAlert('Please fill in all payment details', 'danger');
        return;
    }

    if (cardNumber.length < 13 || cardNumber.length > 19) {
        subscription.showAlert('Please enter a valid card number', 'danger');
        return;
    }

    if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
        subscription.showAlert('Please enter a valid expiry date (MM/YY)', 'danger');
        return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
        subscription.showAlert('Please enter a valid CVV', 'danger');
        return;
    }

    // In a real application, this would integrate with a payment processor
    const paymentData = {
        card_number: cardNumber.slice(-4), // Only store last 4 digits
        cardholder_name: cardholderName,
        payment_method: 'credit_card'
    };

    await subscription.subscribeToPlan(paymentData);
}

// Initialize subscription manager when page loads
let subscription;
document.addEventListener('DOMContentLoaded', () => {
    subscription = new SubscriptionManager();
});
