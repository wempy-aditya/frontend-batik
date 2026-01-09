# 🎨 Klasifikasi Batik REST API

REST API untuk klasifikasi pola batik menggunakan deep learning models. API ini dibuat berdasarkan pipeline dari aplikasi Klasifikasi Batik original dengan Clean Architecture.

## ✨ Fitur

- 🧠 **3 Deep Learning Models**: CNN, MobileNetV2, VGG19
- 🏷️ **16 Batik Classes**: BRENDI, CAKAR AYAM, CEPLOK LIRING, dll
- 🔄 **Model Comparison**: Predict dengan multiple models sekaligus
- 📤 **Image Upload**: Upload custom images untuk klasifikasi
- 📊 **Performance Tracking**: Measure inference time per model
- 🌐 **CORS Enabled**: Ready untuk integrasi frontend
- 🐳 **Docker Ready**: Complete Docker setup

## 📋 Prerequisites

- Python 3.10+
- pip
- Docker (optional)
- 4GB RAM minimum

## 🚀 Instalasi

### Method 1: Local Setup

```bash
cd klasifikasi-batik-api

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

API: **http://localhost:5002**

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
      "name": "cnn_model",
      "path": "models/cnn_model.h5",
      "size_mb": 7.76,
      "loaded": true
    }
  ]
}
```

### 3. Get Batik Classes
```
GET /api/classes
```

**Response:**
```json
{
  "success": true,
  "classes": [
    {"index": 0, "name": "BRENDI"},
    {"index": 1, "name": "CAKAR AYAM"},
    ...
  ],
  "total": 16
}
```

### 4. Get Query Images
```
GET /api/query_images
```

### 5. Predict Single Model ⭐
```
POST /api/predict
Content-Type: application/json

{
  "model_name": "cnn_model",
  "image_path": "static/query_images/BRENDI_1.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "model_name": "cnn_model",
  "predicted_class": "BRENDI",
  "predicted_index": 0,
  "confidence": 98.456,
  "probabilities": {
    "BRENDI": 98.456,
    "CAKAR AYAM": 0.234,
    ...
  },
  "inference_time": 0.1234
}
```

### 6. Predict Multiple Models (Compare) ⭐
```
POST /api/predict/compare
Content-Type: application/json

{
  "models": ["cnn_model", "mobilenetv2_model"],
  "image_path": "static/query_images/BRENDI_1.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "models_used": ["cnn_model", "mobilenetv2_model"],
  "results": [
    {
      "model_name": "cnn_model",
      "predicted_class": "BRENDI",
      "confidence": 98.456,
      "probabilities": {...},
      "inference_time": 0.1234
    },
    {
      "model_name": "mobilenetv2_model",
      "predicted_class": "BRENDI",
      "confidence": 99.123,
      "probabilities": {...},
      "inference_time": 0.0987
    }
  ]
}
```

### 7. Predict Uploaded Image ⭐
```
POST /api/predict/upload
Content-Type: multipart/form-data

file: [image file]
model_name: cnn_model (optional)
compare: false (optional, true for all models)
```

## 🔄 Workflow Example

### JavaScript/React

```javascript
// 1. Get available models
const modelsRes = await fetch('http://localhost:5002/api/models');
const { models } = await modelsRes.json();

// 2. Get query images
const imagesRes = await fetch('http://localhost:5002/api/query_images');
const { images } = await imagesRes.json();

// 3. Predict with single model
const result = await fetch('http://localhost:5002/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_name: 'cnn_model',
    image_path: images[0].path
  })
});

const data = await result.json();
console.log(`Predicted: ${data.predicted_class} (${data.confidence}%)`);

// 4. Compare multiple models
const compareResult = await fetch('http://localhost:5002/api/predict/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    models: ['cnn_model', 'mobilenetv2_model'],
    image_path: images[0].path
  })
});

// 5. Upload custom image
const formData = new FormData();
formData.append('file', imageFile);
formData.append('compare', 'true');

const uploadResult = await fetch('http://localhost:5002/api/predict/upload', {
  method: 'POST',
  body: formData
});
```

## 🎯 16 Batik Classes

1. BRENDI
2. CAKAR AYAM
3. CEPLOK LIRING
4. CINDE WILIS
5. GEDHANGAN
6. JAYA KUSUMA
7. JAYA KIRANA
8. KARAWITAN
9. KAWUNG NITIK
10. KAMUKUS
11. KLAMPOK ARUM
12. KUNCUP KANTHIL
13. MANGGAR
14. MAWUR
15. RENGGANIS
16. SARI MULAT

## 📊 Model Information

| Model | File Size | Type | Description |
|-------|-----------|------|-------------|
| **cnn_model** | ~8MB | Custom CNN | Custom architecture |
| **mobilenetv2_model** | ~10MB | Transfer Learning | MobileNetV2 pretrained |
| **VGG19_model** | ~2KB | Transfer Learning | VGG19 architecture |

## 🔍 Preprocessing Pipeline

Berdasarkan original Clean Architecture:

```python
# 1. Read image (BGR format from cv2)
img = cv2.imread(image_path)

# 2. Convert BGR to RGB
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# 3. Resize based on model input shape
target_size = model.input_shape[1:3]  # (height, width)
img_resized = cv2.resize(img_rgb, target_size)

# 4. Normalize (divide by 255)
img_normalized = img_resized / 255.0

# 5. Expand dimensions for batch
img_batch = np.expand_dims(img_normalized, axis=0)

# 6. Predict
prediction = model.predict(img_batch)
```

## 🐳 Docker Deployment

### Build & Run

```bash
docker build -t klasifikasi-batik-api .
docker run -d -p 5002:5000 klasifikasi-batik-api
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
- **Recommended**: 4GB RAM
- **Docker**: Memory limit set in docker-compose.yml

## 📝 Comparison dengan Original App

| Aspek | Original App | REST API |
|-------|--------------|----------|
| **Architecture** | Clean Architecture (3 layers) | Simplified (API only) |
| **Frontend** | ✅ Full web UI | ❌ API only |
| **Pipeline** | ✅ Original | ✅ **Same** |
| **Preprocessing** | _rgbImageProcessing() | **Same logic** |
| **Model Loading** | _loadSelectModel() | **Cached** |
| **Multi-model** | ✅ Yes | ✅ **Enhanced** |
| **Upload** | ✅ Yes | ✅ Yes |
| **CORS** | ❌ | ✅ Yes |
| **Docker** | ❌ | ✅ Yes |
| **API Endpoints** | 6 routes | 8 endpoints |

## 🛠️ Troubleshooting

### TensorFlow Warnings

```bash
export TF_CPP_MIN_LOG_LEVEL=2
```

### Out of Memory

Reduce workers in gunicorn or increase Docker memory limit.

### Model Loading Slow

Models are cached after first load.

## 📚 Tech Stack

- **Backend**: Flask
- **ML Framework**: TensorFlow 2.13, Keras 2.13
- **Image Processing**: OpenCV, Pillow
- **Production Server**: Gunicorn
- **Containerization**: Docker

## 🎯 Use Cases

1. **Classification**: Classify batik patterns
2. **Comparison**: Compare model performance
3. **Research**: Test different architectures
4. **Integration**: Connect with web/mobile apps

---

**Happy Classifying! 🎨✨**
