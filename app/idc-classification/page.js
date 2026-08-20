"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "/api/rispro/9105";
const MODEL_ID = "MobileNet_model";

// ─── Class info helper ─────────────────────────────────────────────────────────
function getClassInfo(className) {
  const lower = (className || "").toLowerCase().replace(/[\s_-]/g, "");

  if (lower === "0" || lower.includes("nonanker") || lower.includes("nonidc") ||
      lower.includes("negative") || lower.includes("negatif") || lower === "0_nonidc" || lower === "class0" ||
      lower === "non_idc" || lower === "benign" || lower === "normal" || lower === "nonidc") {
    return {
      key:      "non_idc",
      label:    "IDC Negatif",
      sublabel: "Bukan Kanker",
      desc:     "Jaringan histopatologi tidak menunjukkan tanda-tanda Invasive Ductal Carcinoma",
      color:    "#16a34a",
      gradient: "from-green-500 to-emerald-600",
      ring:     "ring-green-400",
      bg:       "bg-green-50",
      border:   "border-green-200",
      text:     "text-green-700",
      badge:    "bg-green-100 text-green-700",
      dot:      "bg-green-400",
      severity: "Tidak Terdeteksi",
      severityBg: "bg-green-100",
      severityText: "text-green-700",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
  }

  // IDC positive
  return {
    key:      "idc",
    label:    "IDC Positif",
    sublabel: "Invasive Ductal Carcinoma",
    desc:     "Terdeteksi pola sel yang mengindikasikan Invasive Ductal Carcinoma pada jaringan histopatologi",
    color:    "#e11d48",
    gradient: "from-rose-600 to-pink-700",
    ring:     "ring-rose-400",
    bg:       "bg-rose-50",
    border:   "border-rose-200",
    text:     "text-rose-700",
    badge:    "bg-rose-100 text-rose-700",
    dot:      "bg-rose-500",
    severity: "Terdeteksi IDC",
    severityBg: "bg-rose-100",
    severityText: "text-rose-700",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };
}

// ─── MicroscopeIcon ─────────────────────────────────────────────────────────────
function MicroscopeIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15m-5.05-11.896c.251.023.501.05.75.082M19.8 15l-5.05-5.05" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3.75 19.5h16.5" />
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
          ? "border-pink-500 bg-pink-50"
          : file
          ? "border-pink-400 bg-pink-50/30"
          : "border-gray-300 hover:border-pink-400 bg-gray-50 hover:bg-pink-50/20 cursor-pointer"
      }`}
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
          {/* Slight warm overlay for histopathology feel */}
          <img
            src={preview}
            alt="Histopatologi preview"
            className="w-full max-h-80 object-contain bg-pink-950/10 rounded-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
          >
            x
          </button>
          {/* Microscope overlay badge */}
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <MicroscopeIcon className="w-3.5 h-3.5 text-pink-300" />
            <span className="text-white text-[10px] font-semibold">Histopatologi</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mb-4">
            <MicroscopeIcon className="w-9 h-9 text-pink-500" />
          </div>
          <p className="text-gray-700 font-semibold text-base mb-1">Upload patch histopatologi</p>
          <p className="text-gray-400 text-sm mb-3">Citra potongan jaringan payudara (50×50 px)</p>
          <span className="text-xs text-pink-500 font-medium bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            JPG, PNG, WebP, TIFF
          </span>
        </div>
      )}
    </div>
  );
}



// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IdcClassificationPage() {
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
        url:  s.url.replace(/^https?:\/\/[^/]+/, "/api/rispro/9105"),
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

  const topInfo = result?.predicted_class ? getClassInfo(result.predicted_class) : null;
  const isIDC   = topInfo?.key === "idc";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-rose-950 to-pink-950 overflow-hidden">
        {/* Blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-8 w-80 h-80 bg-pink-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-4 w-96 h-64 bg-rose-600 rounded-full blur-3xl" />
          <div className="absolute top-28 right-28 w-48 h-48 bg-fuchsia-500 rounded-full blur-2xl" />
        </div>
        {/* Hexagonal pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v31l26 15z' fill='%23f9a8d4'/%3E%3C/svg%3E")`,
            backgroundSize: "56px 100px",
          }}
        />

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <MicroscopeIcon className="w-3.5 h-3.5" />
              Histopathology Patch Analysis
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              IDC Breast Cancer
              <span className="block bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent">
                Classification
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Deteksi <strong className="text-white">Invasive Ductal Carcinoma (IDC)</strong> dari
              patch citra histopatologi jaringan payudara menggunakan{" "}
              <strong className="text-pink-300">MobileNet</strong> — secara otomatis dan akurat.
            </p>

            {/* Binary class pills */}
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-sm font-semibold px-5 py-2.5 rounded-xl backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                Non-IDC
                <span className="text-green-400/60 text-xs font-normal">(Tidak ada kanker)</span>
              </div>
              <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 text-rose-300 text-sm font-semibold px-5 py-2.5 rounded-xl backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                IDC Positif
                <span className="text-rose-400/60 text-xs font-normal">(Kanker terdeteksi)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* ── Left ── */}
          <div className="space-y-6">

            {/* Model info */}
            <div className="flex items-center gap-3 bg-white border border-pink-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-xs">MN</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">MobileNet Model</p>
                <p className="text-xs text-gray-500">Ringan dan efisien untuk klasifikasi patch histopatologi</p>
              </div>
              <span className="ml-auto bg-pink-100 text-pink-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                Default
              </span>
            </div>

            {/* DropZone card */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MicroscopeIcon className="w-5 h-5 text-pink-500" />
                Upload Patch Histopatologi
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
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 focus:outline-none ${
                                isSelected ? "border-pink-500 ring-2 ring-pink-300" : "border-transparent hover:border-pink-400"
                              } ${loadingSample && !isFetching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg hover:shadow-pink-500/30 hover:scale-[1.01]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Menganalisis Jaringan...
                  </>
                ) : (
                  <>
                    <MicroscopeIcon className="w-5 h-5" />
                    Deteksi IDC
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

            {/* What is IDC */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Apa itu IDC?
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong className="text-gray-800">Invasive Ductal Carcinoma (IDC)</strong> adalah jenis kanker payudara
                yang paling umum — sekitar 80% dari semua diagnosis kanker payudara. IDC bermula di
                saluran susu (duktus) dan menyebar ke jaringan sekitarnya.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block mb-1" />
                  <p className="text-xs font-bold text-green-700">Non-IDC (0)</p>
                  <p className="text-[10px] text-green-600 mt-0.5">Jaringan normal / jinak</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mb-1" />
                  <p className="text-xs font-bold text-rose-700">IDC (1)</p>
                  <p className="text-[10px] text-rose-600 mt-0.5">Pola kanker terdeteksi</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">
              <p className="text-pink-800 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips penggunaan
              </p>
              <ul className="text-pink-700 text-xs space-y-1 list-disc list-inside">
                <li>Gunakan patch citra histopatologi berukuran 50x50 piksel</li>
                <li>Pewarnaan H&E (Hematoxylin & Eosin) standar</li>
                <li>Pastikan resolusi dan kontras gambar baik</li>
                <li>Satu gambar = satu patch jaringan</li>
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
                <div className="relative w-20 h-20 mb-5">
                  <div className="absolute inset-0 rounded-full bg-pink-100 animate-ping opacity-40" />
                  <div className="relative w-20 h-20 rounded-full bg-pink-50 border-2 border-pink-200 flex items-center justify-center">
                    <MicroscopeIcon className="w-9 h-9 text-pink-400" />
                  </div>
                </div>
                <p className="text-gray-800 font-bold text-lg mb-1">Menganalisis jaringan...</p>
                <p className="text-gray-400 text-sm">MobileNet memproses patch histopatologi</p>
              </div>
            )}

            {/* Idle */}
            {!isProcessing && !result && !error && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center justify-center min-h-72 text-center">
                <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-4">
                  <MicroscopeIcon className="w-8 h-8 text-pink-300" />
                </div>
                <p className="text-gray-700 font-semibold">Siap Mendeteksi</p>
                <p className="text-gray-400 text-sm mt-1">Upload patch histopatologi untuk memulai analisis</p>
              </div>
            )}

            {/* Result */}
            {!isProcessing && result && topInfo && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">

                {/* Top color stripe */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${topInfo.gradient}`}
                />

                <div className="p-6 space-y-5">

                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br ${topInfo.gradient}`}
                    >
                      {topInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">
                        Hasil Deteksi IDC
                      </p>
                      <h3 className="text-2xl font-extrabold leading-tight" style={{ color: topInfo.color }}>
                        {topInfo.label}
                      </h3>
                      <p className="text-xs font-semibold text-gray-400 mt-0.5">{topInfo.sublabel}</p>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${topInfo.severityBg} ${topInfo.severityText}`}>
                      {topInfo.severity}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm leading-relaxed">{topInfo.desc}</p>

                  {/* Probability bars */}
                  {predList.length > 0 && (
                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Probabilitas Kelas
                      </p>
                      <div className="space-y-4">
                        {predList.map(({ cls, pct }) => {
                          const info   = getClassInfo(cls);
                          const isTop  = cls === result.predicted_class;
                          const numPct = typeof pct === "number" ? pct : parseFloat(pct);
                          return (
                            <div key={cls}>
                              <div className="flex justify-between items-end mb-1.5">
                                <span className={`text-sm font-bold flex items-center gap-2 ${isTop ? info.text : "text-gray-500"}`}>
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                                    style={{ backgroundColor: info.color, opacity: isTop ? 1 : 0.4 }}
                                  />
                                  {info.label}
                                  {isTop && (
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full ml-1 ${info.badge}`}>
                                      Prediksi
                                    </span>
                                  )}
                                </span>
                                <span className={`text-base font-extrabold tabular-nums ${isTop ? info.text : "text-gray-400"}`}>
                                  {numPct.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-3 rounded-full transition-all duration-700 ease-out"
                                  style={{
                                    width: `${numPct}%`,
                                    background: isTop ? `linear-gradient(90deg, ${info.color}, ${info.color}dd)` : info.color,
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

                  {/* Alert for IDC positive */}
                  {isIDC && (
                    <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-rose-800 font-bold text-sm">Pola IDC Terdeteksi</p>
                          <p className="text-rose-600 text-xs mt-0.5 leading-relaxed">
                            Patch ini menunjukkan karakteristik IDC. Diperlukan evaluasi lebih lanjut
                            oleh ahli patologi untuk konfirmasi diagnosis.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Model</p>
                      <p className="text-sm font-bold text-gray-700 truncate">MobileNet</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Waktu Inferensi</p>
                      <p className="text-sm font-bold text-gray-700">
                        {result.inference_time_ms?.toFixed(0)} ms
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <strong>Perhatian:</strong> Hasil ini hanya untuk keperluan penelitian. Tidak menggantikan
                      diagnosis patologi profesional. Konfirmasi dengan ahli patologi diperlukan sebelum
                      keputusan klinis.
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
