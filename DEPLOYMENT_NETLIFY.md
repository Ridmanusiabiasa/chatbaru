# Deployment Guide - Netlify

## Cara Deploy RidChat AI ke Netlify

### 1. Persiapan File
Saya sudah membuat file-file yang diperlukan:
- `netlify.toml` - Konfigurasi deployment Netlify
- `functions/api.js` - Backend API sebagai Netlify Functions

### 2. Langkah-langkah Deploy

#### Opsi A: Deploy via GitHub (Recommended)
1. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

2. **Connect ke Netlify:**
   - Buka https://netlify.com
   - Login dan klik "New site from Git"
   - Pilih repository GitHub Anda
   - Konfigurasi build settings:
     - Build command: `npm run build`
     - Publish directory: `dist/public`
   - Klik "Deploy site"

#### Opsi B: Deploy via Netlify CLI
1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login ke Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   # Build project
   npm run build
   
   # Deploy to staging
   netlify deploy
   
   # Deploy to production
   netlify deploy --prod
   ```

### 3. Konfigurasi Environment Variables

Jika menggunakan database eksternal, tambahkan environment variables di Netlify:

1. Buka site settings di Netlify dashboard
2. Pergi ke "Environment variables"
3. Tambahkan:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (jika menggunakan database eksternal)

### 4. Struktur URL Setelah Deploy

- **Frontend**: `https://your-site.netlify.app`
- **API**: `https://your-site.netlify.app/api/*`
- **Admin Panel**: `https://your-site.netlify.app/secret-admin-panel`

### 5. Catatan Penting

#### Limitations Netlify Functions:
- **Timeout**: 10 detik (free tier), 15 menit (paid)
- **Memory**: 1GB maksimum
- **Cold starts**: Fungsi mungkin memerlukan waktu startup

#### Features yang Tetap Berfungsi:
- ✅ Chat interface dengan AI
- ✅ Model selection (GPT-4o-mini, GPT-4o, GPT-4.1, GPT-4.1-nano)
- ✅ Admin dashboard di `/secret-admin-panel`
- ✅ API key management
- ✅ Token usage monitoring
- ✅ Dark theme ChatGPT-like interface
- ✅ Circular avatars
- ✅ Markdown rendering dengan syntax highlighting

#### Data Storage:
- Aplikasi menggunakan in-memory storage
- Data akan reset setiap kali function restart
- For production, pertimbangkan menggunakan database eksternal seperti:
  - MongoDB Atlas
  - PostgreSQL on Railway/Supabase
  - Prisma with PlanetScale

### 6. Testing Local Development

Untuk test lokal dengan Netlify Functions:
```bash
# Install Netlify CLI jika belum
npm install -g netlify-cli

# Test local
netlify dev
```

### 7. Troubleshooting

**Jika deployment gagal:**
1. Check build logs di Netlify dashboard
2. Pastikan semua dependencies terinstall
3. Periksa Node.js version compatibility

**Jika API tidak berfungsi:**
1. Check function logs di Netlify dashboard
2. Pastikan environment variables sudah benar
3. Verify API endpoints menggunakan developer tools

### 8. Login Credentials

Setelah deploy, gunakan credentials berikut untuk mengakses admin panel:
- **URL**: `https://your-site.netlify.app/secret-admin-panel`
- **Username**: `admin`
- **Password**: `082254730892`

### 9. Next Steps

Setelah berhasil deploy:
1. Tambahkan API key Sumopod AI melalui admin panel
2. Test chat functionality
3. Monitor token usage statistics
4. Pertimbangkan setup database eksternal untuk production use