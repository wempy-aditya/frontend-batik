# Batch Generation API Documentation

## 📡 New Batch Endpoints

BASE URL = https://service-t2i.wempyaw.com

### 1. **Create Batch Job** (POST)

**Endpoint:**
```
POST /batik_product/devt2i/batch/generate/
POST /api/batch/generate/  (alias)
```

**Request Body:**
```json
{
  "prompts": [
    "batik motif named Sekar Kemuning...",
    "batik pattern with blue and gold...",
    "traditional batik design..."
  ],
  "scenario": "scenario1",
  "steps": 30,
  "guidance_scale": 7.5,
  "seed_start": 42,
  "negative_prompt": "blurry, bad quality, distorted"
}
```

**Parameters:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompts` | array | Yes | - | Array of prompts (max 1000) |
| `scenario` | string | Yes | - | LoRA scenario |
| `steps` | integer | No | 30 | Inference steps |
| `guidance_scale` | float | No | 7.5 | CFG scale |
| `seed_start` | integer | No | random | Starting seed |
| `negative_prompt` | string | No | "blurry..." | Negative prompt |

**Response (202 Accepted):**
```json
{
  "job_id": "a1b2c3d4",
  "status": "queued",
  "total_prompts": 100,
  "message": "Batch job created successfully"
}
```

---

### 2. **Check Job Status** (GET)

**Endpoint:**
```
GET /batik_product/devt2i/batch/status/<job_id>
GET /api/batch/status/<job_id>  (alias)
```

**Response:**
```json
{
  "job_id": "a1b2c3d4",
  "status": "processing",
  "total": 100,
  "completed": 45,
  "failed": 2,
  "progress": 47.0,
  "created_at": "2026-02-03T15:00:00",
  "completed_at": "2026-02-03T16:00:00"
}
```

**Status Values:**
- `queued` - Job created, waiting to start
- `processing` - Currently generating images
- `completed` - All images generated
- `failed` - Job failed

---

### 3. **Download Results** (GET)

**Endpoint:**
```
GET /batik_product/devt2i/batch/download/<job_id>
GET /api/batch/download/<job_id>  (alias)
```

**Response:**
- ZIP file containing all generated images + metadata.json

**ZIP Contents:**
```
batch_a1b2c3d4.zip
├── a1b2c3d4_0000_seed12345.jpg
├── a1b2c3d4_0001_seed12346.jpg
├── a1b2c3d4_0002_seed12347.jpg
├── ...
└── a1b2c3d4_metadata.json
```

---

### 4. **List All Jobs** (GET)

**Endpoint:**
```
GET /batik_product/devt2i/batch/list/
GET /api/batch/list/  (alias)
```

**Response:**
```json
{
  "jobs": [
    {
      "job_id": "a1b2c3d4",
      "status": "completed",
      "total": 100,
      "completed": 98,
      "failed": 2,
      "created_at": "2026-02-03T15:00:00"
    },
    {
      "job_id": "e5f6g7h8",
      "status": "processing",
      "total": 50,
      "completed": 25,
      "failed": 0,
      "created_at": "2026-02-03T14:00:00"
    }
  ]
}
```

---

## 🎨 Frontend Integration Examples

### JavaScript/Fetch API

```javascript
// 1. Create batch job
async function createBatchJob(prompts, scenario) {
  const response = await fetch('http://localhost:8000/api/batch/generate/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompts: prompts,
      scenario: scenario,
      steps: 30,
      guidance_scale: 7.5,
    })
  });
  
  const data = await response.json();
  return data.job_id;
}

// 2. Poll job status
async function pollJobStatus(jobId) {
  const response = await fetch(`http://localhost:8000/api/batch/status/${jobId}`);
  const data = await response.json();
  return data;
}

// 3. Download results
function downloadResults(jobId) {
  window.location.href = `http://localhost:8000/api/batch/download/${jobId}`;
}

// 4. Complete workflow
async function batchGenerationWorkflow() {
  const prompts = [
    "batik motif named Sekar Kemuning...",
    "batik pattern with blue and gold...",
    // ... more prompts
  ];
  
  // Create job
  const jobId = await createBatchJob(prompts, 'scenario1');
  console.log('Job created:', jobId);
  
  // Poll status every 5 seconds
  const interval = setInterval(async () => {
    const status = await pollJobStatus(jobId);
    console.log(`Progress: ${status.progress}% (${status.completed}/${status.total})`);
    
    if (status.status === 'completed') {
      clearInterval(interval);
      console.log('Job completed!');
      downloadResults(jobId);
    } else if (status.status === 'failed') {
      clearInterval(interval);
      console.error('Job failed:', status.error);
    }
  }, 5000);
}
```

---

### React Component

```jsx
import React, { useState, useEffect } from 'react';

function BatchGenerator() {
  const [prompts, setPrompts] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create batch job
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/batch/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: prompts,
          scenario: 'scenario1',
          steps: 30,
          guidance_scale: 7.5,
        })
      });
      const data = await response.json();
      setJobId(data.job_id);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Poll status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/batch/status/${jobId}`);
        const data = await response.json();
        setStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId]);

  // Download results
  const handleDownload = () => {
    window.location.href = `http://localhost:8000/api/batch/download/${jobId}`;
  };

  return (
    <div>
      <h2>Batch Image Generator</h2>
      
      {/* Input prompts */}
      <textarea
        value={prompts.join('\n')}
        onChange={(e) => setPrompts(e.target.value.split('\n'))}
        placeholder="Enter prompts (one per line)"
        rows={10}
        cols={50}
      />
      
      {/* Submit button */}
      <button onClick={handleSubmit} disabled={loading || jobId}>
        {loading ? 'Creating job...' : 'Start Batch Generation'}
      </button>

      {/* Status display */}
      {status && (
        <div>
          <h3>Job Status: {status.status}</h3>
          <p>Progress: {status.progress}%</p>
          <p>Completed: {status.completed}/{status.total}</p>
          <p>Failed: {status.failed}</p>
          
          {status.status === 'completed' && (
            <button onClick={handleDownload}>Download Results</button>
          )}
        </div>
      )}
    </div>
  );
}

export default BatchGenerator;
```

---

### Vue.js Component

```vue
<template>
  <div class="batch-generator">
    <h2>Batch Image Generator</h2>
    
    <!-- Prompts input -->
    <textarea
      v-model="promptsText"
      placeholder="Enter prompts (one per line)"
      rows="10"
      cols="50"
    ></textarea>
    
    <!-- Submit button -->
    <button @click="createBatch" :disabled="loading || jobId">
      {{ loading ? 'Creating job...' : 'Start Batch Generation' }}
    </button>

    <!-- Status display -->
    <div v-if="status" class="status">
      <h3>Job Status: {{ status.status }}</h3>
      <div class="progress-bar">
        <div class="progress" :style="{ width: status.progress + '%' }"></div>
      </div>
      <p>Progress: {{ status.progress }}%</p>
      <p>Completed: {{ status.completed }}/{{ status.total }}</p>
      <p>Failed: {{ status.failed }}</p>
      
      <button v-if="status.status === 'completed'" @click="downloadResults">
        Download Results
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      promptsText: '',
      jobId: null,
      status: null,
      loading: false,
      pollInterval: null,
    };
  },
  methods: {
    async createBatch() {
      this.loading = true;
      const prompts = this.promptsText.split('\n').filter(p => p.trim());
      
      try {
        const response = await fetch('http://localhost:8000/api/batch/generate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompts: prompts,
            scenario: 'scenario1',
            steps: 30,
            guidance_scale: 7.5,
          })
        });
        const data = await response.json();
        this.jobId = data.job_id;
        this.startPolling();
      } catch (error) {
        console.error('Error:', error);
      }
      this.loading = false;
    },
    
    startPolling() {
      this.pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/batch/status/${this.jobId}`);
          const data = await response.json();
          this.status = data;

          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(this.pollInterval);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }, 5000);
    },
    
    downloadResults() {
      window.location.href = `http://localhost:8000/api/batch/download/${this.jobId}`;
    },
  },
  beforeUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  },
};
</script>

<style scoped>
.progress-bar {
  width: 100%;
  height: 20px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s;
}
</style>
```

---

## 🔥 cURL Examples

### Create Batch Job
```bash
curl -X POST http://localhost:8000/api/batch/generate/ \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": [
      "batik motif named Sekar Kemuning",
      "batik pattern with blue and gold"
    ],
    "scenario": "scenario1",
    "steps": 30,
    "guidance_scale": 7.5
  }'
```

### Check Status
```bash
curl http://localhost:8000/api/batch/status/a1b2c3d4
```

### Download Results
```bash
curl -O http://localhost:8000/api/batch/download/a1b2c3d4
```

### List All Jobs
```bash
curl http://localhost:8000/api/batch/list/
```

---

## 📊 Response Examples

### Success Response (Create Job)
```json
{
  "job_id": "a1b2c3d4",
  "status": "queued",
  "total_prompts": 100,
  "message": "Batch job created successfully"
}
```

### Error Response
```json
{
  "error": "prompts array cannot be empty"
}
```

### Status Response (Processing)
```json
{
  "job_id": "a1b2c3d4",
  "status": "processing",
  "total": 100,
  "completed": 45,
  "failed": 2,
  "progress": 47.0,
  "created_at": "2026-02-03T15:00:00"
}
```

### Status Response (Completed)
```json
{
  "job_id": "a1b2c3d4",
  "status": "completed",
  "total": 100,
  "completed": 98,
  "failed": 2,
  "progress": 100.0,
  "created_at": "2026-02-03T15:00:00",
  "completed_at": "2026-02-03T16:30:00"
}
```

---

## 🎯 Best Practices

1. **Poll Interval**: Use 5-10 seconds between status checks
2. **Max Prompts**: Limit to 1000 prompts per batch
3. **Error Handling**: Always check for failed status
4. **Download**: Only download when status is "completed"
5. **Cleanup**: Consider implementing job cleanup after download

---

## 🚀 Quick Start

1. **Start the server:**
```bash
cd web_api_flask
python flask_app.py
```

2. **Test with cURL:**
```bash
# Create job
curl -X POST http://localhost:8000/api/batch/generate/ \
  -H "Content-Type: application/json" \
  -d '{"prompts": ["test prompt"], "scenario": "scenario1"}'

# Check status (replace JOB_ID)
curl http://localhost:8000/api/batch/status/JOB_ID

# Download (replace JOB_ID)
curl -O http://localhost:8000/api/batch/download/JOB_ID
```

3. **Integrate with frontend** using examples above!

---

**Status:** ✅ **READY FOR PRODUCTION!**
