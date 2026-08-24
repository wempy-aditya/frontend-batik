"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import ProjectInfoPanel from "@/components/demos/ProjectInfoPanel";


const API_URL = "https://batik-klasifikasi-paru.wempyaw.com";

// ─── Single model ──────────────────────────────────────────────────────────────
const MODEL_ID    = "Skneario_model";
const MODEL_LABEL = "Skenario";

// ─── Class info helper ─────────────────────────────────────────────────────────
function getClassInfo(className) {
  const lower = (className || "").toLowerCase().replace(/[\s_-]/g, "");

  if (lower === "normal" || lower.includes("normal")) {
    return {
      key:        "normal",
      label:      "Normal",
      desc:       "Paru-paru dalam kondisi sehat, tidak ditemukan tanda-tanda infeksi atau peradangan",
      color:      "#16a34a",
      lightColor: "#dcfce7",
      gradient:   "from-green-600 to-emerald-600",
      bg:         "bg-green-50",
      border:     "border-green-200",
      text:       "text-green-700",
      badge:      "bg-green-100 text-green-700",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      status: "Sehat",
      statusIcon: "✓",
    };
  }

  if (lower.includes("viral") || lower.includes("virus")) {
    return {
      key:        "viral",
      label:      "Viral Pneumonia",
      desc:       "Pneumonia yang disebabkan oleh infeksi virus — umumnya lebih ringan dari bakteri",
      color:      "#d97706",
      lightColor: "#fef3c7",
      gradient:   "from-amber-500 to-yellow-600",
      bg:         "bg-amber-50",
      border:     "border-amber-200",
      text:       "text-amber-700",
      badge:      "bg-amber-100 text-amber-700",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      status: "Terinfeksi — Viral",
      statusIcon: "!",
    };
  }

  if (lower.includes("bacter") || lower.includes("bakteri")) {
    return {
      key:        "bacterial",
      label:      "Bacterial Pneumonia",
      desc:       "Pneumonia yang disebabkan oleh bakteri — memerlukan penanganan antibiotik segera",
      color:      "#dc2626",
      lightColor: "#fee2e2",
      gradient:   "from-red-600 to-rose-700",
      bg:         "bg-red-50",
      border:     "border-red-200",
      text:       "text-red-700",
      badge:      "bg-red-100 text-red-700",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      status: "Terinfeksi — Bakteri",
      statusIcon: "!!",
    };
  }

  // generic "pneumonia" fallback
  if (lower.includes("pneumonia") || lower.includes("paru")) {
    return {
      key:        "pneumonia",
      label:      "Pneumonia",
      desc:       "Terdeteksi tanda-tanda infeksi paru-paru pada citra X-ray",
      color:      "#ef4444",
      lightColor: "#fee2e2",
      gradient:   "from-red-500 to-rose-600",
      bg:         "bg-red-50",
      border:     "border-red-200",
      text:       "text-red-700",
      badge:      "bg-red-100 text-red-700",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      status: "Terdeteksi Pneumonia",
      statusIcon: "!",
    };
  }

  return {
    key:        "unknown",
    label:      className,
    desc:       "Kelas terdeteksi dari model klasifikasi",
    color:      "#6b7280",
    lightColor: "#f3f4f6",
    gradient:   "from-gray-500 to-gray-600",
    bg:         "bg-gray-50",
    border:     "border-gray-200",
    text:       "text-gray-700",
    badge:      "bg-gray-100 text-gray-700",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    status: "-",
    statusIcon: "?",
  };
}

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
          ? "border-teal-500 bg-teal-50"
          : file
          ? "border-teal-400 bg-teal-50/30"
          : "border-gray-300 hover:border-teal-400 bg-gray-50 hover:bg-teal-50/20 cursor-pointer"
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
            alt="X-ray preview"
            className="w-full max-h-80 object-contain bg-black/5 rounded-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
          >
            x
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          {/* Lung icon */}
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
            <svg className="w-9 h-9 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload foto X-ray dada</p>
          <p className="text-gray-400 text-sm mb-3">Drag & drop atau klik untuk memilih</p>
          <span className="text-xs text-teal-600 font-medium bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            JPG, PNG, WebP
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Confidence Gauge ──────────────────────────────────────────────────────────
function ConfidenceGauge({ pct, color }) {
  const angle   = (pct / 100) * 180;
  const radius  = 54;
  const cx = 70; const cy = 70;
  const startX  = cx - radius;
  const startY  = cy;
  const endRad  = (Math.PI * angle) / 180;
  const endX    = cx - radius * Math.cos(endRad);
  const endY    = cy - radius * Math.sin(endRad);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 140 80" className="w-full max-w-[180px] mx-auto">
      {/* Track */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round"
      />
      {/* Fill */}
      {pct > 0 && (
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
        />
      )}
      {/* Label */}
      <text x={cx} y={cy - 6} textAnchor="middle" className="text-sm font-extrabold"
        style={{ fontSize: "18px", fontWeight: 800, fill: color }}
      >
        {pct.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle"
        style={{ fontSize: "9px", fill: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}
      >
        CONFIDENCE
      </text>
    </svg>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PneumoniaClassificationPage() {
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
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

      const res = await fetch(
        `${API_URL}/predict?model_name=${encodeURIComponent(MODEL_ID)}`,
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

  const isOnline   = serverStatus === "online";
  const canPredict = isOnline && (!!imageFile || !!imagePreview) && !isProcessing;

  const predList = result?.prediction
    ? Object.entries(result.prediction)
        .map(([cls, pct]) => ({ cls, pct }))
        .sort((a, b) => b.pct - a.pct)
    : [];

  const topInfo    = result?.predicted_class ? getClassInfo(result.predicted_class) : null;
  const isHealthy  = topInfo?.key === "normal";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 left-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-8 w-80 h-64 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute top-32 right-32 w-40 h-40 bg-emerald-400 rounded-full blur-2xl" />
        </div>
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(45,212,191,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Chest X-ray Analysis
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Pneumonia
              <span className="block bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Classification
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Klasifikasi kondisi paru-paru dari foto <strong className="text-white">X-ray dada</strong> ke dalam
              kategori <strong className="text-teal-300">Normal</strong>,{" "}
              <strong className="text-amber-300">Viral Pneumonia</strong>, atau{" "}
              <strong className="text-red-300">Bacterial Pneumonia</strong> secara otomatis.
            </p>

            {/* Class overview */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {[
                { label: "Normal",            color: "text-green-400",  dot: "bg-green-400",  desc: "Sehat" },
                { label: "Viral Pneumonia",   color: "text-amber-400",  dot: "bg-amber-400",  desc: "Infeksi Virus" },
                { label: "Bacterial",         color: "text-red-400",    dot: "bg-red-400",    desc: "Infeksi Bakteri" },
              ].map((c) => (
                <div key={c.label}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2.5 text-center"
                >
                  <span className={`w-2 h-2 rounded-full ${c.dot} inline-block mb-1`} />
                  <p className={`text-xs font-bold ${c.color}`}>{c.label}</p>
                  <p className="text-[10px] text-slate-400">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* ── Left: Upload ── */}
          <div className="space-y-6">

            {/* Model badge */}
            <div className="flex items-center gap-3 bg-white border border-teal-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-sm">S</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{MODEL_LABEL} Model</p>
                <p className="text-xs text-gray-500">Model tunggal teroptimasi untuk klasifikasi pneumonia</p>
              </div>
              <span className="ml-auto bg-teal-100 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                Default
              </span>
            </div>

            {/* DropZone card */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 focus:outline-none ${isSelected ? 'border-teal-500 ring-2 ring-teal-300' : 'border-transparent hover:border-teal-400'} ${loadingSample && !isFetching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-teal-500/30 hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Menganalisis X-ray...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Klasifikasikan X-ray
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

            {/* Tips */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
              <p className="text-teal-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips untuk hasil terbaik
              </p>
              <ul className="text-teal-700 text-xs space-y-1 list-disc list-inside">
                <li>Gunakan foto X-ray dada posisi PA (Posteroanterior)</li>
                <li>Pastikan gambar mencakup seluruh area paru-paru</li>
                <li>Hindari foto yang blur, overexposed, atau terpotong</li>
                <li>Resolusi minimal 224x224 piksel</li>
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
                <div className="flex gap-2 mb-5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-teal-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-gray-800 font-bold text-lg mb-1">Menganalisis X-ray...</p>
                <p className="text-gray-400 text-sm">Model {MODEL_LABEL} sedang memproses</p>
              </div>
            )}

            {/* Idle */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-72 text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">Siap Mengklasifikasikan</p>
                <p className="text-gray-400 text-sm mt-1">Upload foto X-ray dan klik tombol klasifikasi</p>
              </div>
            )}

            {/* Result card */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Status bar */}
                <div
                  className="h-2 w-full"
                  style={{ background: `linear-gradient(90deg, ${topInfo.color}, ${topInfo.color}66)` }}
                />

                <div className="p-6 space-y-5">

                  {/* Header row */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${topInfo.color}, ${topInfo.color}cc)` }}
                    >
                      {topInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
                        Hasil Klasifikasi
                      </p>
                      <h3 className="text-2xl font-extrabold leading-tight" style={{ color: topInfo.color }}>
                        {topInfo.label}
                      </h3>
                    </div>
                    {/* Status badge */}
                    <div
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: topInfo.color }}
                    >
                      {isHealthy ? "Sehat" : "Terdeteksi"}
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm leading-relaxed">{topInfo.desc}</p>

                  {/* Gauge */}
                  <div className="py-2">
                    <ConfidenceGauge pct={result.confidence ?? 0} color={topInfo.color} />
                  </div>

                  {/* All class probabilities */}
                  {predList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Probabilitas per Kelas
                      </p>
                      <div className="space-y-3">
                        {predList.map(({ cls, pct }) => {
                          const info   = getClassInfo(cls);
                          const isTop  = cls === result.predicted_class;
                          const numPct = typeof pct === "number" ? pct : parseFloat(pct);
                          return (
                            <div key={cls}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-semibold flex items-center gap-1.5 ${isTop ? info.text : "text-gray-500"}`}>
                                  <span
                                    className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                                    style={{ backgroundColor: info.color, opacity: isTop ? 1 : 0.4 }}
                                  />
                                  {info.label}
                                  {isTop && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${info.badge}`}>
                                      Prediksi
                                    </span>
                                  )}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${isTop ? info.text : "text-gray-400"}`}>
                                  {numPct.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-2.5 rounded-full transition-all duration-700"
                                  style={{
                                    width: `${numPct}%`,
                                    backgroundColor: info.color,
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

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                        Model
                      </p>
                      <p className="text-sm font-bold text-gray-700 truncate">
                        {MODEL_LABEL}
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

                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <strong>Perhatian:</strong> Hasil ini hanya untuk keperluan penelitian dan tidak
                      menggantikan diagnosis medis profesional. Selalu konsultasikan hasil dengan dokter.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    
      {/* Floating Project Info Panel */}
      <ProjectInfoPanel projectId="019fd05e-739a-7800-ba43-8272777c51bc" />
    </div>
  );
}