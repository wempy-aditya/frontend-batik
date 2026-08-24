"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ProjectInfoPanel from "@/components/demos/ProjectInfoPanel";


const API_URL = "https://batik-mikrosatelit.wempyaw.com";

// ─── Models ────────────────────────────────────────────────────────────────────
const MODELS = [
  {
    id:          "Colorectal_model",
    label:       "Colorectal",
    desc:        "Dioptimasi untuk kanker kolorektal (usus besar & rektum)",
    badge:       "Default",
    badgeColor:  "bg-indigo-100 text-indigo-700",
    color:       "#6366f1",
    border:      "border-indigo-300",
    bg:          "bg-indigo-50",
    organ:       "Kolorektal",
    recommended: true,
  },
  {
    id:          "Gastic_model",
    label:       "Gastric",
    desc:        "Dioptimasi untuk kanker lambung (gastrik)",
    badge:       "Gastrik",
    badgeColor:  "bg-purple-100 text-purple-700",
    color:       "#a855f7",
    border:      "border-purple-300",
    bg:          "bg-purple-50",
    organ:       "Lambung",
    recommended: false,
  },
];

const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]));

// ─── MSI class info ────────────────────────────────────────────────────────────
function getMSIInfo(className) {
  if (!className) return null;
  const lower = className.toString().toLowerCase().replace(/[\s_-]/g, "");

  // MSI-H / MSI / instable
  if (
    lower === "msih" || lower === "msi" || lower.includes("instab") ||
    lower.includes("msih") || lower === "1" || lower === "positive"
  ) {
    return {
      key:        "msi",
      label:      "MSI-H",
      fullLabel:  "Microsatellite Instable-High",
      sublabel:   className,
      desc:       "Status microsatellite instable — umumnya menandakan respons baik terhadap imunoterapi (PD-1/PD-L1 inhibitor)",
      color:      "#f97316",
      gradient:   "from-orange-500 to-rose-600",
      bg:         "bg-orange-50",
      border:     "border-orange-200",
      text:       "text-orange-700",
      badge:      "bg-orange-100 text-orange-700",
      dot:        "bg-orange-400",
      clinical:   "Kandidat imunoterapi — perlu evaluasi onkolog",
      clinicalBg: "bg-orange-50 border-orange-300",
      clinicalText:"text-orange-700",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      ),
    };
  }

  // MSS / stable
  if (
    lower === "mss" || lower.includes("stable") || lower.includes("microsatellitestable") ||
    lower === "0" || lower === "negative"
  ) {
    return {
      key:        "mss",
      label:      "MSS",
      fullLabel:  "Microsatellite Stable",
      sublabel:   className,
      desc:       "Status microsatellite stabil — umumnya kurang responsif terhadap imunoterapi monoterapi",
      color:      "#3b82f6",
      gradient:   "from-blue-500 to-indigo-600",
      bg:         "bg-blue-50",
      border:     "border-blue-200",
      text:       "text-blue-700",
      badge:      "bg-blue-100 text-blue-700",
      dot:        "bg-blue-400",
      clinical:   "Pertimbangkan kemoterapi konvensional atau kombinasi",
      clinicalBg: "bg-blue-50 border-blue-300",
      clinicalText:"text-blue-700",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    };
  }

  // Fallback
  return {
    key:        lower,
    label:      className,
    fullLabel:  className,
    sublabel:   "",
    desc:       "Status terdeteksi dari model",
    color:      "#6b7280",
    gradient:   "from-gray-500 to-gray-600",
    bg:         "bg-gray-50",
    border:     "border-gray-200",
    text:       "text-gray-700",
    badge:      "bg-gray-100 text-gray-700",
    dot:        "bg-gray-400",
    clinical:   "Konsultasikan dengan onkolog",
    clinicalBg: "bg-gray-50 border-gray-300",
    clinicalText:"text-gray-700",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
}

// ─── DNA strand SVG decoration ────────────────────────────────────────────────
function DNAIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4.5 3C4.5 3 5.5 6 9 6s4.5 3 4.5 3-1 3-4.5 3S4.5 15 4.5 15s1 3 4.5 3 4.5 3 4.5 3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19.5 3C19.5 3 18.5 6 15 6s-4.5 3-4.5 3 1 3 4.5 3 4.5 3 4.5 3-1 3-4.5 3-4.5 3-4.5 3" />
      <line x1="4.5" y1="6" x2="19.5" y2="6" strokeWidth={1} strokeDasharray="2 2" />
      <line x1="4.5" y1="12" x2="19.5" y2="12" strokeWidth={1} strokeDasharray="2 2" />
      <line x1="4.5" y1="18" x2="19.5" y2="18" strokeWidth={1} strokeDasharray="2 2" />
    </svg>
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
        isDragging ? "bg-indigo-50"
        : file     ? "bg-indigo-50/30"
        : "border-gray-300 hover:bg-indigo-50/10 bg-gray-50 cursor-pointer"
      }`}
      style={(isDragging || file) ? { borderColor: accentColor } : { borderColor: isDragging ? accentColor : "" }}
      onMouseEnter={(e) => !file && !isDragging && (e.currentTarget.style.borderColor = accentColor + "88")}
      onMouseLeave={(e) => !file && !isDragging && (e.currentTarget.style.borderColor = "")}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/tiff"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Histopatologi preview"
            className="w-full max-h-80 object-contain bg-gray-900/5 rounded-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
          >
            x
          </button>
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <DNAIcon className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-white text-[10px] font-semibold">Histopatologi</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
            <DNAIcon className="w-9 h-9 text-indigo-500" />
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload patch histopatologi</p>
          <p className="text-gray-400 text-sm mb-3">Citra H&E staining jaringan kolorektal / lambung</p>
          <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            JPG, PNG, WebP, TIFF
          </span>
        </div>
      )}
    </div>
  );
}

// ─── MSI vs MSS comparison ─────────────────────────────────────────────────────
const MSI_COMPARISON = [
  { label: "MSI-H", color: "#f97316", dot: "bg-orange-400",
    points: ["Defek Mismatch Repair (dMMR)", "Hipermutasi DNA", "Respons baik terhadap imunoterapi", "Prognosis umumnya lebih baik"] },
  { label: "MSS", color: "#3b82f6", dot: "bg-blue-400",
    points: ["Proficient Mismatch Repair (pMMR)", "Mutan DNA stabil", "Kurang responsif terhadap imunoterapi", "Gunakan kemoterapi standar"] },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MicrosatelliteStatusPage() {
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [selectedModel, setSelectedModel] = useState("Colorectal_model");
  const [result, setResult]               = useState(null);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [error, setError]                 = useState("");
  const [serverStatus, setServerStatus]   = useState("checking");
  const [samples, setSamples]             = useState([]);
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
      const res  = await fetch(`${API_URL}/samples`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = (data.samples || []).map((s) => ({
        name: s.name,
        url:  s.url.replace(/^https?:\/\/[^/]+/, "/api/rispro/9207"),
      }));
      setSamples(list);
    } catch {
      // non-critical
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
    } finally {
      setLoadingSample(null);
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

  const topInfo = result?.predicted_class ? getMSIInfo(result.predicted_class) : null;
  const isMSI   = topInfo?.key === "msi";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-6 left-12 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-8 w-80 h-64 bg-purple-600 rounded-full blur-3xl" />
          <div className="absolute top-20 right-32 w-48 h-48 bg-violet-500 rounded-full blur-2xl" />
        </div>

        {/* DNA helix pattern dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(129,140,248,0.9) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <DNAIcon className="w-3.5 h-3.5" />
              Genomic Biomarker Analysis
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Microsatellite
              <span className="block bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                Instability Status
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Prediksi status <strong className="text-white">MSI (Microsatellite Instability)</strong> dari
              patch histopatologi — biomarker penting untuk panduan{" "}
              <strong className="text-indigo-300">imunoterapi kanker</strong> kolorektal dan lambung.
            </p>

            {/* MSI vs MSS pills */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-5 py-2.5 rounded-xl backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                MSI-H
                <span className="text-orange-400/60 text-xs font-normal">(Instable)</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold px-5 py-2.5 rounded-xl backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                MSS
                <span className="text-blue-400/60 text-xs font-normal">(Stable)</span>
              </div>
            </div>

            {/* Model selector */}
            <div className="flex justify-center gap-3">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    selectedModel === m.id
                      ? "bg-white text-slate-900 border-white shadow-lg scale-105"
                      : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedModel === m.id ? m.color : "rgba(255,255,255,0.4)" }}
                  />
                  {m.organ}
                  {m.recommended && (
                    <span className="text-[9px] bg-indigo-400/30 text-indigo-300 px-1.5 py-0.5 rounded-full ml-1">
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

          {/* ── Left ── */}
          <div className="space-y-6">

            {/* Active model card */}
            <div
              className="rounded-2xl border-2 p-4 flex items-center gap-3 transition-all"
              style={{ borderColor: activeModel.color + "66", backgroundColor: activeModel.color + "0d" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: activeModel.color }}
              >
                <DNAIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{activeModel.label} Model</p>
                <p className="text-xs text-gray-500 truncate">{activeModel.desc}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${activeModel.badgeColor}`}>
                {activeModel.badge}
              </span>
            </div>

            {/* DropZone card */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DNAIcon className="w-5 h-5 text-indigo-500" />
                Upload Patch Histopatologi
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
                      : samples.map((s, idx) => {
                          const isSelected = imagePreview === s.url;
                          const isFetching = loadingSample === s.url;
                          return (
                            <button
                              key={s.url || idx}
                              onClick={() => handleSampleClick(s)}
                              disabled={!!loadingSample}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 focus:outline-none ${
                                isSelected ? "border-indigo-500 ring-2 ring-indigo-300" : "border-transparent"
                              } ${loadingSample && !isFetching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              style={isSelected ? { borderColor: activeModel.color } : {}}
                              onMouseEnter={(e) => !loadingSample && (e.currentTarget.style.borderColor = activeModel.color)}
                              onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = "transparent")}
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
                    ? "text-white shadow-lg hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                style={
                  canPredict
                    ? {
                        background: `linear-gradient(135deg, ${activeModel.color}, ${activeModel.color}bb)`,
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
                    Menganalisis Biomarker...
                  </>
                ) : (
                  <>
                    <DNAIcon className="w-5 h-5" />
                    Prediksi Status MSI
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

            {/* MSI vs MSS comparison */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                MSI-H vs MSS
              </p>
              <div className="grid grid-cols-2 gap-3">
                {MSI_COMPARISON.map((side) => (
                  <div
                    key={side.label}
                    className="rounded-xl p-3 border"
                    style={{ backgroundColor: side.color + "0d", borderColor: side.color + "44" }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`w-2 h-2 rounded-full ${side.dot}`} />
                      <p className="text-xs font-extrabold" style={{ color: side.color }}>{side.label}</p>
                    </div>
                    <ul className="space-y-1">
                      {side.points.map((pt) => (
                        <li key={pt} className="text-[10px] text-gray-600 flex items-start gap-1">
                          <span className="mt-0.5 flex-shrink-0" style={{ color: side.color }}>•</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical significance */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
              <p className="text-indigo-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Signifikansi Klinis MSI
              </p>
              <ul className="text-indigo-700 text-xs space-y-1 list-disc list-inside">
                <li>MSI-H merupakan biomarker prediktif imunoterapi (PD-1/PD-L1)</li>
                <li>FDA-approved: pembrolizumab untuk MSI-H/dMMR solid tumors</li>
                <li>MSS umumnya diobati dengan kemoterapi FOLFOX/FOLFIRI</li>
                <li>Gunakan patch H&E staining untuk akurasi terbaik</li>
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

            {/* Processing — DNA strand animation */}
            {isProcessing && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-72">
                <div className="relative mb-5">
                  {/* Rotating DNA rings */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-spin"
                      style={{ borderTopColor: activeModel.color, animationDuration: "1.2s" }}
                    />
                    <div
                      className="absolute inset-2 rounded-full border-4 border-purple-100 animate-spin"
                      style={{ borderTopColor: "#a855f7", animationDuration: "1.8s", animationDirection: "reverse" }}
                    />
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: activeModel.color + "22" }}>
                      <DNAIcon className="w-5 h-5" style={{ color: activeModel.color }} />
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 font-bold text-lg mb-1">Menganalisis biomarker...</p>
                <p className="text-gray-400 text-sm">{activeModel.label} model memproses patch</p>
              </div>
            )}

            {/* Idle */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-72 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <DNAIcon className="w-8 h-8 text-indigo-300" />
                </div>
                <p className="text-gray-700 font-semibold">Siap Menganalisis</p>
                <p className="text-gray-400 text-sm mt-1">Upload patch histopatologi untuk prediksi MSI status</p>
              </div>
            )}

            {/* Result */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${topInfo.gradient} p-6 text-white`}>
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      {topInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Status MSI — {MODEL_MAP[result.model_used]?.organ || result.model_used}
                      </p>
                      <h3 className="text-3xl font-extrabold leading-tight">{topInfo.label}</h3>
                      <p className="text-white/75 text-sm font-medium mt-0.5">{topInfo.fullLabel}</p>
                    </div>
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">{topInfo.desc}</p>
                </div>

                <div className="p-5 space-y-5">

                  {/* Confidence */}
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
                          background: `linear-gradient(90deg, ${topInfo.color}, ${topInfo.color}88)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Class probabilities */}
                  {predList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Probabilitas Status
                      </p>
                      <div className="space-y-3">
                        {predList.map(({ cls, pct }) => {
                          const info   = getMSIInfo(cls);
                          const isTop  = cls === result.predicted_class;
                          const numPct = typeof pct === "number" ? pct : parseFloat(pct);
                          return (
                            <div key={cls}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-semibold flex items-center gap-2 ${isTop ? info?.text : "text-gray-400"}`}>
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: info?.color || "#6b7280", opacity: isTop ? 1 : 0.35 }}
                                  />
                                  {info?.label || cls}
                                  {isTop && (
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${info?.badge}`}>
                                      Prediksi
                                    </span>
                                  )}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${isTop ? info?.text : "text-gray-400"}`}>
                                  {numPct.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-2.5 rounded-full transition-all duration-700"
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

                  {/* Clinical implication */}
                  <div
                    className={`border rounded-xl p-4 ${topInfo.clinicalBg}`}
                  >
                    <p className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${topInfo.clinicalText}`}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Implikasi Klinis
                    </p>
                    <p className={`text-xs leading-relaxed ${topInfo.clinicalText}`}>
                      {topInfo.clinical}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Model</p>
                      <p className="text-sm font-bold text-gray-700">{MODEL_MAP[result.model_used]?.label || result.model_used}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Waktu Inferensi</p>
                      <p className="text-sm font-bold text-gray-700">{result.inference_time_ms?.toFixed(0)} ms</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <strong>Perhatian:</strong> Prediksi MSI ini hanya untuk keperluan penelitian. Keputusan
                      terapi imunoterapi harus dikonfirmasi dengan uji IHC MMR atau PCR MSI oleh patolog dan onkolog.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    
      {/* Floating Project Info Panel */}
      <ProjectInfoPanel projectId="019fd072-cc24-7ee2-bafb-4d70e0c744bb" />
    </div>
  );
}