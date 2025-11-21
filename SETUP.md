# 🚀 QUICK SETUP GUIDE - Nala Project Management

## ⚡ Setup dalam 5 Menit!

### Step 1: Update Firebase Config (WAJIB!)

Buka file: **js/config.js**

Ganti bagian ini dengan config dari Firebase Console Anda:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",           // ← Ganti ini
    authDomain: "YOUR_PROJECT.firebaseapp.com",  // ← Ganti ini
    projectId: "YOUR_PROJECT_ID",            // ← Ganti ini
    storageBucket: "YOUR_PROJECT.appspot.com",   // ← Ganti ini
    messagingSenderId: "YOUR_SENDER_ID",     // ← Ganti ini
    appId: "YOUR_APP_ID"                     // ← Ganti ini
};
```

**Cara mendapatkan config:**
1. Buka https://console.firebase.google.com
2. Pilih project Anda
3. Klik ⚙️ (Settings) → Project settings
4. Scroll ke "Your apps" → pilih Web app
5. Copy semua nilai config

---

### Step 2: Setup Firebase Project

#### A. Enable Authentication
```
Firebase Console → Authentication → Sign-in method
→ Enable "Email/Password"
→ Users → Add user: admin@nalaaircon.com / 123456
```

#### B. Create Firestore Database
```
Firebase Console → Firestore Database → Create database
→ Start in production mode
→ Location: asia-southeast2 (Jakarta)
```

#### C. Enable Storage
```
Firebase Console → Storage → Get started
→ Start in production mode
→ Location: asia-southeast2 (Jakarta)
```

#### D. Deploy Rules

**Firestore Rules:**
```
Firebase Console → Firestore Database → Rules
→ Copy isi file "firestore.rules"
→ Paste di editor
→ Klik "Publish"
```

**Storage Rules:**
```
Firebase Console → Storage → Rules
→ Copy storage rules yang sudah diberikan
→ Paste di editor
→ Klik "Publish"
```

---

### Step 3: Deploy Aplikasi

#### Option A: Local Testing (Tercepat!)
```bash
# Gunakan Python 3
python -m http.server 8000

# Atau PHP
php -S localhost:8000

# Atau Node.js
npx http-server -p 8000
```

Buka browser: **http://localhost:8000**

#### Option B: Firebase Hosting (Production)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init (di folder project)
firebase init hosting

# Deploy
firebase deploy
```

---

### Step 4: Login & Test

1. Buka aplikasi di browser
2. Login dengan:
   - Email: **admin@nalaaircon.com**
   - Password: **123456**

3. Test fitur:
   - ✅ Dashboard loads
   - ✅ Map muncul dengan lokasi Makassar
   - ✅ Tambah project baru (klik map untuk set lokasi)
   - ✅ Upload foto & dokumen
   - ✅ Material tracking & chart

---

## ❗ Troubleshooting Cepat

### Error: "Firebase is not defined"
→ Config belum diupdate di `js/config.js`

### Map tidak muncul
→ Google Maps API Key sudah enable "Maps JavaScript API"?
→ Billing account aktif?

### Login gagal
→ User `admin@nalaaircon.com` sudah dibuat di Firebase Authentication?

### Upload foto gagal
→ Storage rules sudah di-deploy?
→ File < 5MB?
→ Max 10 foto per project?

---

## 📱 Browser Testing

Test di:
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari (iOS)
- ✅ Edge

---

## 🎯 Checklist Setup

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] User admin@nalaaircon.com created
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Firebase config updated in js/config.js
- [ ] App deployed (local or hosting)
- [ ] Login test successful
- [ ] Map loads correctly
- [ ] Can add project
- [ ] Can upload photos
- [ ] Material tracking works
- [ ] Chart displays correctly

---

## 🆘 Need Help?

Jika ada kendala, check:
1. Browser console (F12) untuk error messages
2. Firebase Console → Logs untuk backend errors
3. Network tab untuk failed requests

---

**🎉 Selamat! Aplikasi Nala Project Management siap digunakan!**

Contact: Yuzar @ Nala Aircon  
Location: Makassar, South Sulawesi
