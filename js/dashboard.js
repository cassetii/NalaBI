// ================================================
// DASHBOARD MANAGEMENT
// Nala Project Management System
// ================================================

let allProjects = [];
let filteredProjects = [];
let currentFilter = 'all';

// Initialize dashboard
async function initDashboard() {
    console.log('📊 Initializing dashboard...');
    
    // Initialize map
    initMap('map', DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    
    // Load projects
    await loadProjects();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load projects to map
    loadProjectsToMap();
}

// Load all projects
async function loadProjects() {
    try {
        const projectsGrid = document.getElementById('projectsGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const emptyState = document.getElementById('emptyState');
        
        // Show loading
        loadingSpinner.style.display = 'block';
        projectsGrid.innerHTML = '';
        
        // Get projects from Firestore
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
        
        filteredProjects = [...allProjects];
        
        // Hide loading
        loadingSpinner.style.display = 'none';
        
        if (allProjects.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            renderProjects(filteredProjects);
        }
        
        // Update statistics
        updateStatistics();
        
        console.log(`✅ Loaded ${allProjects.length} projects`);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        utils.showToast('Gagal memuat data project', 'error');
        
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
    }
}

// Render projects to grid
function renderProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p style="font-size: 18px;">Tidak ada project yang sesuai filter</p>
            </div>
        `;
        return;
    }
    
    projects.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.onclick = () => {
        window.location.href = `project-detail.html?id=${project.id}`;
    };
    
    const statusClass = `status-${project.status}`;
    const statusText = {
        'prospek': 'Prospek',
        'survey': 'Survey',
        'pengerjaan': 'Pengerjaan',
        'ditolak': 'Ditolak'
    }[project.status] || project.status;
    
    card.innerHTML = `
        <div class="project-card-header">
            <div>
                <span class="project-status ${statusClass}">${statusText}</span>
            </div>
            <i class="fas fa-chevron-right" style="color: #bbb;"></i>
        </div>
        <div class="project-card-body">
            <h3 class="project-title">${project.projectName || 'Untitled Project'}</h3>
            <p class="project-client">
                <i class="fas fa-building"></i> ${project.client || '-'}
            </p>
            <p class="project-location">
                <i class="fas fa-map-marker-alt"></i> ${project.location?.address || 'Lokasi tidak tersedia'}
            </p>
            <div class="project-meta">
                <span>
                    <i class="fas fa-calendar"></i> ${utils.formatDate(project.createdAt)}
                </span>
                <span>
                    <i class="fas fa-photo-video"></i> ${project.photos?.length || 0}/10
                </span>
            </div>
        </div>
    `;
    
    return card;
}

// Update statistics
function updateStatistics() {
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter(p => 
        p.status === 'prospek' || p.status === 'pengerjaan'
    ).length;
    const completedProjects = allProjects.filter(p => 
        p.status === 'survey'
    ).length;
    
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('activeProjects').textContent = activeProjects;
    document.getElementById('completedProjects').textContent = completedProjects;
}

// Filter projects by status
function filterProjects(status) {
    currentFilter = status;
    
    if (status === 'all') {
        filteredProjects = [...allProjects];
    } else {
        filteredProjects = allProjects.filter(p => p.status === status);
    }
    
    renderProjects(filteredProjects);
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === status) {
            btn.classList.add('active');
        }
    });
}

// Search projects
function searchProjects(query) {
    query = query.toLowerCase().trim();
    
    if (!query) {
        filteredProjects = currentFilter === 'all' 
            ? [...allProjects]
            : allProjects.filter(p => p.status === currentFilter);
    } else {
        const baseProjects = currentFilter === 'all' 
            ? allProjects
            : allProjects.filter(p => p.status === currentFilter);
        
        filteredProjects = baseProjects.filter(project => {
            const projectName = (project.projectName || '').toLowerCase();
            const client = (project.client || '').toLowerCase();
            const address = (project.location?.address || '').toLowerCase();
            
            return projectName.includes(query) || 
                   client.includes(query) || 
                   address.includes(query);
        });
    }
    
    renderProjects(filteredProjects);
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterProjects(btn.dataset.status);
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchProjects(e.target.value);
            }, 300);
        });
    }
}

// Export functions
window.initDashboard = initDashboard;
window.loadProjects = loadProjects;
window.filterProjects = filterProjects;
window.searchProjects = searchProjects;
