# Batik ControlNet API - Complete Guide

**Structure-Preserving Image Editing dengan ControlNet**

---

## 🎯 **Apa itu ControlNet API?**

ControlNet API memungkinkan editing gambar batik dengan **mempertahankan struktur/pola asli** sambil mengubah warna, style, atau motif. Berbeda dengan inpainting yang mengedit area tertentu, ControlNet mengedit **seluruh gambar** dengan panduan kondisi struktural.

**Cara kerjanya:**
1. Input gambar diekstrak menjadi **control image** (edge map / depth map)
2. Control image digunakan sebagai panduan ke SD pipeline
3. Pipeline generate gambar baru yang mengikuti struktur control image

---

## 🆚 **Kapan Pilih ControlNet vs Cara Lain?**

| Method | Kekuatan | Kelemahan | Terbaik untuk |
|--------|----------|-----------|---------------|
| **ControlNet** | Preservasi struktur motif | Seluruh gambar berubah | Ganti warna/style keseluruhan ⭐ |
| **Inpainting** | Edit area spesifik | Tidak ada kontrol struktur | Ganti motif di area tertentu |
| **IP-Adapter** | Style transfer | Tidak presisi | Transfer gaya dari gambar lain |

---

## 🚀 **Quick Start:**

### **Step 1: Start Server**

```bash
cd ~/Public/batik_t2i_api/web_flask/controlnet
python image_editor_controlnet_api.py
# Server berjalan di port 8004
```

### **Step 2: Health Check**

```bash
curl http://localhost:8004/health
```

Response:
```json
{
  "status": "healthy",
  "service": "Batik ControlNet API",
  "cuda_available": true,
  "cuda_devices": 2,
  "current_scenario": null,
  "method": "ControlNet (Canny Edge)"
}
```

### **Step 3: Test Edit**

```python
import requests

response = requests.post("http://localhost:8004/edit", files={
    "image": open("Brendhi.jpg", "rb"),
}, data={
    "prompt": "batik cloth with deep red background, cream and gold motif",
    "scenario": "scenario2",
})

with open("result.jpg", "wb") as f:
    f.write(response.content)
```

---

## 📋 **API Reference**

### `GET /` atau `GET /health`

Info service dan health check.

---

### `POST /edit` atau `POST /api/edit`

Edit gambar batik menggunakan ControlNet.

**Content-Type:** `multipart/form-data`

#### **Required Fields:**

| Field | Type | Keterangan |
|-------|------|-----------|
| `image` | file | Gambar batik input (JPG/PNG) |
| `prompt` | string | Deskripsi hasil yang diinginkan |
| `scenario` | string | LoRA scenario yang digunakan |

#### **Optional Fields:**

| Field | Type | Default | Range | Keterangan |
|-------|------|---------|-------|-----------|
| `controlnet_type` | string | `canny` | `canny`, `depth`, `softedge` | Jenis ControlNet yang digunakan |
| `controlnet_scale` | float | `1.0` | `0.0–2.0` | Seberapa kuat kontrol struktur |
| `steps` | int | `30` | `20–100` | Inference steps |
| `guidance_scale` | float | `7.5` | `5–15` | Seberapa kuat ikut prompt |
| `seed` | int | `-1` | any | Random seed (-1 = random) |
| `negative_prompt` | string | `"blurry, bad quality, distorted"` | - | Yang ingin dihindari |
| `canny_low` | int | `100` | `0–255` | Canny edge threshold bawah *(hanya untuk `controlnet_type=canny`)* |
| `canny_high` | int | `200` | `0–255` | Canny edge threshold atas *(hanya untuk `controlnet_type=canny`)* |
| `return_edge` | bool | `false` | - | Jika `true`, return edge map (untuk debug) |

#### **Available Scenarios:**

| Scenario | Keterangan |
|----------|-----------|
| `scenario1` | Dataset batik dasar |
| `scenario2` ⭐ | Extended dataset (recommended untuk ControlNet) |
| `scenario2_1` s.d. `scenario2_5` | Sub-variant scenario 2 |
| `scenario3_1`, `scenario3_2` | Extended scenario 3 |

> **Catatan:** `scenario4_1` dan `scenario4_1_1` **tidak tersedia** di ControlNet API ini (hanya ada di Inpainting API).

#### **Response:**

**Success (200):**
- Body: gambar JPEG hasil editing
- Header `X-Seed`: seed aktual yang digunakan

**Error (400/500):**
```json
{ "error": "pesan error" }
```

---

## 🔧 **ControlNet Types: Perbedaan & Kapan Dipakai**

### **1. `canny` (Default) — Canny Edge Detection**

Mengekstrak **garis tepi/kontur** gambar menggunakan algoritma Canny.

```
Input batik → deteksi edge → garis hitam-putih → panduan ke SD
```

**Karakteristik:**
- ✅ Preservasi garis motif paling tajam dan detail
- ✅ Cocok untuk motif geometris (Kawung, Parang, dll)
- ⚠️ Bisa terlalu "kaku" untuk motif organik
- ✅ Tidak butuh library tambahan

**Parameter tambahan:**
- `canny_low` (default 100): threshold bawah — **turunkan** untuk lebih banyak edge
- `canny_high` (default 200): threshold atas — **naikkan** untuk edge lebih selektif

```python
# Lebih banyak detail (banyak edge)
data = { 'controlnet_type': 'canny', 'canny_low': 50, 'canny_high': 150 }

# Hanya garis besar saja (sedikit edge)
data = { 'controlnet_type': 'canny', 'canny_low': 150, 'canny_high': 250 }
```

---

### **2. `softedge` — Soft Edge Detection (HED)**

Mengekstrak edge yang lebih **halus dan lembut** menggunakan HED (Holistically-nested Edge Detection).

```
Input batik → soft edge → gradasi abu-abu → panduan ke SD
```

**Karakteristik:**
- ✅ Edge lebih natural dan organik
- ✅ SD punya lebih banyak kebebasan kreatif
- ✅ Cocok untuk motif florals, curves
- ⚠️ Membutuhkan `controlnet_aux` library (`pip install controlnet-aux`)
- ⚠️ Fallback ke Canny jika library tidak tersedia

**Pilih softedge jika:** Ingin preservasi struktur tapi hasil lebih mengalir dan natural.

---

### **3. `depth` — Depth Estimation (MiDaS)**

Mengekstrak **peta kedalaman** gambar menggunakan MiDaS.

```
Input batik → estimasi kedalaman → grayscale depth map → panduan ke SD
```

**Karakteristik:**
- ✅ Preservasi dimensi / perspektif
- ⚠️ Kurang optimal untuk batik (batik bersifat flat 2D)
- ⚠️ Membutuhkan `controlnet_aux` library
- ⚠️ Fallback ke grayscale jika library tidak tersedia

**Pilih depth jika:** Batik dipotret dengan perspektif/sudut tertentu (bukan foto flat).

---

## ⚙️ **Parameter Tuning**

### **`controlnet_scale`** ← *Kontrol keseimbangan struktur vs kreativitas*

| Nilai | Efek | Use Case |
|-------|------|----------|
| `0.3–0.5` | Bebas kreatif, sedikit ikut struktur | Eksplorasi gaya baru |
| `0.7–0.8` | Seimbang ⭐ | General editing |
| `1.0` | Kuat ikut struktur (default) | Ganti warna/style |
| `1.3–1.5` | Sangat kuat ikut struktur | Hanya ganti warna minimal |
| `>1.5` | Ekstrem — bisa muncul artefak | Tidak direkomendasikan |

### **`guidance_scale`** ← *Seberapa kuat SD mengikuti prompt*

| Nilai | Efek |
|-------|------|
| `5–7` | Lebih bebas / kreatif |
| `7.5` | Balanced (default) |
| `8.5–10` | Kuat ikut prompt |
| `>10` | Bisa over-saturated |

### **`steps`**

| Nilai | Kualitas | Kecepatan |
|-------|----------|-----------|
| `20–25` | Cukup | Cepat |
| `30` | Baik (default) | Sedang |
| `40–50` | Sangat baik | Lambat |

---

## 🎨 **Contoh Use Cases**

### **Case 1: Ganti Warna Background (Navy → Merah)**

```python
import requests

files = {"image": open("Brendhi.jpg", "rb")}
data = {
    "prompt": "traditional batik cloth with deep red crimson background, cream and gold motif pattern, intricate traditional batik style",
    "scenario": "scenario2",
    "controlnet_type": "canny",
    "controlnet_scale": "1.0",
    "steps": "40",
    "guidance_scale": "8.0",
    "negative_prompt": "navy, dark blue, blurry, distorted, modern, realistic",
}

r = requests.post("http://localhost:8004/edit", files=files, data=data)
with open("result_red.jpg", "wb") as f:
    f.write(r.content)
print(f"Seed: {r.headers.get('X-Seed')}")
```

---

### **Case 2: Ganti Warna Aksen (Cokelat → Emas)**

```python
files = {"image": open("Brendhi.jpg", "rb")}
data = {
    "prompt": "traditional batik cloth, dark navy background, bright gold and cream accent motif, luxurious royal Javanese batik style",
    "scenario": "scenario2",
    "controlnet_type": "canny",
    "controlnet_scale": "1.0",
    "steps": "40",
    "guidance_scale": "8.0",
    "negative_prompt": "brown, orange, blurry, distorted, modern",
}
r = requests.post("http://localhost:8004/edit", files=files, data=data)
```

---

### **Case 3: Ubah Style (Modern) dengan Softedge**

```python
files = {"image": open("Brendhi.jpg", "rb")}
data = {
    "prompt": "modern contemporary batik pattern with vibrant purple and teal colors, clean geometric motif, modern Indonesian textile design",
    "scenario": "scenario2",
    "controlnet_type": "softedge",  # lebih fleksibel untuk style baru
    "controlnet_scale": "0.7",       # turunkan agar lebih bebas
    "steps": "40",
    "guidance_scale": "9.0",
    "negative_prompt": "traditional, old, navy, brown, blurry",
}
r = requests.post("http://localhost:8004/edit", files=files, data=data)
```

---

### **Case 4: Preservasi Motif Ketat, Hanya Ganti Warna**

```python
files = {"image": open("Brendhi.jpg", "rb")}
data = {
    "prompt": "same batik motif pattern, bright emerald green and gold colors, traditional batik style",
    "scenario": "scenario2",
    "controlnet_type": "canny",
    "controlnet_scale": "1.3",   # tinggi = sangat ikut struktur
    "canny_low": "70",
    "canny_high": "160",
    "steps": "40",
    "guidance_scale": "7.5",
    "negative_prompt": "navy, dark blue, brown, blurry, distorted",
}
r = requests.post("http://localhost:8004/edit", files=files, data=data)
```

---

### **Case 5: Debug — Lihat Edge Map yang Dipakai**

```python
files = {"image": open("Brendhi.jpg", "rb")}
data = {
    "prompt": "test",
    "scenario": "scenario2",
    "controlnet_type": "canny",
    "return_edge": "true",   # return edge map, bukan hasil edit
}

r = requests.post("http://localhost:8004/edit", files=files, data=data)
with open("debug_edge.jpg", "wb") as f:
    f.write(r.content)
# Buka debug_edge.jpg untuk lihat apa yang "dilihat" ControlNet
```

---

## 🌐 **cURL Examples**

### Edit Basic

```bash
curl -X POST http://localhost:8004/edit \
  -F "image=@Brendhi.jpg" \
  -F "prompt=traditional batik with red background, cream gold motif" \
  -F "scenario=scenario2" \
  -F "controlnet_type=canny" \
  -F "controlnet_scale=1.0" \
  -F "steps=40" \
  -F "guidance_scale=8.0" \
  -F "negative_prompt=blurry, distorted, modern, navy" \
  -o result.jpg
```

### Debug Edge Map

```bash
curl -X POST http://localhost:8004/edit \
  -F "image=@Brendhi.jpg" \
  -F "prompt=test" \
  -F "scenario=scenario2" \
  -F "return_edge=true" \
  -o debug_edge.jpg
```

### Dengan Seed Spesifik (dan lihat header X-Seed)

```bash
curl -X POST http://localhost:8004/edit \
  -F "image=@Brendhi.jpg" \
  -F "prompt=batik with emerald green background, gold motif" \
  -F "scenario=scenario2" \
  -F "seed=42" \
  -o result_seed42.jpg -D -
```

---

## 💡 **Integrasi Next.js**

```javascript
// utils/controlnet.js
export async function editBatikControlNet({
  imageFile,
  prompt,
  scenario = "scenario2",
  controlnetType = "canny",
  controlnetScale = 1.0,
  steps = 40,
  guidanceScale = 8.0,
  negativePrompt = "blurry, distorted, modern",
}) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("prompt", prompt);
  formData.append("scenario", scenario);
  formData.append("controlnet_type", controlnetType);
  formData.append("controlnet_scale", String(controlnetScale));
  formData.append("steps", String(steps));
  formData.append("guidance_scale", String(guidanceScale));
  formData.append("negative_prompt", negativePrompt);

  const BASE_URL = process.env.NEXT_PUBLIC_CONTROLNET_API_URL || "http://localhost:8004";

  const response = await fetch(`${BASE_URL}/edit`, {
    method: "POST",
    body: formData,
    // Jangan set Content-Type header — biarkan browser auto-set boundary
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Edit failed");
  }

  const seed = response.headers.get("X-Seed");
  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  return { imageUrl, seed: parseInt(seed) };
}
```

**Penggunaan di React component:**

```jsx
import { editBatikControlNet } from "@/utils/controlnet";

export default function EditPage() {
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = async (file) => {
    setLoading(true);
    try {
      const { imageUrl, seed } = await editBatikControlNet({
        imageFile: file,
        prompt: "traditional batik with red background",
        scenario: "scenario2",
        controlnetType: "canny",
        controlnetScale: 1.0,
      });
      setResultUrl(imageUrl);
      console.log("Seed used:", seed); // simpan seed untuk reproduksi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleEdit(e.target.files[0])} />
      {loading && <p>Generating...</p>}
      {resultUrl && <img src={resultUrl} alt="Hasil edit batik" />}
    </div>
  );
}
```

---

## 📊 **Perbandingan ControlNet Types**

| | Canny | SoftEdge | Depth |
|--|-------|----------|-------|
| **Preservasi garis** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Kebebasan kreatif** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cocok untuk batik flat** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Kecepatan load** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Library tambahan** | ❌ Tidak perlu | ✅ controlnet-aux | ✅ controlnet-aux |
| **Fallback jika error** | — | Canny | Grayscale |

**Rekomendasi mulai:** `canny` dengan `controlnet_scale=1.0` → paling stabil dan tidak butuh library tambahan.

---

## 🔧 **Troubleshooting**

### **Hasil tidak mirip gaya batik**
```python
"prompt": "... traditional Javanese batik style, intricate batik pattern, flat 2D textile ..."
"negative_prompt": "realistic, photo, 3d, modern, gradient"
```

### **Struktur motif hilang / berubah terlalu drastis**
```python
"controlnet_scale": "1.2"   # naikkan
"canny_low": "70", "canny_high": "150"   # lebih banyak edge
```

### **Warna tidak berubah cukup**
```python
"negative_prompt": "navy, dark blue, brown, ..."   # sebutkan warna asli
"controlnet_scale": "0.8"   # turunkan agar lebih ikut prompt
"guidance_scale": "9.0"     # naikkan
```

### **`softedge` atau `depth` error**
```bash
pip install controlnet-aux
# Jika masih error, API akan otomatis fallback ke Canny
```

### **VRAM out of memory**
- Resize gambar input ke 512×512 sebelum dikirim
- Kurangi `steps` ke 20–25
- Tutup service lain yang pakai GPU

---

**Selamat mencoba ControlNet API! 🎨**
