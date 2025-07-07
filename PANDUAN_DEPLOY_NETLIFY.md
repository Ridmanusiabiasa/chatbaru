# 🚀 Panduan Deploy RidChat AI ke Netlify

## 📋 Langkah-langkah Deploy

### 1. Persiapan Repository
```bash
# Buat repository baru di GitHub
# Lalu jalankan perintah ini di terminal:

git init
git add .
git commit -m "RidChat AI - Ready for deployment"
git remote add origin https://github.com/USERNAME/ridchat-ai.git
git push -u origin main
```

### 2. Deploy ke Netlify

#### Cara 1: Melalui Website Netlify (Paling Mudah)
1. Buka https://netlify.com dan login
2. Klik **"New site from Git"**
3. Pilih **GitHub** dan connect repository Anda
4. Pilih repository **ridchat-ai**
5. Konfigurasi build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
   - **Functions directory**: `functions`
6. Klik **"Deploy site"**

#### Cara 2: Melalui Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### 3. Akses Aplikasi

Setelah deployment selesai:
- **Website**: `https://your-site-name.netlify.app`
- **Admin Panel**: `https://your-site-name.netlify.app/secret-admin-panel`

### 4. Login Admin Panel
- **Username**: `admin`
- **Password**: `082254730892`

### 5. Cara Menggunakan
1. Buka admin panel untuk menambahkan API key Sumopod AI
2. Kembali ke halaman utama untuk mulai chat
3. Pilih model AI yang diinginkan
4. Mulai percakapan!

## ⚠️ Catatan Penting

### Fitur yang Berfungsi:
- ✅ Chat interface dengan AI
- ✅ 4 model AI (GPT-4o-mini, GPT-4o, GPT-4.1, GPT-4.1-nano)
- ✅ Admin dashboard tersembunyi
- ✅ Manajemen API key
- ✅ Monitoring penggunaan token
- ✅ Dark theme seperti ChatGPT
- ✅ Avatar bulat untuk user dan AI
- ✅ Syntax highlighting untuk kode

### Limitasi Netlify:
- **Timeout**: 10 detik untuk free tier
- **Memory**: 1GB maksimum
- **Storage**: Data tersimpan sementara (akan reset)

### Untuk Production:
Jika ingin data permanen, gunakan database eksternal seperti:
- MongoDB Atlas
- PostgreSQL (Railway/Supabase)
- Firebase Firestore

## 🔧 Troubleshooting

**Jika deployment gagal:**
1. Check build logs di Netlify dashboard
2. Pastikan semua file sudah ter-commit ke Git
3. Periksa apakah ada error di console

**Jika chat tidak berfungsi:**
1. Pastikan sudah menambahkan API key di admin panel
2. Check network tab di browser developer tools
3. Periksa function logs di Netlify dashboard

**Jika admin panel tidak bisa diakses:**
1. Pastikan URL benar: `/secret-admin-panel`
2. Gunakan password yang benar: `082254730892`
3. Clear browser cache dan cookies

## 📞 Support
Jika ada masalah, periksa:
- Netlify function logs
- Browser developer console
- Network requests di developer tools

File konfigurasi utama:
- `netlify.toml` - Konfigurasi deployment
- `functions/api.js` - Backend API
- `DEPLOYMENT_NETLIFY.md` - Dokumentasi lengkap