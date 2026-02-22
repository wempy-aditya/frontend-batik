"use client";
import { useState, useRef, useCallback } from "react";

const CONTROLNET_API_URL = "https://controlnet.wempyaw.com";

const CONTROLNET_TYPES = [
  {
    id: "canny",
    label: "Canny Edge",
    icon: "✏️",
    badge: "Recommended",
    badgeColor: "bg-amber-500",
    description: "Extracts sharp edge lines. Best for geometric motifs (Kawung, Parang). No extra library needed.",
    pros: ["Sharpest structure preservation", "Great for geometric patterns", "No extra dependencies"],
    cons: ["Less creative freedom"],
    hasCannyParams: true,
  },
  {
    id: "softedge",
    label: "Soft Edge (HED)",
    icon: "🌊",
    badge: "Flexible",
    badgeColor: "bg-blue-500",
    description: "Smoother, more organic edges using HED algorithm. More creative freedom while keeping structure.",
    pros: ["Natural, flowing edges", "Great for floral motifs", "More creative"],
    cons: ["Requires controlnet-aux library", "Fallback to Canny if unavailable"],
    hasCannyParams: false,
  },
  {
    id: "depth",
    label: "Depth Map (MiDaS)",
    icon: "🏔️",
    badge: "Perspective",
    badgeColor: "bg-purple-500",
    description: "Estimates depth/perspective using MiDaS. Best for batik photographed at an angle.",
    pros: ["Preserves perspective", "Good for 3D-perspective shots"],
    cons: ["Less ideal for flat 2D batik", "Requires controlnet-aux library"],
    hasCannyParams: false,
  },
];

const SCENARIO_OPTIONS = [
  { value: "scenario1", label: "Scenario 1", description: "Basic batik dataset" },
  { value: "scenario2", label: "Scenario 2 ⭐", description: "Extended dataset (recommended)" },
  { value: "scenario2_1", label: "Scenario 2.1", description: "Sub-variant 2.1" },
  { value: "scenario2_2", label: "Scenario 2.2", description: "Sub-variant 2.2" },
  { value: "scenario2_3", label: "Scenario 2.3", description: "Sub-variant 2.3" },
  { value: "scenario2_4", label: "Scenario 2.4", description: "Sub-variant 2.4" },
  { value: "scenario2_5", label: "Scenario 2.5", description: "Sub-variant 2.5" },
  { value: "scenario3_1", label: "Scenario 3.1", description: "Extended scenario 3" },
  { value: "scenario3_2", label: "Scenario 3.2", description: "Extended scenario 3.2" },
  { value: "scenario4_1", label: "Scenario 4.1", description: "Extended scenario 4.1" },
];

const EXAMPLE_PROMPTS = [
  "traditional batik cloth with deep red crimson background, cream and gold motif pattern, intricate traditional batik style",
  "traditional batik with bright emerald green and gold colors, traditional batik style, flat 2D textile illustration",
  "traditional batik cloth, dark navy background, bright gold and cream accent motif, luxurious royal Javanese batik style",
  "modern contemporary batik pattern with vibrant purple and teal colors, clean geometric motif, modern Indonesian textile design",
  "traditional batik with vibrant indigo blue background, white and gold floral motif, Javanese batik style",
  "traditional Javanese batik cloth, deep brown background, cream and ivory geometric pattern, batik style flat illustration",
  "traditional batik with black background, bright multicolor accent, festive batik style, flat 2D textile pattern",
];

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
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
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
            className="w-full h-52 object-contain bg-gray-100 rounded-2xl"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            <span className="text-white text-sm font-medium">Click to replace</span>
          </div>
          <div className="p-2 text-center text-xs text-green-700 font-medium truncate px-3">
            ✅ {file?.name}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-52 p-4 text-center">
          <span className="text-4xl mb-3">{icon}</span>
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          <p className="text-xs text-gray-400">{hint}</p>
          <p className="text-xs text-gray-400 mt-1">Drop file or click to browse</p>
        </div>
      )}
    </div>
  );
}

export default function ControlNetPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(
    "realistic, photo, 3d render, blurry, distorted, low quality, modern, gradient"
  );
  const [scenario, setScenario] = useState("scenario2");
  const [controlnetType, setControlnetType] = useState("canny");
  const [controlnetScale, setControlnetScale] = useState(1.0);
  const [steps, setSteps] = useState(40);
  const [guidanceScale, setGuidanceScale] = useState(8.0);
  const [seed, setSeed] = useState(0);
  const [cannyLow, setCannyLow] = useState(100);
  const [cannyHigh, setCannyHigh] = useState(200);
  const [returnEdge, setReturnEdge] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [debugEdge, setDebugEdge] = useState(null);
  const [usedSeed, setUsedSeed] = useState(null);
  const [error, setError] = useState("");

  const handleImage = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResultImage(null);
    setDebugEdge(null);
    setError("");
  };

  const randomizePrompt = () => {
    const r = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPrompt(r);
  };

  const resetParams = () => {
    setControlnetType("canny");
    setControlnetScale(1.0);
    setSteps(40);
    setGuidanceScale(8.0);
    setSeed(-1);
    setCannyLow(100);
    setCannyHigh(200);
    setScenario("scenario2");
    setNegativePrompt("realistic, photo, 3d render, blurry, distorted, low quality, modern, gradient");
  };

  const handleEdit = async () => {
    if (!imageFile) { setError("Please upload a batik image."); return; }
    if (!prompt.trim()) { setError("Please enter a prompt."); return; }

    setIsProcessing(true);
    setError("");
    setResultImage(null);
    setDebugEdge(null);
    setUsedSeed(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("prompt", prompt.trim());
      formData.append("scenario", scenario);
      formData.append("controlnet_type", controlnetType);
      formData.append("controlnet_scale", String(controlnetScale));
      formData.append("steps", String(steps));
      formData.append("guidance_scale", String(guidanceScale));
      formData.append("seed", String(seed));
      if (negativePrompt.trim()) {
        formData.append("negative_prompt", negativePrompt.trim());
      }
      if (controlnetType === "canny") {
        formData.append("canny_low", String(cannyLow));
        formData.append("canny_high", String(cannyHigh));
      }
      if (returnEdge) {
        formData.append("return_edge", "true");
      }

      const response = await fetch(`${CONTROLNET_API_URL}/edit`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const xSeed = response.headers.get("X-Seed");
      if (xSeed) setUsedSeed(xSeed);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (returnEdge) {
        setDebugEdge(url);
      } else {
        setResultImage(url);
      }
    } catch (err) {
      console.error("ControlNet error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url, suffix = "result") => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `controlnet-${suffix}-${scenario}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedTypeInfo = CONTROLNET_TYPES.find((t) => t.id === controlnetType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M0 40L40 0L80 40L40 80z'/%3E%3C/g%3E%3C/svg%3E")`,
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
            <span className="text-white font-medium">Batik ControlNet</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">Structure-Preserving Editor</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Batik ControlNet
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Edit your batik's colors and style while <strong className="text-amber-300">preserving the original motif structure</strong>. Powered by ControlNet edge guidance.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: "🏗️", text: "Preserves Motif Structure" },
                { icon: "🎨", text: "Change Colors & Style" },
                { icon: "🖼️", text: "Whole-Image Editing" },
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

      {/* How it works */}
      <section className="bg-amber-600/90 py-4">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            {[
              "Upload batik image",
              "Choose ControlNet type",
              "Describe desired result",
              "Get edited batik!",
            ].map((step, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                {step}
                {i < 3 && <span className="text-white/40 ml-2">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ControlNet vs Others Info */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <p className="text-center text-sm text-gray-500 mb-4 font-semibold">ControlNet vs Other Methods</p>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-xl">
              <p className="font-bold text-amber-700 mb-1">ControlNet ⭐</p>
              <p className="text-gray-600">Preserves structure · Edits whole image · Best for color/style change</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="font-bold text-gray-600 mb-1">Inpainting</p>
              <p className="text-gray-500">Edits specific area · Mask-based · Best for motif replacement</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="font-bold text-gray-600 mb-1">IP-Adapter</p>
              <p className="text-gray-500">Style transfer · Semantic only · Best for gaya dari gambar lain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left: Inputs ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Step 1: Upload */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Upload Batik Image
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Upload the batik image to edit. The AI will extract its structural edges and use them as guidance.
                </p>
                <DropZone
                  label="Batik Image"
                  accept="image/jpeg,image/png,image/webp"
                  file={imageFile}
                  preview={imagePreview}
                  onFile={handleImage}
                  icon="🖼️"
                  hint="JPG, PNG, or WEBP · Recommended: 512×512"
                />
              </div>

              {/* Step 2: ControlNet Type */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Choose ControlNet Type
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Select how the AI extracts structural guidance from your image.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {CONTROLNET_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setControlnetType(type.id)}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                        controlnetType === type.id
                          ? "border-amber-500 bg-amber-50 shadow-md"
                          : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/40"
                      }`}
                    >
                      <span className={`absolute top-3 right-3 text-xs text-white font-bold px-2 py-0.5 rounded-full ${type.badgeColor}`}>
                        {type.badge}
                      </span>
                      <span className="text-3xl block mb-2">{type.icon}</span>
                      <p className="font-bold text-gray-800 text-sm mb-1">{type.label}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{type.description}</p>
                    </button>
                  ))}
                </div>

                {/* Selected type details */}
                {selectedTypeInfo && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-2">{selectedTypeInfo.icon} {selectedTypeInfo.label} — Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-1">✅ Pros</p>
                        <ul className="space-y-0.5">
                          {selectedTypeInfo.pros.map((p) => (
                            <li key={p} className="text-xs text-gray-600">• {p}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-600 mb-1">⚠️ Cons</p>
                        <ul className="space-y-0.5">
                          {selectedTypeInfo.cons.map((c) => (
                            <li key={c} className="text-xs text-gray-600">• {c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Canny-specific params */}
                {controlnetType === "canny" && (
                  <div className="mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-4">
                      ✏️ Canny Edge Thresholds
                      <span className="text-xs font-normal text-gray-400 ml-2">(controls edge density)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs font-semibold text-gray-600">Low Threshold</label>
                          <span className="text-xs font-bold text-amber-600">{cannyLow}</span>
                        </div>
                        <input
                          type="range" min="0" max="255" step="5"
                          value={cannyLow}
                          onChange={(e) => setCannyLow(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <p className="text-xs text-gray-400 mt-1">Lower = more edges detected</p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-xs font-semibold text-gray-600">High Threshold</label>
                          <span className="text-xs font-bold text-amber-600">{cannyHigh}</span>
                        </div>
                        <input
                          type="range" min="0" max="255" step="5"
                          value={cannyHigh}
                          onChange={(e) => setCannyHigh(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <p className="text-xs text-gray-400 mt-1">Higher = more selective edges</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Presets:</span>
                      {[
                        { label: "More Detail", low: 50, high: 150 },
                        { label: "Balanced", low: 100, high: 200 },
                        { label: "Outline Only", low: 150, high: 250 },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => { setCannyLow(p.low); setCannyHigh(p.high); }}
                          className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                            cannyLow === p.low && cannyHigh === p.high
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                          }`}
                        >
                          {p.label} ({p.low}/{p.high})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Prompt */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Describe Desired Result
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Describe how you want the batik to look. The motif structure from your original image will be preserved.
                </p>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Prompt</label>
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
                    placeholder="e.g. traditional batik cloth with deep red background, cream and gold motif, intricate traditional batik style"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    💡 Tip: Mention the color you want to <strong>remove</strong> in the negative prompt too, e.g. "navy" if replacing navy background.
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
                  <p className="text-xs text-gray-400 mt-1">Add original colors you want replaced, e.g. "navy, dark blue" when targeting navy background.</p>
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
                    Reset
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
                            className="mt-0.5 accent-amber-600"
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
                    {/* ControlNet Scale */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">ControlNet Scale</label>
                        <span className="text-sm font-bold text-amber-600">{controlnetScale}</span>
                      </div>
                      <input
                        type="range" min="0.3" max="1.8" step="0.1"
                        value={controlnetScale}
                        onChange={(e) => setControlnetScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Creative (0.3)</span>
                        <span>Balanced (0.8)</span>
                        <span>Rigid (1.5)</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Higher = stronger structure preservation</p>
                    </div>

                    {/* Guidance Scale */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">Guidance Scale</label>
                        <span className="text-sm font-bold text-amber-600">{guidanceScale}</span>
                      </div>
                      <input
                        type="range" min="5" max="15" step="0.5"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Creative (5)</span>
                        <span>Balanced (7.5)</span>
                        <span>Strong (10+)</span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">Inference Steps</label>
                        <span className="text-sm font-bold text-amber-600">{steps}</span>
                      </div>
                      <input
                        type="range" min="20" max="60" step="5"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Fast (20)</span>
                        <span>Good (30–40)</span>
                        <span>Max (60)</span>
                      </div>
                    </div>

                    {/* Seed */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seed</label>
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

                {/* Debug toggle */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={returnEdge}
                      onChange={(e) => setReturnEdge(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">🔍 Debug: Return Edge Map instead of result</p>
                      <p className="text-xs text-gray-400">Enable to inspect the edge/structure map the AI uses as guidance</p>
                    </div>
                  </label>
                </div>

                {/* Run Button */}
                <button
                  onClick={handleEdit}
                  disabled={isProcessing || !imageFile || !prompt.trim()}
                  className={`w-full mt-6 py-5 px-6 text-lg font-bold rounded-2xl transition-all duration-300 transform ${
                    isProcessing || !imageFile || !prompt.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Processing... (may take ~30–60s)</span>
                    </div>
                  ) : returnEdge ? (
                    <div className="flex items-center justify-center gap-3">
                      <span>🔍</span>
                      <span>Get Edge Map (Debug)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                      </svg>
                      <span>🎨 Run ControlNet Edit</span>
                    </div>
                  )}
                </button>

                {(!imageFile || !prompt.trim()) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!imageFile && <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">⚠ Upload batik image</span>}
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
                    <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Error
                    </p>
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
                      <p className="text-amber-800 font-bold text-base mb-1">🏗️ Applying ControlNet...</p>
                      <p className="text-amber-600 text-sm">{controlnetType} · scale {controlnetScale} · {steps} steps</p>
                    </div>
                  </div>
                )}

                {/* Debug Edge Map */}
                {debugEdge && !isProcessing && (
                  <div className="space-y-4 mb-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-medium">
                      🔍 This is the <strong>edge map</strong> the AI uses as structural guidance — not the final result.
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow">
                      <img src={debugEdge} alt="Edge Map Debug" className="w-full h-auto object-contain bg-gray-50" />
                    </div>
                    <button
                      onClick={() => downloadImage(debugEdge, "edgemap")}
                      className="w-full py-2.5 px-4 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:shadow transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Edge Map
                    </button>
                  </div>
                )}

                {/* Result Image */}
                {resultImage && !isProcessing && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow">
                      <img
                        src={resultImage}
                        alt="ControlNet Result"
                        className="w-full h-auto object-contain bg-gray-50"
                      />
                    </div>

                    {usedSeed && (
                      <p className="text-xs text-center text-gray-400">
                        Seed: <span className="font-mono font-semibold text-gray-600">{usedSeed}</span>
                      </p>
                    )}

                    <button
                      onClick={() => downloadImage(resultImage, "result")}
                      className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Result
                    </button>

                    <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-xl">
                      <div><strong>Scenario:</strong> {scenario}</div>
                      <div><strong>ControlNet:</strong> {controlnetType} (scale: {controlnetScale})</div>
                      <div><strong>Guidance:</strong> {guidanceScale} · <strong>Steps:</strong> {steps}</div>
                      <div><strong>Seed:</strong> {usedSeed || seed}</div>
                    </div>
                  </div>
                )}

                {/* Before / After */}
                {imagePreview && resultImage && !isProcessing && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Before / After</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-center text-gray-400 mb-1">Original</p>
                        <img src={imagePreview} alt="Before" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                      </div>
                      <div>
                        <p className="text-xs text-center text-gray-400 mb-1">Result</p>
                        <img src={resultImage} alt="After" className="w-full h-24 object-cover rounded-xl border border-amber-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!resultImage && !debugEdge && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border-2 border-dashed border-amber-200">
                    <div className="text-center px-4">
                      <svg className="w-14 h-14 text-amber-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                      </svg>
                      <p className="text-gray-600 font-semibold text-base mb-1">Ready to Edit</p>
                      <p className="text-gray-400 text-sm">Upload image, choose ControlNet type, add prompt, then run.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">🏗️ ControlNet Tips</h2>
            <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
              Get the best results with structure-preserving edits
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🎨",
                  color: "from-amber-500 to-orange-500",
                  title: "Mention Colors to Remove",
                  desc: 'Add the original color to negative prompt, e.g. "navy, dark blue" when changing navy background. This forces the AI away from the original.',
                },
                {
                  icon: "⚖️",
                  color: "from-orange-500 to-red-500",
                  title: "Balance Structure vs Creativity",
                  desc: "ControlNet Scale 1.0 = follow structure strictly. Lower to 0.7–0.8 for more creative freedom. Higher than 1.5 may cause artifacts.",
                },
                {
                  icon: "✏️",
                  color: "from-yellow-500 to-amber-500",
                  title: "Start with Canny",
                  desc: "Canny edge is the most stable and doesn't require extra libraries. Start here, then try SoftEdge for more organic results.",
                },
                {
                  icon: "🔍",
                  color: "from-blue-500 to-indigo-500",
                  title: "Use Debug Mode",
                  desc: 'Enable "Return Edge Map" to see exactly what structural guidance the AI is using. Use this to tune canny thresholds.',
                },
                {
                  icon: "🔁",
                  color: "from-green-500 to-emerald-500",
                  title: "Save Your Seed",
                  desc: "Copy the seed from successful results. Re-use it with slightly different prompts to explore variations consistently.",
                },
                {
                  icon: "📐",
                  color: "from-purple-500 to-pink-500",
                  title: "Canny Threshold Tuning",
                  desc: "Lower thresholds (50/150) = more edge detail. Higher (150/250) = only major outlines. Match to your motif complexity.",
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
