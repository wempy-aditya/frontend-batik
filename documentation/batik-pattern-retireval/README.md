# 🎨 Batik Pattern Generator REST API

REST API untuk menghasilkan pola batik menggunakan GAN models. API ini dibuat berdasarkan pipeline dari aplikasi Batik Pattern Generator original.

## ✨ Fitur

- 🧠 **3 GAN Models**: GAN-SL, GAN-CL, RVGAN
- 🔄 **Similarity Search**: Bray-Curtis distance
- 🎲 **Random Patches**: 18 patches dengan seed=3
- 🎨 **Pattern Generation**: Generate batik dari 2 patches
- 📊 **Model Comparison**: Generate dengan multiple models
- 🌐 **CORS Enabled**: Ready untuk frontend integration
- 🐳 **Docker Ready**: Complete Docker setup

## 📋 Prerequisites

- Python 3.9 (matching original)
- pip
- Docker (optional)
- 4GB RAM minimum

## 🚀 Instalasi

### Method 1: Local Setup

```bash
cd batik-pattern-generator-api

# 1. Setup data files
.\setup.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run API
python app.py
```

API: **http://localhost:5000**

### Method 2: Docker Setup

```bash
# 1. Setup data files
.\setup.ps1

# 2. Build & run
docker-compose up -d
```

API: **http://localhost:5003**

## 📚 API Endpoints

### 1. Health Check
```
GET /api/health
```

### 2. Get Available Models
```
GET /api/models
```

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "name": "GAN-SL",
      "path": "models/GAN_SL.h5",
      "size_mb": 65.88,
      "available": true,
      "loaded": false
    },
    {
      "name": "RVGAN",
      "path": "models/RVGAN.h5",
      "size_mb": 141.38,
      "available": true
    }
  ]
}
```

### 3. Get Random Patches
```
GET /api/patches/random
```

Returns 18 random patches (seed=3 for consistency)

**Response:**
```json
{
  "success": true,
  "patches": [
    {
      "index": 45,
      "path": "patch/image45.jpg",
      "image_url": "/api/patch/patch/image45.jpg"
    }
  ],
  "total": 18,
  "seed": 3
}
```

### 4. Get Similar Patches ⭐
```
POST /api/patches/similar
Content-Type: application/json

{
  "index": 5
}
```

Uses Bray-Curtis distance to find similar patches.

**Response:**
```json
{
  "success": true,
  "query_index": 5,
  "similar_patches": [
    {
      "path": "patch/image10.jpg",
      "image_url": "/api/patch/patch/image10.jpg"
    }
  ],
  "total": 4
}
```

### 5. Generate Batik (Single Model) ⭐
```
POST /api/generate
Content-Type: application/json

{
  "patch_a": "patch/image1.jpg",
  "patch_b": "patch/image2.jpg",
  "model_name": "RVGAN",
  "return_base64": false
}
```

**Response:**
```json
{
  "success": true,
  "model_name": "RVGAN",
  "inference_time": 0.5432,
  "filename": "result-09011326123045.png",
  "image_url": "/api/generated/result-09011326123045.png",
  "download_url": "/api/download/result-09011326123045.png",
  "timestamp": "2026-01-09T13:26:12"
}
```

### 6. Generate with Multiple Models (Compare) ⭐
```
POST /api/generate/compare
Content-Type: application/json

{
  "patch_a": "patch/image1.jpg",
  "patch_b": "patch/image2.jpg",
  "models": ["GAN-SL", "RVGAN"],
  "return_base64": false
}
```

**Response:**
```json
{
  "success": true,
  "patch_a": "patch/image1.jpg",
  "patch_b": "patch/image2.jpg",
  "models_used": ["GAN-SL", "RVGAN"],
  "results": [
    {
      "success": true,
      "model_name": "GAN-SL",
      "inference_time": 0.4321,
      "filename": "result-09011326123046.png",
      "image_url": "/api/generated/result-09011326123046.png"
    },
    {
      "success": true,
      "model_name": "RVGAN",
      "inference_time": 0.5678,
      "filename": "result-09011326123047.png",
      "image_url": "/api/generated/result-09011326123047.png"
    }
  ]
}
```

### 7. Get Generated Image
```
GET /api/generated/<filename>
```

### 8. Download Generated Image
```
GET /api/download/<filename>
```

### 9. Get Gallery
```
GET /api/gallery
```

## 🔄 Workflow Example

### JavaScript/React

```javascript
// 1. Get random patches for home page
const patchesRes = await fetch('http://localhost:5003/api/patches/random');
const { patches } = await patchesRes.json();

// 2. User selects first patch (e.g., index 45)
const selectedIndex = patches[0].index;

// 3. Get similar patches
const similarRes = await fetch('http://localhost:5003/api/patches/similar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ index: selectedIndex })
});
const { similar_patches } = await similarRes.json();

// 4. User selects second patch from similar patches
const patchA = patches[0].path;
const patchB = similar_patches[0].path;

// 5. Generate batik
const result = await fetch('http://localhost:5003/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patch_a: patchA,
    patch_b: patchB,
    model_name: 'RVGAN',
    return_base64: false
  })
});

const data = await result.json();
// Display: http://localhost:5003${data.image_url}

// 6. Or compare multiple models
const compareResult = await fetch('http://localhost:5003/api/generate/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patch_a: patchA,
    patch_b: patchB,
    models: ['GAN-SL', 'GAN-CL', 'RVGAN']
  })
});
```

## 📊 Model Information

| Model | File Size | Description |
|-------|-----------|-------------|
| **GAN-SL** | ~66MB | GAN Single Loss |
| **GAN-CL** | ~66MB | GAN Combined Loss |
| **RVGAN** | ~141MB | Relativistic GAN |

## 🔍 Preprocessing Pipeline

Berdasarkan original `generator.py`:

```python
# 1. Load image with target size 128x128
img = load_img(image_path, target_size=(128, 128))

# 2. Convert to array
img = img_to_array(img)

# 3. Normalize: (img - 127.5) / 127.5
img = (img - 127.5) / 127.5

# 4. Expand dimensions
img = np.expand_dims(img, axis=0)

# 5. Convert to tensor
img = convert_to_tensor(img)

# 6. Generate
result = model([patch_a, patch_b])

# 7. Clear Keras session (IMPORTANT)
keras.backend.clear_session()
```

## 🎲 Random Patches

Uses **seed=3** for consistency (from original `image.py`):

```python
random.seed(3)
random_index = random.sample(range(0, 120), 18)
```

This ensures the same 18 patches are returned every time.

## 🔍 Similarity Search

Uses **Bray-Curtis distance** (from original `retrieval.py`):

```python
from scipy.spatial.distance import braycurtis

for f in features:
    dist = braycurtis(query_features, f)
```

Returns top 4 most similar patches.

## 🐳 Docker Deployment

### Build & Run

```bash
docker build -t batik-pattern-generator-api .
docker run -d -p 5003:5000 batik-pattern-generator-api
```

### Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## 🔧 Configuration

### Environment Variables

```bash
FLASK_ENV=production
PYTHONUNBUFFERED=1
TF_CPP_MIN_LOG_LEVEL=2
```

### Memory Requirements

- **Minimum**: 2GB RAM
- **Recommended**: 4GB RAM (RVGAN model is 141MB)

## 📝 Comparison dengan Original App

| Aspek | Original App | REST API |
|-------|--------------|----------|
| **Framework** | Flask (web UI) | Flask (REST API) |
| **Frontend** | ✅ HTML templates | ❌ API only |
| **Pipeline** | ✅ Original | ✅ **Exact same** |
| **Preprocessing** | 128x128, normalize | **Same** |
| **Random Seed** | seed=3 | **seed=3** |
| **Similarity** | Bray-Curtis | **Bray-Curtis** |
| **Session Clear** | ✅ Yes | ✅ **Yes** |
| **Models** | 3 models | 3 models |
| **CORS** | ❌ | ✅ Yes |
| **Docker** | ❌ | ✅ Yes |
| **Caching** | ❌ | ✅ Yes |

## 🛠️ Troubleshooting

### TensorFlow Warnings

```bash
export TF_CPP_MIN_LOG_LEVEL=2
```

### Out of Memory

Increase Docker memory limit or reduce workers.

### Model Loading Slow

Models are cached after first load.

## 📚 Tech Stack

- **Backend**: Flask
- **ML Framework**: TensorFlow 2.10, Keras
- **Image Processing**: Pillow, OpenCV
- **Similarity**: SciPy (Bray-Curtis)
- **Production Server**: Gunicorn
- **Containerization**: Docker

## 🎯 Use Cases

1. **Pattern Generation**: Generate batik patterns
2. **Model Comparison**: Compare GAN models
3. **Research**: Test different architectures
4. **Integration**: Connect with web/mobile apps

---

**Happy Generating! 🎨✨**
