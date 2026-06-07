# Laptop Price Predictor

Aplikasi web berbasis **Flask + Random Forest** untuk memperkirakan harga laptop berdasarkan spesifikasi. Input berupa spesifikasi prosesor, RAM, penyimpanan, GPU, dan layar — output berupa estimasi harga dalam **Rupiah (IDR)**.

---

## Fitur

- **Prediksi real-time** via web form dengan SweetAlert2
- **Dynamic dropdown** — memilih brand Intel/AMD otomatis memfilter seri prosesor
- **Validasi input** — brand, tier, dan GPU dicek sebelum diproses
- **Loading state** pada tombol selama prediksi
- **Dark theme UI** responsif dengan section grouping
- **Metrik model** ditampilkan: R², MAE, MSE

---

## Cara Kerja

### Target

Harga laptop dalam **INR** dari dataset, dikonversi ke **IDR** (kurs `1 INR = 190 IDR`).

### Fitur yang Digunakan

8 fitur dari dataset `laptops_raw.csv`:

| Fitur | Tipe | Deskripsi |
|---|---|---|
| `processor_tier_score` | numerik (3/5/7) | Skor tier prosesor (i3/Ryzen3=3, i5/Ryzen5=5, i7/Ryzen7=7) |
| `num_cores` | numerik | Jumlah fisik core CPU |
| `num_threads` | numerik | Jumlah thread CPU |
| `ram_memory` | numerik | Kapasitas RAM (GB) |
| `primary_storage_capacity` | numerik | Kapasitas penyimpanan utama (GB) |
| `gpu_type_score` | biner (0/1) | 0 = Integrated, 1 = Dedicated |
| `display_size` | numerik | Ukuran diagonal layar (inci) |
| `processor_brand_*` | one-hot | Intel atau AMD |

### Model

- **Algoritma**: `RandomForestRegressor` (100 trees, `random_state=42`)
- **Scaling**: `StandardScaler` (fitur dinormalisasi sebelum training)
- **Split**: 80% train, 20% test (`random_state=42`)
- **random_state**: 42 (reproducible)

### Performa Model

| Metrik | Nilai |
|---|---|
| **R² Score** | 0.7318 |
| **MAE** | Rp 2.183.385 |
| **MSE** | Rp 64.379.996.157 |

---

## Struktur Proyek

```
project/
├── app.py                  # Flask backend — training, prediksi, API
├── laptops_raw.csv         # Dataset (991 laptop, 22 kolom)
├── static/
│   ├── script.js           # Frontend JS — fetch API + dynamic tier filter
│   └── style.css           # Dark theme CSS dengan section layout
├── templates/
│   └── index.html          # Halaman utama form input
└── README.md
```

---

## Cara Menjalankan

### 1. Install dependensi

```bash
pip install flask pandas scikit-learn
```

### 2. Jalankan aplikasi

```bash
python app.py
```

### 3. Buka browser

```
http://127.0.0.1:5000
```

---

## API Endpoint

### `POST /predict`

Menerima JSON spesifikasi laptop dan mengembalikan estimasi harga.

**Request body:**

```json
{
    "processor_brand": "intel",
    "processor_tier": "core i5",
    "num_cores": 4,
    "num_threads": 8,
    "ram_memory": 16,
    "storage": 512,
    "gpu_type": "dedicated",
    "display_size": 15.6
}
```

**Response sukses (200):**

```json
{
    "predicted_price": 10097572.0,
    "mse": 338842085.03,
    "mae": 11491.5,
    "r2": 0.7318
}
```

**Response error (400):**

```json
{
    "error": "Processor brand hanya boleh intel atau amd"
}
```

### Catatan
- `processor_brand`: hanya `intel` atau `amd`
- `processor_tier`: `core i3` / `core i5` / `core i7` / `ryzen 3` / `ryzen 5` / `ryzen 7`
- `gpu_type`: hanya `integrated` atau `dedicated`
- Harga output dalam **IDR** (konversi dari INR × 190)
- `storage` mengacu pada `primary_storage_capacity`

---

## Dataset

**Sumber**: `laptops_raw.csv` — data spesifikasi dan harga laptop.

- **991 baris**, 22 kolom
- Kolom penting: `Price`, `processor_brand`, `processor_tier`, `num_cores`, `num_threads`, `ram_memory`, `primary_storage_capacity`, `gpu_type`, `display_size`
- Harga dalam **INR** (Indian Rupee)
- Hanya laptop **Intel** dan **AMD** yang digunakan
- Filter tier: hanya Core i3/i5/i7 dan Ryzen 3/5/7

---

## Teknologi

| Stack | Library |
|---|---|
| Backend | Python, Flask |
| Machine Learning | scikit-learn (RandomForestRegressor, StandardScaler) |
| Frontend | HTML, CSS, JavaScript |
| Visualisasi | SweetAlert2 |
