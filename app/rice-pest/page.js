"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import ProjectInfoPanel from "@/components/demos/ProjectInfoPanel";

const API_URL = "/api/rispro/9005";

// ─── 11 Hama Classes ───────────────────────────────────────────────────────────
const PEST_CLASSES = [
  { id: 0,  name: "Cecidomyiidae",    local: "Lalat Padi",           color: "#ef4444" },
  { id: 1,  name: "Chloropidae",      local: "Lalat Hijau Padi",     color: "#f97316" },
  { id: 2,  name: "Cicadellidae",     local: "Wereng / Leafhopper",  color: "#eab308" },
  { id: 3,  name: "Crambidae",        local: "Penggerek Batang",     color: "#84cc16" },
  { id: 4,  name: "Curculionidae",    local: "Kumbang Moncong",      color: "#22c55e" },
  { id: 5,  name: "Delphacidae",      local: "Wereng Coklat",        color: "#10b981" },
  { id: 6,  name: "Ephydridae",       local: "Lalat Pantai Padi",    color: "#06b6d4" },
  { id: 7,  name: "Hesperiidae",      local: "Ulat Penggulung Daun", color: "#3b82f6" },
  { id: 8,  name: "Noctuidae",        local: "Ulat Grayak / Armyworm", color: "#8b5cf6" },
  { id: 9,  name: "Phlaeothripidae",  local: "Thrips Padi",          color: "#d946ef" },
  { id: 10, name: "Thripidae",        local: "Thrips (Kecil)",       color: "#f43f5e" },
];

const PEST_MAP = Object.fromEntries(PEST_CLASSES.map((p) => [p.name, p]));
const PEST_ID_MAP = Object.fromEntries(PEST_CLASSES.map((p) => [p.id, p]));

// ─── Models ────────────────────────────────────────────────────────────────────
const MODELS = [
  {
    id: "efficientnet",
    name: "EfficientNet-B4",
    badge: "Rekomendasi",
    badgeColor: "bg-blue-100 text-blue-700",
    f1: "90.75%",
    size: "68 MB",
    input: "380×380",
    speed: "~50–640ms",
    best: true,
    color: "#3b82f6",
    border: "border-blue-300",
    bg: "bg-blue-50",
  },
  {
    id: "inception",
    name: "Inception-V3",
    badge: "Alternatif",
    badgeColor: "bg-purple-100 text-purple-700",
    f1: "88.19%",
    size: "94 MB",
    input: "299×299",
    speed: "~30–310ms",
    best: false,
    color: "#8b5cf6",
    border: "border-purple-300",
    bg: "bg-purple-50",
  },
];

const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]));

// ─── Confidence color helper ───────────────────────────────────────────────────
function confColor(v) {
  if (v >= 0.90) return "#22c55e";
  if (v >= 0.70) return "#eab308";
  return "#ef4444";
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
          ? "border-green-500 bg-green-50"
          : file
          ? "border-green-400 bg-green-50/30"
          : "border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50/20 cursor-pointer"
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
            alt="Preview hama padi"
            className="w-full max-h-72 object-contain bg-green-50/20 rounded-2xl"
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
        <div className="flex flex-col items-center justify-center h-60 p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1 text-base">Upload Foto Hama Padi</p>
          <p className="text-sm text-gray-400">Drag &amp; drop atau klik untuk browse</p>
          <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP</p>
        </div>
      )}
    </div>
  );
}

// ─── Confidence Bar ────────────────────────────────────────────────────────────
function ConfBar({ value, isTop }) {
  const pct = (value * 100).toFixed(1);
  const color = confColor(value);
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RicePestPage() {
  const [serverStatus, setServerStatus] = useState("checking");
  const [serverInfo, setServerInfo]     = useState(null);

  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [selectedModel, setSelectedModel] = useState("efficientnet");
  const [topk, setTopk]                   = useState(5);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");

  const [samples, setSamples]           = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [loadingSample, setLoadingSample]  = useState(null);

  const resultRef = useRef(null);

  useEffect(() => { checkHealth(); fetchSamples(); }, []);

  async function fetchSamples() {
    setSamplesLoading(true);
    try {
      const res  = await fetch(`${API_URL}/samples`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      // Normalisasi url absolut service → relatif lewat proxy Next (biar same-origin)
      setSamples((data.samples || []).map(s => ({
        ...s,
        url: s.url.replace(/^https?:\/\/[^/]+/, "/api/rispro/9005"),
      })));
    } catch {
      // samples not critical — silently ignore
    } finally {
      setSamplesLoading(false);
    }
  }

  async function handleSampleClick(sample) {
    if (loadingSample) return;
    setLoadingSample(sample.url);

    // Show preview immediately for instant UI feedback
    setImagePreview(sample.url);
    setImageFile(null);
    setResult(null);
    setError("");

    try {
      const res = await fetch(sample.url, { cache: "force-cache" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const file = new File([blob], sample.name, { type: blob.type || "image/jpeg" });
      setImageFile(file);
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
        // Preview is shown, file will be resolved during predict
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
      if (data.status === "ok" && data.models_loaded?.length > 0) {
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

      const url = `${API_URL}/predict?model=${selectedModel}&topk=${topk}`;
      const res = await fetch(url, { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    } catch (err) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOnline   = serverStatus === "online";
  const canPredict = isOnline && (!!imageFile || !!imagePreview) && !isProcessing;
  const activeModel = MODEL_MAP[selectedModel] || MODELS[0];
  const topPred = result?.predictions?.[0];
  const topPestInfo = topPred ? (PEST_MAP[topPred.class_name] || PEST_ID_MAP[topPred.class_id]) : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-green-950 via-emerald-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 left-16 w-80 h-80 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-72 bg-emerald-500 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Rice Pest
              <span className="block bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Classification
              </span>
            </h1>
            <p className="text-green-200 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Identifikasi <strong className="text-white">11 jenis hama tanaman padi</strong> secara otomatis
              menggunakan <strong className="text-green-300">EfficientNet-B4</strong> (90.75%) atau
              <strong className="text-purple-300"> Inception-V3</strong> (88.19%).
            </p>

            {/* Pest count chips */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {PEST_CLASSES.map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-green-100 font-medium"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps Banner ── */}
      <section className="bg-green-700 py-3.5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            {["Pilih model AI", "Upload foto hama", "Atur Top-K prediksi", "Identifikasi hama"].map((step, i) => (
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
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-8">

            {/* ── Left Panel (3/5) ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Model Selector Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Pilih Model AI
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Kedua model di-fine-tune dari ImageNet pretrained weights tanpa augmentasi data.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {MODELS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedModel === m.id
                          ? `${m.border} ${m.bg}`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={m.id}
                        checked={selectedModel === m.id}
                        onChange={() => setSelectedModel(m.id)}
                        className="mt-1 accent-green-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-bold text-gray-800 text-sm">{m.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${m.badgeColor}`}>
                            {m.badge}
                          </span>
                          {m.best && (
                            <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>F1 Score</span>
                            <span className="font-bold" style={{ color: m.color }}>{m.f1}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ukuran</span>
                            <span className="font-mono">{m.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Input</span>
                            <span className="font-mono">{m.input}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Kecepatan</span>
                            <span className="font-mono">{m.speed}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Top-K slider */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Top-K Prediksi
                      <span className="text-xs font-normal text-gray-400 ml-1">(jumlah hasil yang ditampilkan)</span>
                    </label>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                      Top {topk}
                    </span>
                  </div>
                  <input
                    type="range" min="1" max="11" step="1"
                    value={topk}
                    onChange={(e) => setTopk(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Top 1 (prediksi utama)</span>
                    <span>Top 11 (semua kelas)</span>
                  </div>
                </div>
              </div>

              {/* Upload Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Upload Foto Hama Padi
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Upload gambar hama tanaman padi. Model akan mengklasifikasikan ke dalam 11 kelas hama.
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
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        {samples.map((s, idx) => {
                          const isSelected = imagePreview === s.url;
                          const isFetching = loadingSample === s.url;
                          return (
                            <button
                              key={s.url || idx}
                              onClick={() => handleSampleClick(s)}
                              disabled={!!loadingSample}
                              title={`${s.name} (${s.size_kb} KB)`}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                isSelected ? "border-green-500 ring-2 ring-green-300" : "border-transparent hover:border-green-500"
                              } ${loadingSample && !isFetching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                    )}
                  </div>
                )}

                {/* Identify Button */}
                <button
                  id="identify-btn"
                  onClick={handlePredict}
                  disabled={!canPredict}
                  className={`w-full mt-6 py-5 px-6 text-lg font-bold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                    canPredict
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg hover:shadow-green-500/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Mengidentifikasi hama...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Identifikasi Hama Padi
                    </>
                  )}
                </button>

                {(!imageFile || !isOnline) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!imageFile && (
                      <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
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
            </div>

            {/* ── Right: Result Panel (2/5) ── */}
            <div className="lg:col-span-2" ref={resultRef}>
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Hasil Identifikasi
                </h2>

                {/* Error */}
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Identifikasi Gagal
                    </p>
                    <p className="text-red-600 text-xs break-words">{error}</p>
                  </div>
                )}

                {/* Processing */}
                {isProcessing && (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-300 mb-4">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-green-500 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-green-800 font-bold text-base mb-1">Mengidentifikasi hama...</p>
                      <p className="text-green-500 text-sm">
                        {activeModel.name} &mdash; {activeModel.speed}
                      </p>
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && !isProcessing && (
                  <div className="space-y-4">

                    {/* Main prediction card */}
                    {topPred && topPestInfo && (
                      <div
                        className="relative overflow-hidden rounded-2xl p-5 text-center border-2"
                        style={{ borderColor: topPestInfo.color, backgroundColor: `${topPestInfo.color}10` }}
                      >
                        <div
                          className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-10 blur-2xl"
                          style={{ backgroundColor: topPestInfo.color }}
                        />
                        <div className="relative">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Hama Teridentifikasi</p>
                          <h3
                            className="text-2xl font-extrabold italic mb-1"
                            style={{ color: topPestInfo.color }}
                          >
                            {topPestInfo.name}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium mb-3">{topPestInfo.local}</p>

                          {/* Big confidence bar */}
                          <div className="relative mb-1">
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-3 rounded-full transition-all duration-700"
                                style={{ width: `${(topPred.confidence * 100).toFixed(1)}%`, backgroundColor: confColor(topPred.confidence) }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Confidence</span>
                            <span className="font-bold text-sm" style={{ color: confColor(topPred.confidence) }}>
                              {(topPred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>

                          {/* Model badge */}
                          <div className="mt-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: activeModel.color }}
                            >
                              {activeModel.name}
                              {activeModel.best && <span className="text-yellow-300">&#9733;</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top-K predictions list */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Top {result.predictions.length} Prediksi
                      </p>
                      <div className="space-y-2.5">
                        {result.predictions.map((pred, idx) => {
                          const pestInfo = PEST_MAP[pred.class_name] || PEST_ID_MAP[pred.class_id] || {};
                          const isTop = idx === 0;
                          return (
                            <div
                              key={pred.class_id}
                              className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                                isTop
                                  ? "border-2 bg-green-50"
                                  : "bg-gray-50 border border-gray-100"
                              }`}
                              style={isTop ? { borderColor: pestInfo.color || "#22c55e" } : {}}
                            >
                              {/* Rank badge */}
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isTop ? "text-white" : "bg-gray-200 text-gray-500"}`}
                                style={isTop ? { backgroundColor: pestInfo.color || "#22c55e" } : {}}
                              >
                                {idx + 1}
                              </span>

                              {/* Color dot */}
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: pestInfo.color || "#6b7280" }}
                              />

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`text-sm font-bold italic ${isTop ? "" : "text-gray-700"}`}
                                    style={isTop ? { color: pestInfo.color } : {}}>
                                    {pred.class_name}
                                  </span>
                                  {isTop && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                                      style={{ backgroundColor: pestInfo.color || "#22c55e" }}>
                                      UTAMA
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400 mb-1.5">{pestInfo.local || ""}</p>
                                <ConfBar value={pred.confidence} isTop={isTop} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span><strong>File:</strong> {result.filename}</span>
                        <span><strong>Inference:</strong> {result.inference_time_ms?.toFixed(0)} ms</span>
                      </div>
                      <div>
                        <strong>Model:</strong> {result.model} &nbsp;&middot;&nbsp; <strong>Classes:</strong> {result.num_classes}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!result && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-green-50/40 to-emerald-50/40 rounded-2xl border-2 border-dashed border-green-200">
                    <div className="text-center px-4">
                      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-semibold text-sm mb-1">Siap Mengidentifikasi</p>
                      <p className="text-gray-400 text-xs">Upload foto hama dan klik tombol identifikasi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 11 Pest Classes Reference ── */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">11 Kelas Hama Padi</h2>
                <p className="text-gray-400 text-sm">Ordo/famili serangga hama yang dapat diidentifikasi oleh model</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PEST_CLASSES.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-4 rounded-2xl border hover:shadow-md transition-shadow"
                  style={{ borderColor: `${p.color}40`, backgroundColor: `${p.color}08` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm italic truncate" style={{ color: p.color }}>{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.local}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Model Comparison ── */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Perbandingan Model</h2>
                <p className="text-gray-400 text-sm">PyTorch 2.6 + TorchVision &mdash; Full fine-tuning tanpa augmentasi</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {["Model", "F1 Score", "Ukuran", "Input Size", "Kecepatan GPU", "Direkomendasikan", "Aksi"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MODELS.map((m) => (
                    <tr
                      key={m.id}
                      className={`transition-colors ${selectedModel === m.id ? m.bg : "hover:bg-gray-50"}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="font-bold text-gray-800">{m.name}</span>
                          {m.best && (
                            <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">DEFAULT</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-base" style={{ color: m.color }}>{m.f1}</span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: m.f1, backgroundColor: m.color }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">{m.size}</td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">{m.input}</td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">{m.speed}</td>
                      <td className="py-3.5 px-4">
                        {m.best
                          ? <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Ya</span>
                          : <span className="text-xs text-gray-400">Alternatif</span>
                        }
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedModel(m.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors text-white"
                          style={{ backgroundColor: selectedModel === m.id ? m.color : "#d1d5db", color: selectedModel === m.id ? "white" : "#6b7280" }}
                        >
                          {selectedModel === m.id ? "Aktif" : "Pilih"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Confidence color legend */}
            <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold text-gray-700 mb-3">Panduan Warna Confidence</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { range: ">= 90%", label: "Sangat Yakin",  color: "#22c55e" },
                  { range: "70–89%", label: "Cukup Yakin",   color: "#eab308" },
                  { range: "< 70%",  label: "Kurang Yakin",  color: "#ef4444" },
                ].map((c) => (
                  <div key={c.range} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-mono text-xs font-bold" style={{ color: c.color }}>{c.range}</span>
                    <span className="text-xs text-gray-500">&mdash; {c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Floating Project Info Panel */}
      <ProjectInfoPanel projectId="01a013c3-01bf-712a-93d0-43b826fba531" />
    </div>
  );
}
