// Profile Information Form Handler
class ProfileForm {
    constructor() {
        this.form = document.getElementById('profileForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.fileInput = document.getElementById('resume');
        this.fileSelected = document.getElementById('file-selected');
        this.fileName = document.getElementById('file-name');
        this.removeFileBtn = document.getElementById('remove-file');
        
        this.selectedFile = null;
        this.currentUser = null;
        
        this.initializeEventListeners();
        this.initializeFileUpload();
        this.initializeAgentSearch();
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

        // Progress tracking
        this.form.addEventListener('input', this.updateProgress.bind(this));
        this.form.addEventListener('change', this.updateProgress.bind(this));
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

    async loadCurrentUserData() {
        try {
            // Check if user is logged in
            if (!auth.isLoggedIn()) {
                window.location.href = 'login.html';
                return;
            }

            // Get current user data
            const response = await fetch('/api/user/profile', {
                headers: auth.getAuthHeaders()
            });

            if (response.ok) {
                this.currentUser = await response.json();
                this.populateForm(this.currentUser);
            } else {
                console.error('Failed to load user data');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    initializeAgentSearch() {
        const agentSearchInput = document.getElementById('agentSearch');
        const agentDropdown = document.getElementById('agentDropdown');
        const agentResults = document.getElementById('agentResults');
        
        if (!agentSearchInput) return;

        let searchTimeout;
        let allAgents = [];

        // Load all agents initially
        this.loadAllAgents().then(agents => {
            allAgents = agents;
        });

        // Search input handler
        agentSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (searchTerm.length === 0) {
                agentDropdown.style.display = 'none';
                return;
            }

            if (searchTerm.length < 2) {
                return;
            }

            // Show loading state
            this.showAgentSearchLoading(true);
            agentDropdown.style.display = 'block';

            // Debounce search
            searchTimeout = setTimeout(() => {
                this.searchAgents(searchTerm, allAgents);
            }, 300);
        });

        // Click outside to close dropdown
        document.addEventListener('click', (e) => {
            if (!agentSearchInput.contains(e.target) && !agentDropdown.contains(e.target)) {
                agentDropdown.style.display = 'none';
            }
        });

        // Focus handler
        agentSearchInput.addEventListener('focus', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length >= 2) {
                agentDropdown.style.display = 'block';
            }
        });
    }

    async loadAllAgents() {
        try {
            const response = await fetch('/api/agents?limit=100');
            
            if (response.ok) {
                const data = await response.json();
                return data.agents || [];
            } else {
                console.error('Failed to load agents');
                return [];
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            return [];
        }
    }

    searchAgents(searchTerm, agents) {
        const agentResults = document.getElementById('agentResults');
        const agentNoResults = document.getElementById('agentNoResults');
        
        this.showAgentSearchLoading(false);

        // Filter agents based on search term
        const filteredAgents = agents.filter(agent => {
            const searchLower = searchTerm.toLowerCase();
            return (
                agent.agent_name.toLowerCase().includes(searchLower) ||
                agent.display_name.toLowerCase().includes(searchLower) ||
                (agent.location && agent.location.toLowerCase().includes(searchLower)) ||
                (agent.specializations && agent.specializations.some(spec => 
                    spec.toLowerCase().includes(searchLower)
                ))
            );
        });

        // Clear previous results
        agentResults.innerHTML = '';

        if (filteredAgents.length === 0) {
            agentNoResults.style.display = 'block';
        } else {
            agentNoResults.style.display = 'none';
            
            // Limit to first 10 results
            const limitedResults = filteredAgents.slice(0, 10);
            
            limitedResults.forEach(agent => {
                const agentItem = this.createAgentSearchItem(agent);
                agentResults.appendChild(agentItem);
            });
        }
    }

    createAgentSearchItem(agent) {
        const agentItem = document.createElement('div');
        agentItem.className = 'agent-item';
        agentItem.onclick = () => this.selectAgent(agent);

        const specializations = Array.isArray(agent.specializations) 
            ? agent.specializations.slice(0, 3).join(', ')
            : '';

        agentItem.innerHTML = `
            <div class="agent-name">${agent.agent_name}</div>
            <div class="agent-details">
                ${agent.display_name}
                ${agent.location ? ` • ${agent.location}` : ''}
                ${agent.rating ? ` • ⭐ ${agent.rating}` : ''}
            </div>
            ${specializations ? `<div class="agent-specializations">${specializations}</div>` : ''}
        `;

        return agentItem;
    }

    selectAgent(agent) {
        const agentSearchInput = document.getElementById('agentSearch');
        const selectedAgentInput = document.getElementById('selectedAgent');
        const agentDropdown = document.getElementById('agentDropdown');
        const selectedAgentDisplay = document.getElementById('selectedAgentDisplay');
        const selectedAgentName = document.getElementById('selectedAgentName');

        // Set the search input to show selected agent
        agentSearchInput.value = `${agent.agent_name} - ${agent.display_name}`;
        
        // Set the hidden input value
        selectedAgentInput.value = agent.id;
        
        // Hide dropdown
        agentDropdown.style.display = 'none';
        
        // Show selected agent display
        selectedAgentName.textContent = `${agent.agent_name} - ${agent.display_name}${agent.location ? ` (${agent.location})` : ''}`;
        selectedAgentDisplay.style.display = 'block';
    }

    showAgentSearchLoading(show) {
        const loadingElement = document.querySelector('.agent-loading');
        const resultsElement = document.getElementById('agentResults');
        const noResultsElement = document.getElementById('agentNoResults');

        if (show) {
            loadingElement.style.display = 'block';
            resultsElement.innerHTML = '';
            noResultsElement.style.display = 'none';
        } else {
            loadingElement.style.display = 'none';
        }
    }

    populateForm(userData) {
        // Populate basic fields
        if (userData.first_name) document.getElementById('first_name').value = userData.first_name;
        if (userData.last_name) document.getElementById('last_name').value = userData.last_name;
        if (userData.email) document.getElementById('email').value = userData.email;
        if (userData.phone) document.getElementById('phone').value = userData.phone;
        if (userData.location) document.getElementById('location').value = userData.location;
        if (userData.experience_level) document.getElementById('experience_level').value = userData.experience_level;

        // Parse and populate job preferences
        if (userData.job_preference) {
            try {
                const jobPref = JSON.parse(userData.job_preference);
                if (jobPref.role_type) document.getElementById('role_type').value = jobPref.role_type;
                if (jobPref.industry) document.getElementById('industry').value = jobPref.industry;
                
                // Employment types
                if (jobPref.employment_types && Array.isArray(jobPref.employment_types)) {
                    jobPref.employment_types.forEach(type => {
                        const checkbox = document.querySelector(`input[value="${type}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            } catch (error) {
                console.error('Error parsing job preferences:', error);
            }
        }

        // Parse work eligibility from bio (if stored there)
        if (userData.bio && userData.bio.includes('Work Eligibility:')) {
            const workEligibility = userData.bio.split('Work Eligibility:')[1].trim();
            document.getElementById('work_eligibility').value = workEligibility;
        }

        this.updateProgress();
    }

    updateProgress() {
        const sections = [
            { id: 'step-1', fields: ['first_name', 'last_name', 'email', 'location'] },
            { id: 'step-2', fields: ['work_eligibility'] },
            { id: 'step-3', fields: ['role_type', 'experience_level'] },
            { id: 'step-4', fields: [] }, // Resume is optional
            { id: 'step-5', fields: ['data_processing_consent'] }
        ];

        sections.forEach((section, index) => {
            const stepElement = document.getElementById(section.id);
            const isCompleted = section.fields.every(fieldId => {
                const field = document.getElementById(fieldId);
                return field && field.value.trim() !== '';
            });

            // Check employment types for step 3
            if (section.id === 'step-3') {
                const employmentTypesChecked = document.querySelectorAll('.employment-type:checked').length > 0;
                const hasRequiredFields = section.fields.every(fieldId => {
                    const field = document.getElementById(fieldId);
                    return field && field.value.trim() !== '';
                });
                const finalCheck = hasRequiredFields && employmentTypesChecked;
                
                if (finalCheck) {
                    stepElement.classList.add('completed');
                    stepElement.classList.remove('active');
                } else {
                    stepElement.classList.remove('completed');
                    if (index === 0 || sections[index - 1].fields.every(fieldId => {
                        const field = document.getElementById(fieldId);
                        return field && field.value.trim() !== '';
                    })) {
                        stepElement.classList.add('active');
                    }
                }
            } else {
                if (isCompleted) {
                    stepElement.classList.add('completed');
                    stepElement.classList.remove('active');
                } else {
                    stepElement.classList.remove('completed');
                    if (index === 0 || sections.slice(0, index).every(prevSection => 
                        prevSection.fields.every(fieldId => {
                            const field = document.getElementById(fieldId);
                            return field && field.value.trim() !== '';
                        })
                    )) {
                        stepElement.classList.add('active');
                    }
                }
            }
        });
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

    validateEmploymentTypes() {
        // Make validation optional - always return true
        const errorElement = document.getElementById('employment-type-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }

    validateField(event) {
        // Make validation optional - just remove any existing validation classes
        const field = event.target;
        field.classList.remove('is-invalid', 'is-valid');
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

        this.setLoading(true);

        try {
            // Upload resume if provided
            let resumePath = null;
            if (this.selectedFile) {
                resumePath = await this.uploadResume();
                if (!resumePath) {
                    this.showAlert('Resume upload failed. Please try again.', 'danger');
                    this.setLoading(false);
                    return;
                }
            }

            // Prepare form data
            const formData = new FormData(this.form);
            const profileData = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'), // Include email for new users
                phone: formData.get('phone') || null,
                location: formData.get('location'),
                work_eligibility: formData.get('work_eligibility'),
                experience_level: formData.get('experience_level'),
                
                // Job preferences as JSON
                job_preference: JSON.stringify({
                    role_type: formData.get('role_type'),
                    industry: formData.get('industry') || null,
                    employment_types: this.getSelectedEmploymentTypes()
                }),
                
                // Update bio with work eligibility
                bio: `Work Eligibility: ${formData.get('work_eligibility')}`,
                
                // Consent flags
                data_processing_consent: formData.get('data_processing_consent') === 'on',
                job_alerts_consent: formData.get('job_alerts_consent') === 'on',
                marketing_consent: formData.get('marketing_consent') === 'on',
                
                // Selected agent (optional)
                selected_agent_id: formData.get('selected_agent') || null,
                
                // Resume path if uploaded
                resume_path: resumePath
            };

            // Submit profile form (for new users)
            const response = await fetch('/api/user/profile-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert('Profile submitted successfully! We will review your information and contact you soon.', 'success');
                
                // Reset form after successful submission
                setTimeout(() => {
                    this.form.reset();
                    this.form.classList.remove('was-validated');
                    // Clear selected agent
                    document.getElementById('agentSearch').value = '';
                    document.getElementById('selected_agent').value = '';
                    // Clear resume selection
                    this.selectedFile = null;
                    const resumeLabel = document.querySelector('label[for="resume"]');
                    if (resumeLabel) {
                        resumeLabel.textContent = 'Choose resume file (PDF, DOC, DOCX - Max 5MB)';
                    }
                }, 2000);
            } else {
                this.showAlert(result.message || 'Profile submission failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Profile submission error:', error);
            this.showAlert('Network error. Please check your connection and try again.', 'danger');
        } finally {
            this.setLoading(false);
        }
    }

    showAlert(message, type = 'info') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert at the top of the form container
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
        }

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }

    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.loadingSpinner.style.display = 'inline-block';
            this.submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
        } else {
            this.submitBtn.disabled = false;
            this.loadingSpinner.style.display = 'none';
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Profile';
        }
    }
}

// Initialize profile form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize header and footer components
    if (typeof MainHeader !== 'undefined') {
        new MainHeader();
    }
    if (typeof MainFooter !== 'undefined') {
        new MainFooter();
    }
    
    // Initialize profile form
    new ProfileForm();
});

// Global function to clear selected agent
function clearSelectedAgent() {
    const agentSearchInput = document.getElementById('agentSearch');
    const selectedAgentInput = document.getElementById('selectedAgent');
    const selectedAgentDisplay = document.getElementById('selectedAgentDisplay');

    if (agentSearchInput) agentSearchInput.value = '';
    if (selectedAgentInput) selectedAgentInput.value = '';
    if (selectedAgentDisplay) selectedAgentDisplay.style.display = 'none';
}

// Enable Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
