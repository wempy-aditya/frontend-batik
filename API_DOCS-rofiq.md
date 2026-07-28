# Melanoma Classification — API Documentation

**Base URL:** `http://localhost:8006`  
**Versi:** 1.0.0  
**Status:** 🔴 Service dimatikan — hubungi asisten dosen untuk nyalakan

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Arsitektur Ensemble](#-arsitektur-ensemble)
- [Endpoint](#-endpoint)
  - [GET /health](#1-get-health) — Cek status
  - [GET /models](#2-get-models) — Info 4 sub-model + bobot ensemble
  - [POST /predict](#3-post-predict) — **Klasifikasi melanoma** ⭐
- [Response Codes](#-response-codes)
- [Contoh Frontend (JavaScript)](#-contoh-frontend-javascript)
- [Contoh Frontend (HTML Lengkap)](#-contoh-frontend-html-lengkap)
- [Tips untuk Frontend Dev](#-tips-untuk-frontend-dev)

---

## 🎯 Gambaran Umum

API ini mengklasifikasikan **lesi kulit** menjadi **Benign** (jinak) atau **Malignant** (ganas/melanoma) menggunakan ensemble 4 arsitektur deep learning.

| Hasil | Arti |
|---|---|
| **Benign** ✅ | Lesi jinak — umumnya tidak berbahaya |
| **Malignant** ⚠️ | Lesi ganas — potensi kanker kulit melanoma |

> ⚡ Model ensemble memberikan 4 prediksi individu + 1 hasil akhir (weighted average).

---

## 🧠 Arsitektur Ensemble

4 model di-load dari `ensemble_best.pth` (284 MB). Hasil akhir = **weighted average** dari keempat model.

| Model | Input Size | Bobot Ensemble | Keterangan |
|---|---|---|---|
| 🏆 **DenseNet-121** | 224×224 | **0.4706** | Bobot tertinggi — dominan |
| **InceptionV3** | 299×299 | 0.0893 | |
| **Xception** | 299×299 | 0.2850 | |
| **ViT-Pretrained** | 224×224 | 0.1551 | Vision Transformer |

**Bobot ensemble** dioptimasi pakai **Bayesian Optimization (TPE)** via Optuna.

Setiap model mengeluarkan probabilitas sendiri, lalu digabung:

```
final_prob = 0.4706 × prob_densenet + 0.0893 × prob_inception + 0.2850 × prob_xception + 0.1551 × prob_vit
```

---

## 🔌 Endpoint

### 1. GET /health

Cek status server dan sub-model.

**Request:**
```
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "device": "cuda:0",
  "model_loaded": true,
  "sub_models": ["DenseNet-121", "InceptionV3", "Xception", "ViT-Pretrained"],
  "num_classes": 2,
  "classes": ["benign", "malignant"]
}
```

---

### 2. GET /models

Info detail tiap sub-model + bobot ensemble.

**Request:**
```
GET /models
```

**Response (200):**
```json
{
  "models": [
    {
      "key": "densenet121",
      "label": "DenseNet-121",
      "input_size": 224,
      "ensemble_weight": 0.4706
    },
    {
      "key": "inception_v3",
      "label": "InceptionV3",
      "input_size": 299,
      "ensemble_weight": 0.0893
    },
    {
      "key": "xception",
      "label": "Xception",
      "input_size": 299,
      "ensemble_weight": 0.2850
    },
    {
      "key": "vit_scratch",
      "label": "ViT-Pretrained",
      "input_size": 224,
      "ensemble_weight": 0.1551
    }
  ],
  "class_names": ["benign", "malignant"]
}
```

---

### 3. POST /predict ⭐

**Endpoint utama — upload gambar lesi kulit → klasifikasi.**

#### Request

**Method:** `POST`  
**Content-Type:** `multipart/form-data`  
**URL:** `/predict`

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `file` | File upload | ✅ Ya | File gambar lesi kulit (jpg, png, webp, dll) |

**Contoh Request (curl):**
```bash
curl -X POST http://localhost:8006/predict \
  -F "file=@lesi_kulit.jpg"
```

**Contoh Request (JavaScript FormData):**
```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:8006/predict", {
  method: "POST",
  body: formData,
});

const data = await response.json();
```

#### Response (200 OK)

```json
{
  "success": true,
  "filename": "lesi_kulit.jpg",
  "ensemble": {
    "model_label": "Ensemble (Weighted Average)",
    "prediction": "malignant",
    "confidence": 0.7358,
    "probabilities": {
      "benign": 0.2642,
      "malignant": 0.7358
    }
  },
  "models": {
    "densenet121": {
      "model_label": "DenseNet-121",
      "prediction": "malignant",
      "confidence": 0.9194,
      "probabilities": {
        "benign": 0.0806,
        "malignant": 0.9194
      },
      "ensemble_weight": 0.4706
    },
    "inception_v3": {
      "model_label": "InceptionV3",
      "prediction": "malignant",
      "confidence": 0.9796,
      "probabilities": {
        "benign": 0.0204,
        "malignant": 0.9796
      },
      "ensemble_weight": 0.0893
    },
    "xception": {
      "model_label": "Xception",
      "prediction": "malignant",
      "confidence": 0.7456,
      "probabilities": {
        "benign": 0.2544,
        "malignant": 0.7456
      },
      "ensemble_weight": 0.2850
    },
    "vit_scratch": {
      "model_label": "ViT-Pretrained",
      "prediction": "benign",
      "confidence": 0.9782,
      "probabilities": {
        "benign": 0.9782,
        "malignant": 0.0218
      },
      "ensemble_weight": 0.1551
    }
  },
  "inference_time_ms": 3885.04
}
```

#### Penjelasan Response

| Field | Tipe | Keterangan |
|---|---|---|
| `success` | Boolean | `true` jika prediksi berhasil |
| `filename` | String | Nama file asli |
| `ensemble` | Object | **Hasil akhir ensemble** (weighted average) — ini yang dipake sebagai rekomendasi |
| `ensemble.prediction` | String | `"benign"` atau `"malignant"` |
| `ensemble.confidence` | Float | Confidence score ensemble (0–1) |
| `ensemble.probabilities` | Object | Probabilitas per kelas: `{ benign: 0.26, malignant: 0.74 }` |
| `models` | Object | 4 prediksi individual — key: `densenet121`, `inception_v3`, `xception`, `vit_scratch` |
| `models[].prediction` | String | Prediksi model individu |
| `models[].confidence` | Float | Confidence model individu |
| `models[].probabilities` | Object | Probabilitas per kelas |
| `models[].ensemble_weight` | Float | Bobot model dalam ensemble |
| `inference_time_ms` | Float | Waktu total inference (~4 detik) |

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
const API_URL = "http://localhost:8006";

// 🔥 Klasifikasi lesi kulit
async function classifySkin(imageFile) {
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

// ✅ Cek status + model list
async function checkHealth() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}

// 📋 Info detail 4 sub-model
async function getModels() {
  const res = await fetch(`${API_URL}/models`);
  return res.json();
}
```

---

## 🖼️ Contoh Frontend (HTML Lengkap)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Melanoma Classifier</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d1117; color: #e6edf3; padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 800px; margin: auto; }
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
    .upload-zone:hover { border-color: #58a6ff; }
    .upload-zone.dragover { border-color: #f97316; background: #161b22; }
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

    .loading {
      display: none; text-align: center; padding: 20px;
    }
    .spinner {
      border: 3px solid #30363d; border-top: 3px solid #58a6ff;
      border-radius: 50%; width: 32px; height: 32px;
      animation: spin 0.8s linear infinite; margin: 0 auto 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .result { display: none; margin-top: 20px; }

    /* Ensemble card */
    .ensemble-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 2px solid #22c55e;
      border-radius: 12px; padding: 20px; text-align: center;
      margin-bottom: 20px;
    }
    .ensemble-card.malignant { border-color: #ef4444; }
    .ensemble-card h2 { font-size: 20px; margin-bottom: 4px; }
    .ensemble-card .prediction {
      font-size: 28px; font-weight: 700;
    }
    .ensemble-card .prediction.benign { color: #22c55e; }
    .ensemble-card .prediction.malignant { color: #ef4444; }
    .ensemble-card .confidence {
      font-size: 14px; color: #8b949e; margin-top: 4px;
    }
    .ensemble-card .prob-bar {
      display: flex; height: 8px; border-radius: 4px;
      overflow: hidden; margin-top: 12px;
    }
    .ensemble-card .prob-bar .benign-bar { background: #22c55e; }
    .ensemble-card .prob-bar .malignant-bar { background: #ef4444; }

    /* Model cards grid */
    .model-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .model-card {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 10px; padding: 14px;
    }
    .model-card h3 { font-size: 13px; color: #8b949e; margin-bottom: 6px; }
    .model-card .pred {
      font-size: 18px; font-weight: 600;
    }
    .model-card .pred.benign { color: #22c55e; }
    .model-card .pred.malignant { color: #ef4444; }
    .model-card .conf {
      font-size: 13px; color: #8b949e; margin: 4px 0;
    }
    .model-card .weight {
      font-size: 11px; color: #484f58;
    }

    .info-row {
      text-align: center; margin-top: 16px;
      font-size: 13px; color: #8b949e;
    }

    .download-btn {
      display: inline-block; padding: 8px 16px;
      background: #1f6feb; border-radius: 6px;
      color: #fff; text-decoration: none; font-size: 13px;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔬 Melanoma Classifier</h1>
    <p class="subtitle">Ensemble DenseNet121 + InceptionV3 + Xception + ViT</p>

    <div id="status" class="status">⚡ Mengecek server...</div>

    <!-- Upload -->
    <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
      <div class="icon">🩺</div>
      <p>Upload gambar lesi kulit untuk klasifikasi</p>
      <p style="font-size:12px;color:#484f58">JPG, PNG, WebP</p>
      <input type="file" id="fileInput" accept="image/*" style="display:none">
    </div>

    <!-- Predict Button -->
    <button id="predictBtn" onclick="predict()" disabled>🔬 Klasifikasi Lesi Kulit</button>

    <!-- Loading -->
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>⏳ Menganalisis dengan 4 model ... (~4 detik)</p>
    </div>

    <!-- Result -->
    <div class="result" id="result">
      <!-- Ensemble card -->
      <div class="ensemble-card" id="ensembleCard">
        <h2>🔬 Ensemble Final</h2>
        <div class="prediction" id="ensemblePred"></div>
        <div class="confidence" id="ensembleConf"></div>
        <div class="prob-bar" id="probBar"></div>
      </div>

      <!-- Individual models -->
      <div class="model-grid" id="modelGrid"></div>

      <div class="info-row">
        ⏱ Waktu analisis: <span id="timing">0</span> ms
      </div>
    </div>
  </div>

  <script>
    const API_URL = "http://localhost:8006";

    // ── Health Check ──
    async function checkHealth() {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        if (data.status === "ok" && data.model_loaded) {
          document.getElementById("status").textContent =
            `✅ Server online | ${data.sub_models.length} model loaded | Device: ${data.device}`;
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

    // ── Upload zone ──
    let selectedFile = null;

    document.getElementById("fileInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) previewImage(file);
    });

    const uploadZone = document.getElementById("uploadZone");
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadZone.classList.add("dragover");
    });
    uploadZone.addEventListener("dragleave", () => {
      uploadZone.classList.remove("dragover");
    });
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) previewImage(file);
    });

    function previewImage(file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadZone.innerHTML = `<img src="${e.target.result}">`;
        uploadZone.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    }

    // ── Predict ──
    async function predict() {
      if (!selectedFile) return alert("Pilih gambar lesi dulu!");

      const btn = document.getElementById("predictBtn");
      const loading = document.getElementById("loading");
      const resultDiv = document.getElementById("result");

      btn.disabled = true;
      loading.style.display = "block";
      resultDiv.style.display = "none";

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch(`${API_URL}/predict`, {
          method: "POST", body: formData,
        });

        if (!res.ok) throw new Error((await res.json()).detail || "Gagal");
        const data = await res.json();

        loading.style.display = "none";
        resultDiv.style.display = "block";
        document.getElementById("timing").textContent = data.inference_time_ms;

        // ── Ensemble card ──
        const ens = data.ensemble;
        const isMalignant = ens.prediction === "malignant";
        const card = document.getElementById("ensembleCard");
        card.className = `ensemble-card ${isMalignant ? "malignant" : ""}`;

        document.getElementById("ensemblePred").textContent =
          isMalignant ? "⚠️ Malignant (Ganas)" : "✅ Benign (Jinak)";
        document.getElementById("ensemblePred").className =
          `prediction ${isMalignant ? "malignant" : "benign"}`;
        document.getElementById("ensembleConf").textContent =
          `Confidence: ${(ens.confidence * 100).toFixed(1)}%`;

        // Progress bar
        const benignPct = (ens.probabilities.benign * 100).toFixed(0);
        const malignantPct = (ens.probabilities.malignant * 100).toFixed(0);
        document.getElementById("probBar").innerHTML =
          `<div class="benign-bar" style="width:${benignPct}%"></div>
           <div class="malignant-bar" style="width:${malignantPct}%"></div>`;

        // ── Model cards ──
        const grid = document.getElementById("modelGrid");
        const MODEL_KEYS = ["densenet121", "inception_v3", "xception", "vit_scratch"];
        const MODEL_ICONS = {
          densenet121: "🏗️", inception_v3: "🧩", xception: "⚡", vit_scratch: "🅥",
        };

        grid.innerHTML = MODEL_KEYS.map(key => {
          const m = data.models[key];
          if (!m) return "";
          const isMal = m.prediction === "malignant";
          return `
            <div class="model-card">
              <h3>${MODEL_ICONS[key] || ""} ${m.model_label}</h3>
              <div class="pred ${isMal ? "malignant" : "benign"}">
                ${isMal ? "⚠️ Malignant" : "✅ Benign"}
              </div>
              <div class="conf">${(m.confidence * 100).toFixed(1)}% confidence</div>
              <div class="weight">Bobot ensemble: ${(m.ensemble_weight * 100).toFixed(1)}%</div>
              <div style="display:flex;gap:4px;margin-top:6px;font-size:11px;color:#484f58">
                <span>B: ${(m.probabilities.benign * 100).toFixed(0)}%</span>
                <span>|</span>
                <span>M: ${(m.probabilities.malignant * 100).toFixed(0)}%</span>
              </div>
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

    // ── Init ──
    checkHealth();
  </script>
</body>
</html>
```

---

## 🔧 Tips untuk Frontend Dev

| Tips | Detail |
|---|---|
| **Loading state** | Inference butuh ~3-4 detik — **wajib tampilkan spinner/progress!** |
| **Ensemble = hasil akhir** | Gunakan `data.ensemble.prediction` sebagai rekomendasi utama |
| **Per-model view** | Tampilkan 4 model card biar user lihat voting internal |
| **Bobot ensemble** | Confidence per-model bisa beda — DenseNet121 punya bobot 47% (paling dominan) |
| **Color coding** | Hijau = Benign (jinak), Merah = Malignant (ganas) |
| **Progress bar** | Tampilkan perbandingan Benign vs Malignant sebagai horizontal bar |
| **Waktu loading** | Ensemble 284 MB — loading pertama kali ~5-10 detik setelah server start |
| **Download report** | Bisa generate PDF/laporan berisi hasil ensemble + 4 model confidence |

---

## 📦 Keterangan File

| File | Fungsi |
|---|---|
| `service/server.py` | Kode FastAPI utama (210 lines) |
| `service/run.sh` | Script start service |
| `main/[6] model/model_def.py` | **Arsitektur model asli dari mahasiswa** — dipakai langsung |
| `main/[6] model/ensemble_best.pth` | Ensemble weights 284 MB (berisi 4 sub-model) |
| `main/[6] model/*_best.pth` | 4 individual model weights (30-88 MB) |

---

## 📞 Kontak

| Role | Kontak |
|---|---|
| **Backend/DevOps** | Asisten Dosen (via Telegram) |
| **Service** | `http://localhost:8006` (mati — hubungi untuk nyalakan) |
| **Dokumentasi ini** | `~/Public/riset-mahasiswa/Tree-Structured-Parzen-Estimator/service/API_DOCS.md` |
