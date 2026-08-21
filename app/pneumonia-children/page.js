"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import ProjectInfoPanel from "@/components/demos/ProjectInfoPanel";

const API_URL = "/api/rispro/9009";

// ─── Model Schemas ─────────────────────────────────────────────────────────────
const MODELS = [
  {
    id: "Skema 1_model",
    label: "Skema 1",
    desc: "Model utama — arsitektur dasar",
    badge: "Default",
    badgeColor: "bg-blue-100 text-blue-700",
    color: "#3b82f6",
    border: "border-blue-300",
    bg: "bg-blue-50",
    recommended: true,
  },
  {
    id: "Skema 2_model",
    label: "Skema 2",
    desc: "Arsitektur alternatif — recall lebih tinggi",
    badge: "Alternatif",
    badgeColor: "bg-violet-100 text-violet-700",
    color: "#8b5cf6",
    border: "border-violet-300",
    bg: "bg-violet-50",
    recommended: false,
  },
  {
    id: "Skema 3_model",
    label: "Skema 3",
    desc: "Arsitektur presisi tinggi",
    badge: "High Precision",
    badgeColor: "bg-emerald-100 text-emerald-700",
    color: "#10b981",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    recommended: false,
  },
];

const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]));

// ─── Class definitions (NORMAL vs PNEUMONIA) ───────────────────────────────────
function getClassInfo(className) {
  const lower = (className || "").toLowerCase();
  if (lower.includes("normal") || lower === "normal") {
    return {
      label: "Normal",
      desc: "Paru-paru dalam kondisi normal, tidak ditemukan tanda pneumonia",
      color: "#22c55e",
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-700",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      risk: "Rendah",
      riskColor: "text-green-600",
    };
  }
  return {
    label: "Pneumonia",
    desc: "Terdeteksi tanda-tanda infeksi paru-paru (pneumonia) pada citra X-ray",
    color: "#ef4444",
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    risk: "Tinggi",
    riskColor: "text-red-600",
  };
}

// ─── DropZone ──────────────────────────────────────────────────────────────────
function DropZone({ file, preview, onFile, onClear }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 overflow-hidden ${
        isDragging
          ? "border-sky-500 bg-sky-50"
          : file
          ? "border-sky-400 bg-sky-50/30"
          : "border-gray-300 hover:border-sky-400 bg-gray-50 hover:bg-sky-50/20 cursor-pointer"
      }`}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      {preview ? (
        <div className="relative">
          <img src={preview} alt="X-ray preview" className="w-full max-h-80 object-contain bg-black/5 rounded-2xl" />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
          >
            x
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload foto X-ray dada</p>
          <p className="text-gray-400 text-sm mb-3">Drag & drop atau klik untuk memilih</p>
          <span className="text-xs text-sky-500 font-medium bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            JPG, PNG, WebP
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PneumoniaChildrenPage() {
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState("Skema 1_model");
  const [result, setResult]             = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError]               = useState("");
  const [serverStatus, setServerStatus] = useState("checking");
  const [samples, setSamples]           = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [loadingSample, setLoadingSample]  = useState(null);

  const resultRef = useRef(null);

  useEffect(() => {
    checkHealth();
    fetchSamples();
  }, []);

  async function fetchSamples() {
    setSamplesLoading(true);
    try {
      const res = await fetch(`${API_URL}/samples`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // API returns { "samples": [{ "name": "...", "url": "...", "size_kb": ... }] }
      const list = (data.samples || []).map((s) => ({
        name: s.name,
        url:  s.url.replace(/^https?:\/\/[^/]+/, "/api/rispro/9009"),
      }));
      setSamples(list);
    } catch {
      // samples not critical
    } finally {
      setSamplesLoading(false);
    }
  }

  async function handleSampleClick(sample) {
    if (loadingSample) return;
    setLoadingSample(sample.url);
    setImagePreview(sample.url);
    setImageFile(null);
    setResult(null);
    setError("");

    try {
      const res = await fetch(sample.url, { cache: "force-cache" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setImageFile(new File([blob], sample.name, { type: blob.type || "image/jpeg" }));
    } catch {
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d").drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (!blob) return reject();
              setImageFile(new File([blob], sample.name, { type: "image/jpeg" }));
              resolve();
            }, "image/jpeg", 0.95);
          };
          img.onerror = reject;
          img.src = sample.url;
        });
      } catch {
        // Preview shown; file resolved on predict
      }
    } finally {
      setLoadingSample(null);
    }
  }

  async function checkHealth() {
    setServerStatus("checking");
    try {
      const res  = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data.status === "ok") {
        setServerStatus("online");
      } else {
        setServerStatus("offline");
      }
    } catch {
      setServerStatus("offline");
    }
  }

  const handleFile = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError("");
  };

  const handlePredict = async () => {
    if (!imageFile && !imagePreview) return;
    setIsProcessing(true);
    setError("");
    setResult(null);

    try {
      let fileToSend = imageFile;
      if (!fileToSend && imagePreview) {
        const r = await fetch(imagePreview);
        const b = await r.blob();
        fileToSend = new File([b], "sample.jpg", { type: b.type || "image/jpeg" });
      }

      const formData = new FormData();
      formData.append("file", fileToSend);

      const res = await fetch(`${API_URL}/predict?model_name=${encodeURIComponent(selectedModel)}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch (err) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOnline    = serverStatus === "online";
  const canPredict  = isOnline && (!!imageFile || !!imagePreview) && !isProcessing;
  const activeModel = MODEL_MAP[selectedModel] || MODELS[0];

  // Build sorted prediction list from result.prediction object
  const predList = result?.prediction
    ? Object.entries(result.prediction)
        .map(([cls, pct]) => ({ cls, pct }))
        .sort((a, b) => b.pct - a.pct)
    : [];

  const topInfo = result?.predicted_class ? getClassInfo(result.predicted_class) : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 left-16 w-80 h-80 bg-sky-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-72 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute top-20 right-32 w-48 h-48 bg-blue-600 rounded-full blur-2xl" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Pneumonia
              <span className="block bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                Detection
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Deteksi <strong className="text-white">pneumonia pada anak-anak</strong> dari foto
              X-ray dada menggunakan <strong className="text-sky-300">3 skema model deep learning</strong>.
              Upload citra X-ray dan dapatkan diagnosis secara real-time.
            </p>

            {/* Class chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { label: "Normal", color: "bg-green-500/20 text-green-300 border-green-500/30" },
                { label: "Pneumonia", color: "bg-red-500/20 text-red-300 border-red-500/30" },
              ].map((c) => (
                <span
                  key={c.label}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${c.color}`}
                >
                  {c.label}
                </span>
              ))}
            </div>

            {/* Model selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    selectedModel === m.id
                      ? "bg-white text-slate-900 border-white shadow-lg scale-105"
                      : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
                  }`}
                >
                  {m.label}
                  {m.recommended && (
                    <span className="ml-1.5 text-[10px] bg-sky-400/30 text-sky-300 px-1.5 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* ── Left: Upload + Samples ── */}
          <div className="space-y-6">

            {/* Model info card */}
            <div className={`rounded-2xl border-2 ${activeModel.border} ${activeModel.bg} p-4 flex items-center gap-3`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
                style={{ backgroundColor: activeModel.color }}
              >
                {activeModel.label.charAt(activeModel.label.length - 1)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm">{activeModel.label}</p>
                <p className="text-xs text-gray-500 truncate">{activeModel.desc}</p>
              </div>
              <span className={`ml-auto px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${activeModel.badgeColor}`}>
                {activeModel.badge}
              </span>
            </div>

            {/* DropZone */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Citra X-ray
              </h2>

              <DropZone
                file={imageFile}
                preview={imagePreview}
                onFile={handleFile}
                onClear={handleClear}
              />

              {/* Sample gallery */}
              {(samplesLoading || samples.length > 0) && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Atau coba dengan gambar sample:</p>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                    {samplesLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                        ))
                      : samples.map((s, idx) => {
                          const isSelected = imagePreview === s.url;
                          const isFetching = loadingSample === s.url;
                          return (
                            <button
                              key={s.url || idx}
                              onClick={() => handleSampleClick(s)}
                              disabled={!!loadingSample}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 focus:outline-none ${isSelected ? 'border-sky-500 ring-2 ring-sky-300' : 'border-transparent hover:border-sky-400'} ${loadingSample && !isFetching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              title={s.name}
                            >
                              <img src={s.url} alt={s.name} className="w-full h-full object-cover pointer-events-none" />
                              {isFetching && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                  </div>
                </div>
              )}

              {/* Predict button */}
              <button
                id="predict-button"
                onClick={handlePredict}
                disabled={!canPredict}
                className={`mt-5 w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                  canPredict
                    ? "bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-sky-500/30 hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Analisis X-ray
                  </>
                )}
              </button>

              {/* Server offline notice */}
              {serverStatus === "offline" && (
                <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <span className="text-red-600 text-sm font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Server offline
                  </span>
                  <button
                    onClick={checkHealth}
                    className="text-red-600 text-xs font-semibold underline hover:no-underline"
                  >
                    Coba lagi
                  </button>
                </div>
              )}
            </div>

            {/* Tips card */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
              <p className="text-sky-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips untuk hasil terbaik
              </p>
              <ul className="text-sky-700 text-xs space-y-1 list-disc list-inside">
                <li>Gunakan foto X-ray dada bagian depan (PA view)</li>
                <li>Pastikan gambar tidak terlalu gelap atau overexposed</li>
                <li>Foto harus mencakup seluruh rongga dada</li>
                <li>Resolusi gambar minimal 224x224 piksel</li>
              </ul>
            </div>
          </div>

          {/* ── Right: Result ── */}
          <div ref={resultRef}>

            {/* Error */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analisis Gagal
                </p>
                <p className="text-red-600 text-xs break-words">{error}</p>
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-64">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-sky-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-800 font-bold text-base mb-1">Menganalisis citra X-ray...</p>
                <p className="text-gray-400 text-sm">Model: {activeModel.label}</p>
              </div>
            )}

            {/* Idle state */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-64 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">Siap Menganalisis</p>
                <p className="text-gray-400 text-sm mt-1">Upload foto X-ray dan klik tombol analisis</p>
              </div>
            )}

            {/* Result card */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Color header */}
                <div className={`bg-gradient-to-r ${topInfo.gradient} p-6 text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {topInfo.icon}
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Hasil Analisis
                      </p>
                      <h3 className="text-3xl font-extrabold leading-tight">{topInfo.label}</h3>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mt-3 leading-relaxed">{topInfo.desc}</p>
                </div>

                <div className="p-5 space-y-5">

                  {/* Confidence bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence</span>
                      <span
                        className="text-base font-extrabold"
                        style={{ color: topInfo.color }}
                      >
                        {result.confidence?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${result.confidence?.toFixed(1)}%`,
                          background: `linear-gradient(90deg, ${topInfo.color}, ${topInfo.color}aa)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* All class probabilities */}
                  {predList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Probabilitas per Kelas
                      </p>
                      <div className="space-y-3">
                        {predList.map(({ cls, pct }) => {
                          const info = getClassInfo(cls);
                          const isTop = cls === result.predicted_class;
                          return (
                            <div key={cls}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-semibold ${isTop ? info.text : "text-gray-500"}`}>
                                  {info.label}
                                  {isTop && (
                                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${info.badge}`}>
                                      Prediksi
                                    </span>
                                  )}
                                </span>
                                <span className={`text-sm font-bold ${isTop ? info.text : "text-gray-400"}`}>
                                  {typeof pct === "number" ? pct.toFixed(1) : pct}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-2 rounded-full transition-all duration-700"
                                  style={{
                                    width: `${typeof pct === "number" ? pct : parseFloat(pct)}%`,
                                    backgroundColor: info.color,
                                    opacity: isTop ? 1 : 0.4,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                        Model Digunakan
                      </p>
                      <p className="text-sm font-bold text-gray-700 truncate">
                        {MODEL_MAP[result.model_used]?.label || result.model_used}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                        Waktu Inferensi
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {result.inference_time_ms?.toFixed(0)} ms
                      </p>
                    </div>
                  </div>

                  {/* Clinical disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <strong>Perhatian:</strong> Hasil ini hanya untuk keperluan penelitian dan tidak menggantikan
                      diagnosis medis profesional. Selalu konsultasikan dengan dokter untuk penanganan lebih lanjut.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Floating Project Info Panel */}
      <ProjectInfoPanel projectId="019fd052-4127-79f4-bce7-6d30af26f925" />
    </div>
  );
}
