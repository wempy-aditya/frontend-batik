# API Documentation - pneumonia-children

## Base URL
`http://localhost:9009`

## Endpoints

### 1. Health Check
`GET /health`

Response:
```json
{"status": "ok", "models_loaded": 1, "classes": [...]}
```

### 2. Get Classes
`GET /classes`

Response:
```json
{"classes": [...]}
```

### 3. Get Available Models
`GET /models`

Response:
```json
{"models": [...]}
```

### 4. Prediction
`POST /predict`

Parameters:
- `file`: (multipart/form-data) Image file
- `model_name`: (query param, optional) Model name to use. Default: `Skema 1_model`

Available models:
    - `Skema 1_model`
    - `Skema 2_model`
    - `Skema 3_model`

Response:
```json
{
  "prediction": {"class1": 12.3, "class2": 87.7},
  "predicted_class": "class2",
  "confidence": 87.7,
  "inference_time_ms": 145.32,
  "model_used": "model_name"
}
```

### 5. List Sample Images
`GET /samples`

Response:
```json
{"samples": ["image1.jpg", "image2.jpg"]}
```

### 6. Get Sample Image
`GET /sample-image/{name}`

Returns the image file directly.

## CORS
All origins allowed (`*`).
