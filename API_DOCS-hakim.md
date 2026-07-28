# Batik Nitik 960 — Text-to-Image API Documentation

**Base URL:** `http://localhost:8004`  
**Versi:** 1.0.0  
**Status:** 🔴 Service dimatikan hubungi asisten dosen untuk nyalakan

---

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Endpoint](#-endpoint)
  - [GET /health](#1-get-health) — Cek status
  - [GET /variants](#2-get-variants) — Daftar LoRA variant
  - [POST /generate](#3-post-generate) — **Generate gambar batik** ⭐
- [Response Codes](#-response-codes)
- [Panduan LoRA Variant](#-panduan-lora-variant)
- [Contoh Frontend (JavaScript)](#-contoh-frontend-javascript)
- [Contoh Frontend (HTML Lengkap)](#-contoh-frontend-html-lengkap)
- [Tips untuk Frontend Dev](#-tips-untuk-frontend-dev)

---

## 🎯 Gambaran Umum

API ini menghasilkan gambar **motif Batik Nitik** dari teks prompt menggunakan Stable Diffusion v1.5 yang di fine-tune dengan 4 strategi caption (LoRA).

| LoRA Variant | CLIP ↑ | FID ↓ | Cocok Untuk |
|---|---|---|---|
| **Replication** *(default)* | 0.3310 | 170.33 | Generate cepat — cukup nama motif aja |
| **Generic** | 0.3218 | **121.81** | Prompt umum & sederhana |
| **Descriptive** | 0.3259 | 130.28 | Prompt deskriptif & detail visual |
| **Chain-of-Thought** | **0.3448** | 169.46 | Prompt bercerita/bertahap — CLIP tertinggi |

> 💡 **Rekomendasi:** Mulai pake `cot` buat kualitas CLIP tertinggi, atau `generic` buat FID terendah (mirip dataset asli).

---

## 🔌 Endpoint

### 1. GET /health

Cek status server dan LoRA aktif.

**Request:**
```
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "model_loaded": true,
  "device": "cuda:0",
  "active_lora": "replication",
  "lora_variants": ["replication", "generic", "descriptive", "cot"]
}
```

---

### 2. GET /variants

Daftar LoRA variant caption strategy.

**Request:**
```
GET /variants
```

**Response (200):**
```json
{
  "variants": [
    {
      "id": "replication",
      "name": "Replication",
      "description": "Motif name only (baseline)"
    },
    {
      "id": "generic",
      "name": "Generic",
      "description": "General visual description"
    },
    {
      "id": "descriptive",
      "name": "Descriptive",
      "description": "Detailed visual description"
    },
    {
      "id": "cot",
      "name": "CoT (Chain-of-Thought)",
      "description": "Reasoning-based structured caption"
    }
  ]
}
```

---

### 3. POST /generate ⭐

**Endpoint utama — generate motif Batik Nitik dari teks.**

#### Request

**Method:** `POST`  
**Content-Type:** `application/json`  
**URL:** `/generate`

| Field | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `prompt` | String | ✅ Ya | — | Teks deskripsi motif batik (jangan kosong) |
| `lora` | String | ❌ | `"replication"` | Pilihan LoRA: `replication`, `generic`, `descriptive`, `cot` |
| `cfg` | Float | ❌ | `7.0` | Guidance scale (1–20). Makin tinggi → makin sesuai prompt |
| `steps` | Int | ❌ | `30` | Inference steps (1–100). Makin banyak → makin detail |
| `seed` | Int | ❌ | Random | Seed untuk reproducibility. Pake angka fixed biar hasil sama |

**Contoh Request (curl):**
```bash
curl -X POST http://localhost:8004/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Batik Nitik Cinde Wilis dengan ornamen geometris dan pola nitik khas Yogyakarta",
    "lora": "cot",
    "cfg": 9,
    "steps": 40,
    "seed": 42
  }'
```

**Contoh Request (JavaScript fetch):**
```js
const response = await fetch("http://localhost:8004/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Batik Nitik Cinde Wilis",
    lora: "replication",
    cfg: 7,
    steps: 30,
  }),
});

const data = await response.json();
```

#### Response (200 OK)

```json
{
  "success": true,
  "image_b64": "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAC...",
  "prompt": "Batik Nitik Cinde Wilis",
  "lora": "replication",
  "cfg": 7.0,
  "steps": 30,
  "seed": 42,
  "width": 512,
  "height": 512,
  "inference_time_ms": 4567.57
}
```

#### Penjelasan Response

| Field | Tipe | Keterangan |
|---|---|---|
| `success` | Boolean | `true` jika generate berhasil |
| `image_b64` | String | **Gambar PNG dalam base64** — langsung bisa dipake di `<img src="data:image/png;base64,...">` |
| `prompt` | String | Prompt yang dikirim |
| `lora` | String | LoRA variant yang dipake |
| `cfg` | Float | CFG scale yang dipake |
| `steps` | Int | Inference steps |
| `seed` | Int | Seed yang dipake (random jika ga dikirim) |
| `width` | Int | Lebar output (512) |
| `height` | Int | Tinggi output (512) |
| `inference_time_ms` | Float | Waktu generate dalam milidetik (~4-5 detik) |

---

## 📊 Response Codes

| Status | Makna |
|---|---|
| `200` | ✅ Sukses — gambar berhasil di-generate |
| `400` | ❌ Bad Request — prompt kosong, LoRA ga valid, atau parameter di luar range |
| `503` | ❌ Service Unavailable — model belum siap |

---

## 🧪 Panduan LoRA Variant

### Replication — "Nama motif aja"
```
Batik Nitik Cinde Wilis
```
Paling sederhana, hasil mirip dataset asli.

### Generic — "Deskripsi umum"
```
Traditional Batik Nitik motif with geometric patterns.
```
Hasil FID paling rendah — paling mirip dataset asli secara visual.

### Descriptive — "Deskripsi detail"
```
Traditional Batik Nitik motif featuring symmetrical geometric ornaments with dotted textures and floral decorations.
```
Detail visual lebih kaya.

### CoT (Chain-of-Thought) — "Bertahap reasoning" 🏆
```
Batik Nitik motifs are characterized by repeating geometric patterns and dotted textures. The ornaments are arranged symmetrically, creating a balanced composition. Floral decorative elements enhance the traditional appearance. This is a Batik Nitik Cinde Wilis motif.
```
**CLIP score tertinggi** — paling cocok sama prompt yang dikirim.

---

## 💻 Contoh Frontend (JavaScript)

```javascript
const API_URL = "http://localhost:8004";

// 🔥 Generate motif batik
async function generateBatik(prompt, lora = "replication", cfg = 7, steps = 30, seed = null) {
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, lora, cfg, steps, seed }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Gagal generate");
    }

    return await response.json();
  } catch (error) {
    console.error("Generate error:", error);
    return null;
  }
}

// ✅ Cek status
async function checkHealth() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}

// 📋 Ambil daftar LoRA variant
async function getVariants() {
  const res = await fetch(`${API_URL}/variants`);
  return res.json();
}

// 🖼️ Tampilkan gambar di HTML
function displayImage(data) {
  const img = document.getElementById("outputImage");
  img.src = `data:image/png;base64,${data.image_b64}`;

  // Info
  document.getElementById("info").innerHTML = `
    Prompt: "${data.prompt}"<br>
    LoRA: ${data.lora} | CFG: ${data.cfg} | Steps: ${data.steps} | Seed: ${data.seed}<br>
    ⏱ ${(data.inference_time_ms / 1000).toFixed(1)}s
  `;
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
  <title>Batik Nitik Generator</title>
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

    textarea {
      width: 100%; min-height: 80px;
      background: #161b22; border: 1px solid #30363d;
      border-radius: 8px; padding: 12px; color: #e6edf3;
      font-size: 14px; resize: vertical;
    }
    textarea:focus { outline: none; border-color: #58a6ff; }

    .controls {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 12px; margin: 16px 0;
    }
    .control-group label {
      display: block; font-size: 12px; color: #8b949e; margin-bottom: 4px;
    }
    .control-group select, .control-group input {
      width: 100%; padding: 8px;
      background: #161b22; border: 1px solid #30363d;
      border-radius: 6px; color: #e6edf3; font-size: 13px;
    }

    button {
      width: 100%; padding: 14px; font-size: 16px; font-weight: 600;
      background: #238636; border: none; border-radius: 8px;
      color: #fff; cursor: pointer; margin: 16px 0;
      transition: background 0.2s;
    }
    button:hover { background: #2ea043; }
    button:disabled { background: #21262d; color: #484f58; cursor: not-allowed; }

    .output-area {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 12px; padding: 20px; margin-top: 20px;
      display: none;
    }
    .output-area img {
      max-width: 100%; border-radius: 8px;
      display: block; margin: 0 auto;
    }
    .output-info {
      margin-top: 12px; font-size: 13px; color: #8b949e;
      line-height: 1.8;
    }
    .loading {
      text-align: center; padding: 40px; display: none;
    }
    .spinner {
      border: 3px solid #30363d; border-top: 3px solid #58a6ff;
      border-radius: 50%; width: 40px; height: 40px;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .examples {
      display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0;
    }
    .example-btn {
      padding: 6px 12px; font-size: 12px;
      background: #21262d; border: 1px solid #30363d;
      border-radius: 20px; color: #c9d1d9; cursor: pointer;
    }
    .example-btn:hover { border-color: #58a6ff; }

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
    <h1>🦋 Batik Nitik Generator</h1>
    <p class="subtitle">Text-to-Image Batik — SD1.5 + LoRA</p>

    <div id="status" class="status">🔄 Mengecek server...</div>

    <!-- Prompt -->
    <textarea id="promptInput" placeholder="Contoh: Batik Nitik Cinde Wilis dengan ornamen geometris khas Yogyakarta...">Batik Nitik Cinde Wilis</textarea>

    <!-- Quick examples -->
    <div class="examples">
      <span class="example-btn" onclick="fillPrompt('Batik Nitik Cinde Wilis')">Cinde Wilis</span>
      <span class="example-btn" onclick="fillPrompt('Batik Nitik Cakar Ayam dengan pola geometris tradisional')">Cakar Ayam</span>
      <span class="example-btn" onclick="fillPrompt('Batik Nitik Arumdalu dengan nuansa floral dan motif nitik khas')">Arumdalu</span>
      <span class="example-btn" onclick="fillPrompt('Traditional Batik Nitik motif featuring symmetrical geometric ornaments with dotted textures')">English Prompt</span>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <label>LoRA Variant</label>
        <select id="loraSelect">
          <option value="replication">Replication (nama motif)</option>
          <option value="generic" selected>Generic (deskripsi umum)</option>
          <option value="descriptive">Descriptive (detail visual)</option>
          <option value="cot">CoT (chain-of-thought) 🏆</option>
        </select>
      </div>
      <div class="control-group">
        <label>CFG Scale</label>
        <input type="number" id="cfgInput" value="7" min="1" max="20" step="0.5">
      </div>
      <div class="control-group">
        <label>Inference Steps</label>
        <input type="number" id="stepsInput" value="30" min="1" max="100" step="1">
      </div>
      <div class="control-group">
        <label>Seed (kosong = random)</label>
        <input type="number" id="seedInput" placeholder="Random" min="0">
      </div>
    </div>

    <!-- Generate Button -->
    <button id="genBtn" onclick="generate()">🎨 Generate Batik</button>

    <!-- Loading -->
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>⏳ Generate gambar ... (~4-5 detik)</p>
    </div>

    <!-- Output -->
    <div class="output-area" id="outputArea">
      <img id="outputImage" alt="Generated Batik">
      <div class="output-info" id="outputInfo"></div>
      <a class="download-btn" id="downloadBtn" download="batik-nitik.png">⬇ Download PNG</a>
    </div>
  </div>

  <script>
    const API_URL = "http://localhost:8004";

    // ── Health Check ──
    async function checkHealth() {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        if (data.status === "ok" && data.model_loaded) {
          document.getElementById("status").textContent =
            `✅ Server online | LoRA aktif: ${data.active_lora} | Device: ${data.device}`;
          document.getElementById("status").className = "status online";
          document.getElementById("genBtn").disabled = false;
        } else {
          throw new Error("Model not loaded");
        }
      } catch {
        document.getElementById("status").textContent =
          "❌ Server offline — hubungi asisten dosen untuk menyalakan service";
        document.getElementById("status").className = "status offline";
        document.getElementById("genBtn").disabled = true;
      }
    }

    // ── Fill prompt from example ──
    function fillPrompt(text) {
      document.getElementById("promptInput").value = text;
    }

    // ── Generate ──
    async function generate() {
      const prompt = document.getElementById("promptInput").value.trim();
      if (!prompt) return alert("Prompt tidak boleh kosong!");

      const btn = document.getElementById("genBtn");
      const loading = document.getElementById("loading");
      const outputArea = document.getElementById("outputArea");
      const outputImage = document.getElementById("outputImage");
      const outputInfo = document.getElementById("outputInfo");

      btn.disabled = true;
      loading.style.display = "block";
      outputArea.style.display = "none";

      const body = {
        prompt,
        lora: document.getElementById("loraSelect").value,
        cfg: parseFloat(document.getElementById("cfgInput").value) || 7,
        steps: parseInt(document.getElementById("stepsInput").value) || 30,
        seed: parseInt(document.getElementById("seedInput").value) || null,
      };

      try {
        const res = await fetch(`${API_URL}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error((await res.json()).detail || "Gagal");

        const data = await res.json();

        loading.style.display = "none";
        outputArea.style.display = "block";

        outputImage.src = `data:image/png;base64,${data.image_b64}`;

        const infoLines = [
          `🖼 Prompt: <strong>"${data.prompt}"</strong>`,
          `🧩 LoRA: <strong>${data.lora}</strong> | CFG: ${data.cfg} | Steps: ${data.steps} | Seed: <strong>${data.seed}</strong>`,
          `⏱ ${(data.inference_time_ms / 1000).toFixed(1)} detik | 📐 ${data.width}×${data.height}`,
        ];
        outputInfo.innerHTML = infoLines.join("<br>");

        // Download
        const link = document.getElementById("downloadBtn");
        link.href = outputImage.src;
        link.download = `batik-nitik-${data.lora}-${data.seed}.png`;

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
| **Image base64** | Langsung bisa di render: `<img src="data:image/png;base64,${data.image_b64}">` |
| **Loading state** | Generate butuh ~4-5 detik — **wajib tampilkan spinner/progress!** |
| **Seed** | Biarkan `null` untuk random, atau pake angka fixed biar hasil sama persis tiap prompt sama |
| **CFG scale** | `5-9` range ideal. `3-` = lebih kreatif (kurang sesuai prompt). `12+` = sangat sesuai prompt (warna jenuh) |
| **Steps** | `20-30` = cepat & OK. `40-50` = detail lebih halus (2× waktu) |
| **LoRA pilihan** | Sediakan dropdown biar user milih variant. Rekomendasi: `generic` atau `cot` |
| **Download** | Bisa kasih tombol download PNG dari base64 (pakai `download` attr di `<a>`) |
| **Contoh prompt** | Sediakan beberapa contoh prompt motif biar user ga bingung |
| **Status server** | Cek `/health` sebelum generate — service mati otomatis disable button |
| **Image dimension** | Selalu 512×512 — frontend bisa CSS resize sesuai layout |

---

## 📦 Keterangan File

| File | Fungsi |
|---|---|
| `service/server.py` | Kode FastAPI utama (241 lines) |
| `service/run.sh` | Script start service |
| `models/*/pytorch_lora_weights.safetensors` | 4 LoRA weights (masing-masing 6.2MB) |

---

## 📞 Kontak

| Role | Kontak |
|---|---|
| **Backend/DevOps** | Asisten Dosen (via Telegram) |
| **Service** | `http://localhost:8004` (mati — hubungi untuk nyalakan) |
| **Dokumentasi ini** | `~/Public/riset-mahasiswa/generative-ai-batik-nitik-960-sd15-lora/service/API_DOCS.md` |
