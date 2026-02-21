# Batik Inpainting API - Complete Guide

**Precise Motif Editing with Mask-Based Control**

---

## 🎯 **What is Inpainting?**

Inpainting allows you to **edit specific areas** of an image while **preserving the rest**. Perfect for:

- ✅ Changing specific motifs
- ✅ Replacing colors in certain areas
- ✅ Adding new elements to specific regions
- ✅ Removing unwanted elements

---

## 🆚 **Comparison with Other Methods:**

| Method | Control Level | Precision | Best For |
|--------|---------------|-----------|----------|
| **Inpainting** | ✅ **Mask-based** | ✅ **Exact area** | **Specific edits** ⭐ |
| ControlNet | ⚠️ Structure-based | ⚠️ Whole image | Color change |
| IP-Adapter | ❌ Semantic only | ❌ Whole image | Style transfer |

**Inpainting is THE BEST for "ubah motif bunga jadi mawar"!**

---

## 🚀 **Quick Start:**

### **Step 1: Start Server**

```bash
cd ~/Public/batik_t2i_api/web_flask/inpainting
python image_editor_inpainting_api.py
# Server runs on port 8007
```

### **Step 2: Create Mask**

```bash
# Buat mask menggunakan create_mask.py
python create_mask.py --image Brendhi.jpg        # Generate SEMUA mask sekaligus
python create_mask.py --image Brendhi.jpg --list # Lihat daftar mask tersedia
python create_mask.py --image Brendhi.jpg --mask half_left  # Satu mask spesifik
```

Hasil mask yang dibuat (tersimpan di folder yang sama dengan gambar):
```
mask_full.png, mask_center.png, mask_center_small.png,
mask_quadrant_topleft.png, mask_quadrant_topright.png,
mask_quadrant_bottomleft.png, mask_quadrant_bottomright.png,
mask_half_left.png, mask_half_right.png, mask_half_top.png, mask_half_bottom.png,
mask_third_left.png, mask_third_center_v.png, mask_third_right.png,
mask_strip_top.png, mask_strip_bottom.png,
mask_cross.png, mask_ellipse_center.png, mask_ring.png,
mask_border.png, mask_four_corners.png
```

### **Step 3: Test Inpainting**

```bash
python test_inpainting.py
```

---

## 📋 **API Usage:**

### **Endpoint:** `POST /inpaint`

**Required Fields:**
- `image`: Original batik image (file upload)
- `mask`: Mask image — **putih = area yang DIUBAH, hitam = area yang DIPERTAHANKAN**
- `prompt`: Deskripsi apa yang ingin digenerate di area mask
- `scenario`: LoRA scenario yang digunakan

**Optional Fields:**

| Field | Default | Keterangan |
|-------|---------|-----------|
| `steps` | 30 | Inference steps (lebih tinggi = lebih detail) |
| `guidance_scale` | 7.5 | CFG scale — seberapa kuat ikut prompt |
| `seed` | -1 | Random seed (-1 = random) |
| `negative_prompt` | `"blurry, bad quality, distorted"` | Hal yang dihindari |
| `return_mask` | false | Jika `true`, return mask (untuk debug) |
| `strength` | 0.99 | ⚠️ *Diterima untuk kompatibilitas tapi **diabaikan** oleh pipeline* |

> ⚠️ **Catatan penting tentang `strength`:**
> Parameter `strength` **tidak berpengaruh** pada hasil inpainting.
> `StableDiffusionInpaintPipeline` tidak mendukung parameter ini (berbeda dengan img2img pipeline).
> Seberapa besar perubahan dikontrol oleh **kualitas mask** dan **guidance_scale**.

**Available Scenarios:**

| Scenario | Dataset |
|----------|---------|
| `scenario1` | Dataset batik dasar |
| `scenario2` | Extended dataset |
| `scenario2_1` s.d. `scenario2_5` | Sub-variant scenario 2 |
| `scenario3_1`, `scenario3_2` | Extended scenario 3 |
| `scenario4_1` ⭐ | Dataset terbaru (recommended) |
| `scenario4_1_1` | Alias untuk scenario4_1 |

---

## ⚙️ **Cara Kerja: Crop-Inpaint-Paste**

API menggunakan pendekatan **crop-inpaint-paste** untuk hasil yang optimal:

```
1. Deteksi bounding box area putih (mask)
2. Crop area tersebut dari gambar asli (+ padding 20%)
3. Resize crop ke 512×512 (resolusi full SD Inpainting)
4. Inpaint di resolusi 512×512 → detail maksimal
5. Resize hasil kembali ke ukuran crop asli
6. Paste kembali ke gambar original menggunakan mask
```

**Kenapa penting?** Tanpa pendekatan ini, mask kecil (misal 30% center dari gambar 512×512) hanya mengisi ~150×150px area di canvas SD — terlalu kecil untuk generate detail yang baik. Dengan crop-inpaint-paste, area mask selalu di-inpaint pada resolusi penuh 512×512.

---

## 🎨 **Example Use Cases:**

### **1. Ubah Motif di Tengah (mask_center)**

```python
files = {
    'image': open('Brendhi.jpg', 'rb'),
    'mask': open('mask_center.png', 'rb'),   # 50% tengah
}
data = {
    'prompt': 'traditional Javanese kawung batik motif, flat 2D pattern, cream and gold on dark navy, batik style illustration',
    'scenario': 'scenario4_1',
    'steps': 50,
    'guidance_scale': 9.0,
    'negative_prompt': 'realistic, photo, 3d, blurry, distorted, modern',
}
response = requests.post(f'{API_URL}/inpaint', files=files, data=data)
```

---

### **2. Ubah Warna Seluruh Area**

```python
files = {
    'image': open('Brendhi.jpg', 'rb'),
    'mask': open('mask_full.png', 'rb'),   # seluruh gambar
}
data = {
    'prompt': 'traditional batik cloth with deep red background, cream and gold motif, intricate batik style flat illustration',
    'scenario': 'scenario4_1',
    'steps': 50,
    'guidance_scale': 9.0,
    'negative_prompt': 'realistic, photo, 3d, blurry, distorted, navy, dark blue',
}
```

---

### **3. Edit Kuadran Tertentu**

```python
files = {
    'image': open('Brendhi.jpg', 'rb'),
    'mask': open('mask_quadrant_topleft.png', 'rb'),   # hanya kuadran kiri atas
}
data = {
    'prompt': 'traditional batik floral motif, red roses in batik style, flat illustration',
    'scenario': 'scenario4_1',
    'steps': 40,
    'guidance_scale': 9.0,
    'negative_prompt': 'realistic, photo, 3d, blurry, distorted',
}
```

---

### **4. Edit Setengah Gambar**

```python
files = {
    'image': open('Brendhi.jpg', 'rb'),
    'mask': open('mask_half_right.png', 'rb'),   # 50% sisi kanan
}
data = {
    'prompt': 'traditional batik with vibrant purple and gold geometric pattern, batik style flat illustration',
    'scenario': 'scenario4_1',
    'steps': 45,
    'guidance_scale': 9.5,
    'negative_prompt': 'realistic, photo, 3d, blurry, distorted, brown',
}
```

---

## 🖼️ **Creating Masks:**

### **Method 1: Gunakan `create_mask.py`**

```bash
# Generate semua mask sekaligus
python create_mask.py --image Brendhi.jpg

# Generate mask tertentu saja
python create_mask.py --image Brendhi.jpg --mask quadrant_topleft
python create_mask.py --image Brendhi.jpg --mask half_left
python create_mask.py --image Brendhi.jpg --mask center50

# Lihat semua mask yang tersedia
python create_mask.py --list
```

**Mask types yang tersedia:**

| Type | Deskripsi |
|------|-----------|
| `full` | Seluruh gambar |
| `center50` | Kotak tengah 50% |
| `center30` | Kotak tengah 30% (kecil) |
| `quadrant_tl/tr/bl/br` | Salah satu dari 4 kuadran |
| `half_left/right/top/bottom` | Setengah gambar |
| `third_left/center_v/right` | Sepertiga vertikal |
| `third_top/center_h/bottom` | Sepertiga horizontal |
| `strip_top/bottom/left/right` | Strip 20% di sisi tertentu |
| `cross` | Bentuk plus/salib di tengah |
| `ellipse_center` | Ellips/oval di tengah |
| `ring` | Donut/ring (tepi minus tengah) |
| `border` | Bingkai sekeliling gambar |
| `four_corners` | Keempat sudut sekaligus |

### **Method 2: Manual (Photoshop / GIMP)**

1. Buka gambar di Photoshop/GIMP
2. Buat layer baru
3. Cat **putih** di area yang ingin diubah
4. Cat **hitam** di area yang ingin dipertahankan
5. Export sebagai PNG grayscale

### **Method 3: Programmatic (Color-based)**

```python
from PIL import Image
import numpy as np

# Pilih area berdasarkan warna (misal: piksel cokelat)
img = Image.open('Brendhi.jpg')
img_array = np.array(img)

# Cari piksel yang warnanya mendekati cokelat (RGB ~139, 90, 43)
brown_mask = np.all(np.abs(img_array - [139, 90, 43]) < 30, axis=-1)

# Simpan mask
mask = Image.fromarray((brown_mask * 255).astype(np.uint8))
mask.save('mask_brown.png')
```

---

## ⚙️ **Parameter Tuning:**

### **Guidance Scale** ← *Inilah kontrol utama perubahan*

| Nilai | Efek | Use Case |
|-------|------|----------|
| **5–7** | Lebih bebas, kreatif | Eksplorasi gaya |
| **7.5** | Balanced (default) | General editing |
| **8.5–9** | Kuat ikut prompt | Target perubahan spesifik |
| **9.5–10** | Sangat kuat | Perubahan drastis |

> 💡 **Tips:** Gunakan `guidance_scale` tinggi (9–10) ketika ingin perubahan yang signifikan. Ini menggantikan fungsi `strength` yang tidak aktif.

### **Steps**

| Nilai | Kualitas | Kecepatan |
|-------|----------|-----------|
| 20–30 | Cukup | Cepat |
| 40–50 | Baik ⭐ | Sedang |
| 50+ | Diminishing returns | Lambat |

### **`strength` (Tidak Berpengaruh)**

Parameter ini **diterima** API untuk kompatibilitas backward tapi **tidak digunakan** oleh `StableDiffusionInpaintPipeline`. Seberapa besar perubahan dikontrol sepenuhnya oleh:
1. **Kualitas mask** (seberapa jelas area putih/hitam)
2. **`guidance_scale`** (seberapa kuat prompt diikuti)
3. **`steps`** (kualitas detail)

---

## 💡 **Pro Tips:**

### **1. Prompt yang Efektif untuk Batik**

✅ **Prompt yang bagus:**
```
"traditional Javanese kawung batik motif, flat 2D illustration, dark navy background,
cream and gold geometric pattern, intricate batik style"
```

❌ **Prompt yang buruk:**
```
"roses"   # Terlalu singkat, tidak ada konteks batik
```

**Kata kunci penting untuk prompt batik:**
- Style: `batik style`, `traditional batik`, `flat 2D illustration`, `hand-drawn batik`
- Textur: `intricate pattern`, `detailed motif`, `traditional Indonesian textile`
- Anti-realistis: tambahkan ke `negative_prompt` → `realistic, photo, 3d, gradient`

### **2. Negative Prompt yang Direkomendasikan**

```python
'negative_prompt': 'realistic, photo, 3d render, blurry, distorted, low quality, modern, gradient'
```

### **3. Mask Quality**

✅ **Mask yang bagus:**
- Putih jelas (255) dan hitam jelas (0)
- Tidak ada area abu-abu yang ambigu
- Ukuran minimal ~100×100px area putih

❌ **Mask yang buruk:**
- Area putih terlalu kecil (< 64×64px efektif)
- Banyak noise / gradasi

### **4. Debug Mask**

```python
# Kirim return_mask=true untuk melihat mask yang dipakai
data['return_mask'] = 'true'
response = requests.post(f'{API_URL}/inpaint', files=files, data=data)
# Response akan berisi file PNG mask (bukan hasil inpainting)
with open('debug_mask.png', 'wb') as f:
    f.write(response.content)
```

---

## 🔧 **Troubleshooting:**

### **Problem: Output tidak berubah sama sekali**

**Penyebab & Solusi:**
1. ✅ **Cek mask** — Pastikan area yang ingin diubah berwarna **putih** (255), bukan hitam
2. ✅ **Naikkan `guidance_scale`** ke 9–10
3. ✅ **Tambah kata di `negative_prompt`** yang menyebutkan warna/style asli yang ingin dihilangkan
4. ✅ **Gunakan `mask_center.png`** (bukan `mask_center_small`) agar area lebih besar dan terlihat

### **Problem: Hasil terlihat realistis/fotografi, tidak seperti batik**

**Solusi:**
```python
'negative_prompt': 'realistic, photo, 3d render, photorealistic, bokeh, depth of field'
'prompt': '... batik style, flat 2D illustration, traditional batik pattern ...'
```

### **Problem: Tepi antara area yang diedit dan yang tidak kelihatan tidak natural**

**Solusi:**
- Gunakan mask yang sedikit lebih besar dari target area
- Tambahkan `"seamless, blending"` ke prompt
- Engine otomatis melakukan dilasi mask 9px untuk blending

### **Problem: Area yang salah berubah**

**Solusi:**
- Gunakan `return_mask=true` untuk verifikasi mask
- Ingat: **putih = berubah, hitam = dipertahankan**
- Pastikan ukuran mask sama dengan ukuran gambar

---

## 🌐 **cURL Examples:**

### Generate Motif Baru (full mask)

```bash
curl -X POST http://localhost:8007/inpaint \
  -F "image=@Brendhi.jpg" \
  -F "mask=@mask_full.png" \
  -F "prompt=traditional batik kawung motif, dark navy background, cream and gold, batik style flat illustration" \
  -F "scenario=scenario4_1" \
  -F "steps=50" \
  -F "guidance_scale=9.0" \
  -F "negative_prompt=realistic, photo, 3d, blurry" \
  -o result_new_motif.jpg
```

### Edit Area Tengah

```bash
curl -X POST http://localhost:8007/inpaint \
  -F "image=@Brendhi.jpg" \
  -F "mask=@mask_center.png" \
  -F "prompt=traditional batik floral motif, red roses in batik style, flat illustration" \
  -F "scenario=scenario4_1" \
  -F "steps=50" \
  -F "guidance_scale=9.5" \
  -o result_center_edit.jpg
```

### Debug Mask

```bash
curl -X POST http://localhost:8007/inpaint \
  -F "image=@Brendhi.jpg" \
  -F "mask=@mask_center.png" \
  -F "prompt=test" \
  -F "scenario=scenario4_1" \
  -F "return_mask=true" \
  -o debug_mask.png
```

---

## ✅ **Health Check**

```bash
curl http://localhost:8007/health
# Response: { "status": "healthy", "base_model": "runwayml/stable-diffusion-inpainting", ... }
```

```bash
curl http://localhost:8007/
# Response: info endpoint termasuk available_scenarios
```

---

## 🎯 **Contoh Lengkap: Ubah Motif Tengah jadi Truntum**

```python
import requests

API_URL = "http://localhost:8007"

files = {
    'image': open('Brendhi.jpg', 'rb'),
    'mask': open('mask_center.png', 'rb'),
}
data = {
    'prompt': 'traditional Javanese truntum batik motif, small star flower pattern, cream dots and stars on dark navy, intricate batik style, flat 2D textile pattern',
    'scenario': 'scenario4_1',
    'steps': 50,
    'guidance_scale': 9.0,
    'negative_prompt': 'realistic, photo, 3d, blurry, distorted, modern, large flowers',
    'seed': -1,
}

response = requests.post(f'{API_URL}/inpaint', files=files, data=data)

if response.status_code == 200:
    with open('result_truntum.jpg', 'wb') as f:
        f.write(response.content)
    print(f"✓ Saved! Seed: {response.headers.get('X-Seed')}")
else:
    print(f"✗ Error: {response.json()}")
```

---

**Selamat mencoba Inpainting! 🎨**
