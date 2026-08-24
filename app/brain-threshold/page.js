"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import ProjectInfoPanel from "@/components/demos/ProjectInfoPanel";


const API_URL   = "https://batik-brain-threshold.wempyaw.com";
const MODEL_ID  = "N/A";  // thresholding mode, no specific model

// ─── Class info helper ─────────────────────────────────────────────────────────
// Brain threshold usually outputs: tumor/no-tumor or segmentation classes
function getClassInfo(className) {
  if (!className) return null;
  const lower = className.toString().toLowerCase().replace(/[\s_-]/g, "");

  if (lower.includes("tumor") && !lower.includes("no") && !lower.includes("non")) {
    return {
      key:      "tumor",
      label:    "Tumor Terdeteksi",
      sublabel: className,
      desc:     "Piksel / region dengan threshold menunjukkan keberadaan massa abnormal pada jaringan otak",
      color:    "#ef4444",
      gradient: "from-red-600 to-rose-700",
      bg:       "bg-red-50",
      border:   "border-red-200",
      text:     "text-red-700",
      badge:    "bg-red-100 text-red-700",
      icon:     "T",
      iconBg:   "bg-red-500",
      alert:    true,
    };
  }
  if (
    lower.includes("notumor") || lower.includes("normal") ||
    lower.includes("noabnormal") || lower.includes("notumour") ||
    lower.includes("healthy") || lower === "0"
  ) {
    return {
      key:      "normal",
      label:    "Tidak Ada Tumor",
      sublabel: className,
      desc:     "Hasil thresholding tidak mendeteksi pola abnormal yang signifikan pada citra otak",
      color:    "#22c55e",
      gradient: "from-green-500 to-emerald-600",
      bg:       "bg-green-50",
      border:   "border-green-200",
      text:     "text-green-700",
      badge:    "bg-green-100 text-green-700",
      icon:     "N",
      iconBg:   "bg-green-500",
      alert:    false,
    };
  }
  if (lower.includes("glioma")) {
    return {
      key:      "glioma",
      label:    "Glioma",
      sublabel: className,
      desc:     "Thresholding mendeteksi pola yang sesuai dengan karakteristik tumor glioma",
      color:    "#ef4444",
      gradient: "from-red-600 to-rose-700",
      bg:       "bg-red-50",
      border:   "border-red-200",
      text:     "text-red-700",
      badge:    "bg-red-100 text-red-700",
      icon:     "G",
      iconBg:   "bg-red-500",
      alert:    true,
    };
  }
  if (lower.includes("meningioma")) {
    return {
      key:      "meningioma",
      label:    "Meningioma",
      sublabel: className,
      desc:     "Thresholding mendeteksi pola yang sesuai dengan karakteristik meningioma",
      color:    "#f97316",
      gradient: "from-orange-500 to-amber-600",
      bg:       "bg-orange-50",
      border:   "border-orange-200",
      text:     "text-orange-700",
      badge:    "bg-orange-100 text-orange-700",
      icon:     "M",
      iconBg:   "bg-orange-500",
      alert:    true,
    };
  }
  if (lower.includes("pituitary")) {
    return {
      key:      "pituitary",
      label:    "Pituitary",
      sublabel: className,
      desc:     "Thresholding mendeteksi pola yang sesuai dengan tumor hipofisis",
      color:    "#8b5cf6",
      gradient: "from-violet-600 to-purple-700",
      bg:       "bg-violet-50",
      border:   "border-violet-200",
      text:     "text-violet-700",
      badge:    "bg-violet-100 text-violet-700",
      icon:     "P",
      iconBg:   "bg-violet-500",
      alert:    true,
    };
  }

  // Generic fallback
  const isPositive = lower.includes("1") || lower.includes("positive") || lower.includes("abnormal");
  return {
    key:      lower,
    label:    className,
    sublabel: "",
    desc:     "Kelas terdeteksi dari proses thresholding",
    color:    isPositive ? "#ef4444" : "#6b7280",
    gradient: isPositive ? "from-red-500 to-rose-600" : "from-gray-500 to-gray-600",
    bg:       isPositive ? "bg-red-50" : "bg-gray-50",
    border:   isPositive ? "border-red-200" : "border-gray-200",
    text:     isPositive ? "text-red-700" : "text-gray-700",
    badge:    isPositive ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700",
    icon:     className.charAt(0).toUpperCase(),
    iconBg:   isPositive ? "bg-red-500" : "bg-gray-500",
    alert:    isPositive,
  };
}

// ─── Thresholding info cards (educational) ────────────────────────────────────
const THRESHOLD_INFO = [
  {
    label: "Grayscale Conversion",
    desc: "Citra dikonversi ke grayscale untuk menyederhanakan analisis intensitas piksel",
    icon: "G",
    color: "#6b7280",
  },
  {
    label: "Threshold Application",
    desc: "Nilai threshold diterapkan untuk memisahkan area otak normal dari area abnormal",
    icon: "T",
    color: "#3b82f6",
  },
  {
    label: "Region Analysis",
    desc: "Region yang melewati threshold dianalisis dan diklasifikasikan secara otomatis",
    icon: "R",
    color: "#8b5cf6",
  },
  {
    label: "Classification",
    desc: "Hasil segmentasi digunakan untuk menentukan kelas akhir dengan confidence score",
    icon: "C",
    color: "#10b981",
  },
];

// ─── DropZone ──────────────────────────────────────────────────────────────────
function DropZone({ file, preview, onFile, onClear }) {
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
        isDragging
          ? "border-cyan-500 bg-cyan-50"
          : file
          ? "border-cyan-400 bg-cyan-50/30"
          : "border-gray-300 hover:border-cyan-400 bg-gray-50 hover:bg-cyan-50/10 cursor-pointer"
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
            className="w-full max-h-80 object-contain bg-slate-900 rounded-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
          >
            x
          </button>
          {/* Threshold overlay badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-white text-[10px] font-semibold">Siap Threshold</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mb-4">
            {/* Brain scan icon */}
            <svg className="w-9 h-9 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload citra MRI otak</p>
          <p className="text-gray-400 text-sm mb-3">Akan diproses menggunakan metode thresholding</p>
          <span className="text-xs text-cyan-600 font-medium bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            JPG, PNG, WebP
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Threshold Pipeline Visual ─────────────────────────────────────────────────
function ThresholdPipeline({ active }) {
  return (
    <div className="flex items-start gap-2 overflow-x-auto pb-1">
      {THRESHOLD_INFO.map((step, idx) => (
        <div key={step.label} className="flex items-center gap-2 flex-shrink-0">
          <div className={`flex flex-col items-center text-center ${active ? "opacity-100" : "opacity-40"}`}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm mb-1.5 transition-all duration-500"
              style={{
                backgroundColor: step.color,
                boxShadow: active ? `0 4px 12px ${step.color}44` : "none",
              }}
            >
              {step.icon}
            </div>
            <p className="text-[9px] font-bold text-gray-600 max-w-[56px] leading-tight">{step.label}</p>
          </div>
          {idx < THRESHOLD_INFO.length - 1 && (
            <svg
              className={`w-4 h-4 flex-shrink-0 mt-1 transition-opacity ${active ? "opacity-60" : "opacity-20"}`}
              fill="none" stroke="#94a3b8" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BrainThresholdPage() {
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [result, setResult]               = useState(null);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [error, setError]                 = useState("");
  const [serverStatus, setServerStatus]   = useState("checking");
  const [samples, setSamples]             = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [loadingSample, setLoadingSample]  = useState(null);
  const [binaryGrid, setBinaryGrid]       = useState([]);

  const resultRef = useRef(null);

  useEffect(() => {
    checkHealth();
    fetchSamples();
    setBinaryGrid(
      Array.from({ length: 8 }).map(() =>
        Array.from({ length: 40 }).map(() => (Math.random() > 0.5 ? "1" : "0"))
      )
    );
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

      const res = await fetch(`${API_URL}/predict`, {
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

  const isOnline   = serverStatus === "online";
  const canPredict = isOnline && (!!imageFile || !!imagePreview) && !isProcessing;

  const predList = result?.prediction
    ? Object.entries(result.prediction)
        .map(([cls, pct]) => ({ cls, pct }))
        .sort((a, b) => b.pct - a.pct)
    : [];

  const topInfo = result?.predicted_class ? getClassInfo(result.predicted_class) : null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-6 left-8 w-80 h-80 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-6 w-96 h-60 bg-teal-600 rounded-full blur-3xl" />
        </div>

        {/* Binary/pixel grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          style={{ opacity: 0.03 }}
          aria-hidden="true"
        >
          {binaryGrid.map((rowArr, row) => (
            <div key={row} className="flex gap-3 mt-2 px-4">
              {rowArr.map((bit, col) => (
                <span key={col} className="text-cyan-300 font-mono text-[10px] select-none">
                  {bit}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Image Thresholding Analysis
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Brain Tumor
              <span className="block bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
                Thresholding
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Deteksi tumor otak dari citra MRI menggunakan pendekatan{" "}
              <strong className="text-cyan-300">Image Thresholding</strong> berbasis segmentasi piksel —
              bukan deep learning, melainkan analisis intensitas dan region secara langsung.
            </p>

            {/* Pipeline mini preview */}
            <div className="inline-block bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl px-5 py-4">
              <ThresholdPipeline active={true} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* ── Left ── */}
          <div className="space-y-6">

            {/* Method badge */}
            <div className="flex items-center gap-3 bg-white border border-cyan-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Metode: Image Thresholding</p>
                <p className="text-xs text-gray-500">Segmentasi berbasis intensitas piksel MRI</p>
              </div>
              <span className="ml-auto bg-cyan-100 text-cyan-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                Non-DL
              </span>
            </div>

            {/* DropZone card */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 focus:outline-none ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-300' : 'border-transparent hover:border-cyan-400'} ${loadingSample && !isFetching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                    ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Memproses Threshold...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Jalankan Thresholding
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

            {/* How it works */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Cara Kerja Thresholding
              </p>
              <div className="space-y-2">
                {THRESHOLD_INFO.map((step, idx) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: step.color }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{step.label}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difference from DL */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
              <p className="text-cyan-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thresholding vs Deep Learning
              </p>
              <ul className="text-cyan-700 text-xs space-y-1 list-disc list-inside">
                <li>Tidak memerlukan training data yang besar</li>
                <li>Deterministik — hasil konsisten untuk input sama</li>
                <li>Interpretable — bisa divisualisasikan langsung</li>
                <li>Lebih cepat, cocok untuk resource terbatas</li>
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
                  Proses Gagal
                </p>
                <p className="text-red-600 text-xs break-words">{error}</p>
              </div>
            )}

            {/* Processing — scanning animation */}
            {isProcessing && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden min-h-72">
                {/* Scan line animation */}
                <div className="relative bg-slate-900 h-40 overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce"
                    style={{ top: "50%", animationDuration: "1.5s" }}
                  />
                  <div
                    className="absolute left-0 right-0 h-16 animate-pulse"
                    style={{
                      top: "calc(50% - 32px)",
                      background: "linear-gradient(180deg, transparent, rgba(34,211,238,0.08), transparent)",
                    }}
                  />
                  {/* Fake pixel grid */}
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-cyan-400 font-mono text-xs font-bold">THRESHOLD SCANNING...</p>
                      <div className="flex gap-1 justify-center mt-2">
                        {[0,1,2,3,4].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-4 rounded-full bg-cyan-400 animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <p className="text-gray-800 font-bold text-base mb-1">Memproses thresholding...</p>
                  <p className="text-gray-400 text-sm">Segmentasi intensitas piksel MRI</p>
                </div>
              </div>
            )}

            {/* Idle */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                {/* Dark preview area */}
                <div className="bg-slate-900 h-36 flex items-center justify-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative text-center">
                    <svg className="w-10 h-10 text-cyan-500/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-slate-500 text-xs font-mono">Awaiting MRI input</p>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <p className="text-gray-700 font-semibold">Siap Memproses</p>
                  <p className="text-gray-400 text-sm mt-1">Upload MRI dan jalankan thresholding</p>
                </div>
              </div>
            )}

            {/* Result */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Colored top bar */}
                <div
                  className={`bg-gradient-to-r ${topInfo.gradient} p-6 text-white`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold flex-shrink-0">
                      {topInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Hasil Thresholding
                      </p>
                      <h3 className="text-2xl font-extrabold leading-tight">{topInfo.label}</h3>
                      {topInfo.sublabel && topInfo.sublabel !== topInfo.label && (
                        <p className="text-white/60 text-xs font-mono mt-0.5">{topInfo.sublabel}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-white/75 text-sm mt-4 leading-relaxed">{topInfo.desc}</p>
                </div>

                <div className="p-5 space-y-5">

                  {/* Threshold pipeline result */}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">
                      Pipeline Dijalankan
                    </p>
                    <ThresholdPipeline active={true} />
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence Score</span>
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

                  {/* All class probabilities */}
                  {predList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Distribusi Kelas
                      </p>
                      <div className="space-y-3">
                        {predList.map(({ cls, pct }) => {
                          const info   = getClassInfo(cls);
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
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${info?.badge || "bg-gray-100 text-gray-700"}`}>
                                      Hasil
                                    </span>
                                  )}
                                </div>
                                <span className={`text-sm font-bold tabular-nums font-mono ${isTop ? (info?.text || "text-gray-700") : "text-gray-400"}`}>
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

                  {/* Alert for tumor detected */}
                  {topInfo.alert && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-red-800 font-bold text-sm">Anomali Terdeteksi</p>
                          <p className="text-red-600 text-xs mt-0.5 leading-relaxed">
                            Thresholding mendeteksi region dengan intensitas abnormal. Diperlukan validasi
                            lebih lanjut menggunakan model deep learning atau evaluasi ahli radiologi.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Metode</p>
                      <p className="text-sm font-bold text-gray-700 font-mono">Thresholding</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Waktu Proses</p>
                      <p className="text-sm font-bold text-gray-700 font-mono">{result.inference_time_ms?.toFixed(0)} ms</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <strong>Catatan:</strong> Metode thresholding bersifat deterministik berbasis intensitas piksel.
                      Untuk diagnosis medis, validasi dengan model deep learning dan evaluasi radiolog tetap diperlukan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    
      {/* Floating Project Info Panel */}
      <ProjectInfoPanel projectId="019fd06f-79bf-7cd5-b46e-c29bec0c7499" />
    </div>
  );
}