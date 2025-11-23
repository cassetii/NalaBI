// ================================================
// REDESIGNED DASHBOARD - JAKOB'S LAWS
// ================================================

let allProjects = [];
let filteredProjects = [];
let currentFilter = 'all';

// Initialize dashboard
function initDashboard() {
    console.log('🚀 Initializing redesigned dashboard...');
    
    loadProjects();
    setupSearch();
}

// Load all projects
async function loadProjects() {
    try {
        const snapshot = await db.collection(COLLECTIONS.PROJECTS)
            .orderBy('createdAt', 'desc')
            .get();
        
        allProjects = [];
        
        snapshot.forEach(doc => {
            allProjects.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ Loaded ${allProjects.length} projects`);
        
        renderDashboardStats();
        filteredProjects = [...allProjects];
        renderProjects();
        
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('loadingState').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
            <h3>Failed to Load</h3>
            <p>${error.message}</p>
        `;
    }
}

// Render dashboard stats
function renderDashboardStats() {
    const total = allProjects.length;
    const active = allProjects.filter(p => p.status === 'pengerjaan').length;
    
    let totalRevenue = 0;
    let totalReal = 0;
    
    allProjects.forEach(project => {
        const materials = project.materials || [];
        const services = project.services || [];
        const acUnits = project.acUnits || [];
        
        const summary = calculateProjectSummary(materials, services, acUnits);
        
        totalRevenue += summary.totalQuotation;
        totalReal += summary.totalReal;
    });
    
    const profitLoss = totalRevenue - totalReal;
    const isProfitable = profitLoss >= 0;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statRevenue').textContent = utils.formatCurrency(totalRevenue);
    document.getElementById('statProfit').textContent = utils.formatCurrency(Math.abs(profitLoss));
    
    const profitLabel = document.getElementById('statProfitLabel');
    profitLabel.textContent = isProfitable ? 'Total Profit' : 'Total Loss';
    
    console.log(`📊 Stats updated`);
}

// Render projects with new design
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    loadingState.style.display = 'none';
    
    if (filteredProjects.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';
    
    filteredProjects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
    
    console.log(`🎨 Rendered ${filteredProjects.length} cards`);
}

// Create project card with new design
function createProjectCard(project) {
    const materials = project.materials || [];
    const services = project.services || [];
    const acUnits = project.acUnits || [];
    
    const summary = calculateProjectSummary(materials, services, acUnits);
    const profitLoss = summary.profitLoss;
    const isProfitable = profitLoss >= 0;
    
    const thumbnail = project.photos && project.photos.length > 0 
        ? project.photos[0].url 
        : null;
    
    const statusMap = {
        'prospek': 'Prospek',
        'survey': 'Survey',
        'pengerjaan': 'On Progress',
        'ditolak': 'Rejected'
    };
    
    const statusText = statusMap[project.status] || project.status;
    
    const timeAgo = project.createdAt 
        ? getTimeAgo(project.createdAt.toDate()) 
        : '-';
    
    const card = document.createElement('div');
    card.className = 'project-card-new';
    
    card.innerHTML = `
        <div class="project-card-header ${thumbnail ? '' : 'no-image'}">
            ${thumbnail 
                ? `<img src="${thumbnail}" alt="${project.projectName}">` 
                : '<i class="fas fa-snowflake"></i>'}
            <div class="status-badge ${project.status}">${statusText}</div>
        </div>
        
        <div class="project-card-body">
            <div class="project-title">${project.projectName || 'Untitled'}</div>
            <div class="project-client">
                <i class="fas fa-building"></i>
                ${project.client || '-'}
            </div>
            
            <div class="financial-summary">
                <div class="financial-row">
                    <span class="financial-label">Quotation</span>
                    <span class="financial-value">${utils.formatCurrency(summary.totalQuotation)}</span>
                </div>
                <div class="financial-row">
                    <span class="financial-label">Actual</span>
                    <span class="financial-value">${utils.formatCurrency(summary.totalReal)}</span>
                </div>
            </div>
            
            <div class="profit-indicator ${isProfitable ? 'positive' : 'negative'}">
                ${isProfitable ? '✓' : '⚠'} ${isProfitable ? 'PROFIT' : 'LOSS'}: ${utils.formatCurrency(Math.abs(profitLoss))}
            </div>
            
            <div class="card-meta">
                <span><i class="fas fa-calendar"></i> ${timeAgo}</span>
                <span><i class="fas fa-images"></i> ${project.photos ? project.photos.length : 0}/10</span>
            </div>
            
            <div class="card-actions">
                <button class="btn-card btn-card-primary" onclick="viewProject('${project.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-card btn-card-secondary" onclick="editProject('${project.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Get time ago text
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            applyFilter();
        } else {
            filteredProjects = allProjects.filter(project => {
                const matchesSearch = 
                    (project.projectName && project.projectName.toLowerCase().includes(query)) ||
                    (project.client && project.client.toLowerCase().includes(query));
                
                const matchesFilter = currentFilter === 'all' || project.status === currentFilter;
                
                return matchesSearch && matchesFilter;
            });
            
            renderProjects();
        }
    });
}

// Filter by status
function filterByStatus(status) {
    currentFilter = status;
    
    // Update active chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    applyFilter();
}

// Apply filter
function applyFilter() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    
    filteredProjects = allProjects.filter(project => {
        const matchesSearch = searchQuery === '' ||
            (project.projectName && project.projectName.toLowerCase().includes(searchQuery)) ||
            (project.client && project.client.toLowerCase().includes(searchQuery));
        
        const matchesFilter = currentFilter === 'all' || project.status === currentFilter;
        
        return matchesSearch && matchesFilter;
    });
    
    renderProjects();
}

// View project
function viewProject(projectId) {
    window.location.href = `project-detail.html?id=${projectId}`;
}

// Edit project
function editProject(projectId) {
    window.location.href = `project-detail.html?id=${projectId}`;
}

// Export functions
window.initDashboard = initDashboard;
window.filterByStatus = filterByStatus;
window.viewProject = viewProject;
window.editProject = editProject;

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);

console.log('✅ index-redesign.js loaded');
