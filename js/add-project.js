// ================================================
// ADD PROJECT FUNCTIONALITY - FIXED VERSION
// Nala Project Management System
// ================================================

let selectedLocation = null;

// Initialize add project page - ONLY called when Maps is ready
function initAddProject() {
    console.log('🚀 initAddProject() CALLED');
    
    // Double check Google Maps is available
    if (typeof google === 'undefined' || !google.maps) {
        console.error('❌ Google Maps STILL not available!');
        alert('ERROR: Google Maps tidak load. Silakan refresh halaman.');
        return;
    }
    
    console.log('✅ Google Maps confirmed available');
    
    try {
        // Initialize map
        console.log('📍 Creating map...');
        const mapEl = document.getElementById('map');
        
        if (!mapEl) {
            console.error('❌ Map element #map not found in DOM!');
            return;
        }
        
        console.log('✅ Map element found, initializing...');
        
        // Create the map
        const map = new google.maps.Map(mapEl, {
            center: { lat: -5.1477, lng: 119.4327 }, // Makassar
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true
        });
        
        console.log('✅ MAP CREATED SUCCESSFULLY!');
        
        // Store map globally so other functions can access it
        window.projectMap = map;
        
        // Setup map click handler
        map.addListener('click', (event) => {
            console.log('📍 Map clicked!');
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            // Clear previous markers
            if (window.projectMarker) {
                window.projectMarker.setMap(null);
            }
            
            // Add new marker
            window.projectMarker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                animation: google.maps.Animation.DROP,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#2196F3',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                    scale: 12
                }
            });
            
            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: event.latLng }, (results, status) => {
                let address = 'Alamat tidak ditemukan';
                
                if (status === 'OK' && results[0]) {
                    address = results[0].formatted_address;
                }
                
                // Update form fields
                selectedLocation = { lat, lng, address };
                document.getElementById('latitude').value = lat.toFixed(6);
                document.getElementById('longitude').value = lng.toFixed(6);
                document.getElementById('address').value = address;
                
                if (window.utils) {
                    utils.showToast('Lokasi berhasil dipilih!', 'success');
                }
            });
        });
        
        // Setup form submission
        setupFormSubmission();
        
        console.log('✅ All initialization complete!');
        
    } catch (error) {
        console.error('❌ Error in initAddProject:', error);
        alert('Error initializing map: ' + error.message);
    }
}

// Search location handler
function searchLocationHandler() {
    if (!window.projectMap) {
        alert('Map belum siap!');
        return;
    }
    
    const address = document.getElementById('searchAddress').value.trim();
    
    if (!address) {
        alert('Masukkan alamat yang ingin dicari');
        return;
    }
    
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            window.projectMap.setCenter(location);
            window.projectMap.setZoom(15);
            
            // Clear old marker
            if (window.projectMarker) {
                window.projectMarker.setMap(null);
            }
            
            // Add new marker
            window.projectMarker = new google.maps.Marker({
                position: location,
                map: window.projectMap,
                animation: google.maps.Animation.DROP,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#2196F3',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                    scale: 12
                }
            });
            
            selectedLocation = {
                lat: location.lat(),
                lng: location.lng(),
                address: results[0].formatted_address
            };
            
            document.getElementById('latitude').value = location.lat().toFixed(6);
            document.getElementById('longitude').value = location.lng().toFixed(6);
            document.getElementById('address').value = results[0].formatted_address;
            
            if (window.utils) {
                utils.showToast('Lokasi ditemukan!', 'success');
            }
        } else {
            alert('Lokasi tidak ditemukan. Coba alamat lain.');
        }
    });
}

// Get current location handler
function getCurrentLocationHandler() {
    if (!window.projectMap) {
        alert('Map belum siap!');
        return;
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                window.projectMap.setCenter({ lat, lng });
                window.projectMap.setZoom(15);
                
                // Clear old marker
                if (window.projectMarker) {
                    window.projectMarker.setMap(null);
                }
                
                // Add marker
                window.projectMarker = new google.maps.Marker({
                    position: { lat, lng },
                    map: window.projectMap,
                    animation: google.maps.Animation.DROP,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#2196F3',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                        scale: 12
                    }
                });
                
                // Get address
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    let address = 'Alamat tidak ditemukan';
                    
                    if (status === 'OK' && results[0]) {
                        address = results[0].formatted_address;
                    }
                    
                    selectedLocation = { lat, lng, address };
                    document.getElementById('latitude').value = lat.toFixed(6);
                    document.getElementById('longitude').value = lng.toFixed(6);
                    document.getElementById('address').value = address;
                    
                    if (window.utils) {
                        utils.showToast('Lokasi Anda berhasil ditemukan!', 'success');
                    }
                });
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Gagal mendapatkan lokasi Anda. Pastikan GPS aktif.');
            }
        );
    } else {
        alert('Browser Anda tidak mendukung geolocation.');
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('addProjectForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate location selected
        if (!selectedLocation) {
            alert('Silakan pilih lokasi di map terlebih dahulu!');
            return;
        }
        
        // Get form data
        const formData = {
            projectName: document.getElementById('projectName').value.trim(),
            client: document.getElementById('client').value.trim(),
            status: document.getElementById('status').value,
            phone: document.getElementById('phone').value.trim(),
            description: document.getElementById('description').value.trim(),
            location: {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                address: document.getElementById('address').value.trim()
            },
            materials: window.DEFAULT_MATERIALS ? DEFAULT_MATERIALS.map(m => ({ ...m })) : [],
            services: window.DEFAULT_SERVICES ? DEFAULT_SERVICES.map(s => ({ ...s })) : [],
            photos: [],
            documents: {
                penawaran: [],
                bast: [],
                invoice: [],
                gallery: []
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: firebase.auth().currentUser.uid  
        };
        
        // Validate required fields
        if (!formData.projectName || !formData.client) {
            alert('Nama project dan client harus diisi!');
            return;
        }
        
        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        
        try {
            // Save to Firestore
            const docRef = await window.db.collection('nala_projects').add(formData);
            
            console.log('✅ Project created:', docRef.id);
            
            if (window.utils) {
                utils.showToast('Project berhasil disimpan!', 'success');
            } else {
                alert('Project berhasil disimpan!');
            }
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Gagal menyimpan project: ' + error.message);
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Project';
        }
    });
}

// Export functions to window
window.initAddProject = initAddProject;
window.searchLocationHandler = searchLocationHandler;
window.getCurrentLocationHandler = getCurrentLocationHandler;

console.log('✅ add-project.js loaded');
