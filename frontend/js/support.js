// Support Page JavaScript
class SupportManager {
    constructor() {
        this.chatAvailable = true;
        this.init();
    }

    init() {
        // Setup form handling
        this.setupFormHandler();
        
        // Setup chat functionality
        this.setupChat();
        
        // Setup phone support
        this.setupPhoneSupport();
        
        // Auto-fill user data if available
        this.autoFillUserData();
        
        // Setup analytics tracking
        this.setupAnalytics();
        
        // Check chat availability
        this.checkChatAvailability();
    }

    setupFormHandler() {
        const supportForm = document.getElementById('supportForm');
        if (!supportForm) return;

        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(supportForm);
        });

        // Auto-populate account email if user is logged in
        const emailField = document.getElementById('email');
        const accountEmailField = document.getElementById('accountEmail');
        
        if (emailField && accountEmailField) {
            emailField.addEventListener('change', () => {
                if (!accountEmailField.value) {
                    accountEmailField.value = emailField.value;
                }
            });
        }

        // File upload validation
        const attachmentField = document.getElementById('attachment');
        if (attachmentField) {
            attachmentField.addEventListener('change', (e) => {
                this.validateFileUpload(e.target);
            });
        }
    }

    async handleFormSubmission(form) {
        try {
            const formData = new FormData(form);
            const supportData = Object.fromEntries(formData.entries());

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;

            // Validate form
            if (!this.validateForm(supportData)) {
                throw new Error('Please fill in all required fields correctly.');
            }

            // Simulate API call to submit support ticket
            await this.submitSupportTicket(supportData);

            // Show success message
            this.showSuccessMessage();

            // Reset form
            form.reset();

            // Track submission
            this.trackEvent('support_ticket_submitted', {
                subject: supportData.subject,
                priority: supportData.priority
            });

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Error submitting support form:', error);
            this.showAlert('Failed to submit your request. Please try again or contact us directly.', 'danger');
            
            // Reset button
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Message';
            submitBtn.disabled = false;
        }
    }

    validateForm(data) {
        const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                this.showAlert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'warning');
                return false;
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showAlert('Please enter a valid email address.', 'warning');
            return false;
        }

        return true;
    }

    validateFileUpload(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (file.size > maxSize) {
            this.showAlert('File size must be less than 10MB.', 'warning');
            fileInput.value = '';
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            this.showAlert('Please upload a valid file type (JPG, PNG, PDF, DOC, DOCX).', 'warning');
            fileInput.value = '';
            return false;
        }

        return true;
    }

    async submitSupportTicket(data) {
        // In a real implementation, this would send to the backend
        // For now, we'll simulate the API call
        
        const ticketId = this.generateTicketId();
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Store ticket info in localStorage for demo purposes
        const ticket = {
            id: ticketId,
            ...data,
            createdAt: new Date().toISOString(),
            status: 'Open'
        };
        
        const existingTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        existingTickets.push(ticket);
        localStorage.setItem('supportTickets', JSON.stringify(existingTickets));
        
        return ticket;
    }

    generateTicketId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `FJ-${timestamp}-${randomStr}`.toUpperCase();
    }

    showSuccessMessage() {
        const ticketId = this.generateTicketId();
        
        const successHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <div class="d-flex align-items-center">
                    <i class="fas fa-check-circle fa-2x text-success me-3"></i>
                    <div>
                        <h5 class="alert-heading mb-1">Message Sent Successfully!</h5>
                        <p class="mb-1">Thank you for contacting us. Your support ticket has been created.</p>
                        <p class="mb-0"><strong>Ticket ID:</strong> ${ticketId}</p>
                        <small class="text-muted">You will receive a confirmation email shortly.</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        const formCard = document.querySelector('.contact-form-card');
        formCard.insertAdjacentHTML('afterbegin', successHtml);
        
        // Scroll to success message
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            const alert = formCard.querySelector('.alert-success');
            if (alert) {
                alert.remove();
            }
        }, 10000);
    }

    setupChat() {
        const chatButtons = document.querySelectorAll('#startLiveChat, #startChatMain');
        
        chatButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.initiateLiveChat();
            });
        });
    }

    initiateLiveChat() {
        // Track chat initiation
        this.trackEvent('live_chat_initiated', { source: 'support_page' });
        
        if (!this.chatAvailable) {
            this.showChatUnavailableMessage();
            return;
        }

        // In a real implementation, this would integrate with a chat service like Zendesk, Intercom, etc.
        // For now, we'll show a modal or redirect
        
        this.showChatModal();
    }

    showChatModal() {
        const modalHtml = `
            <div class="modal fade" id="chatModal" tabindex="-1" aria-labelledby="chatModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="chatModalLabel">
                                <i class="fas fa-comments text-success me-2"></i>
                                Live Chat Support
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="chat-info">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="status-indicator online me-2"></div>
                                    <span class="text-success"><strong>Support team is online</strong></span>
                                </div>
                                
                                <p>Connect with our support team for immediate assistance. Average response time: <strong>under 2 minutes</strong>.</p>
                                
                                <div class="chat-features">
                                    <ul class="list-unstyled">
                                        <li><i class="fas fa-check text-success me-2"></i>Real-time messaging</li>
                                        <li><i class="fas fa-check text-success me-2"></i>Screen sharing available</li>
                                        <li><i class="fas fa-check text-success me-2"></i>File sharing support</li>
                                        <li><i class="fas fa-check text-success me-2"></i>Conversation history saved</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Maybe Later</button>
                            <button type="button" class="btn btn-success" id="connectChat">
                                <i class="fas fa-comments me-2"></i>Start Chat Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if present
        const existingModal = document.getElementById('chatModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('chatModal'));
        modal.show();
        
        // Handle connect button
        document.getElementById('connectChat').addEventListener('click', () => {
            modal.hide();
            this.connectToChat();
        });
    }

    connectToChat() {
        // In a real app, this would open the chat widget
        // For demo, we'll show a placeholder message
        alert('Chat integration would open here. For now, please use the contact form or email support.');
    }

    showChatUnavailableMessage() {
        this.showAlert('Live chat is currently unavailable. Please use our contact form or email support for assistance.', 'info');
    }

    setupPhoneSupport() {
        const phoneButton = document.getElementById('scheduleCall');
        if (phoneButton) {
            phoneButton.addEventListener('click', () => {
                this.handlePhoneSupport();
            });
        }
    }

    handlePhoneSupport() {
        // Check if user has premium subscription
        const userSubscription = this.getUserSubscription();
        
        if (!userSubscription || userSubscription.type === 'free') {
            this.showUpgradeModal();
            return;
        }
        
        this.showCallSchedulingModal();
    }

    getUserSubscription() {
        // In a real app, this would come from the backend
        // For demo, check localStorage or return mock data
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.subscription || { type: 'free' };
    }

    showUpgradeModal() {
        const modalHtml = `
            <div class="modal fade" id="upgradeModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-star text-warning me-2"></i>
                                Premium Feature
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Phone support is available exclusively for Premium subscribers.</p>
                            <div class="upgrade-benefits">
                                <h6>Premium benefits include:</h6>
                                <ul>
                                    <li>Priority phone support</li>
                                    <li>Dedicated account manager</li>
                                    <li>Advanced job search features</li>
                                    <li>Resume review service</li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Maybe Later</button>
                            <a href="subscription.html" class="btn btn-primary">Upgrade Now</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('upgradeModal'));
        modal.show();
        
        // Track upgrade prompt
        this.trackEvent('upgrade_prompt_shown', { source: 'phone_support' });
    }

    autoFillUserData() {
        // Auto-fill form with user data if available
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (user.firstName) {
            const firstNameField = document.getElementById('firstName');
            if (firstNameField && !firstNameField.value) {
                firstNameField.value = user.firstName;
            }
        }
        
        if (user.lastName) {
            const lastNameField = document.getElementById('lastName');
            if (lastNameField && !lastNameField.value) {
                lastNameField.value = user.lastName;
            }
        }
        
        if (user.email) {
            const emailField = document.getElementById('email');
            const accountEmailField = document.getElementById('accountEmail');
            
            if (emailField && !emailField.value) {
                emailField.value = user.email;
            }
            
            if (accountEmailField && !accountEmailField.value) {
                accountEmailField.value = user.email;
            }
        }
        
        if (user.phone) {
            const phoneField = document.getElementById('phone');
            if (phoneField && !phoneField.value) {
                phoneField.value = user.phone;
            }
        }
        
        if (user.subscription) {
            const subscriptionField = document.getElementById('subscriptionType');
            if (subscriptionField && !subscriptionField.value) {
                subscriptionField.value = user.subscription.type || '';
            }
        }
    }

    setupAnalytics() {
        // Track page sections viewed
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.className.split(' ')[0];
                    this.trackEvent('support_section_viewed', { section: sectionName });
                }
            });
        }, { threshold: 0.5 });

        // Observe main sections
        const sections = document.querySelectorAll('.support-options, .contact-form-section, .support-resources');
        sections.forEach(section => observer.observe(section));
    }

    checkChatAvailability() {
        // In a real app, this would check with the chat service
        // For demo, we'll simulate based on time
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        // Business hours: 9 AM - 6 PM EST, Monday-Friday
        const isBusinessHours = (day >= 1 && day <= 5) && (hour >= 9 && hour <= 18);
        
        this.chatAvailable = isBusinessHours;
        
        // Update chat status indicators
        const statusIndicators = document.querySelectorAll('.status-indicator');
        const statusTexts = document.querySelectorAll('.chat-status small');
        
        statusIndicators.forEach(indicator => {
            indicator.className = `status-indicator ${this.chatAvailable ? 'online' : 'offline'}`;
        });
        
        statusTexts.forEach(text => {
            text.className = this.chatAvailable ? 'text-success' : 'text-warning';
            text.textContent = this.chatAvailable ? 'Support team is online' : 'Support team is offline';
        });
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert at top of form
        const formCard = document.querySelector('.contact-form-card');
        if (formCard) {
            formCard.insertBefore(alertDiv, formCard.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    trackEvent(eventName, data = {}) {
        console.log('Event tracked:', eventName, data);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SupportManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupportManager;
}
