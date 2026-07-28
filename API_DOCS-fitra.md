# Car Damage Detection — API Documentation

**Base URL:** `http://localhost:8003`  
**Versi:** 1.0.0  
**Status:** 🟢 Running

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Endpoint](#-endpoint)
  - [GET /health](#1-get-health) — Cek status
  - [GET /classes](#2-get-classes) — Daftar kelas kerusakan
  - [POST /detect](#3-post-detect) — **Deteksi kerusakan mobil** ⭐
- [Response Codes](#-response-codes)
- [Panduan Confidence & IoU](#-panduan-confidence--iou)
- [Contoh Frontend (JavaScript)](#-contoh-frontend-javascript)
- [Contoh Frontend (HTML Lengkap)](#-contoh-frontend-html-lengkap)
- [Tips untuk Frontend Dev](#-tips-untuk-frontend-dev)

---

## 🎯 Gambaran Umum

API ini mendeteksi **6 jenis kerusakan mobil** dari gambar menggunakan YOLOv12n (Skenario 5 High Recall).

| Kelas | Indonesia | Keterangan |
|---|---|---|
| `dent` | Penyok | Body mobil penyok |
| `scratch` | Goresan | Cat tergores |
| `crack` | Retak | Kaca/tempat retak |
| `glass_shatter` | Kaca pecah | Kaca mobil pecah |
| `lamp_broken` | Lampu pecah | Lampu depan/belakang pecah |
| `tire_flat` | Ban kempes | Ban mobil kempes |

> ⚡ **Inference:** ~250ms per gambar (CPU), bisa beberapa objek sekaligus dalam satu gambar.

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
  "device": "cpu",
  "model_path": "Skenario 5/scenario_5_full_results/scenario_5_high_recall_insurance/weights/best.pt"
}
```

---

### 2. GET /classes

Daftar 6 kelas kerusakan yang bisa dideteksi.

**Request:**
```
GET /classes
```

**Response (200):**
```json
{
  "classes": [
    { "id": 0, "name": "dent" },
    { "id": 1, "name": "scratch" },
    { "id": 2, "name": "crack" },
    { "id": 3, "name": "glass_shatter" },
    { "id": 4, "name": "lamp_broken" },
    { "id": 5, "name": "tire_flat" }
  ]
}
```

---

### 3. POST /detect ⭐

**Endpoint utama — upload gambar → deteksi kerusakan.**

#### Request

**Method:** `POST`  
**Content-Type:** `multipart/form-data`  
**URL:** `/detect`

| Field | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `file` | File upload | ✅ Ya | — | File gambar (jpg, png, webp, dll) |
| `conf` | Float | ❌ | `0.25` | Confidence threshold (0.01–1.0) |
| `iou` | Float | ❌ | `0.45` | IoU NMS threshold (0.01–1.0) |

**Contoh Request (curl):**
```bash
curl -X POST http://localhost:8003/detect \
  -F "file=@foto_mobil.jpg" \
  -G --data-urlencode "conf=0.25" \
  -G --data-urlencode "iou=0.45"
```

**Contoh Request (JavaScript FormData):**
```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:8003/detect?conf=0.25&iou=0.45", {
  method: "POST",
  body: formData,
});

const data = await response.json();
```

#### Response (200 OK)

```json
{
  "success": true,
  "filename": "mobil_rusak.jpg",
  "image_size": [1920, 1080],
  "num_detections": 2,
  "detections": [
    {
      "class_name": "scratch",
      "class_id": 1,
      "confidence": 0.7542,
      "bbox": { "x1": 450, "y1": 320, "x2": 620, "y2": 480 }
    },
    {
      "class_name": "dent",
      "class_id": 0,
      "confidence": 0.4521,
      "bbox": { "x1": 800, "y1": 560, "x2": 950, "y2": 700 }
    }
  ],
  "inference_time_ms": 248.12
}
```

#### Penjelasan Response

| Field | Tipe | Keterangan |
|---|---|---|
| `success` | Boolean | `true` jika deteksi berhasil |
| `filename` | String | Nama file asli |
| `image_size` | Array [w, h] | Ukuran gambar asli (lebar, tinggi) |
| `num_detections` | Int | Jumlah objek kerusakan terdeteksi (bisa 0) |
| `detections` | Array | Array deteksi, sorted by confidence descending |
| `detections[].class_name` | String | Nama kelas kerusakan (dent, scratch, dll) |
| `detections[].class_id` | Int | ID kelas (0–5) |
| `detections[].confidence` | Float | Confidence score (0–1) |
| `detections[].bbox` | Object | Bounding box: `{ x1, y1, x2, y2 }` — pixel coordinate |
| `inference_time_ms` | Float | Waktu inference dalam milidetik |

---

## 📊 Response Codes

| Status | Makna |
|---|---|
| `200` | ✅ Sukses — deteksi berhasil (num_detections mungkin 0) |
| `400` | ❌ Bad Request — file bukan gambar, atau parameter out of range |
| `503` | ❌ Service Unavailable — model belum siap |

---

## 🎛️ Panduan Confidence & IoU

### Confidence (`conf`)

| Rentang | Efek |
|---|---|
| `0.1–0.2` | Mendeteksi banyak objek — banyak false positive |
| `0.25` (default) | Recommended — seimbang precision/recall |
| `0.4–0.5` | Hanya deteksi yakin — bisa miss beberapa objek |
| `0.7+` | Sangat ketat — hampir tanpa false positive |

### IoU (`iou`)

| Rentang | Efek |
|---|---|
| `0.3–0.4` | Agresif — mengurangi bounding box tumpang tindih |
| `0.45` (default) | Recommended — standard |
| `0.6–0.7` | Lembut — bisa ada overlapping box |

### Contoh kombinasi

| Skenario | conf | iou |
|---|---|---|
| **Default** | `0.25` | `0.45` |
| **High Recall** (catch all) | `0.15` | `0.40` |
| **High Precision** (yakin aja) | `0.45` | `0.50` |
| **Survey/Mobile** (kualitas rendah) | `0.20` | `0.35` |

---

## 💻 Contoh Frontend (JavaScript)

```javascript
const API_URL = "http://localhost:8003";

// 🔥 Deteksi kerusakan
async function detectDamage(imageFile, conf = 0.25, iou = 0.45) {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(
      `${API_URL}/detect?conf=${conf}&iou=${iou}`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Gagal deteksi");
    }

    return await response.json();
  } catch (error) {
    console.error("Detect error:", error);
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

// 🖼️ Gambar bounding box di Canvas
function drawDetections(canvas, image, data) {
  const ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const COLORS = {
    dent: "#ef4444", scratch: "#f97316", crack: "#eab308",
    glass_shatter: "#22c55e", lamp_broken: "#3b82f6", tire_flat: "#8b5cf6",
  };

  for (const det of data.detections) {
    const { x1, y1, x2, y2 } = det.bbox;
    const color = COLORS[det.class_name] || "#ef4444";

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    // Label background
    const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = "14px sans-serif";
    const textW = ctx.measureText(label).width;

    ctx.fillStyle = color;
    ctx.fillRect(x1, y1 - 22, textW + 12, 22);

    ctx.fillStyle = "#fff";
    ctx.fillText(label, x1 + 6, y1 - 6);
  }
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
  <title>Car Damage Detector</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d1117; color: #e6edf3; padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 900px; margin: auto; }
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
    .upload-zone.dragover { border-color: #22c55e; background: #161b22; }
    .upload-zone.has-image { border-style: solid; padding: 12px; }

    .upload-zone img { max-width: 100%; max-height: 400px; border-radius: 8px; }
    .upload-zone p { color: #8b949e; margin-top: 8px; }
    .upload-zone .icon { font-size: 40px; margin-bottom: 8px; }

    .controls {
      display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap;
    }
    .control-group { flex: 1; min-width: 140px; }
    .control-group label {
      display: block; font-size: 12px; color: #8b949e; margin-bottom: 4px;
    }
    .control-group input {
      width: 100%; padding: 8px;
      background: #161b22; border: 1px solid #30363d;
      border-radius: 6px; color: #e6edf3; font-size: 13px;
    }

    button {
      width: 100%; padding: 14px; font-size: 16px; font-weight: 600;
      background: #238636; border: none; border-radius: 8px;
      color: #fff; cursor: pointer; margin: 8px 0;
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

    .result {
      margin-top: 20px; display: none;
    }

    .result canvas {
      width: 100%; border-radius: 8px;
      border: 1px solid #30363d;
    }

    .detection-list {
      margin-top: 12px;
    }
    .detection-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; background: #161b22;
      border-radius: 8px; margin-bottom: 8px;
      border-left: 4px solid #58a6ff;
    }
    .detection-item .color-dot {
      width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
    }
    .detection-item .class-name {
      font-weight: 600; text-transform: capitalize;
    }
    .detection-item .confidence {
      color: #8b949e; font-size: 13px;
    }
    .detection-item .coord {
      color: #484f58; font-size: 11px; margin-left: auto;
    }

    .no-detection {
      text-align: center; padding: 30px; color: #8b949e;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚗 Car Damage Detector</h1>
    <p class="subtitle">YOLOv12n — 6 jenis kerusakan mobil</p>

    <div id="status" class="status">⚡ Mengecek server...</div>

    <!-- Upload -->
    <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
      <div class="icon">📸</div>
      <p>Klik atau drag & drop gambar mobil rusak</p>
      <p style="font-size:12px;color:#484f58">JPG, PNG, WebP — max 10MB</p>
      <input type="file" id="fileInput" accept="image/*" style="display:none">
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <label>Confidence Threshold</label>
        <input type="number" id="confInput" value="0.25" min="0.01" max="1.0" step="0.05">
      </div>
      <div class="control-group">
        <label>IoU Threshold</label>
        <input type="number" id="iouInput" value="0.45" min="0.01" max="1.0" step="0.05">
      </div>
    </div>

    <!-- Detect Button -->
    <button id="detectBtn" onclick="detect()" disabled>🔍 Deteksi Kerusakan</button>

    <!-- Loading -->
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>⏳ Mendeteksi kerusakan...</p>
    </div>

    <!-- Result -->
    <div class="result" id="result">
      <canvas id="resultCanvas"></canvas>

      <div id="detectionList" class="detection-list"></div>

      <div style="margin-top:12px;font-size:13px;color:#8b949e">
        ⏱ Waktu inference: <span id="timing">0</span> ms
      </div>
    </div>
  </div>

  <script>
    const API_URL = "http://localhost:8003";

    const COLORS = {
      dent: "#ef4444", scratch: "#f97316", crack: "#eab308",
      glass_shatter: "#22c55e", lamp_broken: "#3b82f6", tire_flat: "#8b5cf6",
    };

    // ── Health Check ──
    async function checkHealth() {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        if (data.status === "ok" && data.model_loaded) {
          document.getElementById("status").textContent =
            `✅ Server online | Device: ${data.device} | Model loaded`;
          document.getElementById("status").className = "status online";
          document.getElementById("detectBtn").disabled = false;
        } else {
          throw new Error("Model not loaded");
        }
      } catch {
        document.getElementById("status").textContent =
          "❌ Server offline — hubungi asisten dosen";
        document.getElementById("status").className = "status offine";
        document.getElementById("detectBtn").disabled = true;
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

    // ── Detect ──
    async function detect() {
      if (!selectedFile) return alert("Pilih gambar dulu!");

      const btn = document.getElementById("detectBtn");
      const loading = document.getElementById("loading");
      const resultDiv = document.getElementById("result");

      btn.disabled = true;
      loading.style.display = "block";
      resultDiv.style.display = "none";

      const formData = new FormData();
      formData.append("file", selectedFile);

      const conf = document.getElementById("confInput").value;
      const iou = document.getElementById("iouInput").value;

      try {
        const res = await fetch(`${API_URL}/detect?conf=${conf}&iou=${iou}`, {
          method: "POST", body: formData,
        });

        if (!res.ok) throw new Error((await res.json()).detail || "Gagal");
        const data = await res.json();

        loading.style.display = "none";
        resultDiv.style.display = "block";
        document.getElementById("timing").textContent = data.inference_time_ms;

        // Draw on canvas
        const canvas = document.getElementById("resultCanvas");
        const img = new Image();
        img.onload = () => drawDetections(canvas, img, data);
        img.src = URL.createObjectURL(selectedFile);

        // Detection list
        const listEl = document.getElementById("detectionList");
        if (data.detections.length === 0) {
          listEl.innerHTML = '<div class="no-detection">✅ Tidak ada kerusakan terdeteksi</div>';
        } else {
          listEl.innerHTML = data.detections.map(d => {
            const color = COLORS[d.class_name] || "#ef4444";
            return `
              <div class="detection-item" style="border-left-color:${color}">
                <span class="color-dot" style="background:${color}"></span>
                <span class="class-name">${d.class_name}</span>
                <span class="confidence">${(d.confidence * 100).toFixed(0)}%</span>
                <span class="coord">[${d.bbox.x1},${d.bbox.y1},${d.bbox.x2},${d.bbox.y2}]</span>
              </div>
            `;
          }).join("");
        }

      } catch (err) {
        loading.style.display = "none";
        alert("❌ " + err.message);
      } finally {
        btn.disabled = false;
      }
    }

    // ── Draw bboxes ──
    function drawDetections(canvas, image, data) {
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      for (const det of data.detections) {
        const { x1, y1, x2, y2 } = det.bbox;
        const color = COLORS[det.class_name] || "#ef4444";

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const label = `${det.class_name} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 14px sans-serif";
        const textW = ctx.measureText(label).width;

        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - 24, textW + 12, 24);

        ctx.fillStyle = "#fff";
        ctx.fillText(label, x1 + 6, y1 - 7);
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
| **FormData** | Gunakan `multipart/form-data` — kirim file via `FormData.append("file", ...)` |
| **Canvas drawing** | Gambar bounding box di atas foto asli pake `<canvas>` overlay |
| **Response mungkin 0 deteksi** | `num_detections: 0` berarti ga ada kerusakan terdeteksi — valid |
| **Confidence threshold** | Kasih slider/number input biar user bisa tuning `conf` & `iou` |
| **Koordinat bounding box** | `[x1, y1, x2, y2]` — pixel coordinate relative ke image size |
| **Loading state** | Inference ~250ms — tapi tetap kasih spinner ya |
| **Multiple detections** | Satu gambar bisa detect >1 kerusakan — tampilin semua |
| **Color coding** | Pake warna beda per kelas biar mudah dibaca |
| **Status server** | Cek `/health` dulu — disable tombol kalo server mati |

---

## 📦 Keterangan File

| File | Fungsi |
|---|---|
| `service/server.py` | Kode FastAPI utama (264 lines) |
| `service/run.sh` | Script start service |
| `Skenario 5/scenario_5_full_results/scenario_5_high_recall_insurance/weights/best.pt` | Model YOLOv12n (5.2 MB) |

---

## 📞 Kontak

| Role | Kontak |
|---|---|
| **Backend/DevOps** | Asisten Dosen (via Telegram) |
| **Service** | `http://localhost:8003` (sedang running 🟢) |
| **Dokumentasi ini** | `~/Public/riset-mahasiswa/car-damage-detection-using-yolov12n/service/API_DOCS.md` |
