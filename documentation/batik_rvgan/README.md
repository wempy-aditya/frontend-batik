# 🎨 Batik Generator REST API

REST API backend untuk menghasilkan pola batik menggunakan AI/Machine Learning models (ONNX). API ini dirancang untuk diintegrasikan dengan frontend yang sudah ada.

## ✨ Fitur API

- 🔍 **Dataset Management**: Get available datasets dan informasi patch
- 🖼️ **Patch Retrieval**: Random patches dan similarity search
- 🧠 **Multiple AI Models**: Support 3 model GAN (BatikRVGAN, BatikGAN-SL, BatikGAN-CL)
- 🎨 **Image Generation**: Generate batik dari kombinasi 2 patch
- 📥 **File Management**: Download dan gallery management
- 🌐 **CORS Enabled**: Siap diintegrasikan dengan frontend dari domain berbeda
- 📊 **Base64 Support**: Return image sebagai base64 atau file URL

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)

## 🚀 Instalasi

### 1. Install Dependencies

```bash
cd batik-flask-app
pip install -r requirements.txt
```

### 2. Setup Data Files

Jalankan setup script untuk copy file dari Django app:

**Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

Atau copy manual:
```powershell
# Copy NPY files
Copy-Item -Path "..\batikrvgan\app\web\app\npy" -Destination "." -Recurse

# Copy Model files  
Copy-Item -Path "..\batikrvgan\app\web\app\models" -Destination "." -Recurse

# Copy Static images
New-Item -ItemType Directory -Path "static\images" -Force
Copy-Item -Path "..\batikrvgan\app\web\staticfiles\images\nitik_patches_webp" -Destination "static\images\" -Recurse
Copy-Item -Path "..\batikrvgan\app\web\staticfiles\images\itb_patches_webp" -Destination "static\images\" -Recurse
```

### 3. Struktur Folder

```
batik-flask-app/
├── app.py                      # Main Flask REST API
├── requirements.txt            # Dependencies
├── README.md                   # Documentation
├── setup.ps1                   # Setup script
├── static/
│   ├── images/                 # Patch images
│   │   ├── nitik_patches_webp/
│   │   └── itb_patches_webp/
│   └── generated/              # Generated images (auto-created)
├── npy/                        # Pre-computed features
│   ├── nitik_features.npy
│   ├── nitik_labels.npy
│   ├── nitik_paths_webp.npy
│   ├── itb_features.npy
│   ├── itb_labels.npy
│   └── itb_paths_webp.npy
└── models/                     # ONNX models
    ├── batikgan_sl.onnx
    ├── batikgan_cl.onnx
    └── batikrvgan.onnx
```

## 🎮 Menjalankan API

### Development Mode

```bash
python app.py
```

API akan berjalan di: **http://localhost:5000**

### Production Mode

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

---

### 1. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Batik Generator API",
  "version": "1.0.0",
  "timestamp": "2026-01-06T08:55:00"
}
```

---

### 2. Get Available Datasets

**Endpoint:** `GET /api/datasets`

**Response:**
```json
{
  "success": true,
  "datasets": [
    {
      "name": "nitik",
      "total_patches": 120
    },
    {
      "name": "itb",
      "total_patches": 138
    }
  ]
}
```

---

### 3. Get Available Models

**Endpoint:** `GET /api/models`

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "name": "batikrvgan",
      "path": "models/batikrvgan.onnx",
      "available": true,
      "size_mb": 147.89
    },
    {
      "name": "batikgan_sl",
      "path": "models/batikgan_sl.onnx",
      "available": true,
      "size_mb": 68.86
    },
    {
      "name": "batikgan_cl",
      "path": "models/batikgan_cl.onnx",
      "available": true,
      "size_mb": 68.86
    }
  ]
}
```

---

### 4. Get Random Patches

**Endpoint:** `POST /api/patches/random`

**Request Body:**
```json
{
  "dataset": "nitik",
  "count": 18
}
```

**Response:**
```json
{
  "success": true,
  "dataset": "nitik",
  "total_available": 120,
  "count": 18,
  "patches": [
    {
      "index": 5,
      "path": "nitik_5.webp",
      "image_url": "/api/patch/image/nitik/5"
    },
    ...
  ]
}
```

---

### 5. Find Similar Patches

**Endpoint:** `POST /api/patches/similar`

**Request Body:**
```json
{
  "dataset": "nitik",
  "index": 5,
  "top_k": 4
}
```

**Response:**
```json
{
  "success": true,
  "dataset": "nitik",
  "query_index": 5,
  "top_k": 4,
  "similar_patches": [
    {
      "index": 5,
      "label": "motif_A",
      "distance": 0.0,
      "path": "nitik_5.webp",
      "image_url": "/api/patch/image/nitik/5"
    },
    {
      "index": 12,
      "label": "motif_A",
      "distance": 0.1234,
      "path": "nitik_12.webp",
      "image_url": "/api/patch/image/nitik/12"
    },
    ...
  ]
}
```

---

### 6. Get Patch Image

**Endpoint:** `GET /api/patch/image/<dataset>/<index>`

**Example:** `GET /api/patch/image/nitik/5`

**Response:** Image file (WebP format)

---

### 7. Generate Batik Image ⭐

**Endpoint:** `POST /api/generate`

**Request Body (Save to File):**
```json
{
  "dataset": "nitik",
  "patch_a": 5,
  "patch_b": 10,
  "model_name": "batikrvgan",
  "return_base64": false
}
```

**Response:**
```json
{
  "success": true,
  "dataset": "nitik",
  "patch_a": 5,
  "patch_b": 10,
  "model_name": "batikrvgan",
  "filename": "batik_nitik_20260106_085530.jpg",
  "image_url": "/api/generated/batik_nitik_20260106_085530.jpg",
  "download_url": "/api/download/batik_nitik_20260106_085530.jpg",
  "timestamp": "2026-01-06T08:55:30"
}
```

**Request Body (Return Base64):**
```json
{
  "dataset": "nitik",
  "patch_a": 5,
  "patch_b": 10,
  "model_name": "batikrvgan",
  "return_base64": true
}
```

**Response:**
```json
{
  "success": true,
  "dataset": "nitik",
  "patch_a": 5,
  "patch_b": 10,
  "model_name": "batikrvgan",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2026-01-06T08:55:30"
}
```

---

### 8. Get Generated Image

**Endpoint:** `GET /api/generated/<filename>`

**Example:** `GET /api/generated/batik_nitik_20260106_085530.jpg`

**Response:** Image file (JPEG format)

---

### 9. Download Generated Image

**Endpoint:** `GET /api/download/<filename>`

**Example:** `GET /api/download/batik_nitik_20260106_085530.jpg`

**Response:** Image file with download headers

---

### 10. Get Gallery

**Endpoint:** `GET /api/gallery`

**Response:**
```json
{
  "success": true,
  "count": 25,
  "images": [
    {
      "filename": "batik_nitik_20260106_085530.jpg",
      "image_url": "/api/generated/batik_nitik_20260106_085530.jpg",
      "download_url": "/api/download/batik_nitik_20260106_085530.jpg",
      "size_kb": 245.67,
      "created_at": "2026-01-06T08:55:30"
    },
    ...
  ]
}
```

---

## 🔄 Typical Workflow

### Frontend Integration Flow:

```javascript
// 1. Get random patches
const patchesResponse = await fetch('http://localhost:5000/api/patches/random', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dataset: 'nitik', count: 18 })
});
const { patches } = await patchesResponse.json();

// 2. User selects first patch (e.g., index 5)
const selectedPatchA = 5;

// 3. Find similar patches
const similarResponse = await fetch('http://localhost:5000/api/patches/similar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dataset: 'nitik', index: selectedPatchA, top_k: 4 })
});
const { similar_patches } = await similarResponse.json();

// 4. User selects second patch (e.g., index 10)
const selectedPatchB = 10;

// 5. Generate batik
const generateResponse = await fetch('http://localhost:5000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dataset: 'nitik',
    patch_a: selectedPatchA,
    patch_b: selectedPatchB,
    model_name: 'batikrvgan',
    return_base64: false
  })
});
const { image_url, download_url } = await generateResponse.json();

// 6. Display generated image
document.getElementById('result').src = `http://localhost:5000${image_url}`;
```

---

## 🛠️ Error Handling

Semua endpoint mengembalikan error dalam format:

```json
{
  "success": false,
  "error": "Error message",
  "traceback": "Detailed traceback (only in debug mode)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (endpoint/resource not found)
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## 🔧 Configuration

### CORS Settings

CORS sudah di-enable untuk semua origins. Untuk production, edit `app.py`:

```python
# Restrict to specific origins
CORS(app, origins=['https://your-frontend-domain.com'])
```

### Upload Folder

Default: `static/generated/`

Ubah di `app.py`:
```python
app.config['UPLOAD_FOLDER'] = 'path/to/your/folder'
```

### Max File Size

Default: 16MB

Ubah di `app.py`:
```python
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB
```

---

## 📊 Performance Tips

1. **Use Base64 for Small Images**: Jika frontend butuh response cepat tanpa additional request
2. **Cache Patch Images**: Frontend bisa cache patch images karena static
3. **Async Generation**: Untuk multiple generations, gunakan async/await
4. **Model Selection**: BatikRVGAN lebih besar tapi hasil lebih baik

---

## 🧪 Testing API

### Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get datasets
curl http://localhost:5000/api/datasets

# Get random patches
curl -X POST http://localhost:5000/api/patches/random \
  -H "Content-Type: application/json" \
  -d '{"dataset":"nitik","count":18}'

# Generate batik
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"dataset":"nitik","patch_a":5,"patch_b":10,"model_name":"batikrvgan"}'
```

### Using Python

```python
import requests

# Get random patches
response = requests.post('http://localhost:5000/api/patches/random', 
    json={'dataset': 'nitik', 'count': 18})
print(response.json())

# Generate batik
response = requests.post('http://localhost:5000/api/generate',
    json={
        'dataset': 'nitik',
        'patch_a': 5,
        'patch_b': 10,
        'model_name': 'batikrvgan'
    })
print(response.json())
```

---

## 📝 Notes

- API ini **pure backend**, tidak ada frontend/template HTML
- Semua response dalam format JSON
- CORS enabled untuk integrasi dengan frontend dari domain berbeda
- Support return image sebagai base64 atau file URL
- Generated images disimpan di `static/generated/`

---

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Heroku

```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

---

## 👨‍💻 Developer

REST API version dari Batik RVGAN Django application.

## 📄 License

MIT License

---

**Happy Coding! 🎨✨**
