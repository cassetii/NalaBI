// ================================================
// SIMPLE MAP FUNCTIONS
// ================================================

let map = null;
let markers = [];

// Initialize map
function initMap(elementId, center, zoom) {
    const mapElement = document.getElementById(elementId);
    
    if (!mapElement) {
        console.warn('Map element not found:', elementId);
        return;
    }
    
    if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps not loaded');
        return;
    }
    
    map = new google.maps.Map(mapElement, {
        center: center,
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
    });
    
    console.log('✅ Map initialized');
    
    return map;
}

// Add marker to map
function addMarker(project) {
    if (!map || !project.location) return;
    
    const marker = new google.maps.Marker({
        position: {
            lat: project.location.lat,
            lng: project.location.lng
        },
        map: map,
        title: project.projectName,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getStatusColor(project.status),
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8
        }
    });
    
    // Info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #2c3e50;">${project.projectName}</h3>
                <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px;">
                    <i class="fas fa-building"></i> ${project.client || '-'}
                </p>
                <p style="margin: 0; font-size: 13px;">
                    <span style="background: ${getStatusColor(project.status)}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: 600;">
                        ${getStatusText(project.status)}
                    </span>
                </p>
                <div style="margin-top: 10px;">
                    <button onclick="window.location.href='project-detail.html?id=${project.id}'" 
                            style="background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 13px;">
                        <i class="fas fa-eye"></i> Lihat Detail
                    </button>
                </div>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    markers.push(marker);
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'prospek': '#3498db',
        'survey': '#f39c12',
        'pengerjaan': '#2ecc71',
        'ditolak': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
}

// Get status text
function getStatusText(status) {
    const texts = {
        'prospek': 'Prospek',
        'survey': 'Survey',
        'pengerjaan': 'Pengerjaan',
        'ditolak': 'Ditolak'
    };
    return texts[status] || status;
}

// Export functions
window.initMap = initMap;
window.addMarker = addMarker;
window.clearMarkers = clearMarkers;

console.log('✅ map.js loaded');
