# Batik AI Studio - Full Documentation

## Purpose

This document describes the full Batik AI Studio frontend app (Next.js), including UI elements, step-by-step flow, and API request details. It is intended as a guide to duplicate the complete Stage 1 to Stage 3 pipeline into another web app.

## Tech Stack

- Next.js
- React
- CSS Modules
- Backend: Flask REST API

## Environment Configuration

Create .env.local in the app root:

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

If not set, the frontend defaults to https://batik-studio.wempyaw.com.

## High-Level Flow

1. Stage 1: Generate motifs from text prompt (select 2 motifs).
2. Stage 2: Compose the two motifs into a fabric (checkerboard pattern).
3. Stage 3 (FLUX only): Apply the fabric via FLUX to generate a realistic batik garment image.

Note: The implementation can omit mockup selection entirely because Stage 3 uses only the FLUX pipeline.

## App Structure

- src/app/layout.js: Root layout, header, container.
- src/app/page.js: Main pipeline flow and state management.
- src/app/login/page.js: Mock login screen.
- src/lib/api.js: API client and fetch helper.
- src/lib/api-tests.js: Manual API testing helpers for browser console.
- src/components/\*: UI building blocks for each step.

## Main Page State Model

Defined in src/app/page.js:

- currentStep
- sessionId
- generatedMotifs[]
- selectedMotifs[] (exactly 2)
- selectedPattern (default: checkerboard)
- fabricParams { grid_rows, grid_cols, output_width_cm, output_height_cm, dpi }
- fabricData
- selectedMockup (default: pria_lengan_panjang)
- resultData
- consoleMessages[]

## UI Pages and Elements

### Root Layout (layout.js)

- Header component
- Main container for page content

### Header

- Brand title and logo icon
- Actions: Masuk, Reset, Ekspor Preset
- Mobile drawer menu with the same actions

### Login Page (login/page.js)

- Email and password form
- Back link to home
- No real auth; on submit redirects to home

### Stepper

- Steps displayed: 1, 2, 4, 5
- Step 3 (SelectGarment) is not needed for FLUX-only usage

### Sidebar (Agent Console)

- Shows pipeline status messages (info, success, error)
- Messages are appended via addConsoleMessage in page.js

### Step 1: GeneratePatch

- Inputs:
  - Prompt (textarea)
  - Scenario LoRA (scenario2, scenario4_1)
  - Number of motif variations (1..8)
- Action:
  - Bangkitkan Patch button
- Output:
  - Motif previews from Stage 1
  - User selects 2 motifs (max 2)

### Step 2: SelectLayout

- Shows selected motif previews
- Pattern selection (checkerboard only in current UI)
- Fabric parameters:
  - grid_rows (even number required)
  - grid_cols (even number required)
  - output_width_cm
  - output_height_cm
  - dpi
- Action:
  - Susun Kain button (Stage 2 compose)

### Step 3: SelectGarment

- Not used for FLUX-only flow

### Step 4: FabricParameters

- Preview composed fabric
- Read-only summary of fabric parameters

### Step 5: GenerateResult (FLUX only)

- Apply mode: FLUX Kontext
- Controls:
  - style: kemeja, batik, casual
  - gender: pria, wanita
  - sleeve: panjang, pendek
- Output:
  - One front image
- Actions:
  - Generate
  - Download (front)
  - Back and Reset All

### NavigationButtons

- Shared Back / Next component
- Accepts optional helper text

## API Client (src/lib/api.js)

All requests use the same base URL and error handling. Errors are normalized into a message string.

### Base Helper

- fetchAPI(endpoint, options)
- Throws an Error with a readable message for non-2xx responses

## API Endpoints and Payloads

### Utility

GET /api/v1/health

### Stage 1: Generate Motifs

POST /api/v1/stage1/generate
Content-Type: application/json

Request body:
{
"prompt": "...",
"scenario": "scenario4_1",
"steps": 40,
"guidance_scale": 9.0,
"negative_prompt": "blurry, distorted, realistic, photo, 3d",
"num_motifs": 2,
"seed": -1
}

Response:
{
"session_id": "...",
"motifs": [ { "id": "...", "url": "/api/v1/files/motifs/..." } ]
}

### Stage 1: Edit Motif (optional, UI not wired)

POST /api/v1/stage1/edit
Content-Type: multipart/form-data

Form fields:

- image (file)
- prompt (string)
- scenario (string)
- mask (file, optional) or mask_type (string)

### Stage 2: Compose Fabric

POST /api/v1/stage2/compose
Content-Type: application/json

Request body:
{
"motif_a_id": "...",
"motif_b_id": "...",
"grid_rows": 10,
"grid_cols": 10,
"output_width_cm": 110,
"output_height_cm": 240,
"dpi": 150,
"pattern": "checkerboard"
}

Response:
{
"id": "...",
"url": "/api/v1/files/fabrics/...",
"width_cm": 110,
"height_cm": 240,
"grid_rows": 10,
"grid_cols": 10,
"pattern": "checkerboard"
}

### Stage 3: Apply via FLUX

POST /api/v1/stage3/apply-flux
Content-Type: application/json

Request body:
{
"fabric_id": "...",
"prompt": "...", // optional
"style": "kemeja",
"gender": "pria",
"sleeve": "panjang",
"max_px": 1024
}

Response:
{
"result_id": "...",
"front_url": "/api/v1/files/results/...\_flux_front.jpg",
"prompt_used": "...",
"input_size": [1024, 1024],
"original_size": [5120, 5120],
"flux_model": "black-forest-labs/FLUX.1-Kontext-dev"
}

### File Serving

GET /api/v1/files/{category}/{filename}
Categories: motifs, fabrics, results, mockups

## Data Flow (Frontend)

1. generateMotifs -> session_id and motifs[]
2. select two motifs -> selectedMotifs[]
3. composeFabric -> fabricData
4. applyFlux -> resultData
5. show image and enable download

## Frontend API Usage Patterns

Example in React:

const result = await generateMotifs({ prompt, scenario, num_motifs: 4 });

const fabric = await composeFabric({
motif_a_id: selectedMotifs[0].id,
motif_b_id: selectedMotifs[1].id,
pattern: "checkerboard",
grid_rows: 10,
grid_cols: 10,
output_width_cm: 110,
output_height_cm: 240,
dpi: 150
});

const resultFlux = await applyFlux({
fabric_id: fabric.id,
style: "kemeja",
gender: "pria",
sleeve: "panjang",
max_px: 1024
});

## Validation Rules (UI)

- Must select exactly 2 motifs before composing fabric.
- grid_rows and grid_cols must be even numbers.
- Apply action is disabled until fabric is ready.

## Error Handling and Console Messages

- API errors show in sidebar console as error messages.
- All stages log info, success, and error states.

## Manual Testing (Browser Console)

Open dev tools on the frontend and run:

- apiTests.testHealthCheck()
- apiTests.testFullWorkflow()

These helpers are defined in src/lib/api-tests.js.

## Embedding into Another Web App

Recommended approach:

1. Copy src/lib/api.js to the new app.
2. Copy the required components under src/components.
3. Copy src/app/page.js or re-implement the same state model.
4. Include src/app/globals.css and the CSS modules for each component.
5. Ensure .env.local is set with NEXT_PUBLIC_API_BASE_URL.

Optional:

- Wire editMotif into the UI if you want inpainting.
- Expose row_stripe or col_stripe by enabling those options in SelectLayout.

## Notes

- The pipeline can completely omit mockup selection for FLUX-only usage.
- FLUX mode returns a single front image.
- This frontend is stateless; refreshing the page resets the workflow state.
