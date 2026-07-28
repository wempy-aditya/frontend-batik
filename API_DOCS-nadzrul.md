# Rice Pest Classification — API Documentation

**Base URL:** `http://localhost:8005`  
**Versi:** 1.0.0  
**Status:** 🔴 Service dimatikan — hubungi asisten dosen untuk nyalakan

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Model](#-model)
- [Daftar 11 Hama](#-daftar-11-hama-padi)
- [Endpoint](#-endpoint)
  - [GET /health](#1-get-health) — Cek status
  - [GET /classes](#2-get-classes) — Daftar 11 kelas hama
  - [POST /predict](#3-post-predict) — **Klasifikasi hama padi** ⭐
- [Perbandingan Model](#-perbandingan-model)
- [Response Codes](#-response-codes)
- [Contoh Frontend (JavaScript)](#-contoh-frontend-javascript)
- [Contoh Frontend (HTML + CSS Lengkap)](#-contoh-frontend-html--css-lengkap)
- [Tips untuk Frontend Dev](#-tips-untuk-frontend-dev)

---

## 🎯 Gambaran Umum

API ini mengklasifikasikan **hama tanaman padi** dari gambar menjadi **11 kelas** hama.

API menyediakan **2 model arsitektur** yang bisa dipilih via query parameter:

| Model | Akurasi (F1) | Input | Kecepatan |
|---|---|---|---|
| 🏆 **EfficientNet-B4** (default) | **90.75%** | 380×380 | ~50-640ms |
| **Inception-V3** | 88.19% | 299×299 | ~30-310ms |

EfficientNet-B4 direkomendasikan sebagai model default karena akurasi lebih tinggi.

---

## 🧠 Model

| Property | EfficientNet-B4 | Inception-V3 |
|---|---|---|
| Arsitektur | EfficientNet-B4 (transfer learning) | Inception-V3 (transfer learning) |
| Berat Model | 68 MB | 94 MB |
| Input | 380×380 (resize→412, center crop 380) | 299×299 (resize→331, center crop 299) |
| Normalisasi | ImageNet mean/std | ImageNet mean/std |
| Framework | PyTorch 2.6 + TorchVision | PyTorch 2.6 + TorchVision |
| GPU | `cuda:0` (RTX 4080) | `cuda:0` (RTX 4080) |

Kedua model di-fine-tune **tanpa augmentasi data** (No Augmentation) — full fine-tuning dari ImageNet pretrained weights.

---

## 🐛 Daftar 11 Hama Padi

| ID | Nama Latin | Nama Umum (Indonesia) |
|---|---|---|
| 0 | **Cecidomyiidae** | Lalat padi / agromyzidae |
| 1 | **Chloropidae** | Lalat hijau padi |
| 2 | **Cicadellidae** | Wereng / leafhopper |
| 3 | **Crambidae** | Penggerek batang padi |
| 4 | **Curculionidae** | Kumbang moncong padi |
| 5 | **Delphacidae** | Wereng coklat (planthopper) |
| 6 | **Ephydridae** | Lalat pantai padi |
| 7 | **Hesperiidae** | Ulat penggulung daun |
| 8 | **Noctuidae** | Ulat grayak / armyworm |
| 9 | **Phlaeothripidae** | Thrips padi |
| 10 | **Thripidae** | Thrips (kecil) |

---

## 🔌 Endpoint

### 1. GET /health

Cek status server, model yang terload, dan device.

**Request:**
```
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "device": "cuda:0",
  "models_loaded": ["efficientnet", "inception"],
  "available_models": ["efficientnet", "inception"]
}
```

`models_loaded` = model yang sudah di-load di memory.  
`available_models` = semua model yang tersedia di server.

---

### 2. GET /classes

Daftar 11 kelas hama padi.

**Request:**
```
GET /classes
```

**Response (200):**
```json
{
  "classes": [
    { "id": 0, "name": "Cecidomyiidae" },
    { "id": 1, "name": "Chloropidae" },
    { "id": 2, "name": "Cicadellidae" },
    { "id": 3, "name": "Crambidae" },
    { "id": 4, "name": "Curculionidae" },
    { "id": 5, "name": "Delphacidae" },
    { "id": 6, "name": "Ephydridae" },
    { "id": 7, "name": "Hesperiidae" },
    { "id": 8, "name": "Noctuidae" },
    { "id": 9, "name": "Phlaeothripidae" },
    { "id": 10, "name": "Thripidae" }
  ]
}
```

---

### 3. POST /predict ⭐

**Endpoint utama — upload gambar hama padi → klasifikasi 11 kelas.**

#### Request

**Method:** `POST`  
**Content-Type:** `multipart/form-data`  
**URL:** `/predict?model=efficientnet&topk=3`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `file` | File upload | ✅ Ya | File gambar hama (jpg, png, dll) |

| Query Param | Default | Keterangan |
|---|---|---|
| `model` | `efficientnet` | Pilih arsitektur: `efficientnet` atau `inception` |
| `topk` | `1` | Jumlah prediksi teratas (1-11) |

**Contoh Request (curl):**
```bash
# EfficientNet — 3 prediksi teratas
curl -X POST "http://localhost:8005/predict?model=efficientnet&topk=3" \
  -F "file=@hama_padi.jpg"

# Inception — 1 prediksi teratas
curl -X POST "http://localhost:8005/predict?model=inception&topk=1" \
  -F "file=@hama_padi.jpg"

# Semua 11 probabilitas
curl -X POST "http://localhost:8005/predict?model=efficientnet&topk=11" \
  -F "file=@hama_padi.jpg"
```

#### Response (200 OK)

```json
{
  "success": true,
  "filename": "hama_padi.jpg",
  "model": "efficientnet",
  "num_classes": 11,
  "predictions": [
    {
      "class_name": "Delphacidae",
      "class_id": 5,
      "confidence": 0.9512
    },
    {
      "class_name": "Hesperiidae",
      "class_id": 7,
      "confidence": 0.0321
    },
    {
      "class_name": "Cicadellidae",
      "class_id": 2,
      "confidence": 0.0089
    }
  ],
  "probabilities": [
    0.0001, 0.0002, 0.0089, 0.0003,
    0.0005, 0.9512, 0.0001, 0.0321,
    0.0035, 0.0021, 0.0010
  ],
  "inference_time_ms": 638.0
}
```

> ⚡ Jika `topk=1`, cukup gunakan `predictions[0]` sebagai hasil.

#### Penjelasan Response

| Field | Tipe | Keterangan |
|---|---|---|
| `success` | Boolean | `true` jika sukses |
| `filename` | String | Nama file asli |
| `model` | String | Model yang digunakan: `efficientnet` atau `inception` |
| `num_classes` | Integer | 11 |
| `predictions` | Array | **Top-K predictions** (urut confidence tertinggi) |
| `predictions[].class_name` | String | Nama hama (latin) |
| `predictions[].class_id` | Integer | ID kelas (0-10) |
| `predictions[].confidence` | Float | Confidence (0–1) |
| `probabilities` | Array | Semua 11 probabilitas urutan index kelas [0..10] |
| `inference_time_ms` | Float | Waktu inference (GPU) |

---

## 📊 Perbandingan Model

| Aspek | EfficientNet-B4 🏆 | Inception-V3 |
|---|---|---|
| **F1 Score (weighted)** | **90.75%** | 88.19% |
| **Ukuran Model** | 68 MB | 94 MB |
| **Input Size** | 380×380 | 299×299 |
| **Inference (GPU)** | ~50-640ms | ~30-310ms |
| **Direkomendasikan?** | ✅ **Ya — default** | Alternatif |

### Detail F1 per kelas — EfficientNet-B4

| Kelas | Precision | Recall | F1 |
|---|---|---|---|
| Cecidomyiidae | ... | ... | ... |
| *(data lengkap ada di notebook evaluasi)* | | | |

---

## 📊 Response Codes

| Status | Makna |
|---|---|
| `200` | ✅ Sukses — prediksi berhasil |
| `400` | ❌ Bad Request — model/param ga valid, file bukan gambar |
| `503` | ❌ Service Unavailable — model weights ga ditemukan |

---

## 💻 Contoh Frontend (JavaScript)

```javascript
const API_URL = "http://localhost:8005";

// 🔥 Upload gambar hama padi → klasifikasi
async function classifyPest(imageFile, model = "efficientnet", topk = 3) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const url = `${API_URL}/predict?model=${model}&topk=${topk}`;

  try {
    const response = await fetch(url, {
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

// 🔄 Ganti model
async function predictWithModel(imageFile, model) {
  return classifyPest(imageFile, model, 5);
}
```

---

## 🖼️ Contoh Frontend (HTML + CSS Lengkap)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rice Pest Classifier</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d1117; color: #e6edf3; padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 780px; margin: auto; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #8b949e; font-size: 14px; margin-bottom: 20px; }

    .status {
      font-size: 13px; margin-bottom: 16px; padding: 8px 12px;
      border-radius: 6px;
    }
    .status.online { background: #0d5320; color: #7ee787; }
    .status.offline { background: #490202; color: #ff7b72; }

    .controls {
      display: flex; gap: 10px; margin-bottom: 16px;
      align-items: center; flex-wrap: wrap;
    }
    .controls select, .controls input {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 6px; color: #e6edf3; padding: 8px 12px;
      font-size: 14px;
    }
    .controls select { flex: 1; min-width: 160px; }
    .controls label { font-size: 13px; color: #8b949e; }

    .upload-zone {
      border: 2px dashed #30363d;
      border-radius: 12px; padding: 40px 20px;
      text-align: center; cursor: pointer;
      transition: border-color 0.2s;
    }
    .upload-zone:hover { border-color: #58a6ff; }
    .upload-zone.dragover { border-color: #58a6ff; background: #161b22; }
    .upload-zone.has-image { border-style: solid; padding: 12px; }
    .upload-zone img { max-width: 100%; max-height: 300px; border-radius: 8px; }
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
      border: 3px solid #30363d; border-top: 3px solid #58a6ff;
      border-radius: 50%; width: 32px; height: 32px;
      animation: spin 0.8s linear infinite; margin: 0 auto 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .result { display: none; margin-top: 20px; }

    /* Main prediction */
    .main-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 2px solid #22c55e;
      border-radius: 12px; padding: 20px; text-align: center;
      margin-bottom: 16px;
    }
    .main-card .icon { font-size: 36px; margin-bottom: 6px; }
    .main-card .name { font-size: 24px; font-weight: 700; }
    .main-card .name .latin { font-size: 14px; font-weight: 400; color: #8b949e; display: block; }
    .main-card .conf { font-size: 16px; color: #8b949e; margin: 4px 0; }
    .main-card .model-badge {
      display: inline-block; padding: 4px 10px; border-radius: 12px;
      font-size: 11px; font-weight: 600; margin-top: 6px;
    }
    .model-efficientnet { background: #1f6feb; color: #fff; }
    .model-inception { background: #8957e5; color: #fff; }

    .conf-bar {
      height: 8px; border-radius: 4px;
      background: #30363d; overflow: hidden; margin-top: 10px;
    }
    .conf-bar .fill {
      height: 100%; border-radius: 4px;
      background: linear-gradient(90deg, #22c55e, #16a34a);
      transition: width 0.5s;
    }

    /* All insects grid */
    .pest-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .pest-item {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 8px; padding: 10px 12px;
      display: flex; align-items: center; gap: 10px;
    }
    .pest-item.top-1 {
      border-color: #22c55e; background: #0d2815;
      grid-column: 1 / -1;
    }
    .pest-item .info { flex: 1; }
    .pest-item .name-latin { font-weight: 600; font-size: 14px; }
    .pest-item .name-id { font-size: 11px; color: #8b949e; }
    .pest-item .pct { font-weight: 700; font-size: 16px; min-width: 50px; text-align: right; }
    .pest-item .mini-bar { width: 60px; height: 5px; border-radius: 3px; background: #30363d; overflow: hidden; }
    .pest-item .mini-bar .fill { height: 100%; border-radius: 3px; }

    .info-row { text-align: center; margin-top: 14px; font-size: 13px; color: #8b949e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌾 Rice Pest Classifier</h1>
    <p class="subtitle">11 hama tanaman padi — EfficientNet-B4 / Inception-V3</p>

    <div id="status" class="status">⚡ Mengecek server...</div>

    <!-- Controls -->
    <div class="controls">
      <label for="modelSelect">🧠 Model:</label>
      <select id="modelSelect">
        <option value="efficientnet">🏆 EfficientNet-B4 (90.75%, 380px)</option>
        <option value="inception">Inception-V3 (88.19%, 299px)</option>
      </select>
      <label for="topkInput">🔢 Top-K:</label>
      <input type="number" id="topkInput" value="3" min="1" max="11" style="width:60px">
    </div>

    <!-- Upload -->
    <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
      <div class="icon">🌾</div>
      <p>Upload gambar hama padi untuk identifikasi</p>
      <p style="font-size:12px;color:#484f58">JPG, PNG, WebP</p>
      <input type="file" id="fileInput" accept="image/*" style="display:none">
    </div>

    <button id="predictBtn" onclick="predict()" disabled>🔬 Identifikasi Hama Padi</button>

    <!-- Loading -->
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>⏳ Menganalisis hama padi ...</p>
    </div>

    <!-- Result -->
    <div class="result" id="result">
      <div class="main-card" id="mainCard">
        <div class="icon">🐛</div>
        <div class="name" id="pestName">-</div>
        <div class="conf" id="pestConf">-</div>
        <div class="conf-bar"><div class="fill" id="confBar" style="width:0%"></div></div>
        <div class="model-badge" id="modelBadge">EfficientNet-B4</div>
      </div>

      <div class="pest-grid" id="pestGrid"></div>

      <div class="info-row">⏱ Waktu: <span id="timing">0</span> ms</div>
    </div>
  </div>

  <script>
    const API_URL = "http://localhost:8005";

    // ── Health check ──
    async function checkHealth() {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        if (data.status === "ok" && data.models_loaded.length > 0) {
          document.getElementById("status").textContent =
            `✅ Server online | ${data.models_loaded.length} model loaded (${data.models_loaded.join(", ")}) | ${data.device}`;
          document.getElementById("status").className = "status online";
          document.getElementById("predictBtn").disabled = false;
        } else {
          throw new Error("No models loaded");
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
      e.preventDefault(); zone.classList.remove("dragover");
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
      if (!selectedFile) return alert("Pilih gambar hama padi dulu!");

      const btn = document.getElementById("predictBtn");
      const loading = document.getElementById("loading");
      const resultDiv = document.getElementById("result");

      const model = document.getElementById("modelSelect").value;
      const topk = Math.min(11, Math.max(1, parseInt(document.getElementById("topkInput").value) || 3));

      btn.disabled = true;
      loading.style.display = "block";
      resultDiv.style.display = "none";

      const formData = new FormData();
      formData.append("file", selectedFile);
      const url = `${API_URL}/predict?model=${model}&topk=${topk}`;

      try {
        const res = await fetch(url, { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json()).detail || "Gagal");
        const data = await res.json();

        loading.style.display = "none";
        resultDiv.style.display = "block";
        document.getElementById("timing").textContent = data.inference_time_ms;

        // Main card
        const top = data.predictions[0];
        document.getElementById("pestName").innerHTML =
          `${top.class_name} <span class="latin">ID: ${top.class_id} — Prediksi utama</span>`;
        document.getElementById("pestConf").textContent =
          `${(top.confidence * 100).toFixed(1)}% confidence`;
        document.getElementById("confBar").style.width = `${(top.confidence * 100).toFixed(1)}%`;

        const badge = document.getElementById("modelBadge");
        badge.textContent = data.model === "efficientnet" ? "EfficientNet-B4 🏆" : "Inception-V3";
        badge.className = `model-badge model-${data.model}`;

        // Pest grid
        const grid = document.getElementById("pestGrid");
        const PEST_ICONS = ["🐛","🐜","🦗","🐞","🪲","🦟","🪰","🐛","🐛","🦟","🦟"];
        const PEST_ID = {
          0: "Lalat padi", 1: "Lalat hijau", 2: "Wereng",
          3: "Penggerek batang", 4: "Kumbang moncong", 5: "Wereng coklat",
          6: "Lalat pantai", 7: "Ulat penggulung", 8: "Ulat grayak",
          9: "Thrips padi", 10: "Thrips kecil",
        };

        grid.innerHTML = data.predictions.map((p, i) => {
          const isTop = i === 0;
          const pct = (p.confidence * 100).toFixed(1);
          const hue = Math.max(120 - (p.confidence * 120), 0); // green → red
          return `
            <div class="pest-item ${isTop ? 'top-1' : ''}">
              <div>${PEST_ICONS[p.class_id] || '🐛'}</div>
              <div class="info">
                <div class="name-latin">${p.class_name}</div>
                <div class="name-id">${PEST_ID[p.class_id] || ''}</div>
              </div>
              <div class="mini-bar">
                <div class="fill" style="width:${pct}%;background:hsl(${hue},70%,50%)"></div>
              </div>
              <div class="pct" style="color:hsl(${hue},70%,50%)">${pct}%</div>
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
| **Model selector** | Sediakan dropdown pilih model — EfficientNet (default) vs Inception |
| **Top-K slider** | Bisa tampilkan 1-11 prediksi. Default 3 sudah cukup |
| **Confidence color** | Hijau > 90%, Kuning 70-90%, Merah < 70% — kode warna HSL di contoh |
| **Loading state** | Inference GPU cepat (~50-640ms) tapi tetap kasih spinner |
| **Nama lokal** | Bisa tambah nama Indonesia (contoh: Delphacidae = Wereng coklat) |
| **Nama latin** | Tampilkan nama latin sebagai label utama — itu yang diprediksi model |
| **Perbandingan model** | Bisa tambah fitur "bandingkan EfficientNet vs Inception" untuk akurasi lebih detail |

---

## 📦 Keterangan File

| File | Fungsi |
|---|---|
| `service/server.py` | Kode FastAPI utama (245 lines) |
| `service/run.sh` | Script start service |
| `Model/best_efficientnet_b4_no_aug.pth` | EfficientNet-B4 weights (68 MB) |
| `Model/best_inception_v3_no_aug.pth` | Inception-V3 weights (94 MB) |
| `dataset_fix/` | Dataset lokal ~1.4 GB (4559 gambar uji) |

---

## 📞 Kontak

| Role | Kontak |
|---|---|
| **Backend/DevOps** | Asisten Dosen (via Telegram) |
| **Service** | `http://localhost:8005` (mati — hubungi untuk nyalakan) |
| **Dokumentasi ini** | `~/Public/riset-mahasiswa/Rice-Pest-Classification/service/API_DOCS.md` |
