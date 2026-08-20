"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "/api/rispro/9006";

// ─── Sub-model definitions ─────────────────────────────────────────────────────
const SUB_MODELS = [
  {
    key: "densenet121",
    label: "DenseNet-121",
    input: "224×224",
    weight: 0.4706,
    weightPct: "47.1%",
    icon: "D",
    color: "#3b82f6",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dominant: true,
  },
  {
    key: "inception_v3",
    label: "InceptionV3",
    input: "299×299",
    weight: 0.0893,
    weightPct: "8.9%",
    icon: "I",
    color: "#8b5cf6",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    dominant: false,
  },
  {
    key: "xception",
    label: "Xception",
    input: "299×299",
    weight: 0.2850,
    weightPct: "28.5%",
    icon: "X",
    color: "#f97316",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dominant: false,
  },
  {
    key: "vit_scratch",
    label: "ViT-Pretrained",
    input: "224×224",
    weight: 0.1551,
    weightPct: "15.5%",
    icon: "V",
    color: "#10b981",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dominant: false,
  },
];

const MODEL_MAP = Object.fromEntries(SUB_MODELS.map((m) => [m.key, m]));

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
          ? "border-rose-500 bg-rose-50"
          : file
          ? "border-green-400 bg-green-50/30"
          : "border-gray-300 hover:border-rose-400 bg-gray-50 hover:bg-rose-50/20 cursor-pointer"
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
            alt="Preview lesi kulit"
            className="w-full max-h-72 object-contain bg-gray-50 rounded-2xl"
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
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1 text-base">Upload Gambar Lesi Kulit</p>
          <p className="text-sm text-gray-400">Drag &amp; drop atau klik untuk browse</p>
          <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP</p>
        </div>
      )}
    </div>
  );
}

// ─── Probability Split Bar ─────────────────────────────────────────────────────
function SplitBar({ benign, malignant }) {
  const bPct = (benign * 100).toFixed(1);
  const mPct = (malignant * 100).toFixed(1);
  return (
    <div className="relative">
      <div className="flex h-4 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-4 transition-all duration-700 ease-out"
          style={{ width: `${bPct}%`, backgroundColor: "#22c55e" }}
        />
        <div
          className="h-4 transition-all duration-700 ease-out"
          style={{ width: `${mPct}%`, backgroundColor: "#ef4444" }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <span className="text-green-600 font-bold">{bPct}% Benign</span>
        <span className="text-red-500 font-bold">{mPct}% Malignant</span>
      </div>
    </div>
  );
}

// ─── Sub-model Card ────────────────────────────────────────────────────────────
function SubModelCard({ modelKey, modelData }) {
  const meta = MODEL_MAP[modelKey];
  if (!modelData || !meta) return null;

  const isMalignant = modelData.prediction === "malignant";
  const conf = (modelData.confidence * 100).toFixed(1);
  const bPct = (modelData.probabilities.benign * 100).toFixed(0);
  const mPct = (modelData.probabilities.malignant * 100).toFixed(0);

  return (
    <div className={`p-4 rounded-2xl border-2 ${meta.border} ${meta.bg} transition-all`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: meta.color }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-bold ${meta.text}`}>{meta.label}</p>
            {meta.dominant && (
              <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">
                DOMINAN
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Input {meta.input} &middot; Bobot {meta.weightPct}
          </p>
        </div>
      </div>

      {/* Prediction */}
      <div className={`flex items-center gap-2 p-2.5 rounded-xl mb-3 ${
        isMalignant ? "bg-red-50 border border-red-100" : "bg-green-50 border border-green-100"
      }`}>
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isMalignant ? "bg-red-500" : "bg-green-500"}`} />
        <span className={`font-bold text-sm ${isMalignant ? "text-red-700" : "text-green-700"}`}>
          {isMalignant ? "Malignant" : "Benign"}
        </span>
        <span className={`ml-auto text-xs font-bold ${isMalignant ? "text-red-600" : "text-green-600"}`}>
          {conf}%
        </span>
      </div>

      {/* Mini split bar */}
      <div className="flex h-2 rounded-full overflow-hidden">
        <div className="h-2 bg-green-400 transition-all duration-500" style={{ width: `${bPct}%` }} />
        <div className="h-2 bg-red-400 transition-all duration-500" style={{ width: `${mPct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>B: {bPct}%</span>
        <span>M: {mPct}%</span>
      </div>

      {/* Weight bar */}
      <div className="mt-3 pt-2 border-t border-gray-100/60">
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-gray-400 flex-shrink-0">Bobot ensemble</p>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${meta.weight * 100}%`, backgroundColor: meta.color }}
            />
          </div>
          <span className="text-[10px] font-bold flex-shrink-0" style={{ color: meta.color }}>
            {meta.weightPct}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MelanomaPage() {
  const [serverStatus, setServerStatus] = useState("checking");
  const [serverInfo, setServerInfo]     = useState(null);

  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
        url: s.url.replace(/^https?:\/\/[^/]+/, "/api/rispro/9006"),
      })));
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
    } finally {
      setLoadingSample(null);
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    } catch (err) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOnline   = serverStatus === "online";
  const canPredict = isOnline && (!!imageFile || !!imagePreview) && !isProcessing;
  const ensemble   = result?.ensemble;
  const isMalignant = ensemble?.prediction === "malignant";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-16 w-80 h-80 bg-rose-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-72 bg-red-600 rounded-full blur-3xl" />
          <div className="absolute top-20 right-32 w-48 h-48 bg-blue-600 rounded-full blur-2xl" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">


            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Melanoma
              <span className="block bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">
                Skin Lesion Classifier
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Klasifikasi lesi kulit menjadi <strong className="text-green-400">Benign (jinak)</strong> atau{" "}
              <strong className="text-red-400">Malignant (ganas)</strong> menggunakan
              ensemble <strong className="text-white">4 arsitektur deep learning</strong>.
            </p>

            {/* Model chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {SUB_MODELS.map((m) => (
                <span
                  key={m.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-slate-200 font-medium"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.icon}
                  </span>
                  {m.label}
                  <span className="text-slate-400 font-mono text-[9px]">{m.weightPct}</span>
                </span>
              ))}
            </div>

            {/* Ensemble formula */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-full text-xs text-slate-300 font-mono">
              final = 0.4706&times;DenseNet + 0.0893&times;InceptionV3 + 0.2850&times;Xception + 0.1551&times;ViT
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps Banner ── */}
      <section className="bg-rose-700 py-3.5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            {["Upload foto lesi kulit", "Klik Klasifikasi", "Lihat hasil ensemble", "Analisis 4 sub-model"].map((step, i) => (
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

            {/* ── Left: Input (2/5) ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Upload Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Upload Gambar Lesi
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Upload gambar lesi kulit (dermatoscopy atau foto klinis). Ensemble 4 model akan menganalisis secara bersamaan.
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
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                isSelected ? "border-rose-500 ring-2 ring-rose-300" : "border-transparent hover:border-rose-400"
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

                {/* Classify Button */}
                <button
                  id="classify-btn"
                  onClick={handlePredict}
                  disabled={!canPredict}
                  className={`w-full mt-6 py-5 px-6 text-base font-bold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                    canPredict
                      ? "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg hover:shadow-rose-500/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Menganalisis 4 model... (~4 detik)
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Klasifikasi Lesi Kulit
                    </>
                  )}
                </button>

                {(!imageFile || !isOnline) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!imageFile && (
                      <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100">
                        Upload gambar terlebih dahulu
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

              {/* Info Card */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">Dua Kelas Output</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border-2 border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-sm">Benign (Jinak)</p>
                      <p className="text-xs text-green-600 leading-relaxed mt-0.5">Lesi jinak &mdash; umumnya tidak berbahaya dan tidak memerlukan tindakan segera</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-red-800 text-sm">Malignant (Ganas)</p>
                      <p className="text-xs text-red-600 leading-relaxed mt-0.5">Lesi ganas &mdash; potensi melanoma, segera konsultasi dokter kulit</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed text-center">
                  Hasil ini bukan diagnosis medis. Selalu konsultasikan dengan dokter.
                </p>
              </div>
            </div>

            {/* ── Right: Results (3/5) ── */}
            <div className="lg:col-span-3" ref={resultRef}>
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Hasil Ensemble
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
                  <div>
                    <div className="flex items-center justify-center h-48 bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border-2 border-dashed border-rose-300 mb-6">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-rose-400 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <p className="text-rose-800 font-bold text-base mb-1">Menganalisis dengan 4 model...</p>
                        <p className="text-rose-400 text-sm">DenseNet-121 + InceptionV3 + Xception + ViT</p>
                        <p className="text-rose-400 text-xs mt-1">~4 detik</p>
                      </div>
                    </div>
                    {/* Loading sub-model indicators */}
                    <div className="grid grid-cols-4 gap-2">
                      {SUB_MODELS.map((m) => (
                        <div key={m.key} className={`p-2 rounded-xl text-center ${m.bg} ${m.border} border animate-pulse`}>
                          <div className="w-7 h-7 rounded-lg mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: m.color }}>{m.icon}</div>
                          <p className={`text-[10px] font-semibold ${m.text} truncate`}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && !isProcessing && ensemble && (
                  <div className="space-y-6">

                    {/* ── Ensemble Final Card ── */}
                    <div
                      className={`relative overflow-hidden rounded-2xl p-6 border-2 text-center ${
                        isMalignant
                          ? "border-red-300 bg-gradient-to-br from-red-50 to-rose-50"
                          : "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
                      }`}
                    >
                      <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-15 blur-3xl"
                        style={{ backgroundColor: isMalignant ? "#ef4444" : "#22c55e" }}
                      />
                      <div className="relative">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                          Hasil Ensemble &mdash; Weighted Average
                        </p>
                        {/* Big prediction label */}
                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-3 ${
                          isMalignant ? "bg-red-100 border-2 border-red-200" : "bg-green-100 border-2 border-green-200"
                        }`}>
                          <div className={`w-4 h-4 rounded-full ${isMalignant ? "bg-red-500" : "bg-green-500"}`} />
                          <span className={`text-3xl font-extrabold ${isMalignant ? "text-red-700" : "text-green-700"}`}>
                            {isMalignant ? "Malignant" : "Benign"}
                          </span>
                        </div>
                        <p className={`text-sm font-medium mb-1 ${isMalignant ? "text-red-600" : "text-green-600"}`}>
                          {isMalignant ? "Lesi Ganas &mdash; Potensi Melanoma" : "Lesi Jinak &mdash; Umumnya Tidak Berbahaya"}
                        </p>

                        {/* Confidence */}
                        <p className="text-xs text-gray-400 mb-4">
                          Confidence: <strong className={isMalignant ? "text-red-600" : "text-green-600"}>
                            {(ensemble.confidence * 100).toFixed(1)}%
                          </strong>
                        </p>

                        {/* Benign vs Malignant split bar */}
                        <SplitBar
                          benign={ensemble.probabilities.benign}
                          malignant={ensemble.probabilities.malignant}
                        />
                      </div>
                    </div>

                    {/* ── 4 Sub-model Cards ── */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Prediksi Individual &mdash; 4 Sub-Model
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {SUB_MODELS.map((m) => (
                          <SubModelCard
                            key={m.key}
                            modelKey={m.key}
                            modelData={result.models?.[m.key]}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span><strong>File:</strong> {result.filename}</span>
                        <span><strong>Inference:</strong> {result.inference_time_ms?.toFixed(0)} ms</span>
                      </div>
                      <div>
                        <strong>Ensemble:</strong> Weighted Average &middot;
                        <strong> Bobot dioptimasi:</strong> Bayesian Optimization (Optuna TPE)
                      </div>
                    </div>

                    {/* Medical disclaimer */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-700 font-semibold flex items-center gap-2 mb-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Perhatian
                      </p>
                      <p className="text-xs text-amber-600 leading-relaxed">
                        Hasil ini adalah prediksi model AI dan <strong>bukan diagnosis medis</strong>.
                        Selalu konsultasikan dengan dokter spesialis kulit untuk diagnosis yang akurat.
                      </p>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!result && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-gray-50 to-rose-50/20 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-semibold text-sm mb-1">Siap Mengklasifikasi</p>
                      <p className="text-gray-400 text-xs">Upload gambar lesi kulit dan klik tombol klasifikasi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Ensemble Architecture Section ── */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Arsitektur Ensemble</h2>
                <p className="text-gray-400 text-sm">
                  4 sub-model digabung dengan weighted average &mdash; bobot dioptimasi via Bayesian Optimization (Optuna TPE)
                </p>
              </div>
            </div>

            {/* Ensemble formula visual */}
            <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto">
              <p className="text-xs font-semibold text-slate-500 mb-3">Weighted Average Formula</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-700">final_prob =</span>
                {SUB_MODELS.map((m, i) => (
                  <span key={m.key} className="flex items-center gap-1">
                    {i > 0 && <span className="text-gray-400 font-bold">+</span>}
                    <span className="font-mono text-xs font-bold" style={{ color: m.color }}>
                      {m.weight}
                    </span>
                    <span className="text-gray-400 text-xs">&times;</span>
                    <span
                      className="px-2 py-0.5 rounded text-white text-xs font-bold"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Sub-model table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {["Model", "Input Size", "Bobot Ensemble", "Peran", "Model File"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { ...MODEL_MAP.densenet121,   role: "Dominan (47%)", file: "best_densenet.pth",   size: "88 MB" },
                    { ...MODEL_MAP.inception_v3,  role: "Pendukung",     file: "best_inception.pth",  size: "86 MB" },
                    { ...MODEL_MAP.xception,      role: "Sekunder",      file: "best_xception.pth",   size: "83 MB" },
                    { ...MODEL_MAP.vit_scratch,   role: "Transformer",   file: "best_vit.pth",        size: "30 MB" },
                  ].map((m) => (
                    <tr key={m.key} className={`hover:bg-gray-50 transition-colors ${m.dominant ? m.bg : ""}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: m.color }}
                          >
                            {m.icon}
                          </div>
                          <span className="font-bold text-gray-800">{m.label}</span>
                          {m.dominant && (
                            <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">
                              DOMINAN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-600">{m.input}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${m.weight * 100}%`, backgroundColor: m.color }}
                            />
                          </div>
                          <span className="font-mono font-bold text-sm" style={{ color: m.color }}>
                            {m.weightPct}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{m.role}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{m.file}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700 font-semibold mb-1">Ensemble File</p>
              <p className="text-xs text-blue-600 font-mono">ensemble_best.pth &mdash; 284 MB (berisi 4 sub-model dalam satu file)</p>
              <p className="text-xs text-blue-500 mt-1">Bobot dioptimasi menggunakan Bayesian Optimization via Optuna (TPE sampler)</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
