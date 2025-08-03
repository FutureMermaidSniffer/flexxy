
const pages = [
    { file: 'what-job.html', backUrl: '/where-remote' },
    { file: 'job-category.html', backUrl: '/what-job' },
    { file: 'relevant-experience.html', backUrl: '/job-category' },
    { file: 'education-level.html', backUrl: '/relevant-experience' },
    { file: 'benefits.html', backUrl: '/education-level' }
];

const fs = require('fs');
const path = require('path');

pages.forEach(page => {
    const filePath = path.join(__dirname, '..', 'frontend', page.file);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        
        content = content.replace(
            /<!-- Custom CSS -->\s*<link rel="stylesheet" href="css\/style\.css">\s*<!-- Component CSS -->/,
            `<!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
    <!-- Component CSS -->
    <link rel="stylesheet" href="css/components/header.css">
    <link rel="stylesheet" href="css/components/footer.css">
    <!-- Wizard Components CSS -->
    <link rel="stylesheet" href="css/components/wizard-header.css">
    <link rel="stylesheet" href="css/components/wizard-footer.css">`
        );
        
        
        content = content.replace(
            /<!-- Header Component -->\s*<div id="header-container"><\/div>/,
            `<!-- Wizard Header -->
    <div id="wizard-header-container"></div>`
        );
        
        
        content = content.replace(
            /<!-- Footer Component -->\s*<div id="footer-container"><\/div>\s*<!-- Bootstrap JS -->\s*<script[^>]*bootstrap[^<]*<\/script>\s*<!-- Component JS -->\s*<script[^>]*component-loader[^<]*<\/script>\s*<script[^>]*header[^<]*<\/script>\s*<script[^>]*footer[^<]*<\/script>\s*<!-- Page-specific JavaScript -->\s*<script>\s*\/\/ Load header and footer components\s*loadComponents\(\);/,
            `<!-- Wizard Footer -->
    <div id="wizard-footer-container"></div>

    <!-- Bootstrap JS -->
    <script src="https:
    <!-- Component JS -->
    <script src="js/components/component-loader.js"></script>
    <script src="js/components/header.js"></script>
    <script src="js/components/footer.js"></script>
    <!-- Wizard Components JS -->
    <script src="js/components/wizard-header.js"></script>
    <script src="js/components/wizard-footer.js"></script>
    
    <!-- Page-specific JavaScript -->
    <script>
        
        document.addEventListener('DOMContentLoaded', () => {
            
            window.wizardHeader = new WizardHeader({
                isFirstPage: false,
                backUrl: '${page.backUrl}'
            });
            
            
            window.wizardFooter = new WizardFooter();
        });

        
        loadComponents();`
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${page.file}`);
        
    } catch (error) {
        console.error(`Error updating ${page.file}:`, error.message);
    }
});

console.log('Batch update completed!');
