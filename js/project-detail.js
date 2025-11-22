// ================================================
// PROJECT DETAIL PAGE
// Nala Project Management System - COMPLETE
// ================================================

let currentProject = null;
let projectId = null;
let isEditMode = false;
let editLocationMap = null;
let editMarker = null;
let newLocation = null;

// Initialize project detail page
function initProjectDetail() {
    console.log('📄 Initializing project detail page...');
    
    // Get project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    projectId = urlParams.get('id');
    
    if (!projectId) {
        utils.showToast('Project ID tidak ditemukan', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Load project data
    loadProjectDetail();
}

// Load project detail
async function loadProjectDetail() {
    try {
        const doc = await db.collection(COLLECTIONS.PROJECTS).doc(projectId).get();
        
        if (!doc.exists) {
            utils.showToast('Project tidak ditemukan', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        currentProject = { id: doc.id, ...doc.data() };
        
        // Render project details
        renderProjectHeader();
        renderProjectInfo();
        renderProjectLocation();
        renderMaterials();
        renderPhotos();
        renderDocuments();
        
        // RENDER AC UNITS & SUMMARY (CRITICAL!)
        renderAcUnits();
        updateProjectSummary();
        
        console.log('✅ Project loaded:', currentProject);
        
    } catch (error) {
        console.error('Error loading project:', error);
        utils.showToast('Gagal memuat data project', 'error');
    }
}

// Render project header
function renderProjectHeader() {
    document.getElementById('projectTitle').textContent = currentProject.projectName || 'Untitled Project';
    document.getElementById('projectClient').innerHTML = `<i class="fas fa-building"></i> ${currentProject.client || '-'}`;
    
    const statusElement = document.getElementById('projectStatus');
    const statusClass = `status-${currentProject.status}`;
    const statusText = {
        'prospek': 'Prospek',
        'survey': 'Survey',
        'pengerjaan': 'Pengerjaan',
        'ditolak': 'Ditolak'
    }[currentProject.status] || currentProject.status;
    
    statusElement.className = `project-status ${statusClass}`;
    statusElement.textContent = statusText;
}

// Render project info
function renderProjectInfo() {
    if (isEditMode) {
        // Edit mode - show input fields
        document.getElementById('infoProjectName').innerHTML = `
            <input type="text" id="editProjectName" value="${currentProject.projectName || ''}" 
                   style="width: 100%; padding: 8px; border: 2px solid #2196F3; border-radius: 4px;">
        `;
        document.getElementById('infoClient').innerHTML = `
            <input type="text" id="editClient" value="${currentProject.client || ''}"
                   style="width: 100%; padding: 8px; border: 2px solid #2196F3; border-radius: 4px;">
        `;
        document.getElementById('infoPhone').innerHTML = `
            <input type="tel" id="editPhone" value="${currentProject.phone || ''}"
                   style="width: 100%; padding: 8px; border: 2px solid #2196F3; border-radius: 4px;">
        `;
        document.getElementById('infoStatus').innerHTML = `
            <select id="editStatus" style="width: 100%; padding: 8px; border: 2px solid #2196F3; border-radius: 4px;">
                <option value="prospek" ${currentProject.status === 'prospek' ? 'selected' : ''}>Prospek</option>
                <option value="survey" ${currentProject.status === 'survey' ? 'selected' : ''}>Survey</option>
                <option value="pengerjaan" ${currentProject.status === 'pengerjaan' ? 'selected' : ''}>Pengerjaan</option>
                <option value="ditolak" ${currentProject.status === 'ditolak' ? 'selected' : ''}>Ditolak</option>
            </select>
        `;
        document.getElementById('infoAddress').innerHTML = `
            <textarea id="editAddress" rows="2" 
                      style="width: 100%; padding: 8px; border: 2px solid #2196F3; border-radius: 4px;">${currentProject.location?.address || ''}</textarea>
        `;
        document.getElementById('infoDescription').innerHTML = `
            <textarea id="editDescription" rows="3"
                      style="width: 100%; padding: 8px; border: 2px solid #2196F3; border-radius: 4px;">${currentProject.description || ''}</textarea>
        `;
    } else {
        // View mode - show text
        document.getElementById('infoProjectName').textContent = currentProject.projectName || '-';
        document.getElementById('infoClient').textContent = currentProject.client || '-';
        document.getElementById('infoPhone').textContent = currentProject.phone || '-';
        document.getElementById('infoStatus').textContent = {
            'prospek': 'Prospek',
            'survey': 'Survey',
            'pengerjaan': 'Pengerjaan',
            'ditolak': 'Ditolak'
        }[currentProject.status] || currentProject.status;
        document.getElementById('infoAddress').textContent = currentProject.location?.address || '-';
        document.getElementById('infoDescription').textContent = currentProject.description || '-';
    }
}

// Render project location on map
function renderProjectLocation() {
    if (!currentProject.location) return;
    
    const location = {
        lat: currentProject.location.lat,
        lng: currentProject.location.lng
    };
    
    // Initialize map
    initMap('map', location, 15);
    
    // Add marker
    addMarker({
        id: currentProject.id,
        projectName: currentProject.projectName,
        client: currentProject.client,
        status: currentProject.status,
        location: currentProject.location
    });
}

// Render materials and services
function renderMaterials() {
    const materials = currentProject.materials || DEFAULT_MATERIALS;
    const services = currentProject.services || DEFAULT_SERVICES;
    const acUnits = currentProject.acUnits || [];
    
    // Render tables
    renderMaterialTable(materials, 'materialsTableBody');
    renderMaterialTable(services, 'servicesTableBody');
    
    // Initialize chart WITH AC UNITS
    initMaterialChart(materials, services, acUnits);
}

// Save materials and services
async function saveMaterials() {
    try {
        // Get updated materials
        const materials = [];
        const materialRows = document.querySelectorAll('#materialsTableBody tr');
        
        materialRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            materials.push({
                name: DEFAULT_MATERIALS[index].name,
                unit: DEFAULT_MATERIALS[index].unit,
                quotationQty: parseFloat(inputs[0].value) || 0,
                quotationPrice: parseFloat(inputs[1].value) || 0,
                realQty: parseFloat(inputs[2].value) || 0,
                realPrice: parseFloat(inputs[3].value) || 0
            });
        });
        
        // Get updated services
        const services = [];
        const serviceRows = document.querySelectorAll('#servicesTableBody tr');
        
        serviceRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            services.push({
                name: DEFAULT_SERVICES[index].name,
                unit: DEFAULT_SERVICES[index].unit,
                quotationQty: parseFloat(inputs[0].value) || 0,
                quotationPrice: parseFloat(inputs[1].value) || 0,
                realQty: parseFloat(inputs[2].value) || 0,
                realPrice: parseFloat(inputs[3].value) || 0
            });
        });
        
        // Update Firestore
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update({
            materials: materials,
            services: services,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update current project
        currentProject.materials = materials;
        currentProject.services = services;
        
        // Reset input borders
        document.querySelectorAll('.material-input').forEach(input => {
            input.style.borderColor = '#ddd';
        });
        
        // Update chart WITH AC UNITS
        const acUnits = currentProject.acUnits || [];
        initMaterialChart(materials, services, acUnits);
        
        // Update summary
        updateProjectSummary();
        
        utils.showToast('Material & Jasa berhasil disimpan!', 'success');
        
        console.log('✅ Materials saved');
        
    } catch (error) {
        console.error('Error saving materials:', error);
        utils.showToast('Gagal menyimpan data', 'error');
    }
}

// Render photos
function renderPhotos() {
    const photos = currentProject.photos || [];
    const photoGrid = document.getElementById('photoGrid');
    
    // Update tab label
    const photoTab = document.querySelector('.tab[onclick*="photos"]');
    if (photoTab) {
        photoTab.innerHTML = `<i class="fas fa-images"></i> Foto (${photos.length}/10)`;
    }
    
    photoGrid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photo.url}" alt="Photo ${index + 1}" onclick="window.open('${photo.url}', '_blank')">
            <button onclick="deletePhoto(${index})" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(244, 67, 54, 0.9);
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <i class="fas fa-trash"></i>
            </button>
        `;
        photoGrid.appendChild(photoItem);
    });
}

// Upload photos
async function uploadPhotos(event) {
    const files = Array.from(event.target.files);
    
    if (!files.length) return;
    
    const currentPhotos = currentProject.photos || [];
    
    // Check max photos limit
    if (currentPhotos.length + files.length > MAX_PHOTOS) {
        utils.showToast(`Maksimal ${MAX_PHOTOS} foto per project`, 'error');
        return;
    }
    
    // Validate files
    for (const file of files) {
        if (!utils.validateFileSize(file, MAX_PHOTO_SIZE)) {
            utils.showToast(`File ${file.name} terlalu besar. Maksimal 5MB`, 'error');
            return;
        }
        
        if (!utils.validateFileType(file, ['image'])) {
            utils.showToast(`File ${file.name} bukan format gambar`, 'error');
            return;
        }
    }
    
    utils.showToast('Mengupload foto...', 'info');
    
    try {
        const uploadedPhotos = [];
        
        for (const file of files) {
            const filename = `${Date.now()}_${file.name}`;
            const storageRef = storage.ref(`nala_projects/${projectId}/photos/${filename}`);
            
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();
            
            uploadedPhotos.push({
                url: url,
                filename: filename,
                uploadedAt: new Date().toISOString()
            });
        }
        
        // Update Firestore
        const updatedPhotos = [...currentPhotos, ...uploadedPhotos];
        
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update({
            photos: updatedPhotos,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        currentProject.photos = updatedPhotos;
        
        renderPhotos();
        
        utils.showToast('Foto berhasil diupload!', 'success');
        
        // Reset input
        event.target.value = '';
        
    } catch (error) {
        console.error('Error uploading photos:', error);
        utils.showToast('Gagal mengupload foto', 'error');
    }
}

// Delete photo
async function deletePhoto(index) {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;
    
    try {
        const photos = currentProject.photos || [];
        const photo = photos[index];
        
        // Delete from storage
        const storageRef = storage.ref(`nala_projects/${projectId}/photos/${photo.filename}`);
        await storageRef.delete();
        
        // Remove from array
        photos.splice(index, 1);
        
        // Update Firestore
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update({
            photos: photos,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        currentProject.photos = photos;
        
        renderPhotos();
        
        utils.showToast('Foto berhasil dihapus', 'success');
        
    } catch (error) {
        console.error('Error deleting photo:', error);
        utils.showToast('Gagal menghapus foto', 'error');
    }
}

// Render documents
function renderDocuments() {
    const documents = currentProject.documents || {};
    
    renderDocumentList('docPenawaranList', documents.penawaran || []);
    renderDocumentList('docBastList', documents.bast || []);
    renderDocumentList('docInvoiceList', documents.invoice || []);
}

// Render document list
function renderDocumentList(containerId, documents) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    documents.forEach((doc, index) => {
        const docItem = document.createElement('div');
        docItem.className = 'document-item';
        docItem.innerHTML = `
            <div class="document-info">
                <i class="fas fa-file-pdf document-icon"></i>
                <div>
                    <strong>${doc.filename}</strong>
                    <div style="font-size: 12px; color: #999;">
                        ${utils.formatDateTime(doc.uploadedAt)}
                    </div>
                </div>
            </div>
            <div>
                <button class="btn btn-primary" style="padding: 8px 15px; margin-right: 5px;" onclick="window.open('${doc.url}', '_blank')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-danger" style="padding: 8px 15px;" onclick="deleteDocument('${containerId}', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(docItem);
    });
}

// Upload document
async function uploadDocument(event, category) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file size
    if (!utils.validateFileSize(file, MAX_DOCUMENT_SIZE)) {
        utils.showToast('File terlalu besar. Maksimal 10MB', 'error');
        return;
    }
    
    utils.showToast('Mengupload dokumen...', 'info');
    
    try {
        const filename = `${Date.now()}_${file.name}`;
        const storageRef = storage.ref(`nala_projects/${projectId}/documents/${category}/${filename}`);
        
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();
        
        const documentData = {
            url: url,
            filename: file.name,
            uploadedAt: new Date().toISOString()
        };
        
        // Update Firestore
        const documents = currentProject.documents || {};
        if (!documents[category]) documents[category] = [];
        
        documents[category].push(documentData);
        
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update({
            documents: documents,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        currentProject.documents = documents;
        
        renderDocuments();
        
        utils.showToast('Dokumen berhasil diupload!', 'success');
        
        // Reset input
        event.target.value = '';
        
    } catch (error) {
        console.error('Error uploading document:', error);
        utils.showToast('Gagal mengupload dokumen', 'error');
    }
}

// Delete document
async function deleteDocument(containerId, index) {
    if (!confirm('Yakin ingin menghapus dokumen ini?')) return;
    
    try {
        // Determine category from container ID
        const category = containerId.replace('doc', '').replace('List', '').toLowerCase();
        
        const documents = currentProject.documents || {};
        const categoryDocs = documents[category] || [];
        const doc = categoryDocs[index];
        
        // Remove from array
        categoryDocs.splice(index, 1);
        documents[category] = categoryDocs;
        
        // Update Firestore
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update({
            documents: documents,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        currentProject.documents = documents;
        
        renderDocuments();
        
        utils.showToast('Dokumen berhasil dihapus', 'success');
        
    } catch (error) {
        console.error('Error deleting document:', error);
        utils.showToast('Gagal menghapus dokumen', 'error');
    }
}

// Delete project
async function deleteProject() {
    if (!confirm('PERINGATAN: Anda yakin ingin menghapus project ini? Semua data termasuk foto dan dokumen akan terhapus permanen!')) {
        return;
    }
    
    if (!confirm('Konfirmasi sekali lagi: Hapus project ini?')) {
        return;
    }
    
    try {
        utils.showToast('Menghapus project...', 'info');
        
        // Delete photos from storage
        const photos = currentProject.photos || [];
        for (const photo of photos) {
            try {
                const storageRef = storage.ref(`nala_projects/${projectId}/photos/${photo.filename}`);
                await storageRef.delete();
            } catch (e) {
                console.warn('Failed to delete photo:', e);
            }
        }
        
        // Delete Firestore document
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).delete();
        
        utils.showToast('Project berhasil dihapus', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error deleting project:', error);
        utils.showToast('Gagal menghapus project', 'error');
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Re-render AC Units when switching to acunits tab
    if (tabName === 'acunits') {
        renderAcUnits();
        updateProjectSummary();
    }
    
    // Re-render materials chart when switching to materials tab
    if (tabName === 'materials') {
        renderMaterials();
    }
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const editBtn = document.getElementById('editBtn');
    const mapContainer = document.getElementById('editMapContainer');
    
    if (isEditMode) {
        editBtn.innerHTML = '<i class="fas fa-save"></i> Simpan';
        editBtn.onclick = saveProjectChanges;
        editBtn.classList.remove('btn-primary');
        editBtn.classList.add('btn-success');
        
        // Show map for location editing
        mapContainer.classList.add('active');
        
        // Initialize edit map
        setTimeout(() => {
            if (!editLocationMap) {
                editLocationMap = new google.maps.Map(document.getElementById('editMap'), {
                    center: {
                        lat: currentProject.location.lat,
                        lng: currentProject.location.lng
                    },
                    zoom: 15,
                    mapTypeControl: true,
                    streetViewControl: false
                });
                
                // Add current location marker
                editMarker = new google.maps.Marker({
                    position: {
                        lat: currentProject.location.lat,
                        lng: currentProject.location.lng
                    },
                    map: editLocationMap,
                    draggable: true,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#2196F3',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                        scale: 12
                    }
                });
                
                // Handle map click to change location
                editLocationMap.addListener('click', (event) => {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    
                    // Update marker position
                    editMarker.setPosition(event.latLng);
                    
                    // Reverse geocode
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ location: event.latLng }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            newLocation = {
                                lat: lat,
                                lng: lng,
                                address: results[0].formatted_address
                            };
                            
                            // Update address field
                            document.getElementById('editAddress').value = results[0].formatted_address;
                            utils.showToast('Lokasi baru dipilih! Klik Simpan untuk update.', 'info');
                        }
                    });
                });
                
                // Handle marker drag
                editMarker.addListener('dragend', (event) => {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ location: event.latLng }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            newLocation = {
                                lat: lat,
                                lng: lng,
                                address: results[0].formatted_address
                            };
                            
                            document.getElementById('editAddress').value = results[0].formatted_address;
                            utils.showToast('Lokasi baru dipilih! Klik Simpan untuk update.', 'info');
                        }
                    });
                });
            }
        }, 100);
        
    } else {
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.onclick = toggleEditMode;
        editBtn.classList.remove('btn-success');
        editBtn.classList.add('btn-primary');
        
        // Hide map
        mapContainer.classList.remove('active');
        newLocation = null;
    }
    
    renderProjectInfo();
}

// Save project changes
async function saveProjectChanges() {
    try {
        const updatedData = {
            projectName: document.getElementById('editProjectName').value.trim(),
            client: document.getElementById('editClient').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            status: document.getElementById('editStatus').value,
            description: document.getElementById('editDescription').value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // If location changed, include new location
        if (newLocation) {
            updatedData.location = {
                lat: newLocation.lat,
                lng: newLocation.lng,
                address: newLocation.address
            };
        } else {
            // Just update address if changed (without lat/lng change)
            updatedData['location.address'] = document.getElementById('editAddress').value.trim();
        }
        
        // Validate
        if (!updatedData.projectName || !updatedData.client) {
            utils.showToast('Nama project dan client harus diisi', 'error');
            return;
        }
        
        // Update Firestore
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update(updatedData);
        
        // Update current project
        currentProject.projectName = updatedData.projectName;
        currentProject.client = updatedData.client;
        currentProject.phone = updatedData.phone;
        currentProject.status = updatedData.status;
        currentProject.description = updatedData.description;
        
        if (newLocation) {
            currentProject.location = newLocation;
            // Update sidebar map marker
            clearMarkers();
            addMarker(currentProject);
        } else if (currentProject.location) {
            currentProject.location.address = updatedData['location.address'];
        }
        
        // Exit edit mode
        isEditMode = false;
        newLocation = null;
        
        // Hide map
        document.getElementById('editMapContainer').classList.remove('active');
        
        // Update UI
        renderProjectHeader();
        renderProjectInfo();
        
        const editBtn = document.getElementById('editBtn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.onclick = toggleEditMode;
        editBtn.classList.remove('btn-success');
        editBtn.classList.add('btn-primary');
        
        utils.showToast('Project berhasil diupdate!', 'success');
        
        console.log('✅ Project updated');
        
    } catch (error) {
        console.error('Error updating project:', error);
        utils.showToast('Gagal mengupdate project', 'error');
    }
}

// ================================================
// AC UNITS MANAGEMENT FUNCTIONS
// ================================================

// Show Add AC Unit Modal
function showAddAcUnitModal() {
    document.getElementById('acUnitModal').style.display = 'block';
    document.getElementById('acModalTitle').textContent = 'Tambah Unit AC';
    document.getElementById('acUnitIndex').value = '-1';
    document.getElementById('acUnitForm').reset();
}

// Close AC Unit Modal
function closeAcUnitModal() {
    document.getElementById('acUnitModal').style.display = 'none';
    document.getElementById('acUnitForm').reset();
}

// Show Edit AC Unit Modal
function editAcUnit(index) {
    const acUnit = currentProject.acUnits[index];
    
    document.getElementById('acUnitModal').style.display = 'block';
    document.getElementById('acModalTitle').textContent = 'Edit Unit AC';
    document.getElementById('acUnitIndex').value = index;
    document.getElementById('acType').value = acUnit.acType || '';
    document.getElementById('acQuotationQty').value = acUnit.quotationQty || 0;
    document.getElementById('acQuotationPrice').value = acUnit.quotationPrice || 0;
    document.getElementById('acRealQty').value = acUnit.realQty || 0;
    document.getElementById('acRealPrice').value = acUnit.realPrice || 0;
}

// Handle AC Unit Form Submit
document.addEventListener('DOMContentLoaded', () => {
    const acUnitForm = document.getElementById('acUnitForm');
    if (acUnitForm) {
        acUnitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const index = parseInt(document.getElementById('acUnitIndex').value);
            const acUnitData = {
                acType: document.getElementById('acType').value.trim(),
                quotationQty: parseFloat(document.getElementById('acQuotationQty').value) || 0,
                quotationPrice: parseFloat(document.getElementById('acQuotationPrice').value) || 0,
                realQty: parseFloat(document.getElementById('acRealQty').value) || 0,
                realPrice: parseFloat(document.getElementById('acRealPrice').value) || 0
            };
            
            if (!acUnitData.acType) {
                utils.showToast('Type/Nama AC harus diisi', 'error');
                return;
            }
            
            try {
                if (!currentProject.acUnits) {
                    currentProject.acUnits = [];
                }
                
                if (index === -1) {
                    currentProject.acUnits.push(acUnitData);
                } else {
                    currentProject.acUnits[index] = acUnitData;
                }
                
                await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update({
                    acUnits: currentProject.acUnits
                });
                
                closeAcUnitModal();
                renderAcUnits();
                updateProjectSummary();
                
                utils.showToast(index === -1 ? 'Unit AC berhasil ditambahkan!' : 'Unit AC berhasil diupdate!', 'success');
                
            } catch (error) {
                console.error('Error saving AC unit:', error);
                utils.showToast('Gagal menyimpan data AC unit', 'error');
            }
        });
    }
});

// Delete AC Unit
async function deleteAcUnit(index) {
    if (!confirm('Yakin ingin menghapus unit AC ini?')) return;
    
    try {
        currentProject.acUnits.splice(index, 1);
        
        await db.collection(COLLECTIONS.PROJECTS).doc(projectId).update({
            acUnits: currentProject.acUnits
        });
        
        renderAcUnits();
        updateProjectSummary();
        
        utils.showToast('Unit AC berhasil dihapus', 'success');
        
    } catch (error) {
        console.error('Error deleting AC unit:', error);
        utils.showToast('Gagal menghapus unit AC', 'error');
    }
}

// Render AC Units Table
function renderAcUnits() {
    const acUnits = currentProject.acUnits || [];
    const tbody = document.getElementById('acUnitsTableBody');
    const table = document.getElementById('acUnitsTable');
    const emptyState = document.getElementById('emptyAcUnits');
    const tabButton = document.querySelector('button[onclick="switchTab(\'acunits\')"]');
    
    // Update tab counter
    if (tabButton) {
        tabButton.innerHTML = `<i class="fas fa-snowflake"></i> Unit AC (${acUnits.length})`;
    }
    
    if (!tbody) {
        console.warn('AC Units table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (acUnits.length === 0) {
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';
    
    acUnits.forEach((ac, index) => {
        const quotationTotal = (ac.quotationPrice || 0) * (ac.quotationQty || 0);
        const realTotal = (ac.realPrice || 0) * (ac.realQty || 0);
        const profitLoss = quotationTotal - realTotal;
        
        const profitLossColor = profitLoss >= 0 ? '#4CAF50' : '#F44336';
        const profitLossText = profitLoss >= 0 ? 'PROFIT' : 'LOSS';
        const profitLossIcon = profitLoss >= 0 ? '↑' : '↓';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${ac.acType}</strong></td>
            <td>${ac.quotationQty || 0}</td>
            <td>${utils.formatCurrency(ac.quotationPrice || 0)}</td>
            <td>${ac.realQty || 0}</td>
            <td>${utils.formatCurrency(ac.realPrice || 0)}</td>
            <td>
                <strong style="color: ${profitLossColor}">
                    ${profitLossText} ${profitLossIcon}
                </strong>
                <div style="font-size: 13px; font-weight: 600; color: ${profitLossColor};">
                    ${utils.formatCurrency(Math.abs(profitLoss))}
                </div>
            </td>
            <td>
                <button class="btn" onclick="editAcUnit(${index})" style="padding: 5px 10px; margin-right: 5px; background: #2196F3; color: white;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn" onclick="deleteAcUnit(${index})" style="padding: 5px 10px; background: #F44336; color: white;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log(`✅ Rendered ${acUnits.length} AC units`);
}

// Update Project Summary with AC Units
function updateProjectSummary() {
    const materials = currentProject.materials || [];
    const services = currentProject.services || [];
    const acUnits = currentProject.acUnits || [];
    
    const summary = calculateProjectSummary(materials, services, acUnits);
    
    const summaryElement = document.getElementById('projectSummary');
    if (summaryElement) {
        const profitLossColor = summary.isProfitable ? '#4CAF50' : '#F44336';
        const profitLossText = summary.isProfitable ? 'PROFIT' : 'LOSS';
        
        summaryElement.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #2c3e50;">📊 Ringkasan Project</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <div style="font-size: 12px; color: #7f8c8d;">Total Penawaran</div>
                        <div style="font-size: 20px; font-weight: 700; color: #2196F3;">
                            ${utils.formatCurrency(summary.totalQuotation)}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #7f8c8d;">Total Real</div>
                        <div style="font-size: 20px; font-weight: 700; color: #4CAF50;">
                            ${utils.formatCurrency(summary.totalReal)}
                        </div>
                    </div>
                </div>
                <div style="border-top: 2px solid #ddd; padding-top: 15px;">
                    <div style="font-size: 14px; font-weight: 600; color: ${profitLossColor};">
                        ${profitLossText}
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${profitLossColor};">
                        ${utils.formatCurrency(Math.abs(summary.profitLoss))}
                    </div>
                </div>
            </div>
            
            ${acUnits.length > 0 ? `
            <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-size: 14px; font-weight: 600; color: #2196F3; margin-bottom: 10px;">
                    ❄️ Unit AC Terpasang: ${acUnits.reduce((sum, ac) => sum + (ac.quotationQty || 0), 0)} Unit
                </div>
                ${acUnits.map(ac => `
                    <div style="font-size: 13px; color: #555; margin-left: 15px;">
                        • ${ac.quotationQty || 0}x ${ac.acType}
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
    }
    
    // Update chart with AC Units
    if (typeof initMaterialChart === 'function') {
        initMaterialChart(materials, services, acUnits);
    }
    
    console.log('✅ Project summary updated');
}

// Export functions
window.initProjectDetail = initProjectDetail;
window.saveMaterials = saveMaterials;
window.uploadPhotos = uploadPhotos;
window.deletePhoto = deletePhoto;
window.uploadDocument = uploadDocument;
window.deleteDocument = deleteDocument;
window.deleteProject = deleteProject;
window.switchTab = switchTab;
window.toggleEditMode = toggleEditMode;
window.saveProjectChanges = saveProjectChanges;
window.showAddAcUnitModal = showAddAcUnitModal;
window.closeAcUnitModal = closeAcUnitModal;
window.editAcUnit = editAcUnit;
window.deleteAcUnit = deleteAcUnit;
window.renderAcUnits = renderAcUnits;
window.updateProjectSummary = updateProjectSummary;
