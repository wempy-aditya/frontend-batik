# Batik IP-Adapter API - Complete Guide

**Latent/Semantic Motif Blending Alternative to Spatial ControlNet**

---

## 🎯 **Overview**

IP-Adapter provides **latent/semantic** control using CLIP image features, as opposed to ControlNet's **spatial/pixel** control using Canny edges.

### **Key Difference:**

```
ControlNet:  Image → Canny Edge → "Follow this structure!"
IP-Adapter:  Image → CLIP Features → "Match this style/concept!"
```

---

## 📊 **Approach Comparison**

| Aspect | ControlNet | IP-Adapter |
|--------|-----------|------------|
| **Control Level** | Pixel/Spatial | Latent/Semantic |
| **Input Processing** | Canny edge detection | CLIP image encoding |
| **Structure Preservation** | ✅ Exact | ⚠️ Conceptual |
| **Style Transfer** | ⚠️ Limited | ✅ **Excellent** |
| **Artistic Freedom** | ❌ Rigid | ✅ **Flexible** |
| **Best For** | Precise editing | Creative blending |
| **Port** | 8004/8005 | **8006** |

---

## 🚀 **Quick Start**

### **1. Install:**
```bash
pip install ip-adapter
```

### **2. Start Server:**
```bash
python script/image_editor_ipadapter_api.py
```

### **3. Test:**
```bash
curl -X POST http://localhost:8006/blend \
  -F "image1=@batik.png" \
  -F "prompt=batik in red and gold" \
  -F "scenario=scenario2" \
  -o result.jpg
```

---

## 📡 **API Endpoint**

### **POST /blend**

**URL:** `http://localhost:8006/blend`

**Content-Type:** `multipart/form-data`

---

## 📋 **Parameters**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `image1` | File | ✅ Yes | - | Primary motif image |
| `image2` | File | No | - | Secondary motif (optional) |
| `image3` | File | No | - | Tertiary motif (optional) |
| `prompt` | String | ✅ Yes | - | Text instruction |
| `scenario` | String | ✅ Yes | - | LoRA scenario |
| `scale1` | Float | No | 0.6 | IP-Adapter strength for image1 (0.0-1.0) |
| `scale2` | Float | No | 0.6 | IP-Adapter strength for image2 |
| `scale3` | Float | No | 0.6 | IP-Adapter strength for image3 |
| `steps` | Integer | No | 40 | Inference steps |
| `guidance_scale` | Float | No | 7.5 | CFG scale |
| `seed` | Integer | No | -1 | Random seed |
| `negative_prompt` | String | No | "blurry..." | What to avoid |

---

## 🔥 **Examples**

### **Example 1: Style Transfer**

```bash
curl -X POST http://localhost:8006/blend \
  -F "image1=@batik_kawung.png" \
  -F "prompt=batik pattern in vibrant red and metallic gold colors, traditional Indonesian batik style" \
  -F "scenario=scenario2" \
  -F "scale1=0.6" \
  -F "steps=40" \
  -F "guidance_scale=7.5" \
  -o result_style.jpg
```

**Effect:** Red/gold batik with Kawung style/concept

---

### **Example 2: Weak Influence (Creative)**

```bash
curl -X POST http://localhost:8006/blend \
  -F "image1=@batik_kawung.png" \
  -F "prompt=modern minimalist batik with clean geometric patterns" \
  -F "scenario=scenario2" \
  -F "scale1=0.3" \
  -o result_creative.jpg
```

**Effect:** More creative freedom, loosely based on input

---

### **Example 3: Strong Influence (Conservative)**

```bash
curl -X POST http://localhost:8006/blend \
  -F "image1=@batik_kawung.png" \
  -F "prompt=batik with slight color variation" \
  -F "scenario=scenario2" \
  -F "scale1=0.9" \
  -o result_conservative.jpg
```

**Effect:** Closely follows input style

---

### **Example 4: Dual Image Blending**

```bash
curl -X POST http://localhost:8006/blend \
  -F "image1=@batik_kawung.png" \
  -F "image2=@batik_parang.png" \
  -F "prompt=batik combining Kawung and Parang motifs" \
  -F "scenario=scenario2" \
  -F "scale1=0.5" \
  -F "scale2=0.5" \
  -o result_blend.jpg
```

**Note:** Multi-image uses simplified approach

---

## 🎨 **Python Usage**

```python
import requests

files = {
    'image1': open('batik_kawung.png', 'rb'),
}
data = {
    'prompt': 'batik in red and gold colors, traditional style',
    'scenario': 'scenario2',
    'scale1': 0.6,  # IP-Adapter influence
    'steps': 40,
    'guidance_scale': 7.5,
    'negative_prompt': 'blurry, distorted, low quality'
}

response = requests.post('http://localhost:8006/blend', files=files, data=data)

if response.status_code == 200:
    with open('result.jpg', 'wb') as f:
        f.write(response.content)
    print(f"✓ Success! Seed: {response.headers.get('X-Seed')}")
else:
    print(f"✗ Error: {response.json()}")
```

---

## 💡 **Parameter Tuning**

### **IP-Adapter Scale**

| Scale | Effect | Use Case |
|-------|--------|----------|
| **0.2-0.3** | Weak | Creative freedom, loose reference |
| **0.4-0.6** | **Medium** | **Balanced (recommended)** |
| **0.7-0.9** | Strong | Close to input style |
| **1.0** | Maximum | Almost identical |

**Recommended:** `0.6` for balanced results

---

### **Guidance Scale**

| Value | Effect |
|-------|--------|
| **5.0-7.0** | More creative |
| **7.5-9.0** | **Balanced (recommended)** |
| **10.0+** | Very strict to prompt |

---

## 🎯 **Use Cases**

### **1. Style Transfer**
```python
# Change colors while preserving style/concept
{
    'prompt': 'batik in [NEW_COLORS], traditional style',
    'scale1': 0.6,
    'guidance_scale': 7.5
}
```

### **2. Artistic Reinterpretation**
```python
# Modern take on traditional motif
{
    'prompt': 'modern minimalist batik with [DESCRIPTION]',
    'scale1': 0.4,  # Lower for more creativity
    'guidance_scale': 8.0
}
```

### **3. Concept Blending**
```python
# Combine semantic features from multiple images
{
    'prompt': 'combine [MOTIF_A] and [MOTIF_B] concepts',
    'scale1': 0.5,
    'scale2': 0.5
}
```

---

## 📈 **Comparison with ControlNet**

### **Same Input Test:**

**Input:** `batik_kawung.png`
**Prompt:** "batik in red and gold colors"

**ControlNet Result:**
- ✅ Exact Kawung structure preserved
- ✅ Colors changed to red/gold
- ❌ Less artistic freedom

**IP-Adapter Result:**
- ⚠️ Kawung style/concept preserved
- ✅ Colors changed to red/gold
- ✅ More artistic interpretation

**Conclusion:**
- Use **ControlNet** for precise structure preservation
- Use **IP-Adapter** for creative style transfer

---

## 🚨 **Troubleshooting**

### **Problem: Output too different from input**

```python
# Solution: Increase scale
'scale1': 0.8  # Instead of 0.6
```

---

### **Problem: Output too similar to input**

```python
# Solution: Decrease scale
'scale1': 0.4  # Instead of 0.6
```

---

### **Problem: Not enough color change**

```python
# Solution: Increase CFG, add negative prompt
'guidance_scale': 9.0,
'negative_prompt': '[OLD_COLORS], dull, faded'
```

---

### **Problem: Multi-image not blending well**

```python
# Note: Multi-image uses simplified approach
# For better blending, use ControlNet (port 8005)
# Or use single image with descriptive prompt
```

---

## 📊 **API Summary**

| Port | Service | Approach | Best For |
|------|---------|----------|----------|
| 8004 | Single ControlNet | Spatial | Precise color change |
| 8005 | Multi-ControlNet | Spatial | Structural motif blend |
| **8006** | **IP-Adapter** | **Latent/Semantic** | **Style/concept blend** |

---

## 🎉 **Next Steps**

1. **Install:** `pip install ip-adapter`
2. **Start:** `python script/image_editor_ipadapter_api.py`
3. **Test:** `python script/test_ipadapter.py`
4. **Compare:** Test same input with ControlNet vs IP-Adapter
5. **Experiment:** Try different scales (0.3, 0.6, 0.9)

---

**Status:** ✅ **READY FOR TESTING!**

IP-Adapter provides latent/semantic control for creative motif blending! 🎨✨
