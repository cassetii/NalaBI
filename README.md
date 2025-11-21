# 🌨️ Nala Project Management System

Sistem manajemen project profesional untuk **Nala Aircon (CV Nala Karya)** dengan integrasi Google Maps dan Firebase.

## ✨ Fitur Utama

### 1. **Dashboard Interaktif**
- 📊 Statistik project real-time
- 🗺️ Google Maps hero section dengan semua lokasi project
- 🔵🟢🟣🔴 Color-coded markers berdasarkan status (Prospek, Survey, Pengerjaan, Ditolak)
- 🔍 Filter dan search project

### 2. **Manajemen Project**
- ➕ Tambah project dengan map integration
- 📍 Pilih lokasi dengan klik map atau search address
- ✏️ Edit dan update project details
- 🗑️ Hapus project dengan konfirmasi

### 3. **Material & Jasa Tracking**
- 📦 8 Material default (Pipa, Kabel, Bracket, Ducktip, Isolasi, Sadel, Duckting, Armaflex)
- 🔧 3 Jasa default (Jasa Pasang, Jasa Tarik Pipa, Jasa Bobok)
- 💰 Input harga penawaran vs harga real
- 📊 **Combo Chart** otomatis untuk analisis deviasi
- 💵 Perhitungan deviasi budget real-time

### 4. **Photo Gallery**
- 📸 Upload maksimal 10 foto per project (max 5MB each)
- 🖼️ Grid view yang responsive
- 🗑️ Hapus foto individual
- 📂 Storage terstruktur di Firebase Storage

### 5. **Document Management**
- 📄 Upload Penawaran, BAST, Invoice
- 📁 Kategori dokumen terpisah
- 💾 Max 10MB per dokumen
- 📥 Download dokumen langsung

### 6. **Security**
- 🔐 Firebase Authentication (admin@nalaaircon.com)
- 🛡️ Firestore security rules
- 🚫 Upload validation (size & type)

---

## 🚀 Setup Instructions

### 1. Firebase Project Setup

#### a. Buat Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** atau **"Create a project"**
3. Nama project: **"nala-project-management"**
4. Enable Google Analytics (optional)
5. Klik **"Create project"**

#### b. Enable Authentication
1. Di Firebase Console, pilih project Anda
2. Klik **"Authentication"** di sidebar
3. Klik **"Get started"**
4. Tab **"Sign-in method"**, enable **"Email/Password"**
5. Tab **"Users"**, klik **"Add user"**:
   - Email: `admin@nalaaircon.com`
   - Password: `123456`

#### c. Create Firestore Database
1. Klik **"Firestore Database"** di sidebar
2. Klik **"Create database"**
3. Pilih **"Start in production mode"**
4. Pilih location: **asia-southeast2 (Jakarta)**
5. Klik **"Enable"**

#### d. Setup Storage
1. Klik **"Storage"** di sidebar
2. Klik **"Get started"**
3. Pilih **"Start in production mode"**
4. Location: **asia-southeast2 (Jakarta)**

#### e. Get Firebase Config
1. Klik ⚙️ (Settings) → **"Project settings"**
2. Scroll ke **"Your apps"**
3. Klik **"Web"** icon (</>)
4. App nickname: **"Nala Project App"**
5. Klik **"Register app"**
6. Copy **Firebase configuration**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nala-project-xxx.firebaseapp.com",
  projectId: "nala-project-xxx",
  storageBucket: "nala-project-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxx"
};
```

### 2. Update Config Files

#### a. Update `js/config.js`
Ganti `firebaseConfig` dengan config dari Firebase Console:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Deploy Firestore Rules

#### a. Copy Rules untuk Firestore
1. Di Firebase Console → **Firestore Database** → **Rules**
2. Copy isi file `firestore-rules-production.txt` (lihat di bawah)
3. Paste di Firebase Console
4. Klik **"Publish"**

#### b. Copy Rules untuk Storage
1. Di Firebase Console → **Storage** → **Rules**
2. Copy isi file yang Anda berikan di awal (storage rules)
3. Paste di Firebase Console
4. Klik **"Publish"**

### 4. Deploy Application

#### Option A: Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project folder
firebase init

# Select:
# - Hosting
# - Use existing project: nala-project-management
# - Public directory: . (current directory)
# - Single-page app: No
# - Don't overwrite index.html

# Deploy
firebase deploy
```

#### Option B: Web Server (Apache/Nginx)
Upload semua file ke web server Anda dengan struktur folder tetap sama.

#### Option C: Local Testing
Gunakan web server lokal:
```bash
# Python 3
python -m http.server 8000

# PHP
php -S localhost:8000

# Node.js (http-server)
npx http-server -p 8000
```

Akses: `http://localhost:8000`

---

## 📁 Struktur Folder

```
nala-project-app/
├── index.html                  # Dashboard utama
├── add-project.html           # Form tambah project
├── project-detail.html        # Detail project & tracking
│
├── css/
│   └── style.css             # Styling lengkap (Nala Blue theme)
│
├── js/
│   ├── config.js             # Firebase configuration
│   ├── auth.js               # Authentication logic
│   ├── dashboard.js          # Dashboard functionality
│   ├── maps.js               # Google Maps integration
│   ├── add-project.js        # Add project logic
│   ├── project-detail.js     # Project detail management
│   └── material-tracker.js   # Material tracking & Chart.js
│
└── README.md                  # Documentation (this file)
```

---

## 🔐 Firestore Rules (Production)

Simpan sebagai referensi dan deploy ke Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: Check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Nala Projects Collection
    match /nala_projects/{projectId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Allow create for authenticated users
      allow create: if isAuthenticated() 
                    && request.resource.data.createdBy == request.auth.uid;
      
      // Allow update if authenticated and is creator
      allow update: if isAuthenticated() 
                    && resource.data.createdBy == request.auth.uid;
      
      // Allow delete if authenticated and is creator
      allow delete: if isAuthenticated() 
                    && resource.data.createdBy == request.auth.uid;
    }
    
    // Other collections (customers, kpi_teknisi, etc.)
    match /customers/{document=**} {
      allow read, write: if isAuthenticated();
    }
    
    match /kpi_teknisi/{document=**} {
      allow read, write: if isAuthenticated();
    }
    
    match /nala_dashboard_projects/{document=**} {
      allow read, write: if isAuthenticated();
    }
    
    // Block all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🎨 Theme & Design

- **Primary Color**: Nala Blue (#2196F3)
- **UI Framework**: Custom CSS3 dengan Flexbox & Grid
- **Icons**: Font Awesome 6.4.0
- **Charts**: Chart.js (Combo Chart)
- **Maps**: Google Maps JavaScript API
- **Design System**: Jakob's Laws of UX compliant
  - Familiarity (Material Design inspired)
  - Fitts's Law (Large touch targets)
  - Hick's Law (Progressive disclosure)

---

## 📊 Data Structure

### Project Document Schema
```javascript
{
  projectName: "Hotel Empress",
  client: "PT XYZ",
  phone: "08123456789",
  status: "prospek", // prospek | survey | pengerjaan | ditolak
  description: "Instalasi AC 48 unit",
  location: {
    lat: -5.1477,
    lng: 119.4327,
    address: "Jl. Boulevard No. 123, Makassar"
  },
  materials: [
    {
      name: "Pipa",
      unit: "m",
      quotationQty: 100,
      quotationPrice: 50000,
      realQty: 105,
      realPrice: 48000
    }
    // ... 7 more materials
  ],
  services: [
    {
      name: "Jasa Pasang",
      unit: "unit",
      quotationQty: 48,
      quotationPrice: 500000,
      realQty: 48,
      realPrice: 500000
    }
    // ... 2 more services
  ],
  photos: [
    {
      url: "https://...",
      filename: "photo1.jpg",
      uploadedAt: "2024-11-21T10:00:00Z"
    }
    // max 10 photos
  ],
  documents: {
    penawaran: [],
    bast: [],
    invoice: [],
    gallery: []
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user_uid"
}
```

---

## 🐛 Troubleshooting

### Firebase Connection Failed
- ✅ Pastikan Firebase config di `js/config.js` sudah benar
- ✅ Check browser console untuk error messages
- ✅ Pastikan Firebase project sudah di-enable (Authentication, Firestore, Storage)

### Maps Not Loading
- ✅ Pastikan Google Maps API Key valid
- ✅ Enable **Maps JavaScript API** di Google Cloud Console
- ✅ Check billing account (Google Maps requires billing)

### Photos Not Uploading
- ✅ Pastikan Storage rules sudah di-deploy
- ✅ Check file size (max 5MB per photo)
- ✅ Max 10 photos per project
- ✅ Check browser console for errors

### Authentication Failed
- ✅ Pastikan user `admin@nalaaircon.com` sudah dibuat
- ✅ Password: `123456`
- ✅ Check Firebase Authentication settings

---

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 NOT supported

---

## 🚧 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Multi-user roles (Admin, Teknisi, Client)
- [ ] Export reports (PDF)
- [ ] Timeline activity log
- [ ] WhatsApp integration
- [ ] Email notifications

---

## 📞 Support

**Developer**: Claude AI  
**Client**: Yuzar - Nala Aircon (CV Nala Karya)  
**Location**: Makassar, South Sulawesi

---

## 📄 License

Copyright © 2024 Nala Aircon - CV Nala Karya  
All rights reserved.

---

**⚡ Selamat menggunakan Nala Project Management System! ⚡**
