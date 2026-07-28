# Coffee Bean Quality Classification — API Documentation

**Base URL:** `http://localhost:8007`  
**Versi:** 1.0.0  
**Status:** 🔴 Service dimatikan — hubungi asisten dosen untuk nyalakan

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Arsitektur Model](#-arsitektur-model)
- [Endpoint](#-endpoint)
  - [GET /health](#1-get-health) — Cek status
  - [GET /classes](#2-get-classes) — Daftar 4 kelas kopi
  - [POST /predict](#3-post-predict) — **Klasifikasi biji kopi** ⭐
- [Response Codes](#-response-codes)
- [Contoh Frontend (JavaScript)](#-contoh-frontend-javascript)
- [Contoh Frontend (HTML Lengkap)](#-contoh-frontend-html-lengkap)
- [Tips untuk Frontend Dev](#-tips-untuk-frontend-dev)

---

## 🎯 Gambaran Umum

API ini mengklasifikasikan **kualitas biji kopi arabika** dari gambar menjadi 4 kelas:

| Kelas | Label Indonesia | Keterangan |
|---|---|---|
| `defect` ⚠️ | Cacat/rusak | Biji kopi yang rusak, berlubang, atau tidak sempurna |
| `longberry` 🫘 | Longberry | Biji kopi jenis longberry — bentuk memanjang, kualitas tinggi |
| `peaberry` 🔵 | Peaberry | Biji kopi jenis peaberry/tunggal — bentuk bulat, langka |
| `premium` 🏆 | Premium | Biji kopi kualitas premium — bersih tanpa cacat |

Dataset: **USK-Coffee** (8.000 gambar, 256×256 → 128×128).  
Model terbaik: **CNN 6-layer + Augmentasi + ReduceLR** — akurasi **85.19%** 🏆.

---

## 🧠 Arsitektur Model

```
Input: 128×128×3 RGB (rescale 1/255)
│
├─ Conv2D 8×3×3 → MaxPool 2×2
├─ Conv2D 16×3×3 → MaxPool 2×2
├─ Conv2D 32×3×3 → MaxPool 2×2
├─ Conv2D 64×3×3 → MaxPool 2×2
├─ Conv2D 128×3×3 → MaxPool 2×2
├─ Conv2D 256×3×3 → MaxPool 2×2
│
├─ Flatten → Dropout(0.3) → Dense(256) → Dense(4, Softmax)
└─ Output: [defect, longberry, peaberry, premium]
```

- **Total parameter:** 656,980 (trainable semua)
- **Optimizer:** Adam (lr default 0.001)
- **Framework:** TensorFlow Keras

### Studi Ablasi — 4 Skenario

| Skenario | Augmentasi | LR Scheduler | Val Acc | Test Acc |
|---|---|---|---|---|
| 1. Baseline | Minimal | Konstan | 84.88% | 74.00% |
| 2. +Augmentasi | Ekstensif | Konstan | 88.69% | 82.50% |
| 3. +Augmentasi + Cosine | Ekstensif | Cosine Annealing | 88.00% | 84.00% |
| **4. +Augmentasi + ReduceLR** 🏆 | **Ekstensif** | **ReduceLROnPlateau** | **87.75%** | **85.19%** |

---

## 🔌 Endpoint

### 1. GET /health

Cek status server dan model.

**Request:**
```
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_path": "Model/+Augmentasi+ReduceLR v1/cnn_model.h5",
  "input_size": [128, 128],
  "classes": ["defect", "longberry", "peaberry", "premium"]
}
```

---

### 2. GET /classes

Daftar 4 kelas biji kopi.

**Request:**
```
GET /classes
```

**Response (200):**
```json
{
  "classes": [
    { "id": 0, "name": "defect" },
    { "id": 1, "name": "longberry" },
    { "id": 2, "name": "peaberry" },
    { "id": 3, "name": "premium" }
  ]
}
```

---

### 3. POST /predict ⭐

**Endpoint utama — upload gambar biji kopi → klasifikasi 4 kelas.**

#### Request

**Method:** `POST`  
**Content-Type:** `multipart/form-data`  
**URL:** `/predict`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `file` | File upload | ✅ Ya | File gambar biji kopi (jpg, png, webp, dll) |

**Prosesing:** Gambar di-resize ke 128×128, nilai pixel dibagi 255.0 (rescale).

#### Response (200 OK)

```json
{
  "success": true,
  "filename": "kopi.jpg",
  "predictions": [
    {
      "class_name": "peaberry",
      "class_id": 2,
      "confidence": 0.9938
    },
    {
      "class_name": "premium",
      "class_id": 3,
      "confidence": 0.0057
    },
    {
      "class_name": "defect",
      "class_id": 0,
      "confidence": 0.0005
    },
    {
      "class_name": "longberry",
      "class_id": 1,
      "confidence": 0.0
    }
  ],
  "probabilities": [0.0005, 0.0, 0.9938, 0.0057],
  "inference_time_ms": 444.06
}
```

#### Penjelasan Response

| Field | Tipe | Keterangan |
|---|---|---|
| `success` | Boolean | `true` jika prediksi berhasil |
| `filename` | String | Nama file asli |
| `predictions` | Array | **Top-4 prediksi** (urut dari confidence tertinggi ke terendah) |
| `predictions[].class_name` | String | Nama kelas: `defect`, `longberry`, `peaberry`, `premium` |
| `predictions[].class_id` | Integer | ID kelas (0-3) |
| `predictions[].confidence` | Float | Confidence score (0–1) |
| `probabilities` | Array | Semua probabilitas dalam **urutan index kelas**: [defect, longberry, peaberry, premium] |
| `inference_time_ms` | Float | Waktu inference (CPU ~100-450ms) |

> 💡 **prediction[0] = jawaban utama.** Gunakan `predictions[0].class_name` sebagai hasil klasifikasi final.

---

## 📊 Response Codes

| Status | Makna |
|---|---|
| `200` | ✅ Sukses — prediksi berhasil |
| `400` | ❌ Bad Request — file bukan gambar atau rusak |
| `503` | ❌ Service Unavailable — model belum siap |

---

## 💻 Contoh Frontend (JavaScript)

```javascript
const API_URL = "http://localhost:8007";

// 🔥 Upload gambar biji kopi → klasifikasi
async function classifyCoffee(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Gagal klasifikasi");
    }

    return await response.json();
  } catch (error) {
    console.error("Predict error:", error);
    return null;
  }
}

// ✅ Cek status
async function checkHealth() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}

// 📋 Daftar kelas
async function getClasses() {
  const res = await fetch(`${API_URL}/classes`);
  return res.json();
}
```

### Contoh curl

```bash
curl -X POST http://localhost:8007/predict \
  -F "file=@biji_kopi.jpg"
```

---

## 🖼️ Contoh Frontend (HTML Lengkap)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coffee Bean Classifier</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d1117; color: #e6edf3; padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 720px; margin: auto; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #8b949e; font-size: 14px; margin-bottom: 20px; }

    .status {
      font-size: 13px; margin-bottom: 16px; padding: 8px 12px;
      border-radius: 6px;
    }
    .status.online { background: #0d5320; color: #7ee787; }
    .status.offline { background: #490202; color: #ff7b72; }

    .upload-zone {
      border: 2px dashed #30363d;
      border-radius: 12px; padding: 40px 20px;
      text-align: center; cursor: pointer;
      transition: border-color 0.2s;
    }
    .upload-zone:hover { border-color: #f97316; }
    .upload-zone.dragover { border-color: #f97316; background: #161b22; }
    .upload-zone.has-image { border-style: solid; padding: 12px; }
    .upload-zone img { max-width: 100%; max-height: 280px; border-radius: 8px; }
    .upload-zone p { color: #8b949e; margin-top: 8px; }
    .upload-zone .icon { font-size: 40px; margin-bottom: 8px; }

    button {
      width: 100%; padding: 14px; font-size: 16px; font-weight: 600;
      background: #238636; border: none; border-radius: 8px;
      color: #fff; cursor: pointer; margin: 16px 0;
      transition: background 0.2s;
    }
    button:hover { background: #2ea043; }
    button:disabled { background: #21262d; color: #484f58; cursor: not-allowed; }

    .loading { display: none; text-align: center; padding: 20px; }
    .spinner {
      border: 3px solid #30363d; border-top: 3px solid #f97316;
      border-radius: 50%; width: 32px; height: 32px;
      animation: spin 0.8s linear infinite; margin: 0 auto 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .result { display: none; margin-top: 20px; }

    /* Main prediction card */
    .main-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 2px solid #22c55e;
      border-radius: 12px; padding: 24px; text-align: center;
      margin-bottom: 16px;
    }
    .main-card.defect { border-color: #ef4444; }
    .main-card .emoji { font-size: 40px; margin-bottom: 8px; }
    .main-card .class-name {
      font-size: 28px; font-weight: 700;
    }
    .main-card .class-name.defect { color: #ef4444; }
    .main-card .class-name.longberry { color: #f97316; }
    .main-card .class-name.peaberry { color: #22c55e; }
    .main-card .class-name.premium { color: #eab308; }
    .main-card .confidence {
      font-size: 18px; color: #8b949e; margin: 4px 0;
    }
    .main-card .confidence-bar {
      height: 8px; border-radius: 4px;
      background: #30363d; overflow: hidden; margin-top: 12px;
    }
    .main-card .confidence-bar .fill {
      height: 100%; border-radius: 4px;
      background: linear-gradient(90deg, #22c55e, #16a34a);
      transition: width 0.5s;
    }

    /* All classes grid */
    .class-grid { display: flex; flex-direction: column; gap: 8px; }

    .class-item {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 10px; padding: 12px 16px;
      display: flex; align-items: center; gap: 12px;
    }
    .class-item .icon { font-size: 24px; width: 36px; text-align: center; }
    .class-item .info { flex: 1; }
    .class-item .label { font-weight: 600; }
    .class-item .sub-label { font-size: 12px; color: #8b949e; }
    .class-item .pct { font-weight: 700; font-size: 18px; min-width: 60px; text-align: right; }
    .class-item .mini-bar {
      width: 80px; height: 6px; border-radius: 3px;
      background: #30363d; overflow: hidden;
    }
    .class-item .mini-bar .fill { height: 100%; border-radius: 3px; }
    .class-item.top-1 { border-color: #22c55e; background: #0d2815; }

    .info-row { text-align: center; margin-top: 14px; font-size: 13px; color: #8b949e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>☕ Coffee Bean Classifier</h1>
    <p class="subtitle">CNN 6-layer — Klasifikasi 4 kualitas biji kopi arabika</p>

    <div id="status" class="status">⚡ Mengecek server...</div>

    <!-- Upload -->
    <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
      <div class="icon">☕</div>
      <p>Upload gambar biji kopi untuk klasifikasi</p>
      <p style="font-size:12px;color:#484f58">JPG, PNG, WebP</p>
      <input type="file" id="fileInput" accept="image/*" style="display:none">
    </div>

    <button id="predictBtn" onclick="predict()" disabled>🔬 Klasifikasi Kualitas Kopi</button>

    <!-- Loading -->
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>⏳ Menganalisis biji kopi ...</p>
    </div>

    <!-- Result -->
    <div class="result" id="result">
      <!-- Main card -->
      <div class="main-card" id="mainCard">
        <div class="emoji" id="emoji">☕</div>
        <div class="class-name" id="className">-</div>
        <div class="confidence" id="confidence">-</div>
        <div class="confidence-bar">
          <div class="fill" id="confBar" style="width:0%"></div>
        </div>
      </div>

      <!-- All classes -->
      <div class="class-grid" id="classGrid"></div>

      <div class="info-row">⏱ Waktu analisis: <span id="timing">0</span> ms</div>
    </div>
  </div>

  <script>
    const API_URL = "http://localhost:8007";
    const CLASS_EMOJIS = { defect: "⚠️", longberry: "🫘", peaberry: "🔵", premium: "🏆" };
    const CLASS_LABELS = {
      defect: "Cacat / Rusak",
      longberry: "Longberry (Premium)",
      peaberry: "Peaberry (Langka)",
      premium: "Premium (Terbaik)",
    };

    // ── Health check ──
    async function checkHealth() {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        if (data.status === "ok" && data.model_loaded) {
          document.getElementById("status").textContent =
            `✅ Server online | ${data.classes.length} classes | Input: ${data.input_size[0]}×${data.input_size[1]}`;
          document.getElementById("status").className = "status online";
          document.getElementById("predictBtn").disabled = false;
        } else {
          throw new Error("Model not loaded");
        }
      } catch {
        document.getElementById("status").textContent =
          "❌ Server offline — hubungi asisten dosen untuk menyalakan service";
        document.getElementById("status").className = "status offline";
        document.getElementById("predictBtn").disabled = true;
      }
    }

    // ── Upload ──
    let selectedFile = null;
    document.getElementById("fileInput").addEventListener("change", (e) => {
      if (e.target.files[0]) previewImage(e.target.files[0]);
    });

    const zone = document.getElementById("uploadZone");
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) previewImage(e.dataTransfer.files[0]);
    });

    function previewImage(file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        zone.innerHTML = `<img src="${e.target.result}">`;
        zone.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    }

    // ── Predict ──
    async function predict() {
      if (!selectedFile) return alert("Pilih gambar biji kopi dulu!");

      const btn = document.getElementById("predictBtn");
      const loading = document.getElementById("loading");
      const result = document.getElementById("result");

      btn.disabled = true;
      loading.style.display = "block";
      result.style.display = "none";

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch(`${API_URL}/predict`, { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json()).detail || "Gagal");
        const data = await res.json();

        loading.style.display = "none";
        result.style.display = "block";

        document.getElementById("timing").textContent = data.inference_time_ms;

        // ── Main card ──
        const top = data.predictions[0];
        const cls = top.class_name;
        document.getElementById("emoji").textContent = CLASS_EMOJIS[cls] || "☕";
        document.getElementById("className").textContent =
          `${cls.charAt(0).toUpperCase() + cls.slice(1)} — ${CLASS_LABELS[cls] || cls}`;
        document.getElementById("className").className = `class-name ${cls}`;
        document.getElementById("confidence").textContent =
          `${(top.confidence * 100).toFixed(1)}% confidence`;

        document.getElementById("confBar").style.width = `${(top.confidence * 100).toFixed(1)}%`;

        const mainCard = document.getElementById("mainCard");
        mainCard.className = `main-card ${cls === "defect" ? "defect" : ""}`;

        // ── All 4 classes ──
        const grid = document.getElementById("classGrid");
        const COLORS = { defect: "#ef4444", longberry: "#f97316", peaberry: "#22c55e", premium: "#eab308" };

        grid.innerHTML = data.predictions.map((p, i) => {
          const isTop = i === 0;
          const pct = (p.confidence * 100).toFixed(1);
          return `
            <div class="class-item ${isTop ? 'top-1' : ''}">
              <div class="icon">${CLASS_EMOJIS[p.class_name] || '☕'}</div>
              <div class="info">
                <div class="label">${p.class_name}</div>
                <div class="sub-label">${CLASS_LABELS[p.class_name] || ''}</div>
              </div>
              <div class="mini-bar">
                <div class="fill" style="width:${pct}%;background:${COLORS[p.class_name] || '#22c55e'}"></div>
              </div>
              <div class="pct" style="color:${COLORS[p.class_name] || '#fff'}">${pct}%</div>
            </div>
          `;
        }).join("");

      } catch (err) {
        loading.style.display = "none";
        alert("❌ " + err.message);
      } finally {
        btn.disabled = false;
      }
    }

    checkHealth();
  </script>
</body>
</html>
```

---

## 🔧 Tips untuk Frontend Dev

| Tips | Detail |
|---|---|
| **Loading state** | Inference cepat (~100-450ms CPU) — tetap kasih spinner |
| **Prediction = [0]** | `data.predictions[0]` = hasil terbaik. Confidence > 85% umumnya akurat |
| **Confidence bar** | Tampilkan horizontal bar biar user lihat seberapa yakin model |
| **Color coding** | Hijau = premium/peaberry, Kuning = longberry, Merah = defect |
| **All 4 classes** | Tampilkan ke-4 confidence biar user lihat distribusi probabilitas |
| **Upload preview** | Tampilkan preview gambar sebelum user klik predict |
| **Bahasa Indonesia?** | Bisa pakai mapping: defect→Cacat, longberry→Longberry, peaberry→Peaberry, premium→Premium |

---

## 📦 Keterangan File

| File | Fungsi |
|---|---|
| `service/server.py` | Kode FastAPI utama (172 lines) |
| `service/run.sh` | Script start service (PORT=8007) |
| `Model/+Augmentasi+ReduceLR v1/cnn_model.h5` | **Model terbaik** (85.19% test acc) — 7.7 MB |
| `Model/Baseline/cnn_model.h5` | Baseline (74%) |
| `Model/+Augmentasi/cnn_model.h5` | Augmentasi (82.5%) |
| `Model/+Augmentasi+cos/cnn_model.h5` | Cosine Annealing (84%) |
| `USK-Coffee/` | Dataset lengkap 8.000 gambar |

---

## 📞 Kontak

| Role | Kontak |
|---|---|
| **Backend/DevOps** | Asisten Dosen (via Telegram) |
| **Service** | `http://localhost:8007` (mati — hubungi untuk nyalakan) |
| **Dokumentasi ini** | `~/Public/riset-mahasiswa/Arabica-Coffee-Bean-Quality-Classification-Using-CNN-and-XAI/service/API_DOCS.md` |
