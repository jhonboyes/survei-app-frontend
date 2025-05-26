# Survei Supabase Frontend

Aplikasi frontend untuk sistem survei menggunakan React dan Vite.

## Struktur Proyek

```
frontend/
├── public/                # Aset statis
│   ├── icon.png
│   ├── logo.png
│   └── vite.svg
├── src/
│   ├── api/              # Integrasi API
│   │   ├── admin.jsx
│   │   ├── answer.jsx
│   │   ├── question.jsx
│   │   ├── respondent.jsx
│   │   └── surveyor.jsx
│   ├── assets/           # Aset internal
│   ├── components/       # Komponen React yang dapat digunakan kembali
│   │   ├── alert/
│   │   ├── crosstab/
│   │   ├── excelexport/
│   │   ├── footer/
│   │   ├── header/
│   │   ├── identicon/
│   │   ├── loader/
│   │   └── sidebar/
│   ├── hooks/            # Custom React hooks
│   │   ├── login.jsx
│   │   ├── privateroute.jsx
│   │   └── signup.jsx
│   ├── pages/            # Halaman aplikasi
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── signup/
│   ├── App.jsx           # Komponen utama
│   ├── main.jsx          # Entry point
│   └── index.css         # Stylesheet global
└── package.json          # Dependensi dan skrip
```

## Teknologi yang Digunakan

- React - Library JavaScript untuk membangun antarmuka pengguna
- Vite - Build tool dan development server
- Tailwind CSS - Framework CSS untuk styling

## Cara Memulai

1. Instalasi dependensi:

```bash
npm install
```

2. Jalankan server development:

```bash
npm run dev
```

3. Buka browser dan akses `http://localhost:5173`

## Fitur Utama

- Autentikasi (Login/Signup)
- Dashboard untuk manajemen survei
- Manajemen pertanyaan survei
- Visualisasi data responden
- Export data ke Excel

## Struktur Komponen

### Components

- `alert/` - Komponen notifikasi dan pesan
- `crosstab/` - Komponen untuk analisis data tabulasi silang
- `excelexport/` - Komponen untuk ekspor data ke Excel
- `header/` - Komponen header aplikasi
- `sidebar/` - Navigasi sidebar
- `loader/` - Indikator loading

### Pages

- `dashboard/` - Halaman utama setelah login
- `login/` - Halaman autentikasi
- `signup/` - Halaman pendaftaran

### API Integration

- `admin.jsx` - Endpoint untuk manajemen admin
- `answer.jsx` - Endpoint untuk manajemen jawaban survei
- `question.jsx` - Endpoint untuk manajemen pertanyaan
- `respondent.jsx` - Endpoint untuk manajemen responden
- `surveyor.jsx` - Endpoint untuk manajemen surveyor

## Pengembangan

### Skrip yang Tersedia

- `npm run dev` - Menjalankan server development
- `npm run build` - Membuat versi production
- `npm run preview` - Preview versi production

### Konvensi Kode

- Gunakan ESLint untuk menjaga konsistensi kode
- Ikuti struktur folder yang telah ditentukan
- Gunakan komponen fungsional dan hooks
- Dokumentasikan komponen dan fungsi penting
