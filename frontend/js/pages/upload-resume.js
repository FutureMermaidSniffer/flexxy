


document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof WizardHeader !== 'undefined') {
        window.wizardHeader = new WizardHeader({
            isFirstPage: false
        });
    }
    
    
    if (typeof WizardFooter !== 'undefined') {
        window.wizardFooter = new WizardFooter(2, 6, 'Next');
        
        window.wizardFooter.handleNext = () => {
            window.uploadResumePageInstance.handleNext();
        };
        
        window.wizardFooter.handleBack = () => {
            window.uploadResumePageInstance.handleBack();
        };
        
        window.wizardFooter.disableNextButton();
    }
    
    
    window.uploadResumePageInstance = new UploadResumePage();
});

class UploadResumePage {
    constructor() {
        this.selectedOption = null;
        this.uploadedFile = null;
        this.isFileUploaded = false;
        
        this.init();
    }

    init() {
        this.setupOptionCards();
        this.setupFileUpload();
        this.setupNavigation();
        this.restoreFromLocalStorage();
    }

    setupOptionCards() {
        const uploadOption = document.getElementById('uploadOption');
        const skipOption = document.getElementById('skipOption');
        
        if (uploadOption) {
            uploadOption.addEventListener('click', () => {
                this.selectOption('upload');
            });
        }
        
        if (skipOption) {
            skipOption.addEventListener('click', () => {
                this.selectOption('skip');
            });
        }
    }

    selectOption(option) {
        
        this.clearSelections();
        
        this.selectedOption = option;
        
        if (option === 'upload') {
            this.showSelection('uploadOption', 'uploadOverlay');
            
            this.createUploadInterface();
        } else if (option === 'skip') {
            this.showSelection('skipOption', 'skipOverlay');
        }
        
        this.updateNextButton();
        this.trackSelection();
    }

    createUploadInterface() {
        const uploadCard = document.getElementById('uploadOption');
        const cardBody = uploadCard.querySelector('.card-body');
        
        
        if (cardBody.querySelector('.dynamic-upload-zone')) {
            return;
        }
        
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'resumeFile';
        fileInput.className = 'd-none';
        fileInput.accept = '.doc,.docx,.pdf,.rtf,.txt';
        
        
        const dropZone = document.createElement('div');
        dropZone.id = 'dropZone';
        dropZone.className = 'dynamic-upload-zone page-upload__drop-zone border-2 border-dashed border-info rounded p-4 mb-3';
        dropZone.innerHTML = `
            <div class="page-upload__drop-content">
                <i class="fas fa-file-upload fa-2x text-info mb-2"></i>
                <p class="mb-1 fw-medium">Drop your resume here</p>
                <p class="small text-muted mb-2">or</p>
                <button class="btn btn-outline-info btn-sm" type="button">
                    Browse Files
                </button>
            </div>
        `;
        
        
        const fileTypesSection = cardBody.querySelector('.page-upload__file-types');
        if (fileTypesSection) {
            fileTypesSection.insertAdjacentElement('afterend', fileInput);
            fileTypesSection.insertAdjacentElement('afterend', dropZone);
        }
        
        
        this.setupDynamicFileUpload(fileInput, dropZone);
    }

    showSelection(cardId, overlayId) {
        
        const card = document.getElementById(cardId);
        const overlay = document.getElementById(overlayId);
        
        if (card) {
            card.classList.add('border-3', 'selected');
            if (cardId === 'uploadOption') {
                card.classList.add('border-info');
            } else {
                card.classList.add('border-warning');
            }
        }
        
        
        if (overlay) {
            overlay.classList.remove('d-none');
            overlay.classList.add('d-flex');
            
            
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        }
    }

    clearSelections() {
        
        const uploadCard = document.getElementById('uploadOption');
        const uploadOverlay = document.getElementById('uploadOverlay');
        if (uploadCard) {
            uploadCard.classList.remove('border-3', 'border-info', 'selected');
            
            
            const dynamicZone = uploadCard.querySelector('.dynamic-upload-zone');
            const dynamicInput = uploadCard.querySelector('#resumeFile');
            const dynamicStatus = uploadCard.querySelector('#uploadStatus');
            
            if (dynamicZone) dynamicZone.remove();
            if (dynamicInput) dynamicInput.remove();
            if (dynamicStatus) dynamicStatus.remove();
        }
        if (uploadOverlay) {
            uploadOverlay.classList.add('d-none');
            uploadOverlay.classList.remove('d-flex');
        }
        
        
        const skipCard = document.getElementById('skipOption');
        const skipOverlay = document.getElementById('skipOverlay');
        if (skipCard) {
            skipCard.classList.remove('border-3', 'border-warning', 'selected');
        }
        if (skipOverlay) {
            skipOverlay.classList.add('d-none');
            skipOverlay.classList.remove('d-flex');
        }
        
        
        this.uploadedFile = null;
        this.isFileUploaded = false;
    }

    setupFileUpload() {
        
        const fileInput = document.getElementById('resumeFile');
        const dropZone = document.getElementById('dropZone');
        
        if (fileInput && dropZone) {
            this.setupDynamicFileUpload(fileInput, dropZone);
        }
    }

    setupDynamicFileUpload(fileInput, dropZone) {
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        
        const browseButton = dropZone.querySelector('.btn');
        if (browseButton) {
            browseButton.addEventListener('click', () => {
                fileInput.click();
            });
        }
        
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
        
        
        dropZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                fileInput.click();
            }
        });
    }

    handleFileUpload(file) {
        
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/rtf', 'text/plain'];
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
        
        const fileName = file.name.toLowerCase();
        const isValidType = allowedTypes.includes(file.type) || allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!isValidType) {
            this.showError('Please upload a valid resume file (DOC, DOCX, PDF, RTF, or TXT)');
            return;
        }
        
        
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB');
            return;
        }
        
        this.uploadedFile = file;
        this.isFileUploaded = true;
        this.selectedOption = 'upload';
        
        
        this.showUploadSuccess(file.name);
        
        
        this.clearSelections();
        this.showSelection('uploadOption', 'uploadOverlay');
        this.updateNextButton();
        
        
        this.storeUploadPreference();
        
        
        this.trackFileUpload(file);
    }

    showUploadSuccess(fileName) {
        
        const dropZone = document.getElementById('dropZone') || document.querySelector('.dynamic-upload-zone');
        const uploadStatus = document.getElementById('uploadStatus');
        const uploadedFileName = document.getElementById('uploadedFileName');
        
        if (dropZone) {
            dropZone.classList.add('d-none');
        }
        
        
        if (!uploadStatus) {
            const uploadCard = document.getElementById('uploadOption');
            const cardBody = uploadCard.querySelector('.card-body');
            
            const statusDiv = document.createElement('div');
            statusDiv.id = 'uploadStatus';
            statusDiv.className = 'page-upload__status';
            statusDiv.innerHTML = `
                <div class="alert alert-success mb-0">
                    <i class="fas fa-check-circle me-2"></i>
                    <span id="uploadedFileName">${fileName} uploaded successfully!</span>
                </div>
            `;
            
            
            const insertAfter = dropZone || cardBody.querySelector('.page-upload__file-types');
            if (insertAfter) {
                insertAfter.insertAdjacentElement('afterend', statusDiv);
            }
        } else {
            uploadStatus.classList.remove('d-none');
            if (uploadedFileName) {
                uploadedFileName.textContent = `${fileName} uploaded successfully!`;
            }
        }
    }

    showError(message) {
        
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-2';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
        
        
        const existingError = dropZone.parentElement.querySelector('.alert-danger');
        if (existingError) {
            existingError.remove();
        }
        
        dropZone.parentElement.appendChild(errorDiv);
        
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    setupNavigation() {
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.handleBack();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.handleNext();
            });
        }
    }

    updateNextButton() {
        const nextBtn = document.getElementById('nextBtn');
        
        if (this.selectedOption) {
            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.classList.remove('opacity-50');
            }
            
            if (window.wizardFooter) {
                window.wizardFooter.enableNextButton();
            }
        } else {
            if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.classList.add('opacity-50');
            }
            
            if (window.wizardFooter) {
                window.wizardFooter.disableNextButton();
            }
        }
    }

    handleNext() {
        if (!this.selectedOption) return;
        
        
        this.storeUploadPreference();
        
        
        setTimeout(() => {
            if (this.selectedOption === 'upload' && this.uploadedFile) {
                
                this.processResumeAndContinue();
            } else {
                
                this.continueWithoutUpload();
            }
        }, 300);
    }

    handleBack() {
        
        window.location.href = 'where-remote.html';
    }

    processResumeAndContinue() {
        
        window.location.href = 'what-job.html';
    }

    continueWithoutUpload() {
        
        window.location.href = 'what-job.html';
    }

    buildJobSearchParams() {
        const params = new URLSearchParams();
        
        
        const preferences = [
            'workTypePreference',
            'salaryPreference', 
            'locationPreference',
            'jobTitlePreference',
            'categoryPreference',
            'experiencePreference',
            'educationPreference',
            'benefitsPreference'
        ];

        preferences.forEach(key => {
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    const preference = JSON.parse(stored);
                    this.addPreferenceToParams(params, key, preference);
                } catch (e) {
                    console.error(`Error parsing ${key}:`, e);
                }
            }
        });

        return params;
    }

    addPreferenceToParams(params, key, preference) {
        switch (key) {
            case 'workTypePreference':
                if (preference) {
                    const typeMap = {
                        '100-remote': 'fully-remote',
                        'hybrid': 'hybrid',
                        'flexible': 'flexible'
                    };
                    params.set('type', typeMap[preference] || 'remote');
                }
                break;
            case 'salaryPreference':
                if (preference.type === 'annual') {
                    params.set('salary_min', preference.salary);
                } else {
                    params.set('hourly_min', preference.salary);
                }
                break;
            case 'locationPreference':
                if (preference.location) {
                    params.set('location', preference.location);
                }
                if (preference.options && preference.options.length > 0) {
                    params.set('location_options', preference.options.join(','));
                }
                break;
            
        }
    }

    storeUploadPreference() {
        const preference = {
            option: this.selectedOption,
            hasFile: this.isFileUploaded,
            fileName: this.uploadedFile ? this.uploadedFile.name : null,
            timestamp: Date.now()
        };
        
        localStorage.setItem('uploadPreference', JSON.stringify(preference));
    }

    restoreFromLocalStorage() {
        const stored = localStorage.getItem('uploadPreference');
        if (stored) {
            try {
                const preference = JSON.parse(stored);
                if (preference.option) {
                    this.selectedOption = preference.option;
                    this.isFileUploaded = preference.hasFile || false;
                    
                    if (preference.option === 'upload') {
                        this.showSelection('uploadOption', 'uploadOverlay');
                        if (preference.hasFile && preference.fileName) {
                            this.showUploadSuccess(preference.fileName);
                        }
                    } else {
                        this.showSelection('skipOption', 'skipOverlay');
                    }
                    
                    this.updateNextButton();
                }
            } catch (e) {
                console.error('Error restoring upload preference:', e);
            }
        }
    }

    trackSelection() {
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'upload_option_selected', {
                option: this.selectedOption,
                page: 'upload-resume'
            });
        }

        console.log('Upload option selected:', this.selectedOption);
    }

    trackFileUpload(file) {
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'resume_uploaded', {
                file_type: file.type,
                file_size: file.size,
                page: 'upload-resume'
            });
        }

        console.log('File uploaded:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
    }
}


window.UploadResumePage = UploadResumePage;
