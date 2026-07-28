"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "https://rispro-brain-tumor.wempyaw.com";

// ─── 5 Model Scenarios ─────────────────────────────────────────────────────────
const MODELS = [
  {
    id:          "Sekenario Satu_model",
    label:       "Skenario 1",
    short:       "S1",
    desc:        "Baseline — arsitektur standar",
    badge:       "Default",
    badgeColor:  "bg-blue-100 text-blue-700",
    color:       "#3b82f6",
    border:      "border-blue-300",
    bg:          "bg-blue-50",
    recommended: true,
  },
  {
    id:          "Sekenario Dua_model",
    label:       "Skenario 2",
    short:       "S2",
    desc:        "Augmentasi data ditingkatkan",
    badge:       "Augmented",
    badgeColor:  "bg-violet-100 text-violet-700",
    color:       "#8b5cf6",
    border:      "border-violet-300",
    bg:          "bg-violet-50",
    recommended: false,
  },
  {
    id:          "Sekenario Tiga_model",
    label:       "Skenario 3",
    short:       "S3",
    desc:        "Transfer learning pretrained",
    badge:       "Transfer",
    badgeColor:  "bg-emerald-100 text-emerald-700",
    color:       "#10b981",
    border:      "border-emerald-300",
    bg:          "bg-emerald-50",
    recommended: false,
  },
  {
    id:          "Sekenario Empat_model",
    label:       "Skenario 4",
    short:       "S4",
    desc:        "Fine-tuning lapisan akhir",
    badge:       "Fine-tuned",
    badgeColor:  "bg-orange-100 text-orange-700",
    color:       "#f97316",
    border:      "border-orange-300",
    bg:          "bg-orange-50",
    recommended: false,
  },
  {
    id:          "Sekenario Lima_model",
    label:       "Skenario 5",
    short:       "S5",
    desc:        "Ensemble optimasi terbaik",
    badge:       "Best",
    badgeColor:  "bg-rose-100 text-rose-700",
    color:       "#f43f5e",
    border:      "border-rose-300",
    bg:          "bg-rose-50",
    recommended: false,
  },
];

const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]));

// ─── Tumor classes (same 4 as multi-brain-tumor but independent) ───────────────
const TUMOR_CLASSES = {
  glioma: {
    label: "Glioma", shortLabel: "Gli",
    desc: "Tumor dari sel glial — berkisar dari jinak hingga ganas (grade I–IV)",
    color: "#ef4444", gradient: "from-red-600 to-rose-700",
    bg: "bg-red-50", border: "border-red-200", text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    severity: "Tinggi", icon: "G",
  },
  meningioma: {
    label: "Meningioma", shortLabel: "Men",
    desc: "Tumor pada selaput otak (meninges) — umumnya jinak dan tumbuh lambat",
    color: "#f97316", gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700",
    badge: "bg-orange-100 text-orange-700",
    severity: "Sedang", icon: "M",
  },
  pituitary: {
    label: "Pituitary", shortLabel: "Pit",
    desc: "Tumor pada kelenjar hipofisis — mempengaruhi hormon tubuh",
    color: "#8b5cf6", gradient: "from-violet-600 to-purple-700",
    bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    severity: "Sedang", icon: "P",
  },
  notumor: {
    label: "No Tumor", shortLabel: "Nor",
    desc: "Tidak ditemukan tanda-tanda tumor pada citra MRI",
    color: "#22c55e", gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50", border: "border-green-200", text: "text-green-700",
    badge: "bg-green-100 text-green-700",
    severity: "Normal", icon: "N",
  },
  normal: {
    label: "No Tumor", shortLabel: "Nor",
    desc: "Tidak ditemukan tanda-tanda tumor pada citra MRI",
    color: "#22c55e", gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50", border: "border-green-200", text: "text-green-700",
    badge: "bg-green-100 text-green-700",
    severity: "Normal", icon: "N",
  },
};

function getTumorInfo(className) {
  if (!className) return null;
  const key = className.toString().toLowerCase().replace(/[\s_-]/g, "");
  return (
    TUMOR_CLASSES[key] ||
    TUMOR_CLASSES[className.toLowerCase()] || {
      label: className, shortLabel: className.slice(0, 3).toUpperCase(),
      desc: "Kelas terdeteksi dari model", color: "#6b7280",
      gradient: "from-gray-500 to-gray-600",
      bg: "bg-gray-50", border: "border-gray-200",
      text: "text-gray-700", badge: "bg-gray-100 text-gray-700",
      severity: "-", icon: className.charAt(0).toUpperCase(),
    }
  );
}

// ─── DropZone ──────────────────────────────────────────────────────────────────
function DropZone({ file, preview, onFile, onClear, accentColor }) {
  const inputRef   = useRef(null);
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
        isDragging ? "border-blue-500 bg-blue-50"
        : file     ? "border-blue-400 bg-blue-50/30"
        : "border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/10 cursor-pointer"
      }`}
      style={isDragging || file ? { borderColor: accentColor } : {}}
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
          <img
            src={preview}
            alt="MRI preview"
            className="w-full max-h-80 object-contain bg-black rounded-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
          >
            x
          </button>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-white text-[10px] font-semibold">MRI Otak</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <svg className="w-9 h-9 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload foto MRI otak</p>
          <p className="text-gray-400 text-sm mb-3">Drag & drop atau klik untuk memilih</p>
          <span className="text-xs text-blue-500 font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            JPG, PNG, WebP
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BrainTumorPage() {
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [selectedModel, setSelectedModel] = useState("Sekenario Satu_model");
  const [result, setResult]               = useState(null);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [error, setError]                 = useState("");
  const [serverStatus, setServerStatus]   = useState("checking");
  const [samples, setSamples]             = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(true);

  const resultRef = useRef(null);

  useEffect(() => {
    checkHealth();
    fetchSamples();
  }, []);

  async function fetchSamples() {
    setSamplesLoading(true);
    try {
      const res  = await fetch(`${API_URL}/samples`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = (data.samples || []).map((s) => ({
        name: s.name,
        url:  s.url,
      }));
      setSamples(list);
    } catch {
      // non-critical
    } finally {
      setSamplesLoading(false);
    }
  }

  async function handleSampleClick(sample) {
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
            canvas.width  = img.naturalWidth;
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
    }
  }

  async function checkHealth() {
    setServerStatus("checking");
    try {
      const res  = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      setServerStatus(data.status === "ok" ? "online" : "offline");
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

      const res = await fetch(
        `${API_URL}/predict?model_name=${encodeURIComponent(selectedModel)}`,
        { method: "POST", body: formData }
      );

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

  const predList = result?.prediction
    ? Object.entries(result.prediction)
        .map(([cls, pct]) => ({ cls, pct }))
        .sort((a, b) => b.pct - a.pct)
    : [];

  const topInfo = result?.predicted_class ? getTumorInfo(result.predicted_class) : null;
  const isNormal = topInfo?.label === "No Tumor";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 left-16 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-64 bg-indigo-600 rounded-full blur-3xl" />
        </div>
        {/* Cross-section pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgba(96,165,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.8) 1px, transparent 1px), linear-gradient(0deg, rgba(96,165,250,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.3) 1px, transparent 1px)",
            backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
          }}
        />

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Brain MRI Analysis
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Brain Tumor
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Detection
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Deteksi dan klasifikasi <strong className="text-white">tumor otak</strong> dari citra MRI
              menggunakan <strong className="text-blue-300">5 skenario model deep learning</strong>.
              Pilih skenario, upload MRI, dan lihat hasilnya.
            </p>

            {/* 5 Model scenario tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    selectedModel === m.id
                      ? "bg-white text-slate-900 border-white shadow-lg scale-105"
                      : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0"
                    style={{ backgroundColor: selectedModel === m.id ? m.color : "rgba(255,255,255,0.2)" }}
                  >
                    {m.short}
                  </span>
                  {m.label}
                  {m.recommended && (
                    <span className="text-[9px] bg-blue-400/30 text-blue-300 px-1.5 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tumor class chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(TUMOR_CLASSES)
                .filter(([k]) => k !== "normal")
                .map(([key, cls]) => (
                  <span
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/70"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-white text-[8px] font-extrabold"
                      style={{ backgroundColor: cls.color }}
                    >
                      {cls.icon}
                    </span>
                    {cls.label}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* ── Left ── */}
          <div className="space-y-6">

            {/* Active scenario card */}
            <div
              className="rounded-2xl border-2 p-4 flex items-center gap-3 transition-all duration-300"
              style={{
                borderColor: activeModel.color + "88",
                backgroundColor: activeModel.color + "10",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
                style={{ backgroundColor: activeModel.color }}
              >
                {activeModel.short}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800 text-sm">{activeModel.label}</p>
                <p className="text-xs text-gray-500 truncate">{activeModel.desc}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${activeModel.badgeColor}`}>
                {activeModel.badge}
              </span>
            </div>

            {/* DropZone */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: activeModel.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Upload Citra MRI Otak
              </h2>

              <DropZone
                file={imageFile}
                preview={imagePreview}
                onFile={handleFile}
                onClear={handleClear}
                accentColor={activeModel.color}
              />

              {/* Samples */}
              {(samplesLoading || samples.length > 0) && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Atau coba dengan gambar sample:</p>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                    {samplesLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                        ))
                      : samples.map((s, idx) => (
                          <button
                            key={s.url || idx}
                            onClick={() => handleSampleClick(s)}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent transition-all hover:scale-105 focus:outline-none bg-black"
                            style={{ "--hover-border": activeModel.color }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = activeModel.color}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
                            title={s.name}
                          >
                            <img
                              src={s.url}
                              alt={s.name}
                              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                            />
                          </button>
                        ))}
                  </div>
                </div>
              )}

              {/* Predict button — color changes with active model */}
              <button
                id="predict-button"
                onClick={handlePredict}
                disabled={!canPredict}
                className={`mt-5 w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                  canPredict
                    ? "text-white shadow-lg hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                style={
                  canPredict
                    ? {
                        background: `linear-gradient(135deg, ${activeModel.color}, ${activeModel.color}cc)`,
                        boxShadow: `0 8px 24px ${activeModel.color}33`,
                      }
                    : {}
                }
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Menganalisis MRI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Deteksi dengan {activeModel.label}
                  </>
                )}
              </button>

              {serverStatus === "offline" && (
                <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <span className="text-red-600 text-sm font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Server offline
                  </span>
                  <button onClick={checkHealth} className="text-red-600 text-xs font-semibold underline hover:no-underline">
                    Coba lagi
                  </button>
                </div>
              )}
            </div>

            {/* Scenario comparison mini-table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                5 Skenario Model
              </p>
              <div className="space-y-2">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      selectedModel === m.id ? "ring-2" : "hover:bg-gray-50"
                    }`}
                    style={selectedModel === m.id ? {
                      backgroundColor: m.color + "15",
                      ringColor: m.color,
                      outline: `2px solid ${m.color}66`,
                    } : {}}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.short}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">{m.label}</p>
                      <p className="text-[10px] text-gray-500 truncate">{m.desc}</p>
                    </div>
                    {selectedModel === m.id && (
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: m.color }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-blue-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips untuk hasil terbaik
              </p>
              <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                <li>Gunakan citra MRI T1-weighted atau T2-weighted</li>
                <li>Potongan axial memberikan hasil paling konsisten</li>
                <li>Pastikan citra tidak terpotong dan kontras baik</li>
                <li>Coba beberapa skenario untuk hasil komparatif</li>
              </ul>
            </div>
          </div>

          {/* ── Right: Result ── */}
          <div ref={resultRef} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
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
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-72">
                {/* Model-colored spinner */}
                <div className="relative w-20 h-20 mb-5">
                  <div
                    className="w-20 h-20 rounded-full border-4 border-gray-100"
                    style={{ borderTopColor: activeModel.color }}
                  />
                  <div
                    className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent animate-spin"
                    style={{ borderTopColor: activeModel.color }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-white text-sm font-extrabold w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: activeModel.color }}
                    >
                      {activeModel.short}
                    </span>
                  </div>
                </div>
                <p className="text-gray-800 font-bold text-lg mb-1">Menganalisis MRI...</p>
                <p className="text-gray-400 text-sm">{activeModel.label} sedang memproses</p>
              </div>
            )}

            {/* Idle */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-72 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
                  style={{ backgroundColor: activeModel.color + "18" }}
                >
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: activeModel.color }}
                  >
                    {activeModel.short}
                  </span>
                </div>
                <p className="text-gray-700 font-semibold">Siap Menganalisis</p>
                <p className="text-gray-400 text-sm mt-1">
                  Upload MRI dan klik "Deteksi dengan {activeModel.label}"
                </p>
              </div>
            )}

            {/* Result */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${topInfo.gradient} p-6 text-white`}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold flex-shrink-0">
                      {topInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Hasil Deteksi — {MODEL_MAP[result.model_used]?.label || result.model_used}
                      </p>
                      <h3 className="text-2xl font-extrabold leading-tight">{topInfo.label}</h3>
                      <span className="inline-block mt-1 text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
                        {topInfo.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/75 text-sm mt-4 leading-relaxed">{topInfo.desc}</p>
                </div>

                <div className="p-5 space-y-5">

                  {/* Confidence bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence</span>
                      <span className="text-base font-extrabold" style={{ color: topInfo.color }}>
                        {result.confidence?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${result.confidence?.toFixed(1)}%`,
                          background: `linear-gradient(90deg, ${topInfo.color}, ${topInfo.color}99)`,
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
                          const info   = getTumorInfo(cls);
                          const isTop  = cls === result.predicted_class;
                          const numPct = typeof pct === "number" ? pct : parseFloat(pct);
                          return (
                            <div key={cls}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0"
                                    style={{ backgroundColor: info?.color || "#6b7280", opacity: isTop ? 1 : 0.4 }}
                                  >
                                    {info?.icon || cls.charAt(0).toUpperCase()}
                                  </span>
                                  <span className={`text-sm font-semibold ${isTop ? (info?.text || "text-gray-700") : "text-gray-400"}`}>
                                    {info?.label || cls}
                                  </span>
                                  {isTop && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${info?.badge || "bg-gray-100 text-gray-600"}`}>
                                      Prediksi
                                    </span>
                                  )}
                                </div>
                                <span className={`text-sm font-bold tabular-nums ${isTop ? (info?.text || "text-gray-700") : "text-gray-400"}`}>
                                  {numPct.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-2 rounded-full transition-all duration-700"
                                  style={{
                                    width: `${numPct}%`,
                                    backgroundColor: info?.color || "#6b7280",
                                    opacity: isTop ? 1 : 0.3,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Model</p>
                      <p className="text-sm font-bold text-gray-700">
                        {MODEL_MAP[result.model_used]?.label || result.model_used}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Waktu Inferensi</p>
                      <p className="text-sm font-bold text-gray-700">{result.inference_time_ms?.toFixed(0)} ms</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <strong>Perhatian:</strong> Hasil ini hanya untuk keperluan penelitian dan tidak
                      menggantikan diagnosis radiologis atau medis profesional. Selalu konsultasikan dengan dokter spesialis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-model suggestion */}
            {!isProcessing && result && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-blue-800 font-semibold text-sm mb-2">Coba skenario lain</p>
                <p className="text-blue-600 text-xs mb-3">
                  Bandingkan hasil dari skenario berbeda untuk validasi silang:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MODELS.filter((m) => m.id !== selectedModel).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: m.color }}
                    >
                      <span className="font-extrabold">{m.short}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
