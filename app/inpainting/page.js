"use client";
import { useState, useRef, useCallback } from "react";

const INPAINTING_API_URL = "https://inpainting.wempyaw.com";

const MASK_PRESETS = [
  { id: "full", label: "Full Image", icon: "⬛", description: "Edit entire image" },
  { id: "center50", label: "Center 50%", icon: "🔲", description: "Center square area" },
  { id: "center30", label: "Center 30%", icon: "◼", description: "Small center area" },
  { id: "half_left", label: "Half Left", icon: "◧", description: "Left half" },
  { id: "half_right", label: "Half Right", icon: "◨", description: "Right half" },
  { id: "half_top", label: "Half Top", icon: "⬒", description: "Top half" },
  { id: "half_bottom", label: "Half Bottom", icon: "⬓", description: "Bottom half" },
  { id: "quadrant_tl", label: "Top-Left", icon: "◤", description: "Top-left quadrant" },
  { id: "quadrant_tr", label: "Top-Right", icon: "◥", description: "Top-right quadrant" },
  { id: "quadrant_bl", label: "Bottom-Left", icon: "◣", description: "Bottom-left quadrant" },
  { id: "quadrant_br", label: "Bottom-Right", icon: "◢", description: "Bottom-right quadrant" },
  { id: "ellipse_center", label: "Ellipse", icon: "⭕", description: "Ellipse center area" },
  { id: "ring", label: "Ring / Donut", icon: "🔵", description: "Ring around center" },
  { id: "cross", label: "Cross / Plus", icon: "➕", description: "Cross shape center" },
  { id: "border", label: "Border Frame", icon: "🔳", description: "Image border frame" },
  { id: "four_corners", label: "Four Corners", icon: "🔸", description: "All four corners" },
];

const SCENARIO_OPTIONS = [
  { value: "scenario1", label: "Scenario 1", description: "Basic batik dataset" },
  { value: "scenario2", label: "Scenario 2", description: "Extended dataset" },
  { value: "scenario2_1", label: "Scenario 2.1", description: "Sub-variant 2.1" },
  { value: "scenario2_2", label: "Scenario 2.2", description: "Sub-variant 2.2" },
  { value: "scenario2_3", label: "Scenario 2.3", description: "Sub-variant 2.3" },
  { value: "scenario2_4", label: "Scenario 2.4", description: "Sub-variant 2.4" },
  { value: "scenario2_5", label: "Scenario 2.5", description: "Sub-variant 2.5" },
  { value: "scenario3_1", label: "Scenario 3.1", description: "Extended scenario 3" },
  { value: "scenario3_2", label: "Scenario 3.2", description: "Extended scenario 3.2" },
  { value: "scenario4_1", label: "Scenario 4.1 ⭐", description: "Latest dataset (recommended)" },
  { value: "scenario4_1_1", label: "Scenario 4.1.1", description: "Alias for scenario4_1" },
];

const EXAMPLE_PROMPTS = [
  "traditional Javanese kawung batik motif, flat 2D pattern, cream and gold on dark navy, batik style illustration",
  "traditional batik floral motif, red roses in batik style, flat 2D illustration, intricate pattern",
  "traditional batik with vibrant purple and gold geometric pattern, batik style flat illustration",
  "traditional Javanese truntum batik motif, small star flower pattern, cream dots and stars on dark navy, intricate batik style, flat 2D textile pattern",
  "traditional batik cloth with deep red background, cream and gold motif, intricate batik style flat illustration",
  "traditional batik mega mendung cloud motif, blue gradient clouds, Cirebon style, flat 2D textile pattern",
  "traditional parang batik motif, diagonal blade pattern, brown and cream on dark background, royal Javanese style",
];

function generateMaskCanvas(type, width = 512, height = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Fill black first (preserved area)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Draw white (edit area) based on type
  ctx.fillStyle = "#ffffff";

  const cx = width / 2;
  const cy = height / 2;

  switch (type) {
    case "full":
      ctx.fillRect(0, 0, width, height);
      break;
    case "center50": {
      const s50 = Math.min(width, height) * 0.5;
      ctx.fillRect(cx - s50 / 2, cy - s50 / 2, s50, s50);
      break;
    }
    case "center30": {
      const s30 = Math.min(width, height) * 0.3;
      ctx.fillRect(cx - s30 / 2, cy - s30 / 2, s30, s30);
      break;
    }
    case "half_left":
      ctx.fillRect(0, 0, width / 2, height);
      break;
    case "half_right":
      ctx.fillRect(width / 2, 0, width / 2, height);
      break;
    case "half_top":
      ctx.fillRect(0, 0, width, height / 2);
      break;
    case "half_bottom":
      ctx.fillRect(0, height / 2, width, height / 2);
      break;
    case "quadrant_tl":
      ctx.fillRect(0, 0, width / 2, height / 2);
      break;
    case "quadrant_tr":
      ctx.fillRect(width / 2, 0, width / 2, height / 2);
      break;
    case "quadrant_bl":
      ctx.fillRect(0, height / 2, width / 2, height / 2);
      break;
    case "quadrant_br":
      ctx.fillRect(width / 2, height / 2, width / 2, height / 2);
      break;
    case "ellipse_center":
      ctx.beginPath();
      ctx.ellipse(cx, cy, width * 0.35, height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "ring": {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "cross": {
      const ht = height * 0.25;
      const wt = width * 0.25;
      ctx.fillRect(cx - wt / 2, 0, wt, height);
      ctx.fillRect(0, cy - ht / 2, width, ht);
      break;
    }
    case "border": {
      const bw = Math.min(width, height) * 0.12;
      ctx.fillRect(0, 0, width, bw);
      ctx.fillRect(0, height - bw, width, bw);
      ctx.fillRect(0, 0, bw, height);
      ctx.fillRect(width - bw, 0, bw, height);
      break;
    }
    case "four_corners": {
      const cs = Math.min(width, height) * 0.25;
      ctx.fillRect(0, 0, cs, cs);
      ctx.fillRect(width - cs, 0, cs, cs);
      ctx.fillRect(0, height - cs, cs, cs);
      ctx.fillRect(width - cs, height - cs, cs, cs);
      break;
    }
    default:
      ctx.fillRect(0, 0, width, height);
  }

  return canvas;
}

function DropZone({ label, accept, file, preview, onFile, icon, hint }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
        isDragging
          ? "border-amber-500 bg-amber-50"
          : file
          ? "border-green-400 bg-green-50/30"
          : "border-gray-300 hover:border-amber-400 bg-gray-50 hover:bg-amber-50/30"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt={label}
            className="w-full h-48 object-contain bg-gray-100 rounded-2xl"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            <span className="text-white text-sm font-medium">Click to replace</span>
          </div>
          <div className="p-2 text-center text-xs text-green-700 font-medium truncate px-3">
            ✅ {file?.name}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
          <span className="text-4xl mb-3">{icon}</span>
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          <p className="text-xs text-gray-400">{hint}</p>
          <p className="text-xs text-gray-400 mt-1">Drop file or click to browse</p>
        </div>
      )}
    </div>
  );
}

export default function InpaintingPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [maskFile, setMaskFile] = useState(null);
  const [maskPreview, setMaskPreview] = useState(null);
  const [maskMode, setMaskMode] = useState("upload"); // "upload" | "preset"
  const [selectedPreset, setSelectedPreset] = useState("center50");

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(
    "realistic, photo, 3d render, blurry, distorted, low quality, modern, gradient"
  );
  const [scenario, setScenario] = useState("scenario4_1");
  const [guidanceScale, setGuidanceScale] = useState(9.0);
  const [steps, setSteps] = useState(50);
  const [seed, setSeed] = useState(-1);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState("");
  const [debugMaskUrl, setDebugMaskUrl] = useState(null);
  const [usedSeed, setUsedSeed] = useState(null);

  const handleOriginalImage = (file) => {
    setOriginalImage(file);
    setOriginalPreview(URL.createObjectURL(file));
    setResultImage(null);
    setError("");
  };

  const handleMaskFile = (file) => {
    setMaskFile(file);
    setMaskPreview(URL.createObjectURL(file));
  };

  const applyPreset = useCallback(() => {
    const canvas = generateMaskCanvas(selectedPreset);
    canvas.toBlob((blob) => {
      const file = new File([blob], `mask_${selectedPreset}.png`, { type: "image/png" });
      setMaskFile(file);
      setMaskPreview(canvas.toDataURL("image/png"));
    }, "image/png");
  }, [selectedPreset]);

  const randomizePrompt = () => {
    const r = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPrompt(r);
  };

  const resetParams = () => {
    setGuidanceScale(9.0);
    setSteps(50);
    setSeed(-1);
    setScenario("scenario4_1");
    setNegativePrompt("realistic, photo, 3d render, blurry, distorted, low quality, modern, gradient");
  };

  const handleInpaint = async () => {
    if (!originalImage) {
      setError("Please upload an original image.");
      return;
    }
    if (!maskFile) {
      setError("Please provide a mask (upload or generate from preset).");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt describing what to generate in the masked area.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setResultImage(null);
    setDebugMaskUrl(null);
    setUsedSeed(null);

    try {
      const formData = new FormData();
      formData.append("image", originalImage);
      formData.append("mask", maskFile);
      formData.append("prompt", prompt.trim());
      formData.append("scenario", scenario);
      formData.append("steps", String(steps));
      formData.append("guidance_scale", String(guidanceScale));
      formData.append("seed", String(seed));
      if (negativePrompt.trim()) {
        formData.append("negative_prompt", negativePrompt.trim());
      }

      const response = await fetch(`${INPAINTING_API_URL}/inpaint`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const xSeed = response.headers.get("X-Seed");
      if (xSeed) setUsedSeed(xSeed);

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("image")) {
        const blob = await response.blob();
        setResultImage(URL.createObjectURL(blob));
      } else {
        const data = await response.json();
        if (data.image) {
          const mime = data.mimeType || "image/jpeg";
          setResultImage(`data:${mime};base64,${data.image}`);
        } else if (data.image_url) {
          setResultImage(data.image_url);
        } else {
          throw new Error("No image returned. Response: " + JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Inpainting error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `inpainting-${scenario}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 0L60 30L30 60L0 30z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-orange-200 mb-8">
            <button onClick={() => (window.location.href = "/")} className="hover:text-white transition-colors">
              Home
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">Batik Inpainting</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">Precision Motif Editor</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Batik Inpainting
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Edit specific areas of your batik image using mask-based control. Change motifs, replace colors, or add new elements — while preserving everything else.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: "🎯", text: "Mask-Based Precision" },
                { icon: "🎨", text: "Area-Specific Editing" },
                { icon: "🛡️", text: "Preserve Original Style" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <span>{f.icon}</span>
                  <span className="text-sm font-medium text-gray-200">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Banner */}
      <section className="bg-amber-600/90 py-4">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Upload your batik image
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Define the edit area (mask)
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Describe what to generate
            </span>
            <span className="text-white/40">→</span>
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              Get edited result!
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left: Inputs ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Step 1: Upload Image */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Upload Original Batik Image
                </h2>
                <p className="text-gray-500 text-sm mb-6">Upload the batik image you want to edit. Supported: JPG, PNG, WEBP.</p>
                <DropZone
                  label="Original Batik Image"
                  accept="image/jpeg,image/png,image/webp"
                  file={originalImage}
                  preview={originalPreview}
                  onFile={handleOriginalImage}
                  icon="🖼️"
                  hint="JPG, PNG, or WEBP · Max 10MB recommended"
                />
              </div>

              {/* Step 2: Mask */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Define Mask Area
                </h2>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-semibold text-white bg-white/0 inline-block">
                    🔲 <span className="bg-white text-black px-1 rounded">White</span> = area to <strong>edit</strong>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    ⬛ <span className="bg-black text-white px-1 rounded">Black</span> = area to <strong>preserve</strong>
                  </span>
                </p>
                <p className="text-gray-400 text-xs mb-6">Use a preset shape, or upload your own custom mask PNG.</p>

                {/* Mode Toggle */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setMaskMode("preset")}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
                      maskMode === "preset"
                        ? "bg-amber-500 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                    }`}
                  >
                    🔲 Use Preset Shape
                  </button>
                  <button
                    onClick={() => setMaskMode("upload")}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
                      maskMode === "upload"
                        ? "bg-amber-500 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-amber-50"
                    }`}
                  >
                    📁 Upload Custom Mask
                  </button>
                </div>

                {maskMode === "preset" ? (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-5">
                      {MASK_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPreset(p.id)}
                          title={p.description}
                          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                            selectedPreset === p.id
                              ? "border-amber-500 bg-amber-50 shadow"
                              : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                          }`}
                        >
                          <span className="text-xl mb-1">{p.icon}</span>
                          <span className="text-xs font-semibold text-gray-700 leading-tight">{p.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={applyPreset}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Generate Mask: {MASK_PRESETS.find((p) => p.id === selectedPreset)?.label}
                      </button>
                      {maskPreview && maskMode === "preset" && (
                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                          <span>✅ Mask ready</span>
                        </div>
                      )}
                    </div>

                    {maskPreview && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Mask preview:</p>
                        <img src={maskPreview} alt="Mask Preview" className="w-32 h-32 object-contain rounded-xl border border-gray-200 bg-gray-100" />
                      </div>
                    )}
                  </div>
                ) : (
                  <DropZone
                    label="Custom Mask Image"
                    accept="image/png,image/jpeg"
                    file={maskFile}
                    preview={maskPreview}
                    onFile={handleMaskFile}
                    icon="🎭"
                    hint="PNG grayscale · White = edit area · Black = preserve"
                  />
                )}
              </div>

              {/* Step 3: Prompt */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Describe the Edit
                </h2>
                <p className="text-gray-500 text-sm mb-6">Describe what should be generated inside the white mask area.</p>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Prompt (Edit Area)</label>
                    <button
                      onClick={randomizePrompt}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Random Example
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. traditional Javanese kawung batik motif, flat 2D pattern, cream and gold on dark navy, batik style illustration"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    💡 Tip: Include words like <em>"batik style, flat 2D illustration, traditional pattern"</em> for better results.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Negative Prompt</label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Elements to avoid in the output.</p>
                </div>
              </div>

              {/* Step 4: Parameters */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Generation Parameters
                  </h2>
                  <button
                    onClick={resetParams}
                    className="text-sm text-gray-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset to Defaults
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Scenario */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Model Scenario</label>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {SCENARIO_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            scenario === opt.value
                              ? "border-amber-500 bg-amber-50"
                              : "border-gray-200 hover:border-amber-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="scenario"
                            value={opt.value}
                            checked={scenario === opt.value}
                            onChange={(e) => setScenario(e.target.value)}
                            className="mt-0.5 text-amber-600 accent-amber-600"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-6">
                    {/* Guidance Scale */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">Guidance Scale</label>
                        <span className="text-sm font-bold text-amber-600">{guidanceScale}</span>
                      </div>
                      <input
                        type="range" min="1" max="15" step="0.5"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Creative (5)</span>
                        <span>Balanced (7.5)</span>
                        <span>Strong (10+)</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Higher = stronger adherence to prompt</p>
                    </div>

                    {/* Steps */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">Inference Steps</label>
                        <span className="text-sm font-bold text-amber-600">{steps}</span>
                      </div>
                      <input
                        type="range" min="20" max="80" step="5"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Fast (20)</span>
                        <span>Good (40–50)</span>
                        <span>Max (80)</span>
                      </div>
                    </div>

                    {/* Seed */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Seed</label>
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                        placeholder="-1 for random"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">-1 = random · Set a number to reproduce results</p>
                    </div>
                  </div>
                </div>

                {/* Inpaint Button */}
                <button
                  onClick={handleInpaint}
                  disabled={isProcessing || !originalImage || !maskFile || !prompt.trim()}
                  className={`w-full mt-8 py-5 px-6 text-lg font-bold rounded-2xl transition-all duration-300 transform ${
                    isProcessing || !originalImage || !maskFile || !prompt.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Processing Inpainting... (may take ~30–60s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>🎨 Run Inpainting</span>
                    </div>
                  )}
                </button>

                {/* Validation hints */}
                {(!originalImage || !maskFile || !prompt.trim()) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!originalImage && <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">⚠ Upload original image</span>}
                    {!maskFile && <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">⚠ Set mask area</span>}
                    {!prompt.trim() && <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">⚠ Enter a prompt</span>}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Result ── */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Result
                </h2>

                {/* Error */}
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Error
                    </div>
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                {/* Processing */}
                {isProcessing && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300 mb-4">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-amber-800 font-bold text-base mb-1">🎨 Editing your batik...</p>
                      <p className="text-amber-600 text-sm">{scenario} · {steps} steps</p>
                    </div>
                  </div>
                )}

                {/* Result Image */}
                {resultImage && !isProcessing && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow">
                      <img
                        src={resultImage}
                        alt="Inpainting Result"
                        className="w-full h-auto object-contain bg-gray-50"
                      />
                    </div>

                    {usedSeed && (
                      <p className="text-xs text-center text-gray-400">
                        Seed used: <span className="font-mono font-semibold text-gray-600">{usedSeed}</span>
                      </p>
                    )}

                    <button
                      onClick={downloadResult}
                      className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Result
                    </button>

                    {/* Info panel */}
                    <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-xl">
                      <div><strong>Scenario:</strong> {scenario}</div>
                      <div><strong>Guidance Scale:</strong> {guidanceScale}</div>
                      <div><strong>Steps:</strong> {steps}</div>
                      <div><strong>Seed:</strong> {usedSeed || seed}</div>
                    </div>
                  </div>
                )}

                {/* Before / After comparison */}
                {originalPreview && resultImage && !isProcessing && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Before / After</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-center text-gray-400 mb-1">Original</p>
                        <img src={originalPreview} alt="Before" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                      </div>
                      <div>
                        <p className="text-xs text-center text-gray-400 mb-1">Result</p>
                        <img src={resultImage} alt="After" className="w-full h-24 object-cover rounded-xl border border-amber-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!resultImage && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border-2 border-dashed border-amber-200">
                    <div className="text-center px-4">
                      <svg className="w-14 h-14 text-amber-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <p className="text-gray-600 font-semibold text-base mb-1">Ready to Edit</p>
                      <p className="text-gray-400 text-sm">Upload image, set mask, add prompt, then run inpainting.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">🎨 Inpainting Tips</h2>
            <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
              Get the best results with these techniques
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🎯",
                  color: "from-amber-500 to-orange-500",
                  title: "White = Edit Area",
                  desc: "The white area of your mask is where the AI generates new content. Black areas are preserved exactly.",
                },
                {
                  icon: "🔥",
                  color: "from-orange-500 to-red-500",
                  title: "Use High Guidance Scale",
                  desc: "Set guidance scale to 8.5–10 for strong prompt adherence. This is the main control for how much the area changes.",
                },
                {
                  icon: "✍️",
                  color: "from-yellow-500 to-amber-500",
                  title: "Describe Batik Style",
                  desc: 'Include keywords like "batik style, flat 2D illustration, traditional pattern" for authentic batik output.',
                },
                {
                  icon: "🛡️",
                  color: "from-green-500 to-emerald-500",
                  title: "Negative Prompt Matters",
                  desc: 'Add "realistic, photo, 3d render" to negative prompt to avoid photorealistic outputs.',
                },
                {
                  icon: "📐",
                  color: "from-blue-500 to-indigo-500",
                  title: "Bigger Mask = Better Detail",
                  desc: "Larger mask areas allow the AI to generate more detailed patterns. Very small masks (<64px) may produce poor results.",
                },
                {
                  icon: "🔄",
                  color: "from-purple-500 to-pink-500",
                  title: "Use Seed for Consistency",
                  desc: "Save the seed from a result you like to reproduce similar outputs with tweaked prompts.",
                },
              ].map((tip) => (
                <div key={tip.title} className="text-center p-6 bg-white rounded-2xl shadow-sm">
                  <div className={`w-12 h-12 bg-gradient-to-br ${tip.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white text-xl">{tip.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-500 text-sm">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
