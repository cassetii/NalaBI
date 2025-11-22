// ================================================
// DASHBOARD INDEX - UPGRADED VERSION
// ================================================

let allProjects = [];
let filteredProjects = [];
let currentFilter = 'all';

// Initialize dashboard
function initDashboard() {
    console.log('🚀 Initializing upgraded dashboard...');
    
    // Load projects
    loadProjects();
    
    // Setup search
    setupSearch();
    
    // Initialize map
    if (typeof initMap === 'function') {
        initMap('map', DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    }
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
        
        // Calculate and render stats
        renderDashboardStats();
        
        // Render projects
        filteredProjects = [...allProjects];
        renderProjects();
        
        // Add markers to map
        if (typeof addMarker === 'function') {
            allProjects.forEach(project => {
                if (project.location) {
                    addMarker(project);
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('loadingState').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
            <h3 style="color: #e74c3c;">Gagal Memuat Data</h3>
            <p>${error.message}</p>
        `;
    }
}

// Calculate and render dashboard stats
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
    
    // Update stat cards
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statRevenue').textContent = utils.formatCurrency(totalRevenue);
    document.getElementById('statProfit').textContent = utils.formatCurrency(Math.abs(profitLoss));
    
    // Update profit card color
    const profitCard = document.getElementById('statProfitCard');
    profitCard.classList.remove('profit', 'loss');
    profitCard.classList.add(isProfitable ? 'profit' : 'loss');
    
    // Update label
    const profitLabel = profitCard.querySelector('.stat-card-label');
    profitLabel.textContent = isProfitable ? 'Total Profit' : 'Total Loss';
    
    console.log(`📊 Stats: ${total} projects, ${active} active, Revenue: ${utils.formatCurrency(totalRevenue)}, Profit: ${utils.formatCurrency(profitLoss)}`);
}

// Render projects as cards
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    // Hide loading
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
    
    console.log(`🎨 Rendered ${filteredProjects.length} project cards`);
}

// Create project card element
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
    
    const statusText = {
        'prospek': 'Prospek',
        'survey': 'Survey',
        'pengerjaan': 'Pengerjaan',
        'ditolak': 'Ditolak'
    }[project.status] || project.status;
    
    const timeAgo = project.createdAt 
        ? getTimeAgo(project.createdAt.toDate()) 
        : '-';
    
    const card = document.createElement('div');
    card.className = 'project-card';
    
    card.innerHTML = `
        <div class="project-card-image ${thumbnail ? '' : 'no-image'}">
            ${thumbnail 
                ? `<img src="${thumbnail}" alt="${project.projectName}">` 
                : '<i class="fas fa-snowflake"></i>'}
            <div class="project-card-status ${project.status}">${statusText}</div>
        </div>
        
        <div class="project-card-body">
            <div class="project-card-title">${project.projectName || 'Untitled'}</div>
            <div class="project-card-client">
                <i class="fas fa-building"></i>
                ${project.client || '-'}
            </div>
            
            <div class="project-card-stats">
                <div class="project-card-stat">
                    <div class="project-card-stat-label">Penawaran</div>
                    <div class="project-card-stat-value">${utils.formatCurrency(summary.totalQuotation)}</div>
                </div>
                <div class="project-card-stat">
                    <div class="project-card-stat-label">Real</div>
                    <div class="project-card-stat-value">${utils.formatCurrency(summary.totalReal)}</div>
                </div>
            </div>
            
            <div class="project-card-profit ${isProfitable ? 'positive' : profitLoss === 0 ? 'neutral' : 'negative'}">
                ${isProfitable ? '✅ PROFIT' : profitLoss === 0 ? '➖ BREAK EVEN' : '⚠️ LOSS'}: 
                ${utils.formatCurrency(Math.abs(profitLoss))}
            </div>
            
            <div class="project-card-meta">
                <span><i class="fas fa-calendar"></i> ${timeAgo}</span>
                <span><i class="fas fa-images"></i> ${project.photos ? project.photos.length : 0}/10</span>
            </div>
            
            <div class="project-card-actions">
                <button class="btn btn-primary" onclick="viewProject('${project.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn" style="background: #95a5a6; color: white;" onclick="editProject('${project.id}')">
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
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            // No search, apply current filter only
            applyFilter();
        } else {
            // Search with current filter
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
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Apply filter
    applyFilter();
}

// Apply current filter
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

// Edit project (go to detail page in edit mode)
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

console.log('✅ index.js loaded (upgraded version)');
