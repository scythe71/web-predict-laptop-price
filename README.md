# Laptop Price Predictor

Aplikasi web sederhana untuk memprediksi harga laptop berdasarkan spesifikasi utama. Dirancang agar mudah digunakan oleh siapa saja, tanpa perlu paham teknis.

## Fitur
- UI minimalis, modern, dan responsif
- Form input spesifikasi: brand, tier prosesor, core/thread, RAM, storage, GPU, layar
- Validasi otomatis: tier prosesor hanya muncul sesuai brand
- Hasil prediksi tampil dengan animasi

## Cara Menjalankan
1. **Install dependensi**
   
   Pastikan Python 3.8+ sudah terpasang. Install Flask:
   ```bash
   pip install flask
   ```
2. **Jalankan aplikasi**
   ```bash
   python app.py
   ```
3. **Akses di browser**
   
   Buka [http://localhost:5000](http://localhost:5000)

## Struktur Folder
```
├── app.py                # Backend Flask
├── laptops_raw.csv       # (Opsional) Data mentah
├── static/
│   ├── style.css         # Style lama (opsional)
│   ├── minimal.css       # Style utama (dark, modern)
│   └── script.js         # Animasi & logika form
├── templates/
│   └── index.html        # UI utama
└── README.md
```

## Kustomisasi
- **Warna & tema:** Ubah di `static/minimal.css`
- **Logika prediksi:** Edit di `app.py`

