# 🎨 BatikGAN CL REST API

REST API untuk menghasilkan pola batik menggunakan multiple GAN models (TensorFlow/Keras). API ini dibuat berdasarkan pipeline dari aplikasi BatikGAN CL original.

## ✨ Fitur

- 🧠 **6 GAN Models**: GAN_C1, GAN_C10, GAN_C100, GAN_AUG, GAN_NO_AUG, PATCHGAN
- 🔄 **Model Comparison**: Generate dengan multiple models sekaligus
- 🎨 **Image Generation**: Generate batik dari 2 patch images
- 📊 **Performance Tracking**: Measure inference time per model
- 🌐 **CORS Enabled**: Ready untuk integrasi dengan frontend
- 📥 **Dual Output**: Base64 atau file URL
- 🐳 **Docker Ready**: Complete Docker setup

## 📋 Prerequisites

- Python 3.10+
- pip
- Docker (optional)
- 4GB RAM minimum (untuk TensorFlow)

## 🚀 Instalasi

### Method 1: Local Setup

```bash
cd batikgan-cl-api

# 1. Setup data files
.\setup.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run API
python app.py
```

API akan berjalan di: **http://localhost:5000**

### Method 2: Docker Setup

```bash
# 1. Setup data files
.\setup.ps1

# 2. Build dan run dengan Docker Compose
docker-compose up -d
```

API akan berjalan di: **http://localhost:5001**

## 📚 API Endpoints

### Base URL
```
http://localhost:5000  # Local
http://localhost:5001  # Docker
```

---

### 1. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "BatikGAN CL API",
  "version": "1.0.0",
  "timestamp": "2026-01-06T13:00:00",
  "models_loaded": ["GAN_C1", "PATCHGAN"]
}
```

---

### 2. Get Available Models

**Endpoint:** `GET /api/models`

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "name": "GAN_C1",
      "path": "models/GAN_C1.h5",
      "available": true,
      "size_mb": 64.67,
      "input_size": [32, 32],
      "loaded": true
    },
    ...
  ],
  "total": 6
}
```

---

### 3. Get Available Patches

**Endpoint:** `GET /api/patches`

**Response:**
```json
{
  "success": true,
  "patches": [
    {
      "index": 0,
      "filename": "patch1.jpg",
      "path": "static/patches/patch1.jpg",
      "url": "/api/patch/0"
    },
    ...
  ],
  "total": 24
}
```

---

### 4. Get Patch Image

**Endpoint:** `GET /api/patch/<index>`

**Example:** `GET /api/patch/0`

**Response:** Image file (JPEG)

---

### 5. Generate Batik (Single Model) ⭐

**Endpoint:** `POST /api/generate`

**Request Body (File URL):**
```json
{
  "patch_a": 0,
  "patch_b": 5,
  "model_name": "GAN_C1",
  "return_base64": false
}
```

**Response:**
```json
{
  "success": true,
  "model_name": "GAN_C1",
  "patch_a": 0,
  "patch_b": 5,
  "inference_time": 0.1234,
  "filename": "batik_GAN_C1_20260106_130000.png",
  "image_url": "/api/generated/batik_GAN_C1_20260106_130000.png",
  "download_url": "/api/download/batik_GAN_C1_20260106_130000.png",
  "timestamp": "2026-01-06T13:00:00"
}
```

**Request Body (Base64):**
```json
{
  "patch_a": 0,
  "patch_b": 5,
  "model_name": "GAN_C1",
  "return_base64": true
}
```

**Response:**
```json
{
  "success": true,
  "model_name": "GAN_C1",
  "patch_a": 0,
  "patch_b": 5,
  "inference_time": 0.1234,
  "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "timestamp": "2026-01-06T13:00:00"
}
```

---

### 6. Generate with Multiple Models (Comparison) ⭐

**Endpoint:** `POST /api/generate/compare`

**Request Body:**
```json
{
  "patch_a": 0,
  "patch_b": 5,
  "models": ["GAN_C1", "GAN_C10", "PATCHGAN"],
  "return_base64": false
}
```

**Response:**
```json
{
  "success": true,
  "patch_a": 0,
  "patch_b": 5,
  "models_used": ["GAN_C1", "GAN_C10", "PATCHGAN"],
  "results": [
    {
      "model_name": "GAN_C1",
      "inference_time": 0.1234,
      "filename": "batik_GAN_C1_20260106_130000.png",
      "image_url": "/api/generated/batik_GAN_C1_20260106_130000.png",
      "download_url": "/api/download/batik_GAN_C1_20260106_130000.png"
    },
    {
      "model_name": "GAN_C10",
      "inference_time": 0.1456,
      "filename": "batik_GAN_C10_20260106_130001.png",
      "image_url": "/api/generated/batik_GAN_C10_20260106_130001.png",
      "download_url": "/api/download/batik_GAN_C10_20260106_130001.png"
    },
    ...
  ],
  "timestamp": "2026-01-06T13:00:00"
}
```

---

### 7. Get Generated Image

**Endpoint:** `GET /api/generated/<filename>`

**Response:** Image file (PNG)

---

### 8. Download Generated Image

**Endpoint:** `GET /api/download/<filename>`

**Response:** Image file with download headers

---

### 9. Get Gallery

**Endpoint:** `GET /api/gallery`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "images": [
    {
      "filename": "batik_GAN_C1_20260106_130000.png",
      "image_url": "/api/generated/batik_GAN_C1_20260106_130000.png",
      "download_url": "/api/download/batik_GAN_C1_20260106_130000.png",
      "size_kb": 123.45,
      "created_at": "2026-01-06T13:00:00"
    },
    ...
  ]
}
```

---

## 🔄 Workflow Example

### JavaScript/React

```javascript
// 1. Get available patches
const patchesRes = await fetch('http://localhost:5000/api/patches');
const { patches } = await patchesRes.json();

// 2. User selects 2 patches
const patchA = 0;
const patchB = 5;

// 3. Generate with single model
const result = await fetch('http://localhost:5000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patch_a: patchA,
    patch_b: patchB,
    model_name: 'GAN_C1',
    return_base64: true
  })
});

const data = await result.json();
// Display: data.image_base64

// 4. Or compare multiple models
const compareResult = await fetch('http://localhost:5000/api/generate/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patch_a: patchA,
    patch_b: patchB,
    models: ['GAN_C1', 'GAN_C10', 'PATCHGAN'],
    return_base64: false
  })
});

const compareData = await compareResult.json();
// Display all results: compareData.results
```

---

## 🐳 Docker Deployment

### Build & Run

```bash
# Build image
docker build -t batikgan-cl-api .

# Run container
docker run -d \
  --name batikgan-cl-api \
  -p 5001:5000 \
  -v ${PWD}/static/generated:/app/static/generated \
  batikgan-cl-api
```

### Docker Compose

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📊 Model Information

| Model | Input Size | File Size | Description |
|-------|------------|-----------|-------------|
| **GAN_C1** | 32x32 | ~68MB | GAN with C=1 parameter |
| **GAN_C10** | 32x32 | ~68MB | GAN with C=10 parameter |
| **GAN_C100** | 32x32 | ~68MB | GAN with C=100 parameter |
| **GAN_AUG** | 32x32 | ~68MB | GAN with data augmentation |
| **GAN_NO_AUG** | 32x32 | ~68MB | GAN without augmentation |
| **PATCHGAN** | 128x128 | ~2KB | PatchGAN architecture |

---

## 🔧 Configuration

### Environment Variables

```bash
FLASK_ENV=production
PYTHONUNBUFFERED=1
TF_CPP_MIN_LOG_LEVEL=2  # Suppress TensorFlow warnings
```

### Memory Requirements

- **Minimum**: 2GB RAM
- **Recommended**: 4GB RAM
- **Docker**: Set memory limit in docker-compose.yml

---

## 🛠️ Troubleshooting

### TensorFlow Warnings

Set environment variable:
```bash
export TF_CPP_MIN_LOG_LEVEL=2
```

### Out of Memory

Reduce number of workers in gunicorn:
```bash
gunicorn --workers 1 --timeout 180 app:app
```

### Model Loading Slow

Models are cached after first load. First request will be slower.

---

## 📝 Perbedaan dengan BatikRVGAN API

| Aspek | BatikGAN CL API | BatikRVGAN API |
|-------|-----------------|----------------|
| **ML Framework** | TensorFlow/Keras | ONNX Runtime |
| **Model Format** | .h5 | .onnx |
| **Models** | 6 models | 3 models |
| **Input Size** | 32x32 (128x128 PATCHGAN) | 128x128 |
| **Memory** | ~4GB | ~2GB |
| **Inference Speed** | Slower | Faster |
| **Model Comparison** | ✅ Yes | ❌ No |
| **Docker Image Size** | ~2GB | ~1GB |

---

## 📚 Tech Stack

- **Backend**: Flask
- **ML Framework**: TensorFlow 2.13, Keras 2.13
- **Image Processing**: Pillow
- **Production Server**: Gunicorn
- **Containerization**: Docker

---

## 🎯 Use Cases

1. **Research**: Compare different GAN models
2. **Production**: Generate batik patterns via API
3. **Integration**: Connect with web/mobile frontend
4. **Batch Processing**: Generate multiple variations

---

## 📄 License

MIT License

---

**Happy Generating! 🎨✨**
