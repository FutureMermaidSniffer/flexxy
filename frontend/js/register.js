// Registration Form Handler
class RegistrationForm {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.fileInput = document.getElementById('resume');
        this.fileSelected = document.getElementById('file-selected');
        this.fileName = document.getElementById('file-name');
        this.removeFileBtn = document.getElementById('remove-file');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirm_password');
        this.strengthMeter = document.getElementById('strengthMeter');
        
        this.selectedFile = null;
        this.initializeEventListeners();
        this.initializeFileUpload();
        this.initializePasswordValidation();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        this.form.addEventListener('input', this.validateField.bind(this));
        this.form.addEventListener('change', this.validateField.bind(this));
        
        // Employment type validation
        const employmentTypes = document.querySelectorAll('.employment-type');
        employmentTypes.forEach(checkbox => {
            checkbox.addEventListener('change', this.validateEmploymentTypes.bind(this));
        });
    }

    initializeFileUpload() {
        // Click to upload
        this.fileUploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File selection
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Drag and drop
        this.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.add('dragover');
        });

        this.fileUploadArea.addEventListener('dragleave', () => {
            this.fileUploadArea.classList.remove('dragover');
        });

        this.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });

        // Remove file
        this.removeFileBtn.addEventListener('click', this.removeFile.bind(this));
    }

    initializePasswordValidation() {
        this.passwordInput.addEventListener('input', this.updatePasswordStrength.bind(this));
        this.confirmPasswordInput.addEventListener('input', this.validatePasswordMatch.bind(this));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            auth.showAlert('Please upload a PDF, DOC, or DOCX file.', 'danger');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            auth.showAlert('File size must be less than 5MB.', 'danger');
            return;
        }

        this.selectedFile = file;
        this.fileName.textContent = file.name;
        this.fileSelected.style.display = 'block';
        this.fileUploadArea.style.display = 'none';
    }

    removeFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.fileSelected.style.display = 'none';
        this.fileUploadArea.style.display = 'block';
    }

    updatePasswordStrength() {
        const password = this.passwordInput.value;
        const strength = this.calculatePasswordStrength(password);
        
        this.strengthMeter.className = 'strength-meter';
        
        if (password.length === 0) {
            this.strengthMeter.style.width = '0%';
            return;
        }

        if (strength < 30) {
            this.strengthMeter.classList.add('strength-weak');
            this.strengthMeter.style.width = '33%';
        } else if (strength < 70) {
            this.strengthMeter.classList.add('strength-medium');
            this.strengthMeter.style.width = '66%';
        } else {
            this.strengthMeter.classList.add('strength-strong');
            this.strengthMeter.style.width = '100%';
        }
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        
        // Character types
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        
        return Math.min(strength, 100);
    }

    validatePasswordMatch() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.confirmPasswordInput.setCustomValidity('Passwords do not match');
            this.confirmPasswordInput.classList.add('is-invalid');
        } else {
            this.confirmPasswordInput.setCustomValidity('');
            this.confirmPasswordInput.classList.remove('is-invalid');
            if (confirmPassword) {
                this.confirmPasswordInput.classList.add('is-valid');
            }
        }
    }

    validateEmploymentTypes() {
        const checkedTypes = document.querySelectorAll('.employment-type:checked');
        const errorElement = document.getElementById('employment-type-error');
        
        if (checkedTypes.length === 0) {
            errorElement.style.display = 'block';
            return false;
        } else {
            errorElement.style.display = 'none';
            return true;
        }
    }

    validateField(event) {
        const field = event.target;
        
        if (field.checkValidity()) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }

        // Custom validations
        if (field.id === 'email') {
            this.validateEmail(field);
        } else if (field.id === 'password') {
            this.validatePassword(field);
        }
    }

    validateEmail(field) {
        const email = field.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            field.setCustomValidity('Please enter a valid email address');
            field.classList.add('is-invalid');
        } else {
            field.setCustomValidity('');
        }
    }

    validatePassword(field) {
        const password = field.value;
        const minLength = 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        if (password.length < minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            field.setCustomValidity('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            field.classList.add('is-invalid');
        } else {
            field.setCustomValidity('');
        }
    }

    getSelectedEmploymentTypes() {
        const checkedTypes = document.querySelectorAll('.employment-type:checked');
        return Array.from(checkedTypes).map(checkbox => checkbox.value);
    }

    async uploadResume() {
        if (!this.selectedFile) return null;

        const formData = new FormData();
        formData.append('resume', this.selectedFile);

        try {
            const response = await fetch('/api/upload/resume', {
                method: 'POST',
                headers: {
                    ...auth.getAuthHeaders()
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.filePath;
            } else {
                throw new Error('Resume upload failed');
            }
        } catch (error) {
            console.error('Resume upload error:', error);
            return null;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        // Validate form
        if (!this.form.checkValidity()) {
            this.form.classList.add('was-validated');
            return;
        }

        // Validate employment types
        if (!this.validateEmploymentTypes()) {
            return;
        }

        // Validate password match
        this.validatePasswordMatch();
        if (this.confirmPasswordInput.classList.contains('is-invalid')) {
            return;
        }

        this.setLoading(true);

        try {
            // Upload resume if provided
            let resumePath = null;
            if (this.selectedFile) {
                resumePath = await this.uploadResume();
                if (!resumePath) {
                    auth.showAlert('Resume upload failed. Please try again.', 'danger');
                    this.setLoading(false);
                    return;
                }
            }

            // Prepare form data
            const formData = new FormData(this.form);
            const registrationData = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                location: formData.get('location'),
                work_eligibility: formData.get('work_eligibility'),
                experience_level: formData.get('experience_level'),
                password: formData.get('password'),
                
                // Job preferences as JSON
                job_preference: JSON.stringify({
                    role_type: formData.get('role_type'),
                    industry: formData.get('industry') || null,
                    employment_types: this.getSelectedEmploymentTypes()
                }),
                
                // Consent flags
                gdpr_consent: formData.get('gdpr_consent') === 'on',
                newsletter_consent: formData.get('newsletter_consent') === 'on',
                marketing_consent: formData.get('marketing_consent') === 'on',
                
                // Resume path if uploaded
                resume_path: resumePath,
                
                // Default values
                user_type: 'job_seeker'
            };

            // Submit registration
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const result = await response.json();

            if (response.ok) {
                auth.showAlert('Registration successful! Please check your email to verify your account.', 'success');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                auth.showAlert(result.message || 'Registration failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            auth.showAlert('Network error. Please check your connection and try again.', 'danger');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.loadingSpinner.style.display = 'inline-block';
            this.submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
        } else {
            this.submitBtn.disabled = false;
            this.loadingSpinner.style.display = 'none';
            this.submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Create Account';
        }
    }
}

// Initialize registration form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationForm();
});

// Enable Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
