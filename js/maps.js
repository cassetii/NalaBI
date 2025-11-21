// ================================================
// GOOGLE MAPS INTEGRATION
// Nala Project Management System
// ================================================

let map;
let markers = [];
let infoWindow;

// Initialize Google Maps
function initMap(elementId = 'map', center = DEFAULT_MAP_CENTER, zoom = DEFAULT_MAP_ZOOM) {
    const mapElement = document.getElementById(elementId);
    
    if (!mapElement) {
        console.error('Map element not found');
        return null;
    }
    
    // Hide loading indicator if exists
    const loadingElement = document.getElementById('mapLoading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Map options
    const mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    };
    
    map = new google.maps.Map(mapElement, mapOptions);
    infoWindow = new google.maps.InfoWindow();
    
    console.log('🗺️ Google Maps initialized');
    return map;
}

// Get marker color based on status
function getMarkerIcon(status) {
    const colors = {
        'prospek': '#2196F3',    // Blue
        'survey': '#4CAF50',     // Green
        'pengerjaan': '#9C27B0', // Purple
        'ditolak': '#F44336'     // Red
    };
    
    const color = colors[status] || '#757575';
    
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12
    };
}

// Add marker to map
function addMarker(project) {
    if (!map || !project.location) return null;
    
    const marker = new google.maps.Marker({
        position: {
            lat: project.location.lat,
            lng: project.location.lng
        },
        map: map,
        title: project.projectName,
        icon: getMarkerIcon(project.status),
        animation: google.maps.Animation.DROP,
        projectId: project.id
    });
    
    // Create info window content
    const contentString = `
        <div style="padding: 15px; max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; color: #2196F3; font-size: 18px;">
                ${project.projectName}
            </h3>
            <p style="margin: 5px 0; color: #666;">
                <strong>Client:</strong> ${project.client || '-'}
            </p>
            <p style="margin: 5px 0; color: #666;">
                <strong>Status:</strong> 
                <span style="
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    background: ${getStatusColor(project.status)};
                    color: white;
                ">
                    ${getStatusText(project.status)}
                </span>
            </p>
            <p style="margin: 10px 0 5px 0; color: #666; font-size: 13px;">
                <i class="fas fa-map-marker-alt"></i> ${project.location.address || 'Alamat tidak tersedia'}
            </p>
            <a href="project-detail.html?id=${project.id}" 
               style="
                   display: inline-block;
                   margin-top: 10px;
                   padding: 8px 16px;
                   background: #2196F3;
                   color: white;
                   text-decoration: none;
                   border-radius: 6px;
                   font-size: 14px;
                   font-weight: 600;
               ">
                <i class="fas fa-eye"></i> Lihat Detail
            </a>
        </div>
    `;
    
    // Add click listener
    marker.addListener('click', () => {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
    });
    
    markers.push(marker);
    return marker;
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'prospek': '#2196F3',
        'survey': '#4CAF50',
        'pengerjaan': '#9C27B0',
        'ditolak': '#F44336'
    };
    return colors[status] || '#757575';
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

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Load all projects to map
async function loadProjectsToMap() {
    try {
        clearMarkers();
        
        const snapshot = await db.collection(COLLECTIONS.PROJECTS).get();
        
        if (snapshot.empty) {
            console.log('No projects found');
            return;
        }
        
        const bounds = new google.maps.LatLngBounds();
        
        snapshot.forEach(doc => {
            const project = { id: doc.id, ...doc.data() };
            
            if (project.location && project.location.lat && project.location.lng) {
                addMarker(project);
                bounds.extend(new google.maps.LatLng(project.location.lat, project.location.lng));
            }
        });
        
        // Fit map to markers if there are any
        if (markers.length > 0) {
            map.fitBounds(bounds);
            
            // Don't zoom in too close
            const listener = google.maps.event.addListener(map, 'idle', () => {
                if (map.getZoom() > 15) map.setZoom(15);
                google.maps.event.removeListener(listener);
            });
        }
        
        console.log(`📍 Loaded ${markers.length} markers to map`);
        
    } catch (error) {
        console.error('Error loading projects to map:', error);
    }
}

// Setup map click for adding project
function setupMapClickForAddProject(callback) {
    if (!map) return;
    
    map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Clear previous markers
        clearMarkers();
        
        // Add temporary marker
        const tempMarker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            icon: getMarkerIcon('prospek'),
            animation: google.maps.Animation.BOUNCE
        });
        
        markers.push(tempMarker);
        
        // Get address from coordinates (reverse geocoding)
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
            let address = 'Alamat tidak ditemukan';
            
            if (status === 'OK' && results[0]) {
                address = results[0].formatted_address;
            }
            
            // Callback with location data
            if (callback) {
                callback({
                    lat: lat,
                    lng: lng,
                    address: address
                });
            }
        });
    });
}

// Search location by address
function searchLocation(address, callback) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            map.setCenter(location);
            map.setZoom(15);
            
            // Clear and add marker
            clearMarkers();
            
            const marker = new google.maps.Marker({
                position: location,
                map: map,
                icon: getMarkerIcon('prospek'),
                animation: google.maps.Animation.DROP
            });
            
            markers.push(marker);
            
            if (callback) {
                callback({
                    lat: location.lat(),
                    lng: location.lng(),
                    address: results[0].formatted_address
                });
            }
        } else {
            utils.showToast('Lokasi tidak ditemukan', 'error');
        }
    });
}

// Get current location
function getCurrentLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                map.setCenter({ lat, lng });
                map.setZoom(15);
                
                // Add marker
                clearMarkers();
                
                const marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    icon: getMarkerIcon('prospek'),
                    animation: google.maps.Animation.DROP
                });
                
                markers.push(marker);
                
                // Get address
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    let address = 'Alamat tidak ditemukan';
                    
                    if (status === 'OK' && results[0]) {
                        address = results[0].formatted_address;
                    }
                    
                    if (callback) {
                        callback({ lat, lng, address });
                    }
                });
            },
            (error) => {
                console.error('Geolocation error:', error);
                utils.showToast('Gagal mendapatkan lokasi', 'error');
            }
        );
    } else {
        utils.showToast('Browser tidak mendukung geolocation', 'error');
    }
}

// Export functions
window.initMap = initMap;
window.addMarker = addMarker;
window.clearMarkers = clearMarkers;
window.loadProjectsToMap = loadProjectsToMap;
window.setupMapClickForAddProject = setupMapClickForAddProject;
window.searchLocation = searchLocation;
window.getCurrentLocation = getCurrentLocation;
window.getMarkerIcon = getMarkerIcon;
