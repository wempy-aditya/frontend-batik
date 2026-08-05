"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "https://rispro-diabetic-retinopathy.wempyaw.com";

// ─── Models ────────────────────────────────────────────────────────────────────
const MODELS = [
  {
    id:          "model_js1",
    label:       "Model JS1",
    desc:        "Arsitektur pertama — balanced accuracy",
    badge:       "Default",
    badgeColor:  "bg-amber-100 text-amber-700",
    color:       "#f59e0b",
    border:      "border-amber-300",
    bg:          "bg-amber-50",
    recommended: true,
  },
  {
    id:          "model_js2",
    label:       "Model JS2",
    desc:        "Arsitektur kedua — sensitivitas lebih tinggi",
    badge:       "Alternatif",
    badgeColor:  "bg-orange-100 text-orange-700",
    color:       "#f97316",
    border:      "border-orange-300",
    bg:          "bg-orange-50",
    recommended: false,
  },
  {
    id:          "model_js3",
    label:       "Model JS3",
    desc:        "Arsitektur ketiga — spesifisitas lebih tinggi",
    badge:       "Varian",
    badgeColor:  "bg-red-100 text-red-700",
    color:       "#ef4444",
    border:      "border-red-300",
    bg:          "bg-red-50",
    recommended: false,
  },
];

const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]));

// ─── DR grading system ─────────────────────────────────────────────────────────
// Standard ISDR grading: 0-No DR, 1-Mild, 2-Moderate, 3-Severe, 4-Proliferative
const DR_GRADES = {
  // numeric keys
  "0": { grade: 0, label: "No DR",          color: "#22c55e", bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  gradient: "from-green-500 to-emerald-600", severity: "Normal",       severityNum: 0 },
  "1": { grade: 1, label: "Mild",            color: "#84cc16", bg: "bg-lime-50",    border: "border-lime-200",   text: "text-lime-700",   badge: "bg-lime-100 text-lime-700",    gradient: "from-lime-500 to-green-500",   severity: "Ringan",       severityNum: 1 },
  "2": { grade: 2, label: "Moderate",        color: "#f59e0b", bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  gradient: "from-amber-500 to-orange-500", severity: "Sedang",       severityNum: 2 },
  "3": { grade: 3, label: "Severe",          color: "#ef4444", bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700",      gradient: "from-red-500 to-rose-600",     severity: "Parah",        severityNum: 3 },
  "4": { grade: 4, label: "Proliferative",   color: "#7c3aed", bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-100 text-violet-700",gradient: "from-violet-600 to-purple-700",severity: "Proliferatif", severityNum: 4 },
  // named keys (possible API responses)
  "no_dr":           { grade: 0, label: "No DR",        color: "#22c55e", bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  gradient: "from-green-500 to-emerald-600", severity: "Normal",       severityNum: 0 },
  "nodr":            { grade: 0, label: "No DR",        color: "#22c55e", bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  gradient: "from-green-500 to-emerald-600", severity: "Normal",       severityNum: 0 },
  "normal":          { grade: 0, label: "No DR",        color: "#22c55e", bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  gradient: "from-green-500 to-emerald-600", severity: "Normal",       severityNum: 0 },
  "mild":            { grade: 1, label: "Mild",         color: "#84cc16", bg: "bg-lime-50",    border: "border-lime-200",   text: "text-lime-700",   badge: "bg-lime-100 text-lime-700",    gradient: "from-lime-500 to-green-500",   severity: "Ringan",       severityNum: 1 },
  "moderate":        { grade: 2, label: "Moderate",     color: "#f59e0b", bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  gradient: "from-amber-500 to-orange-500", severity: "Sedang",       severityNum: 2 },
  "severe":          { grade: 3, label: "Severe",       color: "#ef4444", bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700",      gradient: "from-red-500 to-rose-600",     severity: "Parah",        severityNum: 3 },
  "proliferative":   { grade: 4, label: "Proliferative",color: "#7c3aed", bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-100 text-violet-700",gradient: "from-violet-600 to-purple-700",severity: "Proliferatif", severityNum: 4 },
  "proliferative_dr":{ grade: 4, label: "Proliferative",color: "#7c3aed", bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-100 text-violet-700",gradient: "from-violet-600 to-purple-700",severity: "Proliferatif", severityNum: 4 },
};

function getDRInfo(className) {
  if (!className) return null;
  const key = className.toString().toLowerCase().replace(/[\s_-]/g, "");
  const entry = DR_GRADES[key] || DR_GRADES[className.toString()];
  if (entry) return entry;
  // fallback generic
  return {
    grade: -1, label: className, color: "#6b7280",
    bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700",
    badge: "bg-gray-100 text-gray-700", gradient: "from-gray-500 to-gray-600",
    severity: "-", severityNum: -1,
  };
}

// 5-step severity scale bar
const SEVERITY_STEPS = [
  { num: 0, label: "No DR",        short: "0",  color: "#22c55e" },
  { num: 1, label: "Mild",         short: "1",  color: "#84cc16" },
  { num: 2, label: "Moderate",     short: "2",  color: "#f59e0b" },
  { num: 3, label: "Severe",       short: "3",  color: "#ef4444" },
  { num: 4, label: "Proliferative",short: "4",  color: "#7c3aed" },
];

// ─── Eye icon ─────────────────────────────────────────────────────────────────
function EyeIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
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
          ? "border-amber-500 bg-amber-50"
          : file
          ? "border-amber-400 bg-amber-50/30"
          : "border-gray-300 hover:border-amber-400 bg-gray-50 hover:bg-amber-50/20 cursor-pointer"
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
          {/* Fundus photos are typically circular on dark bg */}
          <img
            src={preview}
            alt="Fundus preview"
            className="w-full max-h-80 object-contain bg-black rounded-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
          >
            x
          </button>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <EyeIcon className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-white text-[10px] font-semibold">Fundus Retina</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <EyeIcon className="w-9 h-9 text-amber-500" />
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload foto fundus retina</p>
          <p className="text-gray-400 text-sm mb-3">Foto fundus/retina menggunakan fundus kamera</p>
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            JPG, PNG, WebP
          </span>
        </div>
      )}
    </div>
  );
}

// ─── DR Severity Scale ─────────────────────────────────────────────────────────
function DRScale({ activeGrade }) {
  return (
    <div className="w-full">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">
        Tingkat Keparahan
      </p>
      <div className="flex gap-1.5">
        {SEVERITY_STEPS.map((s) => {
          const isActive = s.num === activeGrade;
          const isPast   = activeGrade !== undefined && s.num < activeGrade;
          return (
            <div key={s.num} className="flex-1 text-center">
              <div
                className={`h-2.5 rounded-full mb-1.5 transition-all duration-500 ${
                  isActive ? "ring-2 ring-offset-1 scale-y-125" : ""
                }`}
                style={{
                  backgroundColor: s.color,
                  opacity: activeGrade === undefined ? 0.25 : isActive ? 1 : isPast ? 0.5 : 0.15,
                  ringColor: s.color,
                }}
              />
              <p
                className={`text-[9px] font-semibold leading-tight transition-all ${
                  isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {s.short}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-gray-400">Sehat</span>
        <span className="text-[9px] text-gray-400">Proliferatif</span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DiabeticRetinopathyPage() {
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [selectedModel, setSelectedModel] = useState("model_js1");
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
        .sort((a, b) => {
          // sort by DR grade order if possible, else by probability desc
          const aInfo = getDRInfo(a.cls);
          const bInfo = getDRInfo(b.cls);
          if (aInfo?.severityNum >= 0 && bInfo?.severityNum >= 0) {
            return aInfo.severityNum - bInfo.severityNum;
          }
          return b.pct - a.pct;
        })
    : [];

  const topInfo       = result?.predicted_class ? getDRInfo(result.predicted_class) : null;
  const needsAttention = topInfo && topInfo.severityNum >= 2;
  const isSevere       = topInfo && topInfo.severityNum >= 3;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-6 left-12 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-8 w-80 h-64 bg-orange-600 rounded-full blur-3xl" />
          <div className="absolute top-24 right-24 w-52 h-52 bg-red-500 rounded-full blur-2xl" />
        </div>
        {/* Radial "retina" pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.6) 0%, transparent 60%), radial-gradient(circle at 50% 50%, transparent 30%, rgba(251,191,36,0.2) 35%, transparent 40%), radial-gradient(circle at 50% 50%, transparent 50%, rgba(251,191,36,0.15) 55%, transparent 60%)",
          }}
        />

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <EyeIcon className="w-3.5 h-3.5" />
              Fundus Retina Analysis
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Diabetic Retinopathy
              <span className="block bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                Grading
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Deteksi dan grading <strong className="text-white">Diabetic Retinopathy</strong> dari
              foto fundus retina ke dalam{" "}
              <strong className="text-amber-300">5 tingkat keparahan</strong> menggunakan 3 varian
              model deep learning.
            </p>

            {/* 5-grade visual scale in hero */}
            <div className="flex justify-center gap-2 flex-wrap">
              {SEVERITY_STEPS.map((s) => (
                <div
                  key={s.num}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 backdrop-blur-sm text-white/80"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-white/50 text-[10px]">Grade {s.num}</span>
                  {s.label}
                </div>
              ))}
            </div>

            {/* Model selector */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
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
                    <span className="ml-1.5 text-[10px] bg-amber-400/30 text-amber-300 px-1.5 py-0.5 rounded-full">
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
            <div className={`flex items-center gap-3 rounded-2xl border-2 ${activeModel.border} ${activeModel.bg} px-4 py-3`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                style={{ backgroundColor: activeModel.color }}
              >
                {activeModel.label.split(" ").pop()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800 text-sm">{activeModel.label}</p>
                <p className="text-xs text-gray-500 truncate">{activeModel.desc}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${activeModel.badgeColor}`}>
                {activeModel.badge}
              </span>
            </div>

            {/* DropZone */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-amber-500" />
                Upload Foto Fundus Retina
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
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 focus:outline-none ${isSelected ? 'border-amber-500 ring-2 ring-amber-300' : 'border-transparent hover:border-amber-400'} ${loadingSample && !isFetching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg hover:shadow-amber-500/30 hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Menganalisis Retina...
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-5 h-5" />
                    Grading Retinopati
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

            {/* Grading reference card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Skala Grading DR (ISDR)
              </p>
              <div className="space-y-2">
                {SEVERITY_STEPS.map((s) => (
                  <div key={s.num} className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.num}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800">{s.label}</p>
                    </div>
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${((s.num + 1) / 5) * 100}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-amber-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips untuk hasil terbaik
              </p>
              <ul className="text-amber-700 text-xs space-y-1 list-disc list-inside">
                <li>Gunakan foto fundus dari fundus kamera standar</li>
                <li>Fokus pada area makula dan optic disc</li>
                <li>Pastikan gambar tidak blur dan pencahayaan merata</li>
                <li>Resolusi optimal: 512x512 piksel atau lebih</li>
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
                {/* Pulsing eye */}
                <div className="relative w-20 h-20 mb-5">
                  <div className="absolute inset-0 rounded-full bg-amber-100 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-amber-200 animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <EyeIcon className="w-10 h-10 text-amber-500" />
                  </div>
                </div>
                <p className="text-gray-800 font-bold text-lg mb-1">Menganalisis retina...</p>
                <p className="text-gray-400 text-sm">{activeModel.label} sedang memproses</p>
              </div>
            )}

            {/* Idle */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-72 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <EyeIcon className="w-8 h-8 text-amber-300" />
                </div>
                <p className="text-gray-700 font-semibold">Siap Grading</p>
                <p className="text-gray-400 text-sm mt-1">Upload foto fundus retina untuk memulai analisis</p>
                <div className="mt-5 w-full max-w-xs">
                  <DRScale activeGrade={undefined} />
                </div>
              </div>
            )}

            {/* Result */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${topInfo.gradient} p-6 text-white`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <EyeIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Hasil Grading
                      </p>
                      <h3 className="text-2xl font-extrabold leading-tight">
                        {topInfo.grade >= 0 ? `Grade ${topInfo.grade} — ` : ""}{topInfo.label}
                      </h3>
                      <span className="inline-block mt-1 text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
                        Tingkat: {topInfo.severity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">

                  {/* Severity scale */}
                  <DRScale activeGrade={topInfo.severityNum} />

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
                        className="h-3 rounded-full transition-all duration-700"
                        style={{
                          width: `${result.confidence?.toFixed(1)}%`,
                          background: `linear-gradient(90deg, ${topInfo.color}, ${topInfo.color}99)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* All grade probabilities (sorted by grade order) */}
                  {predList.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Probabilitas per Grade
                      </p>
                      <div className="space-y-2.5">
                        {predList.map(({ cls, pct }) => {
                          const info   = getDRInfo(cls);
                          const isTop  = cls === result.predicted_class;
                          const numPct = typeof pct === "number" ? pct : parseFloat(pct);
                          return (
                            <div key={cls}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-semibold flex items-center gap-2 ${isTop ? info?.text : "text-gray-400"}`}>
                                  {info?.grade >= 0 && (
                                    <span
                                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0"
                                      style={{ backgroundColor: info.color, opacity: isTop ? 1 : 0.4 }}
                                    >
                                      {info.grade}
                                    </span>
                                  )}
                                  {info?.label || cls}
                                  {isTop && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${info?.badge}`}>
                                      Prediksi
                                    </span>
                                  )}
                                </span>
                                <span className={`text-xs font-bold tabular-nums ${isTop ? info?.text : "text-gray-400"}`}>
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

                  {/* Clinical recommendation */}
                  {needsAttention && (
                    <div className={`rounded-xl p-4 border-l-4 ${isSevere ? "bg-red-50 border-red-500" : "bg-amber-50 border-amber-500"}`}>
                      <div className="flex items-start gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSevere ? "text-red-500" : "text-amber-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className={`font-bold text-sm mb-0.5 ${isSevere ? "text-red-800" : "text-amber-800"}`}>
                            {isSevere ? "Perlu Tindakan Segera" : "Diperlukan Evaluasi Lanjut"}
                          </p>
                          <p className={`text-xs leading-relaxed ${isSevere ? "text-red-600" : "text-amber-600"}`}>
                            {isSevere
                              ? `Grade ${topInfo.grade} (${topInfo.label}) memerlukan evaluasi dan tindakan oftalmologis segera untuk mencegah kehilangan penglihatan.`
                              : `Grade ${topInfo.grade} (${topInfo.label}) memerlukan pemantauan rutin dan konsultasi dengan dokter mata.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <strong>Perhatian:</strong> Hasil grading ini hanya untuk keperluan penelitian.
                      Tidak menggantikan diagnosis oftalmologis profesional. Konsultasikan dengan dokter mata spesialis.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
