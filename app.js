// Global variables
let currentUser = null;
let currentRole = null;
let darkMode = false;
let sidebarCollapsed = false;
let currentData = null;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Initialize the application
function init() {
    console.log("Initializing application...");
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if user is logged in (from localStorage)
    checkLoggedInUser();
    
    // Initialize theme
    initializeTheme();
    
    // Check sidebar state
    const sidebar = document.getElementById('sidebar');
    if (sidebar) checkSidebarState();
    
    // Check layout preference
    checkLayoutPreference();
    
    // Initialize charts when dashboard is shown
    if (document.getElementById('dashboard-page') && 
        document.getElementById('dashboard-page').classList.contains('active')) {
        initializeCharts();
        updateDashboard();
}

// Set up event listeners
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Theme toggle
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleTheme);
    });
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Update navLinks to handle navigation correctly
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Page navigation links
    document.querySelectorAll('[onclick*="showPage"]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('onclick').match(/showPage\('(.+?)'\)/)[1];
            showPage(pageId);
        });
    });
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Sidebar navigation
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showDashboardPage(page);
        });
    });
    
    // Sidebar upload statement function
    const uploadStatementSidebar = document.querySelector('[data-page="upload-statement"]');
    if (uploadStatementSidebar) {
        uploadStatementSidebar.addEventListener('click', () => {
            showDashboardPage('upload-statement');

            // Reset upload form
            const uploadArea = document.getElementById('upload-area');
            const uploadPreview = document.getElementById('upload-preview');
            const fileUpload = document.getElementById('file-upload');

            if (uploadArea) uploadArea.style.display = 'block';
            if (uploadPreview) uploadPreview.style.display = 'none';
            if (fileUpload) fileUpload.value = '';
        });
    }
    
    // Upload area
    const uploadArea = document.getElementById('upload-area');
    const fileUpload = document.getElementById('file-upload');
    if (uploadArea && fileUpload) {
        uploadArea.addEventListener('click', () => {
            fileUpload.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.backgroundColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.backgroundColor = '';
            
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }
    
    // File upload
    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }
    
    // Cancel upload
    const cancelUpload = document.getElementById('cancel-upload');
    if (cancelUpload) {
        cancelUpload.addEventListener('click', () => {
            const uploadArea = document.getElementById('upload-area');
            const uploadPreview = document.getElementById('upload-preview');
            const fileUpload = document.getElementById('file-upload');
            
            if (uploadArea) uploadArea.style.display = 'block';
            if (uploadPreview) uploadPreview.style.display = 'none';
            if (fileUpload) fileUpload.value = '';
        });
    }
    
    // Process upload
    const processUpload = document.getElementById('process-upload');
    if (processUpload) {
        processUpload.addEventListener('click', processFinancialStatement);
    }
    
    // Refresh dashboard
    const refreshDashboard = document.getElementById('refresh-dashboard');
    if (refreshDashboard) {
        refreshDashboard.addEventListener('click', updateDashboard);
    }

    // Add functionality to refresh button to clear and reset
    const refreshButton = document.getElementById('refresh-dashboard');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            // Clear current data
            currentData = null;
            localStorage.removeItem('finfraud_data');

            // Reset dashboard UI
            const dashboardData = document.getElementById('dashboard-data');
            const noDataMessage = document.getElementById('no-data-message');
            if (dashboardData) dashboardData.style.display = 'none';
            if (noDataMessage) noDataMessage.style.display = 'block';

            // Reset analysis summary and recommendation
            const analysisSummary = document.getElementById('analysis-summary');
            const recommendationText = document.getElementById('recommendation-text');
            if (analysisSummary) analysisSummary.innerHTML = '<p>Upload a financial statement to see the analysis summary.</p>';
            if (recommendationText) recommendationText.textContent = 'No recommendation available. Please upload a financial statement for analysis.';

            alert('Dashboard has been reset.');
        });
    }
    
    // Logout button
    document.querySelectorAll('[onclick*="logout"]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
    
    // Theme settings
    const lightThemeBtn = document.getElementById('light-theme-btn');
    const darkThemeBtn = document.getElementById('dark-theme-btn');
    const systemThemeBtn = document.getElementById('system-theme-btn');
    
    if (lightThemeBtn) {
        lightThemeBtn.addEventListener('click', () => setTheme('light'));
    }
    
    if (darkThemeBtn) {
        darkThemeBtn.addEventListener('click', () => setTheme('dark'));
    }
    
    if (systemThemeBtn) {
        systemThemeBtn.addEventListener('click', () => setTheme('system'));
    }
    
    // Layout settings
    const compactLayoutBtn = document.getElementById('compact-layout-btn');
    const comfortableLayoutBtn = document.getElementById('comfortable-layout-btn');
    
    if (compactLayoutBtn) {
        compactLayoutBtn.addEventListener('click', () => setLayout('compact'));
    }
    
    if (comfortableLayoutBtn) {
        comfortableLayoutBtn.addEventListener('click', () => setLayout('comfortable'));
    }
    
    // Account settings form
    const accountSettingsForm = document.getElementById('account-settings-form');
    if (accountSettingsForm) {
        accountSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAccountSettings();
        });
    }
    
    // Report form
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            generateReport();
        });
    }
}

// Check if user is logged in
function checkLoggedInUser() {
    const user = localStorage.getItem('finfraud_user');
    const role = localStorage.getItem('finfraud_role');
    
    if (user && role) {
        currentUser = user;
        currentRole = role;
        showPage('dashboard-page');
        updateUserInterface();
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('finfraud_theme');
    
    if (savedTheme === 'dark') {
        darkMode = true;
        document.body.classList.add('dark-mode');
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        });
    } else {
        darkMode = false;
        document.body.classList.remove('dark-mode');
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
        });
    }
}

// Toggle theme
function toggleTheme() {
    console.log("Toggling theme...");
    darkMode = !darkMode;
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        });
        localStorage.setItem('finfraud_theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
        });
        localStorage.setItem('finfraud_theme', 'light');
    }
}

// Set theme
function setTheme(theme) {
    if (theme === 'dark') {
        darkMode = true;
        document.body.classList.add('dark-mode');
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        });
        localStorage.setItem('finfraud_theme', 'dark');
        
        // Update theme buttons
        const lightThemeBtn = document.getElementById('light-theme-btn');
        const darkThemeBtn = document.getElementById('dark-theme-btn');
        const systemThemeBtn = document.getElementById('system-theme-btn');
        
        if (lightThemeBtn) lightThemeBtn.classList.remove('active');
        if (darkThemeBtn) darkThemeBtn.classList.add('active');
        if (systemThemeBtn) systemThemeBtn.classList.remove('active');
    } else if (theme === 'light') {
        darkMode = false;
        document.body.classList.remove('dark-mode');
        document.querySelectorAll('.theme-toggle').forEach(toggle => {
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
        });
        localStorage.setItem('finfraud_theme', 'light');
        
        // Update theme buttons
        const lightThemeBtn = document.getElementById('light-theme-btn');
        const darkThemeBtn = document.getElementById('dark-theme-btn');
        const systemThemeBtn = document.getElementById('system-theme-btn');
        
        if (lightThemeBtn) lightThemeBtn.classList.add('active');
        if (darkThemeBtn) darkThemeBtn.classList.remove('active');
        if (systemThemeBtn) systemThemeBtn.classList.remove('active');
    } else {
        // System theme
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (prefersDarkMode) {
            darkMode = true;
            document.body.classList.add('dark-mode');
            document.querySelectorAll('.theme-toggle').forEach(toggle => {
                toggle.innerHTML = '<i class="fas fa-sun"></i>';
            });
        } else {
            darkMode = false;
            document.body.classList.remove('dark-mode');
            document.querySelectorAll('.theme-toggle').forEach(toggle => {
                toggle.innerHTML = '<i class="fas fa-moon"></i>';
            });
        }
        
        localStorage.setItem('finfraud_theme', 'system');
        
        // Update theme buttons
        const lightThemeBtn = document.getElementById('light-theme-btn');
        const darkThemeBtn = document.getElementById('dark-theme-btn');
        const systemThemeBtn = document.getElementById('system-theme-btn');
        
        if (lightThemeBtn) lightThemeBtn.classList.remove('active');
        if (darkThemeBtn) darkThemeBtn.classList.remove('active');
        if (systemThemeBtn) systemThemeBtn.classList.add('active');
    }
}

// Set layout
function setLayout(layout) {
    if (layout === 'compact') {
        document.body.classList.remove('comfortable-layout');
        localStorage.setItem('finfraud_layout', 'compact');
        
        // Update layout buttons
        const compactLayoutBtn = document.getElementById('compact-layout-btn');
        const comfortableLayoutBtn = document.getElementById('comfortable-layout-btn');
        
        if (compactLayoutBtn) compactLayoutBtn.classList.add('active');
        if (comfortableLayoutBtn) comfortableLayoutBtn.classList.remove('active');
    } else {
        document.body.classList.add('comfortable-layout');
        localStorage.setItem('finfraud_layout', 'comfortable');
        
        // Update layout buttons
        const compactLayoutBtn = document.getElementById('compact-layout-btn');
        const comfortableLayoutBtn = document.getElementById('comfortable-layout-btn');
        
        if (compactLayoutBtn) compactLayoutBtn.classList.remove('active');
        if (comfortableLayoutBtn) comfortableLayoutBtn.classList.add('active');
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('sidebar-collapsed');
    } else {
        sidebar.classList.remove('sidebar-collapsed');
    }
    
    localStorage.setItem('finfraud_sidebar', sidebarCollapsed ? 'collapsed' : 'expanded');
}

// Show page
function showPage(pageId) {
    console.log("Showing page:", pageId);
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // If showing dashboard, update user interface
    if (pageId === 'dashboard-page') {
        updateUserInterface();
        updateDashboard();
    }
}

// Show dashboard page
function showDashboardPage(pageId) {
    console.log("Showing dashboard page:", pageId);
    const dashboardPages = document.querySelectorAll('.dashboard-page');
    dashboardPages.forEach(page => {
        page.classList.remove('active');
    });
    
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Update sidebar active state
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
    sidebarNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        }
    });
    
        // Initialize charts if needed
        if (pageId === 'z-score-analysis' || pageId === 'f-score-analysis' || 
            pageId === 'npl-analysis' || pageId === 'industry-benchmarks') {
            initializeCharts();
        }
    }
    
    // Handle login
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;
        
        // Simple validation
        if (!username || !password || !role) {
            alert('Please fill in all fields');
            return;
        }
        
        // In a real application, you would validate credentials against a server
        // For demo purposes, we'll just accept any input
        
        // Save user info to localStorage
        localStorage.setItem('finfraud_user', username);
        localStorage.setItem('finfraud_role', role);
        
        // Update global variables
        currentUser = username;
        currentRole = role;
        
        // Show dashboard
        showPage('dashboard-page');
        updateUserInterface();
    }
    
    // Handle register
    function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const role = document.getElementById('register-role').value;
        
        // Simple validation
        if (!username || !password || !confirmPassword || !role) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // In a real application, you would send registration data to a server
        // For demo purposes, we'll just accept any input
        
        // Save user info to localStorage
        localStorage.setItem('finfraud_user', username);
        localStorage.setItem('finfraud_role', role);
        
        // Update global variables
        currentUser = username;
        currentRole = role;
        
        // Show dashboard
        showPage('dashboard-page');
        updateUserInterface();
    }
    
    // Update user interface based on role
    function updateUserInterface() {
        if (!currentUser || !currentRole) return;
        
        // Update welcome message
        const userWelcome = document.getElementById('user-welcome');
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${currentUser} (${currentRole})`;
        }
        
        // Update settings form
        const settingsUsername = document.getElementById('settings-username');
        const settingsRole = document.getElementById('settings-role');
        
        if (settingsUsername) {
            settingsUsername.value = currentUser;
        }
        
        if (settingsRole) {
            settingsRole.value = currentRole;
        }
        
        // Show/hide role-specific elements
        const investorElements = document.querySelectorAll('.investor-only');
        const auditorElements = document.querySelectorAll('.auditor-only');
        
        investorElements.forEach(el => {
            el.style.display = currentRole === 'investor' ? 'flex' : 'none';
        });
        
        auditorElements.forEach(el => {
            el.style.display = currentRole === 'auditor' ? 'flex' : 'none';
        });
        
        // Update role-specific recommendations
        updateRoleSpecificContent();
    }
    
    // Handle file upload
    function handleFileUpload(file) {
        // Display file info
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const fileIcon = document.getElementById('file-icon');
        const uploadArea = document.getElementById('upload-area');
        const uploadPreview = document.getElementById('upload-preview');
        
        if (fileName && fileSize && fileIcon) {
            fileName.textContent = file.name;
            
            // Format file size
            let size = file.size;
            let unit = 'bytes';
            
            if (size > 1024) {
                size = size / 1024;
                unit = 'KB';
            }
            
            if (size > 1024) {
                size = size / 1024;
                unit = 'MB';
            }
            
            fileSize.textContent = `${size.toFixed(2)} ${unit}`;
            
            // Set icon based on file type
            if (file.name.endsWith('.pdf')) {
                fileIcon.className = 'fas fa-file-pdf';
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                fileIcon.className = 'fas fa-file-excel';
            } else {
                fileIcon.className = 'fas fa-file';
            }
            
            // Show preview
            if (uploadArea) uploadArea.style.display = 'none';
            if (uploadPreview) uploadPreview.style.display = 'block';
        }
    }
    
    // Process financial statement
    function processFinancialStatement() {
        const bankSelect = document.getElementById('bank-select');
        const statementYear = document.getElementById('statement-year');
        const statementType = document.getElementById('statement-type');
        
        if (!bankSelect || !statementYear || !statementType) return;
        
        if (!bankSelect.value || !statementYear.value || !statementType.value) {
            alert('Please fill in all fields');
            return;
        }
        
        // In a real application, you would process the uploaded file
        // For demo purposes, we'll generate mock data
        
        // Generate mock data
        currentData = generateMockData(bankSelect.value);
        
        // Save to localStorage
        localStorage.setItem('finfraud_data', JSON.stringify(currentData));
        
        // Show dashboard overview
        showDashboardPage('dashboard-overview');
        
        // Update dashboard
        updateDashboard();
        
        // Show success message
        alert('Financial statement processed successfully!');
    }
    
    // Generate mock data
    function generateMockData(bankName) {
        // Generate random scores
        const zScore = (Math.random() * 4 + 0.5).toFixed(2);
        const fScore = (Math.random() * 5).toFixed(1);
        const nplRatio = (Math.random() * 8).toFixed(2);
        
        return {
            bankName: bankName,
            zScore: parseFloat(zScore),
            fScore: parseFloat(fScore),
            nplRatio: parseFloat(nplRatio),
            timestamp: new Date().toISOString()
        };
    }
    
    // Update dashboard
    function updateDashboard() {
        // Get data from localStorage
        const savedData = localStorage.getItem('finfraud_data');
        const dashboardData = document.getElementById('dashboard-data');
        const noDataMessage = document.getElementById('no-data-message');
        
        if (savedData) {
            currentData = JSON.parse(savedData);
            
            // Show data section, hide no-data message
            if (dashboardData) dashboardData.style.display = 'block';
            if (noDataMessage) noDataMessage.style.display = 'none';
            
            // Update dashboard values
            updateDashboardValues();
            
            // Update analysis summary
            updateAnalysisSummary();
            
            // Update role-specific content
            updateRoleSpecificContent();
        } else {
            // Hide data section, show no-data message
            if (dashboardData) dashboardData.style.display = 'none';
            if (noDataMessage) noDataMessage.style.display = 'block';
        }
    }
    
    // Update dashboard values
    function updateDashboardValues() {
        if (!currentData) return;
        
        // Bank name
        const bankNameElement = document.getElementById('bank-name');
        if (bankNameElement) bankNameElement.textContent = currentData.bankName;
        
        // Z-Score
        const zScoreValue = document.getElementById('z-score-value');
        const zScoreStatus = document.getElementById('z-score-status');
        const zScoreDisplay = document.getElementById('z-score-display');
        const zScoreProgress = document.getElementById('z-score-progress');
        const zScoreMain = document.getElementById('z-score-main');
        const zScoreMainProgress = document.getElementById('z-score-main-progress');
        
        if (zScoreValue) zScoreValue.textContent = currentData.zScore;
        if (zScoreDisplay) zScoreDisplay.textContent = currentData.zScore;
        if (zScoreMain) zScoreMain.textContent = currentData.zScore;
        
        // Z-Score status
        let zScoreStatusText = '';
        let zScoreColor = '';
        let zScoreProgressWidth = '';
        
        if (currentData.zScore < 1.8) {
            zScoreStatusText = '<i class="fas fa-exclamation-circle"></i> Danger Zone';
            zScoreColor = 'var(--danger-color)';
            zScoreProgressWidth = `${(currentData.zScore / 1.8) * 33}%`;
            if (zScoreDisplay) zScoreDisplay.className = 'score-value score-danger';
            if (zScoreProgress) zScoreProgress.className = 'score-progress-bar score-progress-danger';
        } else if (currentData.zScore < 3.0) {
            zScoreStatusText = '<i class="fas fa-exclamation-triangle"></i> Grey Zone';
            zScoreColor = 'var(--warning-color)';
            zScoreProgressWidth = `${33 + ((currentData.zScore - 1.8) / 1.2) * 33}%`;
            if (zScoreDisplay) zScoreDisplay.className = 'score-value score-warning';
            if (zScoreProgress) zScoreProgress.className = 'score-progress-bar score-progress-warning';
        } else {
            zScoreStatusText = '<i class="fas fa-check-circle"></i> Safe Zone';
            zScoreColor = 'var(--success-color)';
            zScoreProgressWidth = `${66 + ((currentData.zScore - 3.0) / 2.0) * 34}%`;
            if (zScoreDisplay) zScoreDisplay.className = 'score-value score-safe';
            if (zScoreProgress) zScoreProgress.className = 'score-progress-bar score-progress-safe';
        }
        
        if (zScoreStatus) zScoreStatus.innerHTML = zScoreStatusText;
        if (zScoreStatus) zScoreStatus.style.color = zScoreColor;
        if (zScoreProgress) zScoreProgress.style.width = zScoreProgressWidth;
        if (zScoreMainProgress) {
            zScoreMainProgress.style.width = zScoreProgressWidth;
            if (zScoreProgress) zScoreMainProgress.className = zScoreProgress.className;
        }
        
        // F-Score
        const fScoreValue = document.getElementById('f-score-value');
        const fScoreStatus = document.getElementById('f-score-status');
        const fScoreDisplay = document.getElementById('f-score-display');
        const fScoreProgress = document.getElementById('f-score-progress');
        const fScoreMain = document.getElementById('f-score-main');
        const fScoreMainProgress = document.getElementById('f-score-main-progress');
        
        if (fScoreValue) fScoreValue.textContent = currentData.fScore;
        if (fScoreDisplay) fScoreDisplay.textContent = currentData.fScore;
        if (fScoreMain) fScoreMain.textContent = currentData.fScore;
        
        // F-Score status
        let fScoreStatusText = '';
        let fScoreColor = '';
        let fScoreProgressWidth = '';
        
        if (currentData.fScore < 1.5) {
            fScoreStatusText = '<i class="fas fa-exclamation-circle"></i> Danger Zone';
            fScoreColor = 'var(--danger-color)';
            fScoreProgressWidth = `${(currentData.fScore / 1.5) * 33}%`;
            if (fScoreDisplay) fScoreDisplay.className = 'score-value score-danger';
            if (fScoreProgress) fScoreProgress.className = 'score-progress-bar score-progress-danger';
        } else if (currentData.fScore < 3.0) {
            fScoreStatusText = '<i class="fas fa-exclamation-triangle"></i> Warning Zone';
            fScoreColor = 'var(--warning-color)';
            fScoreProgressWidth = `${33 + ((currentData.fScore - 1.5) / 1.5) * 33}%`;
            if (fScoreDisplay) fScoreDisplay.className = 'score-value score-warning';
            if (fScoreProgress) fScoreProgress.className = 'score-progress-bar score-progress-warning';
        } else {
            fScoreStatusText = '<i class="fas fa-check-circle"></i> Safe Zone';
            fScoreColor = 'var(--success-color)';
            fScoreProgressWidth = `${66 + ((currentData.fScore - 3.0) / 2.0) * 34}%`;
            if (fScoreDisplay) fScoreDisplay.className = 'score-value score-safe';
            if (fScoreProgress) fScoreProgress.className = 'score-progress-bar score-progress-safe';
        }
        
        if (fScoreStatus) fScoreStatus.innerHTML = fScoreStatusText;
        if (fScoreStatus) fScoreStatus.style.color = fScoreColor;
        if (fScoreProgress) fScoreProgress.style.width = fScoreProgressWidth;
        if (fScoreMainProgress) {
            fScoreMainProgress.style.width = fScoreProgressWidth;
            if (fScoreProgress) fScoreMainProgress.className = fScoreProgress.className;
        }
        
        // NPL Ratio
        const nplRatioValue = document.getElementById('npl-ratio-value');
        const nplRatioStatus = document.getElementById('npl-ratio-status');
        const nplDisplay = document.getElementById('npl-display');
        const nplProgress = document.getElementById('npl-progress');
        const nplMain = document.getElementById('npl-main');
        const nplMainProgress = document.getElementById('npl-main-progress');
        const nplRatio = document.getElementById('npl-ratio');
        
        if (nplRatioValue) nplRatioValue.textContent = currentData.nplRatio + '%';
        if (nplDisplay) nplDisplay.textContent = currentData.nplRatio + '%';
        if (nplMain) nplMain.textContent = currentData.nplRatio + '%';
        if (nplRatio) nplRatio.textContent = currentData.nplRatio + '%';
        
        // NPL Ratio status
        let nplStatusText = '';
        let nplColor = '';
        let nplProgressWidth = '';
        
        if (currentData.nplRatio < 3.0) {
            nplStatusText = '<i class="fas fa-check-circle"></i> Safe Zone';
            nplColor = 'var(--success-color)';
            nplProgressWidth = `${(currentData.nplRatio / 3.0) * 33}%`;
            if (nplDisplay) nplDisplay.className = 'score-value score-safe';
            if (nplProgress) nplProgress.className = 'score-progress-bar score-progress-safe';
        } else if (currentData.nplRatio < 5.0) {
            nplStatusText = '<i class="fas fa-exclamation-triangle"></i> Warning Zone';
            nplColor = 'var(--warning-color)';
            nplProgressWidth = `${33 + ((currentData.nplRatio - 3.0) / 2.0) * 33}%`;
            if (nplDisplay) nplDisplay.className = 'score-value score-warning';
            if (nplProgress) nplProgress.className = 'score-progress-bar score-progress-warning';
        } else {
            nplStatusText = '<i class="fas fa-exclamation-circle"></i> Danger Zone';
            nplColor = 'var(--danger-color)';
            nplProgressWidth = `${66 + ((currentData.nplRatio - 5.0) / 5.0) * 34}%`;
            if (nplDisplay) nplDisplay.className = 'score-value score-danger';
            if (nplProgress) nplProgress.className = 'score-progress-bar score-progress-danger';
        }
        
        if (nplRatioStatus) nplRatioStatus.innerHTML = nplStatusText;
        if (nplRatioStatus) nplRatioStatus.style.color = nplColor;
        if (nplProgress) nplProgress.style.width = nplProgressWidth;
        if (nplMainProgress) {
            nplMainProgress.style.width = nplProgressWidth;
            if (nplProgress) nplMainProgress.className = nplProgress.className;
        }
        
        // Update benchmark values
        const benchZScore = document.getElementById('bench-z-score');
        const benchFScore = document.getElementById('bench-f-score');
        const benchNpl = document.getElementById('bench-npl');
        
        if (benchZScore) benchZScore.textContent = currentData.zScore;
        if (benchFScore) benchFScore.textContent = currentData.fScore;
        if (benchNpl) benchNpl.textContent = currentData.nplRatio + '%';
        
        // Update ratio values with random data
        updateRatioValues();
    }
    
    // Update ratio values with random data
    function updateRatioValues() {
        // Z-Score ratios
        const zRatio1 = document.getElementById('z-ratio-1');
        const zRatio2 = document.getElementById('z-ratio-2');
        const zRatio3 = document.getElementById('z-ratio-3');
        const zRatio4 = document.getElementById('z-ratio-4');
        const zRatio5 = document.getElementById('z-ratio-5');
        
        if (zRatio1) zRatio1.innerHTML = (Math.random() * 2 + 1).toFixed(2) + ' <span class="ratio-score ratio-score-1">1</span>';
        if (zRatio2) zRatio2.innerHTML = (Math.random() * 2 + 1).toFixed(2) + ' <span class="ratio-score ratio-score-1">1</span>';
        if (zRatio3) zRatio3.innerHTML = (Math.random() * 2 + 0.5).toFixed(2) + ' <span class="ratio-score ratio-score-' + (Math.random() > 0.5 ? '1' : '0') + '">' + (Math.random() > 0.5 ? '1' : '0') + '</span>';
        if (zRatio4) zRatio4.innerHTML = (Math.random() * 2 + 1).toFixed(2) + ' <span class="ratio-score ratio-score-1">1</span>';
        if (zRatio5) zRatio5.innerHTML = (Math.random() * 2 + 0.5).toFixed(2) + ' <span class="ratio-score ratio-score-' + (Math.random() > 0.5 ? '1' : '0') + '">' + (Math.random() > 0.5 ? '1' : '0') + '</span>';
        
        // F-Score ratios
        const fRatio1 = document.getElementById('f-ratio-1');
        const fRatio2 = document.getElementById('f-ratio-2');
        const fRatio3 = document.getElementById('f-ratio-3');
        const fRatio4 = document.getElementById('f-ratio-4');
        const fRatio5 = document.getElementById('f-ratio-5');
        
        if (fRatio1) fRatio1.innerHTML = (Math.random() * 0.1).toFixed(3) + ' <span class="ratio-score ratio-score-1">1</span>';
        if (fRatio2) fRatio2.innerHTML = (Math.random() * 0.1).toFixed(3) + ' <span class="ratio-score ratio-score-1">1</span>';
        if (fRatio3) fRatio3.innerHTML = ((Math.random() - 0.5) * 0.05).toFixed(3) + ' <span class="ratio-score ratio-score-' + (Math.random() > 0.5 ? '1' : '0') + '">' + (Math.random() > 0.5 ? '1' : '0') + '</span>';
        if (fRatio4) fRatio4.innerHTML = (Math.random() > 0.5 ? 'Decreased' : 'Increased') + ' <span class="ratio-score ratio-score-' + (Math.random() > 0.5 ? '1' : '0') + '">' + (Math.random() > 0.5 ? '1' : '0') + '</span>';
        if (fRatio5) fRatio5.innerHTML = (Math.random() * 2 + 0.5).toFixed(2) + ' <span class="ratio-score ratio-score-1">1</span>';
        
        // NPL values
        const nplValue = document.getElementById('npl-value');
        const totalLoans = document.getElementById('total-loans');
        const nplIndustry = document.getElementById('npl-industry');
        const nplThreshold = document.getElementById('npl-threshold');
        
        if (nplValue) nplValue.textContent = '$' + (Math.random() * 50 + 10).toFixed(2) + ' million';
        if (totalLoans) totalLoans.textContent = '$' + (Math.random() * 1000 + 500).toFixed(2) + ' million';
        if (nplIndustry) nplIndustry.textContent = (Math.random() * 2 + 3).toFixed(1) + '%';
        if (nplThreshold) nplThreshold.textContent = '5.0%';
    }
    
    // Update analysis summary
    function updateAnalysisSummary() {
        if (!currentData) return;
        
        const analysisSummary = document.getElementById('analysis-summary');
        
        if (!analysisSummary) return;
        
        let summaryText = `<p>Based on our analysis of ${currentData.bankName}'s financial statements, we have identified the following key insights:</p>`;
        
        // Z-Score summary
        if (currentData.zScore < 1.8) {
            summaryText += `<p><strong>Z-Score (${currentData.zScore}):</strong> The bank is in the <span style="color: var(--danger-color);">danger zone</span>, indicating a high risk of financial distress or bankruptcy within the next 2 years. Immediate action is recommended to improve financial stability.</p>`;
        } else if (currentData.zScore < 3.0) {
            summaryText += `<p><strong>Z-Score (${currentData.zScore}):</strong> The bank is in the <span style="color: var(--warning-color);">grey zone</span>, showing some financial vulnerability. While not in immediate danger, the bank should take steps to strengthen its financial position.</p>`;
        } else {
            summaryText += `<p><strong>Z-Score (${currentData.zScore}):</strong> The bank is in the <span style="color: var(--success-color);">safe zone</span>, demonstrating strong financial health with low probability of financial distress in the near future.</p>`;
        }
        
        // F-Score summary
        if (currentData.fScore < 1.5) {
            summaryText += `<p><strong>F-Score (${currentData.fScore}):</strong> The bank shows <span style="color: var(--danger-color);">significant weaknesses</span> in profitability, leverage, and operating efficiency. This suggests poor financial performance and potential accounting red flags.</p>`;
        } else if (currentData.fScore < 3.0) {
            summaryText += `<p><strong>F-Score (${currentData.fScore}):</strong> The bank demonstrates <span style="color: var(--warning-color);">moderate financial strength</span> with some concerns in certain areas. Improvements in profitability and efficiency are recommended.</p>`;
        } else {
            summaryText += `<p><strong>F-Score (${currentData.fScore}):</strong> The bank exhibits <span style="color: var(--success-color);">strong financial health</span> across profitability, leverage, and operating efficiency metrics, indicating good financial management.</p>`;
        }
        
        // NPL Ratio summary
        if (currentData.nplRatio < 3.0) {
            summaryText += `<p><strong>NPL Ratio (${currentData.nplRatio}%):</strong> The bank maintains a <span style="color: var(--success-color);">healthy loan portfolio</span> with non-performing loans well below the industry average, indicating effective credit risk management.</p>`;
        } else if (currentData.nplRatio < 5.0) {
            summaryText += `<p><strong>NPL Ratio (${currentData.nplRatio}%):</strong> The bank's non-performing loans are at a <span style="color: var(--warning-color);">moderate level</span>, close to industry averages but showing some credit quality concerns that should be monitored.</p>`;
        } else {
            summaryText += `<p><strong>NPL Ratio (${currentData.nplRatio}%):</strong> The bank has an <span style="color: var(--danger-color);">elevated level</span> of non-performing loans, indicating significant credit quality issues that require immediate attention.</p>`;
        }
        
        analysisSummary.innerHTML = summaryText;
    }
    
    // Update role-specific content
    function updateRoleSpecificContent() {
        if (!currentData || !currentRole) return;
        
        const recommendationText = document.getElementById('recommendation-text');
        
        if (!recommendationText) return;
        
        let recommendation = '';
        
        if (currentRole === 'investor') {
            // Investor recommendations
            if (currentData.zScore < 1.8 || currentData.fScore < 1.5 || currentData.nplRatio > 5.0) {
                recommendation = `<strong>Investment Recommendation:</strong> AVOID. ${currentData.bankName} shows significant financial weaknesses and elevated risk levels that make it an unsuitable investment at this time. Consider alternative banking institutions with stronger financial indicators.`;
            } else if (currentData.zScore < 3.0 || currentData.fScore < 3.0 || currentData.nplRatio > 3.0) {
                recommendation = `<strong>Investment Recommendation:</strong> HOLD/CAUTIOUS. ${currentData.bankName} demonstrates moderate financial health with some concerning indicators. If already invested, maintain position but monitor closely. New investors should conduct further due diligence before committing capital.`;
            } else {
                recommendation = `<strong>Investment Recommendation:</strong> BUY/POSITIVE. ${currentData.bankName} exhibits strong financial health across all key metrics, indicating a well-managed institution with solid fundamentals. The bank represents a potentially attractive investment opportunity with favorable risk-reward characteristics.`;
            }
        } else {
            // Auditor recommendations
            if (currentData.zScore < 1.8 || currentData.fScore < 1.5 || currentData.nplRatio > 5.0) {
                recommendation = `<strong>Audit Recommendation:</strong> HIGH PRIORITY REVIEW. ${currentData.bankName} shows multiple financial red flags that warrant a comprehensive audit. Focus areas should include loan loss provisions, revenue recognition practices, and capital adequacy compliance. Recommend expanded testing procedures and increased sampling.`;
            } else if (currentData.zScore < 3.0 || currentData.fScore < 3.0 || currentData.nplRatio > 3.0) {
                recommendation = `<strong>Audit Recommendation:</strong> STANDARD REVIEW WITH ENHANCED FOCUS. ${currentData.bankName} demonstrates adequate financial health with some areas of concern. Recommend standard audit procedures with enhanced focus on credit quality, liquidity management, and operational efficiency metrics.`;
            } else {
                recommendation = `<strong>Audit Recommendation:</strong> STANDARD REVIEW. ${currentData.bankName} exhibits strong financial health across key metrics. Recommend standard audit procedures with routine sampling and testing. No significant risk factors identified that would require expanded audit scope.`;
            }
        }
        
        recommendationText.innerHTML = recommendation;
    }
    
    // Save account settings
    function saveAccountSettings() {
        const newPassword = document.getElementById('settings-new-password').value;
        const confirmPassword = document.getElementById('settings-confirm-password').value;
        
        if (newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // In a real application, you would send the new password to a server
            // For demo purposes, we'll just show a success message
            alert('Password updated successfully');
            
            // Clear password fields
            document.getElementById('settings-new-password').value = '';
            document.getElementById('settings-confirm-password').value = '';
        } else {
            alert('No changes made');
        }
    }
    
    // Generate report
    function generateReport() {
        // In a real application, you would generate a report based on form data
        // For demo purposes, we'll just show a success message
        alert('Report generated successfully');
        
        // Redirect to reports page
        showDashboardPage('reports');
    }
    
    // Logout
    function logout() {
        // Clear user data
        localStorage.removeItem('finfraud_user');
        localStorage.removeItem('finfraud_role');
        
        // Reset global variables
        currentUser = null;
        currentRole = null;
        
        // Show landing page
        showPage('landing-page');
    }
    
    // Mock chart initialization functions
    // In a real application, these would use a charting library like Chart.js or D3.js
    function initializeCharts() {
        // Initialize Z-Score chart
        const zScoreChart = document.getElementById('z-score-chart');
        if (zScoreChart) {
            zScoreChart.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--secondary-color);">Z-Score trend chart would be rendered here</div>';
        }
        
        // Page navigation links
document.querySelectorAll('[data-page]').forEach(element => {
    element.addEventListener('click', function(e) {
        e.preventDefault();
        const pageId = this.getAttribute('data-page');
        showPage(pageId);
    });
});
    }
}