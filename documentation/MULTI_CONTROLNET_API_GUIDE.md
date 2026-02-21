# Batik Multi-ControlNet API - Motif Blending Guide

**Seamless blending of multiple batik motifs using Multi-ControlNet**

---

## 🎯 **What is Multi-ControlNet?**

Multi-ControlNet allows you to **combine multiple batik motifs** into a single, seamlessly blended design.

### **How it works:**

```
Input Image 1 (Motif A) → Canny Edge → ControlNet 1 (weight: 0.5)
                                            ↓
Input Image 2 (Motif B) → Canny Edge → ControlNet 2 (weight: 0.5)
                                            ↓
                                    Combine constraints
                                            ↓
                                Output: Blended Motif A+B
```

---

## 📊 **Comparison with Other Methods:**

| Method | Structure Preservation | Motif Blending | Spatial Control | Seams |
|--------|----------------------|----------------|-----------------|-------|
| **Single ControlNet** | ✅ Excellent | ❌ No | ❌ No | N/A |
| **Multi-ControlNet** | ✅ Good | ✅ **Yes** | ❌ No | ✅ **Seamless** |
| **Inpainting** | ⚠️ Moderate | ✅ Yes | ✅ **Yes** | ❌ Visible |
| **Pure T2I** | ❌ No | ⚠️ Unpredictable | ❌ No | N/A |

**Winner for Motif Blending:** ✅ **Multi-ControlNet**

---

## 🚀 **Quick Start:**

### **1. Install Dependencies:**

Already included in ControlNet dependencies:
```bash
pip install opencv-python diffusers peft
```

### **2. Start Server:**

```bash
python script/image_editor_multi_controlnet_api.py
```

Server runs on: **http://localhost:8005**

---

## 📡 **API Endpoint:**

### **Blend Motifs (POST)**

**URL:**
```
POST http://localhost:8005/blend
```

**Content-Type:** `multipart/form-data`

---

## 📋 **Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `image1` | File | ✅ Yes | - | First motif image |
| `image2` | File | ✅ Yes | - | Second motif image |
| `image3` | File | No | - | Third motif (optional) |
| `prompt` | String | ✅ Yes | - | Blending instruction |
| `scenario` | String | ✅ Yes | - | LoRA scenario |
| `scale1` | Float | No | 0.5 | Weight for image1 (0.0-1.0) |
| `scale2` | Float | No | 0.5 | Weight for image2 (0.0-1.0) |
| `scale3` | Float | No | 0.5 | Weight for image3 (0.0-1.0) |
| `steps` | Integer | No | 40 | Inference steps |
| `guidance_scale` | Float | No | 8.0 | CFG scale |
| `canny_low` | Integer | No | 100 | Canny low threshold |
| `canny_high` | Integer | No | 200 | Canny high threshold |
| `seed` | Integer | No | -1 | Random seed |
| `negative_prompt` | String | No | "blurry..." | What to avoid |
| `return_edges` | Boolean | No | false | Return edge maps |

---

## 🔥 **Quick Test:**

### **Test 1: Equal Blend (50-50)**

```bash
curl -X POST http://localhost:8005/blend \
  -F "image1=@batik_kawung.png" \
  -F "image2=@batik_parang.png" \
  -F "prompt=batik combining Kawung and Parang motifs, traditional Indonesian batik style" \
  -F "scenario=scenario2" \
  -F "scale1=0.5" \
  -F "scale2=0.5" \
  -F "steps=40" \
  -F "guidance_scale=8.5" \
  -o result_blend.jpg
```

**Expected:** Seamless 50-50 blend of both motifs

---

### **Test 2: Dominant First Motif (70-30)**

```bash
curl -X POST http://localhost:8005/blend \
  -F "image1=@batik_kawung.png" \
  -F "image2=@batik_parang.png" \
  -F "prompt=batik Kawung pattern with subtle Parang influences" \
  -F "scenario=scenario2" \
  -F "scale1=0.7" \
  -F "scale2=0.3" \
  -o result_dominant.jpg
```

**Expected:** Mostly Kawung with hints of Parang

---

### **Test 3: Three-Way Blend**

```bash
curl -X POST http://localhost:8005/blend \
  -F "image1=@batik_kawung.png" \
  -F "image2=@batik_parang.png" \
  -F "image3=@batik_mega_mendung.png" \
  -F "prompt=batik combining Kawung, Parang, and Mega Mendung motifs" \
  -F "scenario=scenario2" \
  -F "scale1=0.4" \
  -F "scale2=0.4" \
  -F "scale3=0.2" \
  -o result_three.jpg
```

**Expected:** Complex fusion of 3 motifs

---

## 💡 **Weight Tuning Guide:**

### **Understanding Weights:**

The `scale` parameters control how much each motif influences the final result.

| scale1 | scale2 | Result |
|--------|--------|--------|
| **0.5** | **0.5** | **Equal blend** (recommended start) |
| **0.7** | **0.3** | Motif 1 dominant |
| **0.3** | **0.7** | Motif 2 dominant |
| **0.8** | **0.2** | Mostly Motif 1, subtle Motif 2 |
| **0.6** | **0.6** | Slightly stronger blend |

**Note:** Scales don't need to sum to 1.0, but keeping them balanced (sum ≈ 1.0) works best.

---

## 🎨 **Python Test Script:**

```python
import requests

# Test equal blend
files = {
    'image1': open('batik_kawung.png', 'rb'),
    'image2': open('batik_parang.png', 'rb'),
}
data = {
    'prompt': 'batik combining Kawung and Parang motifs, traditional Indonesian batik style',
    'scenario': 'scenario2',
    'scale1': 0.5,  # Equal weight
    'scale2': 0.5,
    'steps': 40,
    'guidance_scale': 8.5,
    'negative_prompt': 'blurry, distorted, low quality'
}

response = requests.post('http://localhost:8005/blend', files=files, data=data)

if response.status_code == 200:
    with open('result_blend.jpg', 'wb') as f:
        f.write(response.content)
    print(f"✓ Success! Seed: {response.headers.get('X-Seed')}")
else:
    print(f"✗ Error: {response.json()}")
```

---

## 🎯 **Use Cases:**

### **1. Equal Motif Fusion**

**Goal:** Create new motif from 2 existing ones

```python
{
    'prompt': 'batik combining [MOTIF_A] and [MOTIF_B] motifs',
    'scale1': 0.5,
    'scale2': 0.5,
    'steps': 40,
    'guidance_scale': 8.5
}
```

**Example:**
- Kawung + Parang → New hybrid motif
- Mega Mendung + Sekar Jagad → Cloud-flower fusion

---

### **2. Subtle Influence**

**Goal:** Add hints of second motif to main motif

```python
{
    'prompt': 'batik [MAIN_MOTIF] with subtle [ACCENT_MOTIF] influences',
    'scale1': 0.7,  # Main motif
    'scale2': 0.3,  # Accent
    'steps': 40,
    'guidance_scale': 8.5
}
```

**Example:**
- Kawung (70%) + Parang (30%) → Kawung with Parang accents

---

### **3. Complex Multi-Motif**

**Goal:** Blend 3+ motifs for complex design

```python
{
    'prompt': 'batik combining [MOTIF_A], [MOTIF_B], and [MOTIF_C]',
    'scale1': 0.4,
    'scale2': 0.4,
    'scale3': 0.2,
    'steps': 50,
    'guidance_scale': 9.0
}
```

---

## 🔧 **Debugging:**

### **1. Check Edge Maps:**

```bash
curl -X POST http://localhost:8005/blend \
  -F "image1=@test1.jpg" \
  -F "image2=@test2.jpg" \
  -F "prompt=test" \
  -F "scenario=scenario2" \
  -F "return_edges=true" \
  -o edges_grid.jpg
```

This returns a side-by-side view of all edge maps.

---

### **2. Adjust Canny Thresholds:**

If edge maps are too noisy or sparse:

```python
# Too noisy (too many edges)
'canny_low': 150,
'canny_high': 250

# Too sparse (too few edges)
'canny_low': 50,
'canny_high': 100
```

---

## 📈 **Expected Results:**

### **Advantages:**

✅ **Seamless blending** - No visible seams
✅ **Natural fusion** - Model learns to merge motifs organically
✅ **Flexible control** - Adjust weight of each motif
✅ **Preserves batik style** - LoRA ensures traditional aesthetic

### **Limitations:**

⚠️ **Unpredictable** - Exact blend result may vary
⚠️ **No spatial control** - Can't specify "Motif A on left, B on right"
⚠️ **Heavier memory** - Loads multiple ControlNets

---

## 🚨 **Troubleshooting:**

### **Problem: One motif dominates completely**

```python
# Solution: Increase weight of weaker motif
'scale1': 0.4,  # Decrease dominant
'scale2': 0.6   # Increase weaker
```

---

### **Problem: Blend looks messy/chaotic**

```python
# Solution: Reduce total weight, increase CFG
'scale1': 0.3,
'scale2': 0.3,
'guidance_scale': 10.0  # Stronger prompt guidance
```

---

### **Problem: Not blending, just one motif**

```python
# Solution: Ensure both scales > 0, increase steps
'scale1': 0.5,
'scale2': 0.5,
'steps': 50,  # More steps for better blending
'guidance_scale': 8.0
```

---

## 📊 **Comparison: Single vs Multi-ControlNet**

### **Single ControlNet (Port 8004):**

```bash
# Input: 1 image
# Output: Same motif, different color/style
curl -X POST http://localhost:8004/edit \
  -F "image=@batik_kawung.png" \
  -F "prompt=batik Kawung in red and gold" \
  -o result_single.jpg
```

**Use for:** Color change, style transfer

---

### **Multi-ControlNet (Port 8005):**

```bash
# Input: 2+ images
# Output: Blended motifs
curl -X POST http://localhost:8005/blend \
  -F "image1=@batik_kawung.png" \
  -F "image2=@batik_parang.png" \
  -F "prompt=combine Kawung and Parang" \
  -o result_multi.jpg
```

**Use for:** Motif blending, fusion

---

## 🎉 **Next Steps:**

1. **Start server:**
   ```bash
   python script/image_editor_multi_controlnet_api.py
   ```

2. **Test edge maps:**
   ```bash
   python script/test_multi_controlnet.py
   ```

3. **Experiment with weights:**
   - Try 50-50 blend
   - Try 70-30 blend
   - Try 3-way blend

4. **Compare results:**
   - Single ControlNet (color change)
   - Multi-ControlNet (motif blend)

---

## 📝 **API Versions Summary:**

| Port | Service | Use Case |
|------|---------|----------|
| **8003** | I2I (Phase 1) | ❌ Deprecated |
| **8004** | Single ControlNet | ✅ **Color/style change** |
| **8005** | Multi-ControlNet | ✅ **Motif blending** |

---

**Status:** ✅ **READY FOR TESTING!**

Multi-ControlNet will seamlessly blend multiple batik motifs! 🎨✨
