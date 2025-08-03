
class AccountManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        
        this.loadUserData();
        
        
        this.setupFormHandlers();
        
        
        this.setupTabNavigation();
        
        
        this.loadBillingInfo();
        
        
        this.setupBillingFunctionality();
    }

    loadUserData() {
        
        
        const userData = this.getUserData();
        
        if (userData) {
            this.populateContactForm(userData);
            this.populateEmailPreferences(userData);
        }
    }

    getUserData() {
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        
        
        return {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            zipCode: '10001',
            state: 'NY',
            country: 'US',
            timezone: 'EST',
            emailPreferences: {
                dailyAlerts: true,
                weeklyDigest: true,
                instantAlerts: false,
                newsletter: true,
                promotions: false,
                events: true,
                accountUpdates: true,
                applicationUpdates: true
            }
        };
    }

    populateContactForm(userData) {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const fields = ['firstName', 'lastName', 'email', 'phone', 'zipCode', 'state', 'country', 'timezone'];
        
        fields.forEach(field => {
            const input = form.querySelector(`#${field}`);
            if (input && userData[field]) {
                input.value = userData[field];
            }
        });
    }

    populateEmailPreferences(userData) {
        const form = document.getElementById('emailForm');
        if (!form || !userData.emailPreferences) return;

        Object.keys(userData.emailPreferences).forEach(preference => {
            const checkbox = form.querySelector(`#${preference}`);
            if (checkbox) {
                checkbox.checked = userData.emailPreferences[preference];
            }
        });
    }

    setupFormHandlers() {
        
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactUpdate(contactForm);
            });
        }

        
        const emailForm = document.getElementById('emailForm');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailPreferencesUpdate(emailForm);
            });
        }

        
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordUpdate(passwordForm);
            });
        }
    }

    setupTabNavigation() {
        
        const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                const targetTab = e.target.getAttribute('data-bs-target');
                this.onTabSwitch(targetTab);
            });
        });
    }

    onTabSwitch(targetTab) {
        
        this.trackEvent('account_tab_view', {
            tab: targetTab.replace('#', '')
        });

        
        if (targetTab === '#billing-info') {
            this.loadBillingInfo();
        }
    }

    async handleContactUpdate(form) {
        try {
            const formData = new FormData(form);
            const updateData = Object.fromEntries(formData.entries());

            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
            submitBtn.disabled = true;

            
            await this.simulateApiCall();

            
            const currentUser = this.getUserData();
            const updatedUser = { ...currentUser, ...updateData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            
            this.showAlert('Contact information updated successfully!', 'success');

            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            
            this.trackEvent('account_contact_updated');

        } catch (error) {
            console.error('Error updating contact info:', error);
            this.showAlert('Failed to update contact information. Please try again.', 'danger');
            
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
            submitBtn.disabled = false;
        }
    }

    async handleEmailPreferencesUpdate(form) {
        try {
            const formData = new FormData(form);
            const preferences = {};
            
            
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                preferences[checkbox.name] = checkbox.checked;
            });

            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
            submitBtn.disabled = true;

            
            await this.simulateApiCall();

            
            const currentUser = this.getUserData();
            currentUser.emailPreferences = preferences;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            
            this.showAlert('Email preferences updated successfully!', 'success');

            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            
            this.trackEvent('account_email_preferences_updated', { preferences });

        } catch (error) {
            console.error('Error updating email preferences:', error);
            this.showAlert('Failed to update email preferences. Please try again.', 'danger');
            
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Preferences';
            submitBtn.disabled = false;
        }
    }

    async handlePasswordUpdate(form) {
        try {
            const formData = new FormData(form);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            
            if (newPassword !== confirmPassword) {
                this.showAlert('New passwords do not match.', 'danger');
                return;
            }

            if (!this.validatePassword(newPassword)) {
                this.showAlert('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.', 'danger');
                return;
            }

            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
            submitBtn.disabled = true;

            
            await this.simulateApiCall();

            
            this.showAlert('Password updated successfully!', 'success');

            
            form.reset();

            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            
            this.trackEvent('account_password_updated');

        } catch (error) {
            console.error('Error updating password:', error);
            this.showAlert('Failed to update password. Please try again.', 'danger');
            
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-shield-alt me-2"></i>Update Password';
            submitBtn.disabled = false;
        }
    }

    validatePassword(password) {
        
        
        
        
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    loadBillingInfo() {
        
        this.loadSubscriptionInfo();
        this.loadPaymentMethods();
    }

    async loadSubscriptionInfo() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/subscriptions/current', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateSubscriptionDisplay(data.subscription);
            }
        } catch (error) {
            console.error('Error loading subscription info:', error);
        }
    }

    async loadPaymentMethods() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/payment-methods', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updatePaymentMethodDisplay(data.payment_methods);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        }
    }

    updateSubscriptionDisplay(subscription) {
        if (!subscription) return;

        
        const subscriptionCard = document.querySelector('.subscription-card .card-body');
        if (subscriptionCard) {
            const statusBadge = subscription.status === 'active' ? 
                '<span class="badge bg-success">Active</span>' : 
                `<span class="badge bg-warning">${subscription.status}</span>`;

            const nextBillingDate = new Date(subscription.expires_at).toLocaleDateString();

            subscriptionCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title text-primary">${subscription.name}</h5>
                        <p class="card-text">${subscription.description}</p>
                        <div class="subscription-details">
                            <p class="mb-1"><strong>Status:</strong> ${statusBadge}</p>
                            <p class="mb-1"><strong>Next billing date:</strong> ${nextBillingDate}</p>
                            <p class="mb-0"><strong>Amount:</strong> $${subscription.price}/${subscription.billing_period}</p>
                        </div>
                    </div>
                    <div class="subscription-actions">
                        <button class="btn btn-outline-primary btn-sm mb-2" data-action="manage-subscription">Manage Subscription</button>
                        <button class="btn btn-outline-danger btn-sm" data-action="cancel-subscription">Cancel Subscription</button>
                    </div>
                </div>
            `;
            
            
            this.setupBillingEventListeners();
        }
    }

    updatePaymentMethodDisplay(paymentMethods) {
        const paymentCard = document.querySelector('.payment-card .card-body');
        if (!paymentCard) return;

        if (paymentMethods.length === 0) {
            paymentCard.innerHTML = `
                <div class="text-center">
                    <p class="text-muted mb-3">No payment methods on file</p>
                    <button class="btn btn-primary btn-sm" data-action="add-payment-method">Add Payment Method</button>
                </div>
            `;
        } else {
            const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default) || paymentMethods[0];
            const cardBrandIcon = this.getCardBrandIcon(defaultPaymentMethod.card_brand);

            paymentCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <i class="${cardBrandIcon} fa-2x text-primary me-3"></i>
                        <div>
                            <p class="mb-0"><strong>•••• •••• •••• ${defaultPaymentMethod.last_four_digits}</strong></p>
                            <small class="text-muted">Expires ${defaultPaymentMethod.expiry_month.toString().padStart(2, '0')}/${defaultPaymentMethod.expiry_year}</small>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-outline-secondary btn-sm" data-action="update-payment-method">Update</button>
                    </div>
                </div>
            `;
        }
        
        
        this.setupBillingEventListeners();
    }

    getCardBrandIcon(brand) {
        const icons = {
            'visa': 'fab fa-cc-visa',
            'mastercard': 'fab fa-cc-mastercard',
            'amex': 'fab fa-cc-amex',
            'discover': 'fab fa-cc-discover',
            'default': 'fas fa-credit-card'
        };
        return icons[brand?.toLowerCase()] || icons.default;
    }

    setupBillingFunctionality() {
        
        this.populateExpiryYears();
        
        
        this.setupCardNumberFormatting();
        
        
        this.setupBillingEventListeners();
    }

    setupBillingEventListeners() {
        
        document.removeEventListener('click', this.handleBillingClick);
        
        
        this.handleBillingClick = (e) => {
            const action = e.target.dataset.action;
            
            switch (action) {
                case 'manage-subscription':
                    e.preventDefault();
                    openSubscriptionModal();
                    break;
                case 'cancel-subscription':
                    e.preventDefault();
                    cancelSubscription();
                    break;
                case 'update-payment-method':
                case 'add-payment-method':
                    e.preventDefault();
                    if (e.target.closest('#paymentMethodModal')) {
                        
                        addPaymentMethod();
                    } else {
                        
                        openPaymentMethodModal();
                    }
                    break;
            }
        };
        
        document.addEventListener('click', this.handleBillingClick);
    }

    populateExpiryYears() {
        const yearSelect = document.getElementById('expiryYear');
        if (!yearSelect) return;

        const currentYear = new Date().getFullYear();
        for (let i = 0; i <= 20; i++) {
            const year = currentYear + i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    setupCardNumberFormatting() {
        const cardNumberInput = document.getElementById('cardNumber');
        const cvvInput = document.getElementById('cvv');

        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
            });
        }

        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
            });
        }
    }

    simulateApiCall() {
        
        return new Promise(resolve => {
            setTimeout(resolve, 1500);
        });
    }

    showAlert(message, type = 'info') {
        this.showNotification(message, type);
    }

    showNotification(message, type = 'info', title = null) {
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

    showToast(message, type = 'info', duration = 5000) {
        
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        
        const toastId = 'toast-' + Date.now();
        const iconMap = {
            success: 'fas fa-check-circle text-success',
            danger: 'fas fa-exclamation-triangle text-danger',
            warning: 'fas fa-exclamation-circle text-warning',
            info: 'fas fa-info-circle text-info'
        };

        const titleMap = {
            success: 'Success',
            danger: 'Error',
            warning: 'Warning',
            info: 'Info'
        };

        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="toast-header">
                <i class="${iconMap[type]} me-2"></i>
                <strong class="me-auto" style="font-family: 'Halcyon', sans-serif; font-size: 0.85rem;">${titleMap[type]}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body" style="font-family: 'Halcyon', sans-serif; font-size: 0.8rem;">
                ${message}
            </div>
        `;

        
        toast.style.cssText = `
            font-family: 'Halcyon', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid rgba(0,0,0,0.1);
            max-width: 350px;
        `;

        toastContainer.appendChild(toast);

        
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: duration
        });
        
        bsToast.show();

        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    trackEvent(eventName, data = {}) {
        
        console.log('Event tracked:', eventName, data);
        
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
}


let accountManager;
document.addEventListener('DOMContentLoaded', () => {
    accountManager = new AccountManager();
});


async function openSubscriptionModal() {
    const modal = new bootstrap.Modal(document.getElementById('subscriptionModal'));
    const content = document.getElementById('subscriptionModalContent');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/subscriptions/plans');
        const data = await response.json();
        
        if (response.ok) {
            content.innerHTML = `
                <h6>Available Plans</h6>
                <div class="row">
                    ${data.plans.map(plan => `
                        <div class="col-md-6 mb-3">
                            <div class="card h-100">
                                <div class="card-body">
                                    <h6 class="card-title">${plan.name}</h6>
                                    <p class="card-text">${plan.description}</p>
                                    <div class="h5 text-primary">$${plan.price}/${plan.billing_period}</div>
                                    <button class="btn btn-outline-primary btn-sm" onclick="changePlan(${plan.id})">
                                        Switch to this plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        content.innerHTML = `<div class="alert alert-danger">Error loading subscription plans</div>`;
    }
    
    modal.show();
}

async function openPaymentMethodModal() {
    const modal = new bootstrap.Modal(document.getElementById('paymentMethodModal'));
    await loadPaymentMethodsList();
    modal.show();
}

async function loadPaymentMethodsList() {
    const container = document.getElementById('paymentMethodsList');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/payment-methods', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const paymentMethods = data.payment_methods;
            
            if (paymentMethods.length === 0) {
                container.innerHTML = '<p class="text-muted">No payment methods found</p>';
                return;
            }
            
            container.innerHTML = `
                <h6>Your Payment Methods</h6>
                ${paymentMethods.map(pm => `
                    <div class="card mb-2">
                        <div class="card-body py-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <i class="${accountManager.getCardBrandIcon(pm.card_brand)} fa-lg me-3"></i>
                                    <div>
                                        <strong>•••• •••• •••• ${pm.last_four_digits}</strong>
                                        <small class="text-muted d-block">Expires ${pm.expiry_month.toString().padStart(2, '0')}/${pm.expiry_year}</small>
                                        ${pm.is_default ? '<span class="badge bg-primary">Default</span>' : ''}
                                    </div>
                                </div>
                                <div>
                                    ${!pm.is_default ? `<button class="btn btn-outline-primary btn-sm me-2" onclick="setDefaultPaymentMethod(${pm.id})">Set Default</button>` : ''}
                                    <button class="btn btn-outline-danger btn-sm" onclick="deletePaymentMethod(${pm.id})">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Error loading payment methods</div>';
    }
}

async function addPaymentMethod() {
    const form = document.getElementById('paymentMethodForm');
    const formData = new FormData(form);
    
    
    const cardNumber = formData.get('cardNumber').replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        accountManager.showAlert('Please enter a valid card number', 'danger');
        return;
    }
    
    
    const cardBrand = detectCardBrand(cardNumber);
    
    const paymentMethodData = {
        payment_type: 'credit_card',
        card_brand: cardBrand,
        last_four_digits: cardNumber.slice(-4),
        cardholder_name: formData.get('cardholderName'),
        expiry_month: parseInt(formData.get('expiryMonth')),
        expiry_year: parseInt(formData.get('expiryYear')),
        billing_address_line1: formData.get('billingAddress1'),
        billing_city: formData.get('billingCity'),
        billing_state: formData.get('billingState'),
        billing_postal_code: formData.get('billingZip'),
        is_default: formData.get('setAsDefault') === 'on'
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/payment-methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentMethodData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            accountManager.showAlert('Payment method added successfully!', 'success');
            form.reset();
            await loadPaymentMethodsList();
            await accountManager.loadPaymentMethods();
        } else {
            accountManager.showAlert(data.message || 'Error adding payment method', 'danger');
        }
    } catch (error) {
        console.error('Error adding payment method:', error);
        accountManager.showAlert('Network error while adding payment method', 'danger');
    }
}

async function setDefaultPaymentMethod(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payment-methods/${id}/set-default`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            accountManager.showAlert('Default payment method updated!', 'success');
            await loadPaymentMethodsList();
            await accountManager.loadPaymentMethods();
        } else {
            accountManager.showAlert(data.message || 'Error updating default payment method', 'danger');
        }
    } catch (error) {
        console.error('Error setting default payment method:', error);
        accountManager.showAlert('Network error', 'danger');
    }
}

async function deletePaymentMethod(id) {
    if (!confirm('Are you sure you want to delete this payment method?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payment-methods/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            accountManager.showAlert('Payment method deleted successfully!', 'success');
            await loadPaymentMethodsList();
            await accountManager.loadPaymentMethods();
        } else {
            accountManager.showAlert(data.message || 'Error deleting payment method', 'danger');
        }
    } catch (error) {
        console.error('Error deleting payment method:', error);
        accountManager.showAlert('Network error', 'danger');
    }
}

async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/subscriptions/cancel', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            accountManager.showAlert('Subscription cancelled successfully', 'success');
            await accountManager.loadSubscriptionInfo();
        } else {
            accountManager.showAlert(data.message || 'Error cancelling subscription', 'danger');
        }
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        accountManager.showAlert('Network error', 'danger');
    }
}

async function changePlan(planId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/subscriptions/change-plan', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                plan_id: planId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            accountManager.showAlert('Subscription plan changed successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('subscriptionModal')).hide();
            await accountManager.loadSubscriptionInfo();
        } else {
            accountManager.showAlert(data.message || 'Error changing subscription plan', 'danger');
        }
    } catch (error) {
        console.error('Error changing plan:', error);
        accountManager.showAlert('Network error', 'danger');
    }
}

function detectCardBrand(cardNumber) {
    const patterns = {
        'visa': /^4/,
        'mastercard': /^5[1-5]/,
        'amex': /^3[47]/,
        'discover': /^6(?:011|5)/
    };
    
    for (const [brand, pattern] of Object.entries(patterns)) {
        if (pattern.test(cardNumber)) {
            return brand;
        }
    }
    
    return 'unknown';
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountManager;
}
