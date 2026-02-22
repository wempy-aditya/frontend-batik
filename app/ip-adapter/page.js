"use client";
import { useState, useRef, useCallback } from "react";

const IPADAPTER_API_URL = "https://ip-adapter.wempyaw.com/";

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

const SCALE_PRESETS = [
  { label: "Creative (Loose)", value: 0.3, desc: "More freedom, loose reference" },
  { label: "Balanced", value: 0.6, desc: "Recommended starting point" },
  { label: "Conservative", value: 0.8, desc: "Closely follows input style" },
  { label: "Max Influence", value: 1.0, desc: "Almost identical to input" },
];

const EXAMPLE_PROMPTS = [
  "batik pattern in vibrant red and metallic gold colors, traditional Indonesian batik style",
  "batik in deep indigo blue and silver, modern Javanese batik style, flat 2D textile",
  "batik combining elegant purple and gold tones, royal traditional batik illustration",
  "modern minimalist batik with clean geometric patterns, teal and cream color scheme",
  "batik in emerald green and ivory, traditional kawung style, flat 2D textile pattern",
  "batik with bright crimson and copper accents, intricate traditional Javanese motif",
  "contemporary batik with black background and vibrant multicolor accent, flat 2D illustration",
];

const USE_CASES = [
  {
    id: "style-transfer",
    icon: "🎨",
    label: "Style Transfer",
    desc: "Change colors while keeping style/concept",
    promptHint: "batik in [NEW_COLORS], traditional style",
    scale: 0.6,
  },
  {
    id: "artistic",
    icon: "🖌️",
    label: "Artistic Reinterpretation",
    desc: "Modern take on traditional motif",
    promptHint: "modern minimalist batik with [DESCRIPTION]",
    scale: 0.4,
  },
  {
    id: "blend",
    icon: "🔀",
    label: "Concept Blending",
    desc: "Combine features from up to 3 images",
    promptHint: "batik combining [MOTIF_A] and [MOTIF_B] concepts",
    scale: 0.5,
  },
];

function DropZone({ label, accept, file, preview, onFile, onClear, icon, hint, number, optional }) {
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
    <div className="relative">
      {optional && !file && (
        <span className="absolute -top-2 -right-2 z-10 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full border border-gray-200">
          Optional
        </span>
      )}
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
            <img src={preview} alt={label} className="w-full h-44 object-contain bg-gray-100 rounded-2xl" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
              <span className="text-white text-xs font-medium">Click to replace</span>
            </div>
            <div className="p-1.5 text-center text-xs text-green-700 font-medium truncate px-3">
              ✅ {file?.name}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-44 p-3 text-center">
            <span className="text-3xl mb-2">{icon}</span>
            <p className="font-semibold text-gray-700 text-sm mb-0.5">{label}</p>
            <p className="text-xs text-gray-400">{hint}</p>
          </div>
        )}
      </div>
      {file && onClear && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="mt-1.5 w-full text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          ✕ Remove
        </button>
      )}
    </div>
  );
}

function ScaleSlider({ label, value, onChange, imageNum }) {
  const preset = SCALE_PRESETS.find((p) => p.value === value);
  const color =
    value <= 0.35 ? "text-blue-600" :
    value <= 0.65 ? "text-amber-600" :
    value <= 0.85 ? "text-orange-600" :
    "text-red-600";

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        <span className={`text-sm font-bold ${color}`}>{value.toFixed(1)}</span>
      </div>
      <input
        type="range" min="0.1" max="1.0" step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Creative (0.2)</span>
        <span>Balanced (0.6)</span>
        <span>Max (1.0)</span>
      </div>
      {preset && (
        <p className="text-xs text-gray-500 mt-1 italic">{preset.desc}</p>
      )}
      <div className="flex gap-1 mt-2 flex-wrap">
        {SCALE_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
              value === p.value
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-gray-500 border-gray-200 hover:border-amber-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function IPAdapterPage() {
  // Images
  const [image1, setImage1] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [preview3, setPreview3] = useState(null);

  // Scales
  const [scale1, setScale1] = useState(0.6);
  const [scale2, setScale2] = useState(0.6);
  const [scale3, setScale3] = useState(0.6);

  // Generation params
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, distorted, low quality, realistic, photo, 3d render"
  );
  const [scenario, setScenario] = useState("scenario2");
  const [steps, setSteps] = useState(40);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState(-1);

  // Result
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [usedSeed, setUsedSeed] = useState(null);
  const [error, setError] = useState("");

  const handleImage = (file, setFile, setPreview) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setResultImage(null);
    setError("");
  };

  const clearImage = (setFile, setPreview) => {
    setFile(null);
    setPreview(null);
  };

  const randomizePrompt = () => {
    setPrompt(EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]);
  };

  const applyUseCase = (uc) => {
    setScale1(uc.scale);
    setPrompt(uc.promptHint);
  };

  const resetParams = () => {
    setScale1(0.6);
    setScale2(0.6);
    setScale3(0.6);
    setSteps(40);
    setGuidanceScale(7.5);
    setSeed(-1);
    setScenario("scenario2");
    setNegativePrompt("blurry, distorted, low quality, realistic, photo, 3d render");
  };

  const handleBlend = async () => {
    if (!image1) { setError("Please upload at least one image (Image 1)."); return; }
    if (!prompt.trim()) { setError("Please enter a prompt."); return; }

    setIsProcessing(true);
    setError("");
    setResultImage(null);
    setUsedSeed(null);

    try {
      const formData = new FormData();
      formData.append("image1", image1);
      formData.append("prompt", prompt.trim());
      formData.append("scenario", scenario);
      formData.append("scale1", String(scale1));
      formData.append("steps", String(steps));
      formData.append("guidance_scale", String(guidanceScale));
      formData.append("seed", String(seed));
      if (negativePrompt.trim()) {
        formData.append("negative_prompt", negativePrompt.trim());
      }
      if (image2) {
        formData.append("image2", image2);
        formData.append("scale2", String(scale2));
      }
      if (image3) {
        formData.append("image3", image3);
        formData.append("scale3", String(scale3));
      }

      const response = await fetch(`${IPADAPTER_API_URL}/blend`, {
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
      console.error("IP-Adapter error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `ipadapter-${scenario}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageCount = [image1, image2, image3].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
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
            <span className="text-white font-medium">Batik IP-Adapter</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">Latent / Semantic Style Blending</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Batik IP-Adapter
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Transfer and blend batik styles using <strong className="text-amber-300">semantic CLIP features</strong>. More artistic freedom than ControlNet — perfect for creative style transfer and motif concept blending.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: "🧠", text: "Semantic Style Matching" },
                { icon: "🔀", text: "Multi-Image Blending" },
                { icon: "🎨", text: "Creative Freedom" },
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

      {/* Steps banner */}
      <section className="bg-amber-600/90 py-4">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            {["Upload 1–3 reference images", "Set per-image influence scale", "Describe desired result", "Get blended batik!"].map((step, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                {step}
                {i < 3 && <span className="text-white/40 ml-2">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ControlNet vs IP-Adapter comparison */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <p className="text-center text-sm text-gray-500 mb-4 font-semibold">IP-Adapter vs ControlNet</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
            {[
              { label: "Control Type", cn: "Pixel / Spatial", ipa: "Latent / Semantic" },
              { label: "Structure", cn: "✅ Exact", ipa: "⚠️ Conceptual" },
              { label: "Style Transfer", cn: "⚠️ Limited", ipa: "✅ Excellent" },
              { label: "Creative Freedom", cn: "❌ Rigid", ipa: "✅ Flexible" },
            ].map((row) => (
              <div key={row.label} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-600 mb-2">{row.label}</p>
                <p className="text-gray-500 mb-1">CN: {row.cn}</p>
                <p className="text-amber-600 font-semibold">IPA: {row.ipa}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">

          {/* Use Case Quick Presets */}
          <div className="mb-8 bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚡</span> Quick Use Case Presets
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.id}
                  onClick={() => applyUseCase(uc)}
                  className="text-left p-4 rounded-2xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all group"
                >
                  <span className="text-2xl block mb-2">{uc.icon}</span>
                  <p className="font-bold text-gray-800 text-sm mb-1 group-hover:text-amber-700">{uc.label}</p>
                  <p className="text-xs text-gray-500 mb-2">{uc.desc}</p>
                  <p className="text-xs text-amber-600 font-mono bg-amber-50 px-2 py-1 rounded-lg">
                    scale: {uc.scale}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Left: Inputs ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Step 1: Images */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Upload Reference Images
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  Upload 1–3 batik images. IP-Adapter extracts their <strong>semantic style features</strong> (via CLIP) and blends them into the output.
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  Image 1 is required. Images 2 and 3 are optional for multi-motif blending.
                </p>

                <div className="grid md:grid-cols-3 gap-5">
                  {/* Image 1 */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      Image 1
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                    </p>
                    <DropZone
                      label="Primary Image"
                      accept="image/jpeg,image/png,image/webp"
                      file={image1}
                      preview={preview1}
                      onFile={(f) => handleImage(f, setImage1, setPreview1)}
                      onClear={() => clearImage(setImage1, setPreview1)}
                      icon="🖼️"
                      hint="Primary reference"
                    />
                    {image1 && (
                      <div className="mt-3">
                        <ScaleSlider
                          label="Scale 1 (Influence)"
                          value={scale1}
                          onChange={setScale1}
                          imageNum={1}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image 2 */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      Image 2
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Optional</span>
                    </p>
                    <DropZone
                      label="Secondary Image"
                      accept="image/jpeg,image/png,image/webp"
                      file={image2}
                      preview={preview2}
                      onFile={(f) => handleImage(f, setImage2, setPreview2)}
                      onClear={() => clearImage(setImage2, setPreview2)}
                      icon="🔀"
                      hint="For dual-motif blend"
                      optional
                    />
                    {image2 && (
                      <div className="mt-3">
                        <ScaleSlider
                          label="Scale 2 (Influence)"
                          value={scale2}
                          onChange={setScale2}
                          imageNum={2}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image 3 */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      Image 3
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Optional</span>
                    </p>
                    <DropZone
                      label="Tertiary Image"
                      accept="image/jpeg,image/png,image/webp"
                      file={image3}
                      preview={preview3}
                      onFile={(f) => handleImage(f, setImage3, setPreview3)}
                      onClear={() => clearImage(setImage3, setPreview3)}
                      icon="✨"
                      hint="For triple-motif blend"
                      optional
                    />
                    {image3 && (
                      <div className="mt-3">
                        <ScaleSlider
                          label="Scale 3 (Influence)"
                          value={scale3}
                          onChange={setScale3}
                          imageNum={3}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {imageCount >= 2 && (
                  <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                    <strong>🔀 Multi-image mode:</strong> {imageCount} images loaded. API will blend their semantic features. Note: multi-image uses a simplified blending approach — for precise structural blending, consider using ControlNet instead.
                  </div>
                )}
              </div>

              {/* Step 2: Prompt */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Describe Desired Result
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Describe the output you want. The prompt guides <em>what to generate</em>, while the images guide <em>the style/concept</em>.
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
                    placeholder="e.g. batik pattern in vibrant red and metallic gold colors, traditional Indonesian batik style"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    💡 Tip: Describe the new colors/style you want. The images handle the concept/style, prompt handles the transformation direction.
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
                  <p className="text-xs text-gray-400 mt-1">Add original colors to avoid, e.g. "dull, faded" if output looks desaturated.</p>
                </div>
              </div>

              {/* Step 3: Parameters */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
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
                    {/* Guidance Scale */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">Guidance Scale</label>
                        <span className="text-sm font-bold text-amber-600">{guidanceScale}</span>
                      </div>
                      <input
                        type="range" min="5" max="12" step="0.5"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Creative (5)</span>
                        <span>Balanced (7.5)</span>
                        <span>Strict (10+)</span>
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
                        <span>Good (40)</span>
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
                      <p className="text-xs text-gray-400 mt-1">-1 = random · Set number to reproduce results</p>
                    </div>
                  </div>
                </div>

                {/* Blend Button */}
                <button
                  onClick={handleBlend}
                  disabled={isProcessing || !image1 || !prompt.trim()}
                  className={`w-full mt-8 py-5 px-6 text-lg font-bold rounded-2xl transition-all duration-300 transform ${
                    isProcessing || !image1 || !prompt.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Blending... (may take ~30–60s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      <span>🎨 Run IP-Adapter Blend ({imageCount} image{imageCount !== 1 ? "s" : ""})</span>
                    </div>
                  )}
                </button>

                {(!image1 || !prompt.trim()) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!image1 && <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">⚠ Upload at least Image 1</span>}
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
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Error
                    </p>
                    <p className="text-red-600 text-xs break-words">{error}</p>
                  </div>
                )}

                {/* Processing */}
                {isProcessing && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300 mb-4">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-amber-800 font-bold text-base mb-1">🧠 Blending styles...</p>
                      <p className="text-amber-600 text-sm">{imageCount} image{imageCount !== 1 ? "s" : ""} · scale {scale1} · {steps} steps</p>
                    </div>
                  </div>
                )}

                {/* Result Image */}
                {resultImage && !isProcessing && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow">
                      <img src={resultImage} alt="IP-Adapter Result" className="w-full h-auto object-contain bg-gray-50" />
                    </div>

                    {usedSeed && (
                      <p className="text-xs text-center text-gray-400">
                        Seed: <span className="font-mono font-semibold text-gray-600">{usedSeed}</span>
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

                    <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-xl">
                      <div><strong>Scenario:</strong> {scenario}</div>
                      <div><strong>Scale(s):</strong> {scale1}{image2 ? ` / ${scale2}` : ""}{image3 ? ` / ${scale3}` : ""}</div>
                      <div><strong>Guidance:</strong> {guidanceScale} · <strong>Steps:</strong> {steps}</div>
                      <div><strong>Seed:</strong> {usedSeed || seed}</div>
                    </div>
                  </div>
                )}

                {/* Before / After */}
                {preview1 && resultImage && !isProcessing && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Reference vs Result</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-center text-gray-400 mb-1">Reference 1</p>
                        <img src={preview1} alt="Reference" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                      </div>
                      <div>
                        <p className="text-xs text-center text-gray-400 mb-1">Result</p>
                        <img src={resultImage} alt="Result" className="w-full h-24 object-cover rounded-xl border border-amber-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!resultImage && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border-2 border-dashed border-amber-200">
                    <div className="text-center px-4">
                      <svg className="w-14 h-14 text-amber-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      <p className="text-gray-600 font-semibold text-base mb-1">Ready to Blend</p>
                      <p className="text-gray-400 text-sm">Upload image(s), set scales, add prompt, then run.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">🧠 IP-Adapter Tips</h2>
            <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
              Get the best semantic style blending results
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "⚖️",
                  color: "from-amber-500 to-orange-500",
                  title: "Scale = Influence Strength",
                  desc: "Scale 0.6 is the balanced default. Lower (0.3) = more creative freedom. Higher (0.9) = closely follows input style/concept.",
                },
                {
                  icon: "🔀",
                  color: "from-orange-500 to-red-500",
                  title: "Blend Multiple Motifs",
                  desc: "Upload 2–3 images with equal scales (0.5/0.5) to semantically blend different batik motif concepts into one output.",
                },
                {
                  icon: "🎯",
                  color: "from-yellow-500 to-amber-500",
                  title: "Prompt = Transformation Direction",
                  desc: "Images define the style/concept, prompt defines where to take it. Use prompt to specify the new colors or theme.",
                },
                {
                  icon: "🔁",
                  color: "from-green-500 to-emerald-500",
                  title: "Too Similar? Lower the Scale",
                  desc: "If output looks too identical to input, lower scale to 0.4. If output is too different from the reference, raise scale to 0.8.",
                },
                {
                  icon: "🚀",
                  color: "from-blue-500 to-indigo-500",
                  title: "Higher CFG for Color Changes",
                  desc: "Set guidance_scale to 9.0 if the output colors aren't changing enough. Add old colors to negative prompt too.",
                },
                {
                  icon: "🆚",
                  color: "from-purple-500 to-pink-500",
                  title: "IP-Adapter vs ControlNet",
                  desc: "Use ControlNet for exact structure preservation. Use IP-Adapter for creative style transfer — more freedom, less structural rigidity.",
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
