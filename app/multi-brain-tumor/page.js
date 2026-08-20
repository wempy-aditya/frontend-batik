"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "/api/rispro/9010";

// ─── Model definitions ─────────────────────────────────────────────────────────
const MODELS = [
  {
    id: "BALANCE_model",
    label: "Balance",
    desc: "Dataset seimbang — performa stabil di semua kelas",
    badge: "Default",
    badgeColor: "bg-violet-100 text-violet-700",
    color: "#8b5cf6",
    border: "border-violet-300",
    bg: "bg-violet-50",
    recommended: true,
  },
  {
    id: "IMBALANCE_model",
    label: "Imbalance",
    desc: "Dataset asli tanpa augmentasi — cepat, cocok untuk produksi",
    badge: "Produksi",
    badgeColor: "bg-orange-100 text-orange-700",
    color: "#f97316",
    border: "border-orange-300",
    bg: "bg-orange-50",
    recommended: false,
  },
  {
    id: "SPLIT_AUGMENTATION_model",
    label: "Split Aug",
    desc: "Augmentasi data split — generalisasi lebih baik",
    badge: "Best Generalization",
    badgeColor: "bg-emerald-100 text-emerald-700",
    color: "#10b981",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    recommended: false,
  },
];

const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]));

// ─── Brain tumor class info ────────────────────────────────────────────────────
const TUMOR_CLASSES = {
  glioma: {
    label: "Glioma",
    desc: "Tumor yang berasal dari sel glial — bisa bersifat jinak hingga ganas",
    color: "#ef4444",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    gradient: "from-red-600 to-rose-700",
    severity: "Tinggi",
    severityColor: "text-red-600",
    icon: "G",
    iconBg: "bg-red-500",
  },
  meningioma: {
    label: "Meningioma",
    desc: "Tumor pada meninges — umumnya jinak dan tumbuh lambat",
    color: "#f97316",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-700",
    gradient: "from-orange-500 to-amber-600",
    severity: "Sedang",
    severityColor: "text-orange-600",
    icon: "M",
    iconBg: "bg-orange-500",
  },
  pituitary: {
    label: "Pituitary Tumor",
    desc: "Tumor pada kelenjar hipofisis — mempengaruhi sistem hormonal",
    color: "#8b5cf6",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    gradient: "from-violet-600 to-purple-700",
    severity: "Sedang",
    severityColor: "text-violet-600",
    icon: "P",
    iconBg: "bg-violet-500",
  },
  notumor: {
    label: "No Tumor",
    desc: "Tidak ditemukan tanda-tanda tumor pada citra MRI",
    color: "#22c55e",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700",
    gradient: "from-green-500 to-emerald-600",
    severity: "Normal",
    severityColor: "text-green-600",
    icon: "N",
    iconBg: "bg-green-500",
  },
  // fallback — normalise key
  normal: {
    label: "No Tumor",
    desc: "Tidak ditemukan tanda-tanda tumor pada citra MRI",
    color: "#22c55e",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700",
    gradient: "from-green-500 to-emerald-600",
    severity: "Normal",
    severityColor: "text-green-600",
    icon: "N",
    iconBg: "bg-green-500",
  },
};

function getTumorInfo(className) {
  if (!className) return null;
  const key = className.toLowerCase().replace(/[\s_-]/g, "");
  return (
    TUMOR_CLASSES[key] ||
    TUMOR_CLASSES[className.toLowerCase()] || {
      label: className,
      desc: "Kelas terdeteksi dari model",
      color: "#6b7280",
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-700",
      gradient: "from-gray-500 to-gray-600",
      severity: "-",
      severityColor: "text-gray-500",
      icon: className.charAt(0).toUpperCase(),
      iconBg: "bg-gray-500",
    }
  );
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
          ? "border-violet-500 bg-violet-50"
          : file
          ? "border-violet-400 bg-violet-50/30"
          : "border-gray-300 hover:border-violet-400 bg-gray-50 hover:bg-violet-50/20 cursor-pointer"
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
            {/* Brain icon */}
            <svg className="w-9 h-9 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload foto MRI otak</p>
          <p className="text-gray-400 text-sm mb-3">Drag & drop atau klik untuk memilih</p>
          <span className="text-xs text-violet-500 font-medium bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
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
  const [selectedModel, setSelectedModel] = useState("BALANCE_model");
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
      const res = await fetch(`${API_URL}/samples`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = (data.samples || []).map((s) => ({
        name: s.name,
        url:  s.url.replace(/^https?:\/\/[^/]+/, "/api/rispro/9010"),
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-20 w-72 h-72 bg-violet-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-12 w-96 h-64 bg-purple-600 rounded-full blur-3xl" />
          <div className="absolute top-24 right-40 w-40 h-40 bg-fuchsia-500 rounded-full blur-2xl" />
        </div>

        {/* Grid/scan pattern overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Brain Tumor
              <span className="block bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
                Classification
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Klasifikasi <strong className="text-white">4 jenis kondisi otak</strong> dari citra MRI
              menggunakan <strong className="text-violet-300">3 varian model deep learning</strong>.
              Upload MRI scan dan dapatkan analisis secara otomatis.
            </p>

            {/* Tumor class chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {Object.entries(TUMOR_CLASSES)
                .filter(([k]) => k !== "normal") // skip alias
                .map(([key, cls]) => (
                  <span
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/15 bg-white/10 text-white/80 backdrop-blur-sm"
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                      style={{ backgroundColor: cls.color }}
                    >
                      {cls.icon}
                    </span>
                    {cls.label}
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
                    <span className="ml-1.5 text-[10px] bg-violet-400/30 text-violet-300 px-1.5 py-0.5 rounded-full">
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

            {/* Active model card */}
            <div className={`rounded-2xl border-2 ${activeModel.border} ${activeModel.bg} p-4 flex items-center gap-3`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
                style={{ backgroundColor: activeModel.color }}
              >
                {activeModel.label.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800 text-sm">{activeModel.label} Model</p>
                <p className="text-xs text-gray-500 truncate">{activeModel.desc}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${activeModel.badgeColor}`}>
                {activeModel.badge}
              </span>
            </div>

            {/* DropZone card */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      : samples.map((s, idx) => (
                          <button
                            key={s.url || idx}
                            onClick={() => handleSampleClick(s)}
                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-violet-400 transition-all hover:scale-105 focus:outline-none focus:border-violet-500 bg-black"
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

              {/* Predict button */}
              <button
                id="predict-button"
                onClick={handlePredict}
                disabled={!canPredict}
                className={`mt-5 w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                  canPredict
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg hover:shadow-violet-500/30 hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
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
                    Klasifikasi Tumor Otak
                  </>
                )}
              </button>

              {/* Server offline */}
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

            {/* Info card: 4 categories */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Kategori Klasifikasi
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TUMOR_CLASSES)
                  .filter(([k]) => k !== "normal")
                  .map(([key, cls]) => (
                    <div
                      key={key}
                      className={`rounded-xl p-3 ${cls.bg} border ${cls.border} flex items-center gap-2`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg ${cls.iconBg} flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0`}
                      >
                        {cls.icon}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${cls.text} leading-tight`}>{cls.label}</p>
                        <p className={`text-[10px] ${cls.severityColor} font-medium`}>
                          Risiko: {cls.severity}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
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
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-72">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  {/* Spinning ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
                </div>
                <p className="text-gray-800 font-bold text-base mb-1">Menganalisis MRI...</p>
                <p className="text-gray-400 text-sm">Model: {activeModel.label}</p>
              </div>
            )}

            {/* Idle */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-72 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">Siap Menganalisis</p>
                <p className="text-gray-400 text-sm mt-1">Upload foto MRI otak dan klik tombol klasifikasi</p>
              </div>
            )}

            {/* Result */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${topInfo.gradient} p-6 text-white`}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold flex-shrink-0"
                    >
                      {topInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Hasil Klasifikasi
                      </p>
                      <h3 className="text-2xl font-extrabold leading-tight">{topInfo.label}</h3>
                      <span className="inline-block mt-1.5 text-xs font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        Risiko: {topInfo.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/75 text-sm mt-4 leading-relaxed">{topInfo.desc}</p>
                </div>

                <div className="p-5 space-y-5">

                  {/* Main confidence bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Confidence
                      </span>
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
                          const info = getTumorInfo(cls);
                          const isTop = cls === result.predicted_class;
                          const numPct = typeof pct === "number" ? pct : parseFloat(pct);
                          return (
                            <div key={cls}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0"
                                    style={{ backgroundColor: info?.color || "#6b7280" }}
                                  >
                                    {info?.icon || cls.charAt(0).toUpperCase()}
                                  </span>
                                  <span className={`text-sm font-semibold ${isTop ? (info?.text || "text-gray-700") : "text-gray-500"}`}>
                                    {info?.label || cls}
                                  </span>
                                  {isTop && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${info?.badge || "bg-gray-100 text-gray-700"}`}>
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
                                    opacity: isTop ? 1 : 0.35,
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
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                        Model
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
                      <strong>Perhatian:</strong> Hasil ini hanya untuk keperluan penelitian.
                      Tidak menggantikan diagnosis radiologis atau medis profesional.
                      Konsultasikan hasil dengan dokter spesialis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips card (shown when no result) */}
            {!result && !isProcessing && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <p className="text-violet-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tips untuk hasil terbaik
                </p>
                <ul className="text-violet-700 text-xs space-y-1 list-disc list-inside">
                  <li>Gunakan citra MRI T1-weighted atau T2-weighted</li>
                  <li>Potongan axial (tampak atas) memberikan hasil terbaik</li>
                  <li>Pastikan citra tidak terlalu gelap atau overexposed</li>
                  <li>Resolusi gambar minimal 224x224 piksel</li>
                  <li>File format: JPG, PNG, atau WebP</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
