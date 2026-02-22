"use client";
import { useState, useRef, useCallback } from "react";

const MULTI_CONTROLNET_API_URL = "https://multi-controlnet.wempyaw.com";

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

const CANNY_PRESETS = [
  { label: "More Detail", low: 50, high: 100, desc: "More edges, fine details" },
  { label: "Balanced", low: 100, high: 200, desc: "Recommended default" },
  { label: "Outline Only", low: 150, high: 250, desc: "Main structural edges only" },
];

const BLEND_PRESETS = [
  { label: "Equal Blend", s1: 0.5, s2: 0.5, desc: "Perfect 50/50 fusion" },
  { label: "Dominant 1", s1: 0.7, s2: 0.3, desc: "Motif 1 dominates (70%)" },
  { label: "Dominant 2", s1: 0.3, s2: 0.7, desc: "Motif 2 dominates (70%)" },
  { label: "Subtle Accent", s1: 0.8, s2: 0.2, desc: "Motif 1 + subtle Motif 2 hint" },
];

const EXAMPLE_PROMPTS = [
  "batik combining Kawung and Parang motifs, traditional Indonesian batik style",
  "batik Kawung pattern with subtle Parang influences, deep indigo and gold",
  "batik combining Mega Mendung and Sekar Jagad motifs, cloud-flower fusion",
  "seamless fusion of Kawung, Parang, and Mega Mendung batik motifs",
  "batik blending two traditional motifs, vibrant red and metallic gold",
  "traditional Indonesian batik combining geometric and floral patterns",
  "batik fusion of classic motifs, rich brown and cream heritage palette",
];

function DropZone({ label, accept, file, preview, onFile, onClear, icon, hint, required, number }) {
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
            <img src={preview} alt={label} className="w-full h-40 object-contain bg-gray-100 rounded-2xl" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
              <span className="text-white text-xs font-medium">Click to replace</span>
            </div>
            <div className="p-1.5 text-center text-xs text-green-700 font-medium truncate px-3">
              ✅ {file?.name}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 p-3 text-center">
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

function WeightSlider({ label, value, onChange, color = "amber" }) {
  const colorMap = {
    amber: { track: "accent-amber-600", pct: "text-amber-600" },
    orange: { track: "accent-orange-500", pct: "text-orange-600" },
    red: { track: "accent-red-500", pct: "text-red-600" },
  };
  const c = colorMap[color] || colorMap.amber;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        <span className={`text-sm font-bold ${c.pct}`}>{value.toFixed(1)}</span>
      </div>
      <input
        type="range" min="0.1" max="1.0" step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${c.track}`}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Subtle (0.1)</span>
        <span>Equal (0.5)</span>
        <span>Dominant (1.0)</span>
      </div>
    </div>
  );
}

export default function MultiControlNetPage() {
  // Images
  const [image1, setImage1] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview2, setPreview2] = useState(null);

  // Scales
  const [scale1, setScale1] = useState(0.5);
  const [scale2, setScale2] = useState(0.5);

  // Canny
  const [cannyLow, setCannyLow] = useState(100);
  const [cannyHigh, setCannyHigh] = useState(200);

  // Generation params
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, distorted, low quality, realistic, photo, 3d render"
  );
  const [scenario, setScenario] = useState("scenario2");
  const [steps, setSteps] = useState(40);
  const [guidanceScale, setGuidanceScale] = useState(8.0);
  const [seed, setSeed] = useState(-1);
  const [returnEdges, setReturnEdges] = useState(false);

  // Result
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [edgeMapImage, setEdgeMapImage] = useState(null);
  const [usedSeed, setUsedSeed] = useState(null);
  const [error, setError] = useState("");

  const handleImage = (file, setFile, setPreview) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setResultImage(null);
    setEdgeMapImage(null);
    setError("");
  };

  const clearImage = (setFile, setPreview) => {
    setFile(null);
    setPreview(null);
  };

  const randomizePrompt = () => {
    setPrompt(EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]);
  };

  const applyBlendPreset = (preset) => {
    setScale1(preset.s1);
    setScale2(preset.s2);
  };

  const applyCannyPreset = (preset) => {
    setCannyLow(preset.low);
    setCannyHigh(preset.high);
  };

  const resetParams = () => {
    setScale1(0.5);
    setScale2(0.5);
    setCannyLow(100);
    setCannyHigh(200);
    setSteps(40);
    setGuidanceScale(8.0);
    setSeed(-1);
    setScenario("scenario2");
    setReturnEdges(false);
    setNegativePrompt("blurry, distorted, low quality, realistic, photo, 3d render");
  };

  const handleBlend = async () => {
    if (!image1 || !image2) { setError("Please upload at least Image 1 and Image 2."); return; }
    if (!prompt.trim()) { setError("Please enter a prompt."); return; }

    setIsProcessing(true);
    setError("");
    setResultImage(null);
    setEdgeMapImage(null);
    setUsedSeed(null);

    try {
      const formData = new FormData();
      formData.append("image1", image1);
      formData.append("image2", image2);
      formData.append("prompt", prompt.trim());
      formData.append("scenario", scenario);
      formData.append("scale1", String(scale1));
      formData.append("scale2", String(scale2));
      formData.append("steps", String(steps));
      formData.append("guidance_scale", String(guidanceScale));
      formData.append("seed", String(seed));
      formData.append("canny_low", String(cannyLow));
      formData.append("canny_high", String(cannyHigh));
      if (negativePrompt.trim()) {
        formData.append("negative_prompt", negativePrompt.trim());
      }
      if (returnEdges) {
        formData.append("return_edges", "true");
      }

      const response = await fetch(`${MULTI_CONTROLNET_API_URL}/blend`, {
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
          if (data.edge_map) {
            setEdgeMapImage(`data:${mime};base64,${data.edge_map}`);
          }
        } else if (data.image_url) {
          setResultImage(data.image_url);
        } else {
          throw new Error("No image returned. Response: " + JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Multi-ControlNet error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `multi-controlnet-${scenario}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageCount = [image1, image2].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpolygon points='30,5 55,20 55,50 30,65 5,50 5,20'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-orange-200 mb-8">
            <button onClick={() => (window.location.href = "/")} className="hover:text-white transition-colors">
              Home
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">Batik Multi-ControlNet</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">Multi-Motif Structural Fusion</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Batik Multi-ControlNet
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Seamlessly blend <strong className="text-amber-300">2 batik motifs</strong> into one unified design using multi-ControlNet edge fusion — structural blending without visible seams.
            </p>

            {/* Flow diagram */}
            <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-400 mb-8">
              {[
                { icon: "🖼️", label: "Motif A" },
                { arrow: true },
                { icon: "✏️", label: "Canny Edges" },
                { arrow: true },
                { icon: "🔀", label: "Combine" },
                { arrow: true },
                { icon: "✨", label: "Blended Batik" },
              ].map((item, i) =>
                item.arrow ? (
                  <span key={i} className="text-amber-400 text-lg">→</span>
                ) : (
                  <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                    <span>{item.icon}</span>
                    <span className="font-medium text-gray-200 text-xs">{item.label}</span>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: "✅", text: "Seamless Blending" },
                { icon: "⚖️", text: "Adjustable Weights" },
                { icon: "🔗", text: "2 Input Images" },
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
            {["Upload 2 batik motif images", "Set blend weights per image", "Describe the fusion style", "Get seamlessly blended result!"].map((step, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                {step}
                {i < 3 && <span className="text-white/40 ml-2">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <p className="text-center text-sm text-gray-500 mb-4 font-semibold">Method Comparison</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center">
              <thead>
                <tr className="text-gray-500">
                  <th className="p-2 text-left">Method</th>
                  <th className="p-2">Structure</th>
                  <th className="p-2">Motif Blending</th>
                  <th className="p-2">Spatial Control</th>
                  <th className="p-2">Seamless</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: "Single ControlNet", struct: "✅ Excellent", blend: "❌ No", spatial: "❌ No", seamless: "N/A" },
                  { name: "Multi-ControlNet ⭐", struct: "✅ Good", blend: "✅ Yes", spatial: "❌ No", seamless: "✅ Yes", highlight: true },
                  { name: "Inpainting", struct: "⚠️ Moderate", blend: "✅ Yes", spatial: "✅ Yes", seamless: "❌ Visible" },
                  { name: "Pure T2I", struct: "❌ No", blend: "⚠️ Unpredictable", spatial: "❌ No", seamless: "N/A" },
                ].map((row) => (
                  <tr key={row.name} className={row.highlight ? "bg-amber-50 font-semibold" : ""}>
                    <td className={`p-2.5 text-left font-medium ${row.highlight ? "text-amber-800" : "text-gray-700"}`}>{row.name}</td>
                    <td className="p-2.5 text-gray-600">{row.struct}</td>
                    <td className="p-2.5 text-gray-600">{row.blend}</td>
                    <td className="p-2.5 text-gray-600">{row.spatial}</td>
                    <td className="p-2.5 text-gray-600">{row.seamless}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Left: Inputs ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Step 1: Images & Weights */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Upload Motif Images & Set Blend Weights
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Upload 2 batik images. Each image is converted to <strong>Canny edges</strong> and blended as a ControlNet constraint.
                </p>

                {/* Blend weight presets */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Quick Blend Presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {BLEND_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyBlendPreset(p)}
                        className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors font-medium"
                        title={p.desc}
                      >
                        {p.label} ({p.s1}/{p.s2})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image 1 */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                      Motif A
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                    </p>
                    <DropZone
                      label="First Batik Motif"
                      accept="image/jpeg,image/png,image/webp"
                      file={image1}
                      preview={preview1}
                      onFile={(f) => handleImage(f, setImage1, setPreview1)}
                      onClear={() => clearImage(setImage1, setPreview1)}
                      icon="🖼️"
                      hint="Primary motif image"
                    />
                    {image1 && (
                      <div className="mt-4">
                        <WeightSlider
                          label="Weight (scale1)"
                          value={scale1}
                          onChange={setScale1}
                          color="amber"
                        />
                      </div>
                    )}
                  </div>

                  {/* Image 2 */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                      Motif B
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                    </p>
                    <DropZone
                      label="Second Batik Motif"
                      accept="image/jpeg,image/png,image/webp"
                      file={image2}
                      preview={preview2}
                      onFile={(f) => handleImage(f, setImage2, setPreview2)}
                      onClear={() => clearImage(setImage2, setPreview2)}
                      icon="🔀"
                      hint="Secondary motif to blend"
                    />
                    {image2 && (
                      <div className="mt-4">
                        <WeightSlider
                          label="Weight (scale2)"
                          value={scale2}
                          onChange={setScale2}
                          color="orange"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Weight balance hint */}
                {image1 && image2 && (
                  <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-800 font-semibold mb-1">⚖️ Current Blend Ratio</p>
                    <div className="flex items-center overflow-hidden rounded-full">
                      <div
                        className="h-3 bg-amber-500 transition-all"
                        style={{ width: `${(scale1 / (scale1 + scale2)) * 100}%` }}
                      ></div>
                      <div
                        className="h-3 bg-orange-500 transition-all"
                        style={{ width: `${(scale2 / (scale1 + scale2)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      A: {Math.round((scale1 / (scale1 + scale2)) * 100)}% ·
                      B: {Math.round((scale2 / (scale1 + scale2)) * 100)}%
                      <span className="ml-2 text-gray-400">(Total weight: {(scale1 + scale2).toFixed(1)})</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Prompt */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Describe the Fusion
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Describe how you want the motifs to be combined. Mention the motif names for clearer guidance.
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
                    placeholder="e.g. batik combining Kawung and Parang motifs, traditional Indonesian batik style"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    💡 Tip: Name the specific batik motifs (Kawung, Parang, Mega Mendung) and describe desired color/style.
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
                </div>
              </div>

              {/* Step 3: Parameters */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Advanced Parameters
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

                {/* Canny thresholds */}
                <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span>✏️</span> Canny Edge Thresholds
                    <span className="text-xs text-gray-400 font-normal">(applied to all motif images)</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {CANNY_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyCannyPreset(p)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                          cannyLow === p.low && cannyHigh === p.high
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        {p.label} ({p.low}/{p.high})
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-semibold text-gray-600">Low Threshold</label>
                        <span className="text-xs font-bold text-amber-600">{cannyLow}</span>
                      </div>
                      <input
                        type="range" min="30" max="200" step="10"
                        value={cannyLow}
                        onChange={(e) => setCannyLow(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">Higher = fewer weak edges</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-semibold text-gray-600">High Threshold</label>
                        <span className="text-xs font-bold text-amber-600">{cannyHigh}</span>
                      </div>
                      <input
                        type="range" min="100" max="300" step="10"
                        value={cannyHigh}
                        onChange={(e) => setCannyHigh(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">Higher = only strongest edges</p>
                    </div>
                  </div>
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
                  <div className="space-y-5">
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
                        <span>Balanced (8)</span>
                        <span>Strict (12)</span>
                      </div>
                    </div>

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

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seed</label>
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                        placeholder="-1 for random"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">-1 = random · Set number to reproduce</p>
                    </div>

                    {/* Debug: return edges */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={returnEdges}
                          onChange={(e) => setReturnEdges(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-amber-600 rounded"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Return Edge Maps (Debug)</p>
                          <p className="text-xs text-gray-400">Returns side-by-side Canny edge maps alongside the result</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Blend Button */}
                <button
                  onClick={handleBlend}
                  disabled={isProcessing || !image1 || !image2 || !prompt.trim()}
                  className={`w-full mt-8 py-5 px-6 text-lg font-bold rounded-2xl transition-all duration-300 transform ${
                    isProcessing || !image1 || !image2 || !prompt.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Blending motifs... (may take ~30–60s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>🔀 Blend Motifs ({imageCount} image{imageCount !== 1 ? "s" : ""})</span>
                    </div>
                  )}
                </button>

                {(!image1 || !image2 || !prompt.trim()) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!image1 && <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">⚠ Upload Motif A (Image 1)</span>}
                    {!image2 && <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">⚠ Upload Motif B (Image 2)</span>}
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
                      <p className="text-amber-800 font-bold text-base mb-1">🔀 Fusing motifs...</p>
                      <p className="text-amber-600 text-sm">2 motifs · weights {scale1}/{scale2}</p>
                    </div>
                  </div>
                )}

                {/* Result Image */}
                {resultImage && !isProcessing && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow">
                      <img src={resultImage} alt="Blended Result" className="w-full h-auto object-contain bg-gray-50" />
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
                      <div><strong>Weights:</strong> {scale1} / {scale2}</div>
                      <div><strong>Canny:</strong> {cannyLow}/{cannyHigh} · <strong>CFG:</strong> {guidanceScale}</div>
                      <div><strong>Steps:</strong> {steps} · <strong>Seed:</strong> {usedSeed || seed}</div>
                    </div>

                    {/* Edge map debug */}
                    {edgeMapImage && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">🔍 Edge Maps (Debug)</p>
                        <img src={edgeMapImage} alt="Edge Maps" className="w-full rounded-xl border border-gray-200" />
                      </div>
                    )}
                  </div>
                )}

                {/* Input motifs reference */}
                {preview1 && preview2 && resultImage && !isProcessing && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Input Motifs</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <p className="text-xs text-center text-amber-500 font-semibold mb-1">A</p>
                        <img src={preview1} alt="Motif A" className="w-full h-16 object-cover rounded-lg border border-amber-200" />
                      </div>
                      <div>
                        <p className="text-xs text-center text-orange-500 font-semibold mb-1">B</p>
                        <img src={preview2} alt="Motif B" className="w-full h-16 object-cover rounded-lg border border-orange-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!resultImage && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border-2 border-dashed border-amber-200">
                    <div className="text-center px-4">
                      <svg className="w-14 h-14 text-amber-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 font-semibold text-base mb-1">Ready to Blend</p>
                      <p className="text-gray-400 text-sm">Upload 2 motif images, add prompt, then run.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">🔀 Multi-ControlNet Tips</h2>
            <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
              Get the best motif blending results with these guidelines
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "⚖️",
                  color: "from-amber-500 to-orange-500",
                  title: "Start with 50/50 Weights",
                  desc: "Begin with equal weights (0.5/0.5) to get a balanced blend. Then adjust to favor one motif. Weights don't need to sum to 1.0.",
                },
                {
                  icon: "🎯",
                  color: "from-orange-500 to-red-500",
                  title: "One Motif Dominates?",
                  desc: "If one motif overpowers the result, decrease its scale and increase the weaker one. Try 0.4/0.6 instead of 0.7/0.3.",
                },
                {
                  icon: "🌪️",
                  color: "from-yellow-500 to-amber-500",
                  title: "Messy / Chaotic Result?",
                  desc: "Reduce both scales (e.g. 0.3/0.3) and increase guidance_scale to 10.0. This lets the prompt guide more strongly.",
                },
                {
                  icon: "✏️",
                  color: "from-green-500 to-emerald-500",
                  title: "Adjust Canny Thresholds",
                  desc: "If edges are too noisy (messy blend), use high thresholds (150/250). Too sparse (lost detail), use low thresholds (50/100).",
                },
                {
                  icon: "💬",
                  color: "from-blue-500 to-indigo-500",
                  title: "Name Your Motifs in the Prompt",
                  desc: "Saying 'combining Kawung and Parang' helps the model understand the intent. Add 'traditional Indonesian batik style' for quality.",
                },
                {
                  icon: "🔁",
                  color: "from-purple-500 to-pink-500",
                  title: "Not Blending at All?",
                  desc: "Ensure both scales > 0. Try increasing steps to 50 and use guidance_scale 8.0. Check that both images are valid batik patterns.",
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
