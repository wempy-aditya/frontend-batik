"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "https://rispro-kopi.wempyaw.com";

const COFFEE_CLASSES = [
  {
    id: 0,
    name: "defect",
    label: "Cacat / Rusak",
    desc: "Biji kopi yang rusak, berlubang, atau tidak sempurna",
    color: "#ef4444",
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    badge: "bg-red-100 text-red-700",
    quality: "Rendah",
    qualityColor: "text-red-500",
  },
  {
    id: 1,
    name: "longberry",
    label: "Longberry",
    desc: "Biji kopi jenis longberry — bentuk memanjang, kualitas tinggi",
    color: "#f97316",
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    quality: "Tinggi",
    qualityColor: "text-orange-500",
  },
  {
    id: 2,
    name: "peaberry",
    label: "Peaberry",
    desc: "Biji kopi jenis peaberry/tunggal — bentuk bulat, langka",
    color: "#22c55e",
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    badge: "bg-green-100 text-green-700",
    quality: "Langka",
    qualityColor: "text-green-500",
  },
  {
    id: 3,
    name: "premium",
    label: "Premium",
    desc: "Biji kopi kualitas premium — bersih tanpa cacat",
    color: "#eab308",
    gradient: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700",
    quality: "Premium",
    qualityColor: "text-yellow-500",
  },
];

const CLASS_MAP = Object.fromEntries(COFFEE_CLASSES.map((c) => [c.name, c]));

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
          ? "border-green-400 bg-green-50/30"
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
        <div className="relative group">
          <img
            src={preview}
            alt="Preview biji kopi"
            className="w-full max-h-72 object-contain bg-amber-50/30 rounded-2xl"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="px-4 py-2 bg-white/90 text-gray-800 rounded-xl text-sm font-semibold hover:bg-white transition-colors"
            >
              Ganti Gambar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="px-4 py-2 bg-red-500/90 text-white rounded-xl text-sm font-semibold hover:bg-red-500 transition-colors"
            >
              Hapus
            </button>
          </div>
          <div className="p-2 text-center text-xs text-green-700 font-medium truncate px-3 bg-green-50/80">
            {file?.name} &mdash; {(file?.size / 1024).toFixed(0)} KB
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 10c0-1.657 1.343-3 3-3s3 1.343 3 3c0 2-3 5-3 5S9 12 9 10z"/>
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1 text-base">Upload Foto Biji Kopi</p>
          <p className="text-sm text-gray-400">Drag &amp; drop atau klik untuk browse</p>
          <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP &mdash; Input diproses 128&times;128</p>
        </div>
      )}
    </div>
  );
}

// ─── Confidence Bar ────────────────────────────────────────────────────────────
function ConfBar({ value, color, isTop }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${isTop ? "bg-gray-200" : "bg-gray-100"}`}>
        <div
          className="h-2.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold w-14 text-right tabular-nums" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Main Result Card ──────────────────────────────────────────────────────────
function MainResultCard({ prediction }) {
  const cls = CLASS_MAP[prediction.class_name] || COFFEE_CLASSES[0];
  const pct = (prediction.confidence * 100).toFixed(1);
  const isDefect = prediction.class_name === "defect";

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 border-2 text-center ${
      isDefect ? "border-red-300 bg-red-50" : "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
    }`}>
      {/* Decorative glow */}
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: cls.color }}
      />

      {/* Icon */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black shadow-lg"
          style={{ background: `linear-gradient(135deg, ${cls.color}, ${isDefect ? "#dc2626" : "#16a34a"})` }}
        >
          {prediction.class_name === "defect"   && <span className="text-2xl">!</span>}
          {prediction.class_name === "longberry" && <span className="text-2xl">L</span>}
          {prediction.class_name === "peaberry"  && <span className="text-2xl">P</span>}
          {prediction.class_name === "premium"   && <span className="text-2xl">S</span>}
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Hasil Klasifikasi</p>
        <h3 className="text-3xl font-extrabold mb-0.5" style={{ color: cls.color }}>
          {cls.label}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{cls.desc}</p>

        {/* Big confidence bar */}
        <div className="mb-2">
          <div className="flex justify-end mb-1.5">
            <span className="text-sm font-bold" style={{ color: cls.color }}>
              {pct}% yakin
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-4 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cls.color}, ${isDefect ? "#dc2626" : "#16a34a"})` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls.badge}`}>
            Kualitas: {cls.quality}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Ablation Table ────────────────────────────────────────────────────────────
const SCENARIOS = [
  { no: 1, name: "Baseline",               aug: "Minimal",   lr: "Konstan",            val: "84.88%", test: "74.00%", best: false },
  { no: 2, name: "+Augmentasi",            aug: "Ekstensif", lr: "Konstan",            val: "88.69%", test: "82.50%", best: false },
  { no: 3, name: "+Augmentasi + Cosine",   aug: "Ekstensif", lr: "Cosine Annealing",   val: "88.00%", test: "84.00%", best: false },
  { no: 4, name: "+Augmentasi + ReduceLR", aug: "Ekstensif", lr: "ReduceLROnPlateau",  val: "87.75%", test: "85.19%", best: true  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CoffeeBeanPage() {
  const [serverStatus, setServerStatus] = useState("checking");
  const [serverInfo, setServerInfo]     = useState(null);

  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");

  const [samples, setSamples]           = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  const resultRef = useRef(null);

  useEffect(() => { checkHealth(); fetchSamples(); }, []);

  async function fetchSamples() {
    setSamplesLoading(true);
    try {
      const res  = await fetch(`${API_URL}/samples`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      setSamples(data.samples || []);
    } catch {
      // samples not critical — silently ignore
    } finally {
      setSamplesLoading(false);
    }
  }

  async function handleSampleClick(sample) {
    // Show preview immediately (no CORS needed for display)
    setImagePreview(sample.url);
    setImageFile(null);
    setResult(null);
    setError("");

    // Try to fetch blob for actual upload
    try {
      const res = await fetch(sample.url, { cache: "force-cache" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setImageFile(new File([blob], sample.name, { type: blob.type || "image/jpeg" }));
    } catch {
      // CORS fallback: canvas approach
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
      if (data.status === "ok" && data.model_loaded) {
        setServerStatus("online");
        setServerInfo(data);
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 left-16 w-80 h-80 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-72 bg-yellow-500 rounded-full blur-3xl" />
          <div className="absolute top-20 right-32 w-48 h-48 bg-orange-600 rounded-full blur-2xl" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Coffee Bean
              <span className="block bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Quality Classifier
              </span>
            </h1>
            <p className="text-stone-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Klasifikasi <strong className="text-white">4 kualitas biji kopi arabika</strong> secara otomatis
              menggunakan CNN 6-layer. Akurasi <strong className="text-amber-300">85.19%</strong> pada dataset USK-Coffee.
            </p>

            {/* Class chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {COFFEE_CLASSES.map((cls) => (
                <span
                  key={cls.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-stone-200 font-medium"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                  {cls.label}
                  <span className="text-stone-400 font-mono text-[10px]">({cls.name})</span>
                </span>
              ))}
            </div>

            {/* Model badge */}
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
                CNN 6-layer &mdash; +Augmentasi + ReduceLROnPlateau &mdash; 85.19% Test Acc
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps Banner ── */}
      <section className="bg-amber-600 py-3.5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            {["Upload foto biji kopi", "Klik Klasifikasi", "Lihat hasil top-4", "Analisis distribusi probabilitas"].map((step, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                {step}
                {i < 3 && <span className="text-white/40 ml-1">&#8594;</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-8">

            {/* ── Left: Input (2/5) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Upload Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Upload Foto Biji Kopi
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Upload gambar biji kopi arabika. Model akan menganalisis dan mengklasifikasikan kualitasnya ke dalam 4 kelas.
                </p>
                <DropZone
                  file={imageFile}
                  preview={imagePreview}
                  onFile={handleFile}
                  onClear={handleClear}
                />

                {/* ── Sample Dataset ── */}
                {(samplesLoading || samples.length > 0) && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Atau coba dengan gambar sample:
                    </p>
                    {samplesLoading ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {samples.map((s, idx) => (
                          <button
                            key={s.url || idx}
                            onClick={() => handleSampleClick(s)}
                            title={`${s.name} (${s.size_kb} KB)`}
                            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-amber-400 transition-all"
                          >
                            <img
                              src={s.url}
                              alt={s.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Classify Button */}
                <button
                  id="classify-btn"
                  onClick={handlePredict}
                  disabled={!canPredict}
                  className={`w-full mt-6 py-5 px-6 text-base font-bold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                    canPredict
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg hover:shadow-amber-500/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Menganalisis biji kopi...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Klasifikasi Kualitas Kopi
                    </>
                  )}
                </button>

                {/* Hints */}
                {(!imageFile || !isOnline) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!imageFile && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
                        Upload foto terlebih dahulu
                      </span>
                    )}
                    {!isOnline && (
                      <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">
                        Server belum terkoneksi
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Class Guide */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">4 Kelas Kualitas</h3>
                <div className="space-y-3">
                  {COFFEE_CLASSES.map((cls) => (
                    <div key={cls.id} className={`flex items-start gap-3 p-3 rounded-xl border ${cls.border} ${cls.bg}`}>
                      <div
                        className="w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: cls.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-bold ${cls.text}`}>{cls.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${cls.badge}`}>{cls.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{cls.desc}</p>
                      </div>
                      <span className={`text-xs font-bold flex-shrink-0 ${cls.qualityColor}`}>{cls.quality}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Result (3/5) ── */}
            <div className="lg:col-span-3" ref={resultRef}>
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Hasil Klasifikasi
                </h2>

                {/* Error */}
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Klasifikasi Gagal
                    </p>
                    <p className="text-red-600 text-xs break-words">{error}</p>
                  </div>
                )}

                {/* Processing */}
                {isProcessing && (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-dashed border-amber-300 mb-4">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-amber-800 font-bold text-base mb-1">Menganalisis biji kopi...</p>
                      <p className="text-amber-500 text-sm">Inference ~100&ndash;450ms</p>
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && !isProcessing && (
                  <div className="space-y-5">

                    {/* Main prediction card */}
                    <MainResultCard prediction={result.predictions[0]} />

                    {/* All 4 predictions */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Distribusi Probabilitas &mdash; 4 Kelas
                      </p>
                      <div className="space-y-3">
                        {result.predictions.map((pred, idx) => {
                          const cls = CLASS_MAP[pred.class_name] || COFFEE_CLASSES[0];
                          const isTop = idx === 0;
                          return (
                            <div
                              key={pred.class_id}
                              className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                                isTop
                                  ? `border-2 ${cls.border} ${cls.bg}`
                                  : "bg-gray-50 border border-gray-100"
                              }`}
                            >
                              {/* Rank */}
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isTop ? "text-white" : "bg-gray-200 text-gray-500"
                              }`}
                                style={isTop ? { backgroundColor: cls.color } : {}}
                              >
                                {idx + 1}
                              </span>

                              {/* Color dot */}
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: cls.color }}
                              />

                              {/* Class info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`text-sm font-bold ${isTop ? cls.text : "text-gray-700"}`}>
                                    {cls.label}
                                  </span>
                                  <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {cls.name}
                                  </span>
                                  {isTop && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: cls.color }}>
                                      PREDIKSI UTAMA
                                    </span>
                                  )}
                                </div>
                                <ConfBar value={pred.confidence} color={cls.color} isTop={isTop} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1.5">
                      <div className="flex justify-between">
                        <span><strong>File:</strong> {result.filename}</span>
                        <span><strong>Inference:</strong> {result.inference_time_ms?.toFixed(1)} ms</span>
                      </div>
                      <div>
                        <strong>Probabilitas raw:</strong>{" "}
                        <span className="font-mono">[{result.probabilities?.map((p) => p.toFixed(4)).join(", ")}]</span>
                      </div>
                      <div className="text-gray-400">defect &rarr; longberry &rarr; peaberry &rarr; premium</div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!result && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-center px-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-semibold text-sm mb-1">Siap Mengklasifikasi</p>
                      <p className="text-gray-400 text-xs">Upload foto biji kopi dan klik tombol klasifikasi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Ablation Study Section ── */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Studi Ablasi &mdash; 4 Skenario</h2>
                <p className="text-gray-400 text-sm">Perbandingan performa model CNN dengan konfigurasi berbeda</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 px-4 text-left text-gray-500 font-semibold">Skenario</th>
                    <th className="py-3 px-4 text-center text-gray-500 font-semibold">Augmentasi</th>
                    <th className="py-3 px-4 text-center text-gray-500 font-semibold">LR Scheduler</th>
                    <th className="py-3 px-4 text-center text-gray-500 font-semibold">Val Acc</th>
                    <th className="py-3 px-4 text-center text-gray-500 font-semibold">Test Acc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SCENARIOS.map((s) => (
                    <tr
                      key={s.no}
                      className={s.best ? "bg-amber-50" : "hover:bg-gray-50 transition-colors"}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            s.best ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-500"
                          }`}>{s.no}</span>
                          <span className={`font-semibold ${s.best ? "text-amber-800" : "text-gray-700"}`}>
                            {s.name}
                          </span>
                          {s.best && (
                            <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                              TERBAIK
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          s.aug === "Ekstensif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>{s.aug}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-600 text-xs">{s.lr}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-bold ${s.best ? "text-amber-700" : "text-gray-600"}`}>{s.val}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-bold text-base ${s.best ? "text-amber-600" : "text-gray-600"}`}>{s.test}</span>
                        {s.best && (
                          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: s.test }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Architecture summary */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-sm font-bold text-gray-700 mb-3">Arsitektur CNN 6-Layer</p>
                <div className="space-y-1.5 font-mono text-xs text-gray-600">
                  {[
                    "Input: 128&times;128&times;3 RGB",
                    "Conv2D 8&times;3&times;3 → MaxPool 2&times;2",
                    "Conv2D 16&times;3&times;3 → MaxPool 2&times;2",
                    "Conv2D 32&times;3&times;3 → MaxPool 2&times;2",
                    "Conv2D 64&times;3&times;3 → MaxPool 2&times;2",
                    "Conv2D 128&times;3&times;3 → MaxPool 2&times;2",
                    "Conv2D 256&times;3&times;3 → MaxPool 2&times;2",
                    "Flatten → Dropout(0.3) → Dense(256)",
                    "Dense(4, Softmax) → Output",
                  ].map((line, i) => (
                    <div key={i} className={`flex items-center gap-2 ${i === 0 || i === 8 ? "font-bold text-amber-700" : ""}`}>
                      <span className="text-amber-400">&rsaquo;</span>
                      <span dangerouslySetInnerHTML={{ __html: line }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-sm font-bold text-gray-700 mb-3">Detail Model</p>
                <div className="space-y-3">
                  {[
                    { key: "Total Parameter",   val: "656,980 (trainable)" },
                    { key: "Optimizer",         val: "Adam (lr=0.001)"     },
                    { key: "Framework",         val: "TensorFlow Keras"    },
                    { key: "Dataset",           val: "USK-Coffee (8.000 gambar)" },
                    { key: "Input Size",        val: "128×128 px (rescale 1/255)" },
                    { key: "Best Model",        val: "+Augmentasi+ReduceLR v1"   },
                    { key: "Test Accuracy",     val: "85.19%"              },
                    { key: "Inference",         val: "~100–450ms (CPU)"   },
                  ].map((row) => (
                    <div key={row.key} className="flex items-start justify-between gap-2 text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 flex-shrink-0">{row.key}</span>
                      <span className="font-semibold text-gray-700 text-right">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
