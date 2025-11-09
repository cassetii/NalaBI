# 🚀 DEPLOYMENT GUIDE - Nala Aircon Dashboard
## Dashboard Sudah Siap Pakai!

✅ **Firebase Config** - Sudah dimasukkan
✅ **Google Maps API** - Sudah dimasukkan
✅ **File Ready** - nala-aircon-dashboard-configured.html

---

## 📋 CHECKLIST SEBELUM DEPLOY

### 1. Setup Firebase Authentication (WAJIB - 2 menit)

1. Buka Firebase Console: https://console.firebase.google.com/
2. Pilih project: **nalabi-a1b2e**
3. Di menu kiri, klik **Authentication**
4. Klik **Get Started** (jika belum diaktifkan)
5. Pilih tab **Sign-in method**
6. Klik **Email/Password**
7. Toggle **Enable**
8. Klik **Save**

**Buat User Admin:**
9. Klik tab **Users**
10. Klik **Add user**
11. Email: **admin@nalaaircon.com** (atau email Anda)
12. Password: **buat password yang kuat** (minimal 8 karakter)
13. Klik **Add user**

⚠️ **PENTING:** Catat email & password ini untuk login!

---

### 2. Setup Firestore Database (WAJIB - 2 menit)

1. Masih di Firebase Console project **nalabi-a1b2e**
2. Di menu kiri, klik **Firestore Database**
3. Klik **Create database**
4. Pilih lokasi: **asia-southeast1 (Singapore)** atau **asia-southeast2 (Jakarta)**
5. Pilih mode: **Start in test mode** (untuk development)
6. Klik **Enable**

**Ubah Security Rules untuk Production:**
7. Setelah database dibuat, klik tab **Rules**
8. Ganti rules dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

9. Klik **Publish**

Rules ini memastikan hanya user yang login yang bisa akses data.

---

### 3. Google Maps API Setup (OPTIONAL - tapi direkomendasikan)

API Key Anda sudah aktif, tapi untuk keamanan production:

1. Buka Google Cloud Console: https://console.cloud.google.com/
2. Pilih project yang sesuai dengan Maps API key
3. Menu: **APIs & Services** > **Credentials**
4. Cari API Key: `AIzaSyAgJ1XyeNAym-SibOsJG57gE5WXWJgzDA4`
5. Klik **Edit** (icon pensil)
6. **Application restrictions:**
   - Pilih: **HTTP referrers (web sites)**
   - Add: `https://yourdomain.com/*` (ganti dengan domain Anda)
   - Add: `http://localhost/*` (untuk testing lokal)
7. **API restrictions:**
   - Pilih: **Restrict key**
   - Centang: **Maps JavaScript API**
8. Klik **Save**

⚠️ **Note:** Jika belum punya domain, bisa skip dulu. Tapi jangan lupa restrict setelah deploy!

---

## 🌐 CARA DEPLOY

### OPSI 1: Firebase Hosting (Recommended) ⭐

**Keuntungan:**
- Gratis
- HTTPS otomatis
- CDN global
- Domain gratis: `your-project.web.app`

**Langkah:**

1. Install Firebase CLI (sekali saja):
```bash
npm install -g firebase-tools
```

2. Login ke Firebase:
```bash
firebase login
```

3. Di folder project, initialize:
```bash
firebase init hosting
```
   - Select project: **nalabi-a1b2e**
   - Public directory: ketik `.` (titik)
   - Single-page app: **Yes**
   - Automatic builds: **No**

4. Rename file:
```bash
mv nala-aircon-dashboard-configured.html index.html
```

5. Deploy:
```bash
firebase deploy --only hosting
```

6. Selesai! Dashboard bisa diakses di:
   - **https://nalabi-a1b2e.web.app**
   - **https://nalabi-a1b2e.firebaseapp.com**

---

### OPSI 2: Netlify (Mudah & Gratis)

1. Buka https://www.netlify.com/
2. Sign up / Login
3. Klik **Add new site** > **Deploy manually**
4. Drag & drop file `nala-aircon-dashboard-configured.html`
5. Rename jadi `index.html` di Netlify
6. Selesai! Domain gratis: `random-name.netlify.app`

**Custom domain:**
- Site settings > Domain management > Add custom domain

---

### OPSI 3: Web Hosting Sendiri

Upload file ke hosting via:
- cPanel File Manager
- FTP Client (FileZilla)
- SSH

**Langkah:**
1. Rename: `nala-aircon-dashboard-configured.html` → `index.html`
2. Upload ke folder `public_html` atau `www`
3. Akses: `https://yourdomain.com`

---

## 🧪 TESTING LOKAL

Sebelum deploy, test dulu di komputer:

**Cara 1 - Python:**
```bash
python -m http.server 8000
```
Buka: http://localhost:8000

**Cara 2 - PHP:**
```bash
php -S localhost:8000
```
Buka: http://localhost:8000

**Cara 3 - Live Server (VS Code):**
- Install extension: Live Server
- Right click file → Open with Live Server

---

## 📱 CARA PAKAI DASHBOARD

### 1. Login Pertama Kali
- Buka dashboard di browser
- Login dengan email & password yang dibuat di Firebase Auth
- Contoh: admin@nalaaircon.com

### 2. Tambah Project Pertama
- Klik tab **"Tambah Project"**
- Isi field wajib (bertanda *)
- Untuk koordinat, cari di Google Maps:
  * Klik kanan lokasi
  * Klik koordinat untuk copy
  * Paste ke field Latitude & Longitude

**Contoh Koordinat Makassar:**
```
Makassar City Center: -5.1477, 119.4327
Pantai Losari: -5.1379, 119.4122
Mall Trans Studio: -5.1456, 119.4318
```

- Klik **"Simpan Project"**

### 3. Lihat Dashboard
- Tab **Dashboard**: Lihat statistik & project terbaru
- Tab **Daftar Project**: Lihat semua project, filter, edit
- Tab **Peta Project**: Visualisasi map dengan markers

### 4. Testing dengan Sample Data
Gunakan data dari file **SAMPLE_DATA.md** untuk input 8 project testing:
- Hotel Empress
- BPKAD Makassar
- Mall Panakkukang
- RS Stella Maris
- Bank Sulselbar
- UNHAS
- DPRD
- Apartemen Gateway

---

## 🔒 SECURITY CHECKLIST

Sebelum production:

- [ ] Firebase Auth sudah enable
- [ ] Firestore rules sudah diubah (auth required)
- [ ] Google Maps API key sudah di-restrict ke domain
- [ ] User admin sudah dibuat
- [ ] Password kuat (minimal 8 karakter, kombinasi huruf angka)
- [ ] Dashboard hanya diakses via HTTPS
- [ ] Backup credentials di tempat aman

---

## 📊 MONITORING & MAINTENANCE

### Backup Data Rutin
1. Firebase Console > Firestore Database
2. Klik **Import/Export** (atas kanan)
3. Pilih **Export**
4. Pilih collection: `projects`
5. Destination: Google Cloud Storage bucket
6. Klik **Export**

Lakukan backup minimal 1x per minggu!

### Tambah User Baru
Firebase Console > Authentication > Users > Add user

### Lihat Activity Logs
Firebase Console > Authentication > Users
- Lihat Last sign in
- Track active users

### Monitor Usage
- Firebase Console > Usage and billing
- Check Firestore reads/writes
- Check Auth users
- Monitor Google Maps API calls

---

## 🆘 TROUBLESHOOTING

### Login Tidak Bisa
**Solusi:**
- Cek Firebase Auth sudah enable
- Cek user sudah dibuat
- Cek email & password benar
- Clear browser cache & cookies
- Coba browser lain

### Map Tidak Muncul
**Solusi:**
- Cek Google Maps API key benar
- Cek billing account aktif di Google Cloud
- Cek console browser untuk error (F12)
- Cek API restrictions

### Data Tidak Tersimpan
**Solusi:**
- Cek Firestore Database sudah dibuat
- Cek Firestore rules (allow auth users)
- Cek console browser untuk error
- Cek user sudah login

### Marker Tidak Muncul di Map
**Solusi:**
- Pastikan Latitude/Longitude sudah diisi
- Format: -5.1477 (dengan titik, bukan koma)
- Cek nilai tidak kosong
- Refresh halaman

---

## 📞 SUPPORT RESOURCES

**Firebase:**
- Docs: https://firebase.google.com/docs
- Console: https://console.firebase.google.com/

**Google Maps:**
- Docs: https://developers.google.com/maps/documentation
- Console: https://console.cloud.google.com/

**Firebase Pricing:**
- Spark Plan (Free): 
  * 50K reads/day Firestore
  * 20K writes/day
  * 1GB storage
  * 10GB hosting
- Cukup untuk ~500-1000 project

**Google Maps Pricing:**
- Free $200 credit/month
- Dynamic Maps: $7 per 1000 loads
- Free tier cukup untuk ~28,000 map loads/month

---

## ✅ DEPLOYMENT CHECKLIST

Gunakan checklist ini sebelum go-live:

**Pre-Deployment:**
- [ ] Firebase Auth enabled & user admin created
- [ ] Firestore Database created dengan rules
- [ ] Google Maps API key tested
- [ ] File HTML sudah diupdate dengan config
- [ ] Testing lokal berhasil

**Deployment:**
- [ ] File di-upload/deploy ke hosting
- [ ] Dashboard bisa diakses via URL
- [ ] Login berhasil
- [ ] Bisa tambah project
- [ ] Map muncul dengan benar
- [ ] Marker muncul di lokasi yang tepat

**Post-Deployment:**
- [ ] Security rules production sudah diterapkan
- [ ] Google Maps API restricted ke domain
- [ ] SSL/HTTPS aktif
- [ ] Custom domain (optional) sudah setup
- [ ] Backup pertama sudah dilakukan
- [ ] Team sudah ditraining cara pakai

**Training Team:**
- [ ] Cara login
- [ ] Cara tambah project
- [ ] Cara edit/update status
- [ ] Cara lihat map
- [ ] Cara backup data

---

## 🎉 SELESAI!

Dashboard Nala Aircon siap digunakan!

**Next Steps:**
1. ✅ Deploy ke hosting
2. ✅ Login & test
3. ✅ Input 5-10 project real
4. ✅ Share link ke team
5. ✅ Training penggunaan
6. ✅ Setup backup rutin

**Selamat menggunakan dashboard! 🚀**

---

**Project:** Nala Aircon Project Dashboard  
**Version:** 1.0 (Configured)  
**Status:** Production Ready ✅  
**Firebase Project:** nalabi-a1b2e  
**Created:** November 2025