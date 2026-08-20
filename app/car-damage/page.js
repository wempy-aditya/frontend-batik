"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "/api/rispro/9003";

const DAMAGE_CLASSES = [
  { id: 0, name: "dent",         label: "Penyok",      color: "#ef4444" },
  { id: 1, name: "scratch",      label: "Goresan",     color: "#f97316" },
  { id: 2, name: "crack",        label: "Retak",       color: "#eab308" },
  { id: 3, name: "glass_shatter",label: "Kaca Pecah",  color: "#22c55e" },
  { id: 4, name: "lamp_broken",  label: "Lampu Pecah", color: "#3b82f6" },
  { id: 5, name: "tire_flat",    label: "Ban Kempes",  color: "#8b5cf6" },
];

const COLOR_MAP = Object.fromEntries(DAMAGE_CLASSES.map((c) => [c.name, c.color]));
const CLASS_MAP = Object.fromEntries(DAMAGE_CLASSES.map((c) => [c.name, c]));

const CONF_PRESETS = [
  { label: "Default",        conf: 0.25, iou: 0.45, desc: "Seimbang precision/recall" },
  { label: "High Recall",    conf: 0.15, iou: 0.40, desc: "Catch all — banyak false positive" },
  { label: "High Precision", conf: 0.45, iou: 0.50, desc: "Hanya deteksi yang yakin" },
  { label: "Survey/Mobile",  conf: 0.20, iou: 0.35, desc: "Gambar kualitas rendah" },
];

// ─── DropZone ─────────────────────────────────────────────────────────────────
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
          ? "border-red-500 bg-red-50"
          : file
          ? "border-green-400 bg-green-50/30"
          : "border-gray-300 hover:border-red-400 bg-gray-50 hover:bg-red-50/20 cursor-pointer"
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
            alt="Preview"
            className="w-full max-h-80 object-contain bg-gray-100 rounded-2xl"
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
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1 text-base">Upload Foto Mobil</p>
          <p className="text-sm text-gray-400">Drag &amp; drop atau klik untuk browse</p>
          <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP &mdash; max 10MB</p>
        </div>
      )}
    </div>
  );
}

// ─── Confidence Bar ────────────────────────────────────────────────────────────
function ConfBar({ value, color }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-9 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Canvas Drawing ────────────────────────────────────────────────────────────
function drawDetections(canvas, image, detections, imgSize) {
  const ctx = canvas.getContext("2d");
  const [origW, origH] = imgSize;

  canvas.width = origW;
  canvas.height = origH;
  ctx.drawImage(image, 0, 0, origW, origH);

  const lineW = Math.max(2, Math.round(origW / 400));
  const fontSize = Math.max(13, Math.round(origW / 80));

  for (const det of detections) {
    const { x1, y1, x2, y2 } = det.bbox;
    const color = COLOR_MAP[det.class_name] || "#ef4444";
    const conf = Math.round(det.confidence * 100);
    const label = `${det.class_name} ${conf}%`;

    // Bounding box
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.shadowBlur = 0;

    // Label
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    const textW = ctx.measureText(label).width;
    const lblH = fontSize + 10;
    const lblY = y1 - lblH < 0 ? y1 + 2 : y1 - lblH;

    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x1 - 1, lblY, textW + 14, lblH, 4);
    } else {
      ctx.rect(x1 - 1, lblY, textW + 14, lblH);
    }
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x1 + 6, lblY + lblH - 6);
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CarDamagePage() {
  const [serverStatus, setServerStatus] = useState("checking");
  const [serverInfo, setServerInfo]     = useState(null);

  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [conf, setConf]                 = useState(0.25);
  const [iou, setIou]                   = useState(0.45);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");

  const [samples, setSamples]           = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  const canvasRef         = useRef(null);
  const resultSectionRef  = useRef(null);

  useEffect(() => { checkHealth(); fetchSamples(); }, []);

  async function fetchSamples() {
    setSamplesLoading(true);
    try {
      const res  = await fetch(`${API_URL}/samples`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      // Normalisasi url absolut service → relatif lewat proxy Next (biar same-origin)
      setSamples((data.samples || []).map(s => ({
        ...s,
        url: s.url.replace(/^https?:\/\/[^/]+/, "/api/rispro/9003"),
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
        // Preview is shown, file will be fetched on predict
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

  const applyPreset = (preset) => {
    setConf(preset.conf);
    setIou(preset.iou);
  };

  const handleDetect = async () => {
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
        setImageFile(fileToSend);
      }

      const formData = new FormData();
      formData.append("file", fileToSend);

      const res = await fetch(`${API_URL}/detect?conf=${conf}&iou=${iou}`, {
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
        if (canvasRef.current) {
          const img = new Image();
          img.onload = () => drawDetections(canvasRef.current, img, data.detections, data.image_size);
          img.src = imagePreview;
        }
        resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch (err) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `car-damage-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const isOnline  = serverStatus === "online";
  const canDetect = isOnline && (!!imageFile || !!imagePreview) && !isProcessing;
  const activePreset = CONF_PRESETS.find((p) => p.conf === conf && p.iou === iou);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">


            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Car Damage
              <span className="block bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Detection
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Deteksi <strong className="text-white">6 jenis kerusakan mobil</strong> secara otomatis
              menggunakan YOLOv12n. Upload foto, atur threshold, dan lihat hasilnya secara real-time.
            </p>

            {/* Class chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {DAMAGE_CLASSES.map((cls) => (
                <span
                  key={cls.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-gray-200 font-medium"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                  {cls.label}
                  <span className="text-gray-400 font-mono text-[10px]">({cls.name})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps Banner ── */}
      <section className="bg-red-600 py-3.5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            {["Upload foto mobil", "Atur confidence & IoU", "Klik Deteksi", "Lihat hasil bounding box"].map((step, i) => (
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

            {/* ── Left: Inputs (3/5) ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Upload Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Upload Foto Mobil
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Upload gambar mobil yang ingin dianalisis. Satu gambar bisa mendeteksi beberapa kerusakan sekaligus.
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
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-red-400 transition-all"
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
              </div>

              {/* Parameters Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Parameter Deteksi
                  </h2>
                  <button
                    onClick={() => applyPreset(CONF_PRESETS[0])}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {/* Presets */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Quick Preset:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CONF_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyPreset(p)}
                        title={p.desc}
                        className={`text-xs px-3 py-2 rounded-xl border-2 transition-all font-semibold text-center ${
                          conf === p.conf && iou === p.iou
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {activePreset && (
                    <p className="text-xs text-gray-400 mt-2">{activePreset.desc}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">Confidence Threshold</label>
                      <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">{conf.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0.01" max="1.0" step="0.01"
                      value={conf}
                      onChange={(e) => setConf(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Sensitif (0.01)</span>
                      <span>Ketat (1.0)</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                      {[
                        { range: "0.1–0.2", color: "text-blue-500",  note: "Banyak false positive" },
                        { range: "0.25",    color: "text-green-500", note: "Recommended (default)" },
                        { range: "0.4–0.5", color: "text-orange-500",note: "Hanya yang yakin"      },
                      ].map((r) => (
                        <div key={r.range} className="flex justify-between">
                          <span className={`font-mono font-bold ${r.color}`}>{r.range}</span>
                          <span>{r.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* IoU */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">IoU NMS Threshold</label>
                      <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">{iou.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0.01" max="1.0" step="0.01"
                      value={iou}
                      onChange={(e) => setIou(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Agresif (0.01)</span>
                      <span>Lembut (1.0)</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                      {[
                        { range: "0.3–0.4", color: "text-blue-500",   note: "Kurangi box overlap"   },
                        { range: "0.45",    color: "text-green-500",  note: "Standard (default)"    },
                        { range: "0.6–0.7", color: "text-orange-500", note: "Izinkan overlapping"   },
                      ].map((r) => (
                        <div key={r.range} className="flex justify-between">
                          <span className={`font-mono font-bold ${r.color}`}>{r.range}</span>
                          <span>{r.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detect Button */}
                <button
                  id="detect-btn"
                  onClick={handleDetect}
                  disabled={!canDetect}
                  className={`w-full mt-8 py-5 px-6 text-lg font-bold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                    canDetect
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg hover:shadow-red-500/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Mendeteksi kerusakan...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Deteksi Kerusakan
                    </>
                  )}
                </button>

                {(!imageFile || !isOnline) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!imageFile && (
                      <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">
                        Upload foto terlebih dahulu
                      </span>
                    )}
                    {!isOnline && (
                      <span className="text-xs bg-orange-50 text-orange-500 px-3 py-1 rounded-full border border-orange-100">
                        Server belum terkoneksi
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Result Panel (2/5) ── */}
            <div className="lg:col-span-2">
              <div ref={resultSectionRef} className="bg-white rounded-3xl shadow-xl p-8 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Hasil Deteksi
                </h2>

                {/* Error */}
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Deteksi Gagal
                    </p>
                    <p className="text-red-600 text-xs break-words">{error}</p>
                  </div>
                )}

                {/* Processing */}
                {isProcessing && (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-dashed border-red-300 mb-4">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-red-400 animate-spin mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-red-700 font-bold text-base mb-1">Mendeteksi kerusakan...</p>
                      <p className="text-red-400 text-sm">Inference ~250ms</p>
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && !isProcessing && (
                  <div className="space-y-4">
                    {/* Canvas */}
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <canvas ref={canvasRef} className="w-full h-auto" />
                    </div>

                    {/* Summary */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${
                      result.num_detections === 0
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div>
                        <p className={`text-sm font-bold ${result.num_detections === 0 ? "text-green-700" : "text-red-700"}`}>
                          {result.num_detections === 0
                            ? "Tidak ada kerusakan terdeteksi"
                            : `${result.num_detections} kerusakan ditemukan`}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{result.filename}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Inference</p>
                        <p className="text-sm font-bold text-gray-600">{result.inference_time_ms?.toFixed(1)} ms</p>
                      </div>
                    </div>

                    {/* Detection list */}
                    {result.detections.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Detail Deteksi ({result.num_detections})
                        </p>
                        {result.detections.map((det, idx) => {
                          const cls = CLASS_MAP[det.class_name] || {};
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 rounded-xl border-l-4 bg-gray-50"
                              style={{ borderLeftColor: cls.color || "#ef4444" }}
                            >
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: cls.color || "#ef4444" }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-gray-800 capitalize">{det.class_name}</span>
                                  <span className="text-xs text-gray-400">{cls.label || ""}</span>
                                </div>
                                <ConfBar value={det.confidence} color={cls.color || "#ef4444"} />
                                <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                  [{det.bbox.x1}, {det.bbox.y1}, {det.bbox.x2}, {det.bbox.y2}]
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Download */}
                    <button
                      id="download-btn"
                      onClick={downloadCanvas}
                      className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Hasil
                    </button>

                    {/* Params used */}
                    <div className="text-xs text-gray-400 p-3 bg-gray-50 rounded-xl space-y-1">
                      <div><strong>conf:</strong> {conf.toFixed(2)} &nbsp;&middot;&nbsp; <strong>iou:</strong> {iou.toFixed(2)}</div>
                      <div><strong>Image:</strong> {result.image_size?.[0]} &times; {result.image_size?.[1]} px</div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!result && !isProcessing && !error && (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-red-50/30 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-center px-4">
                      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-semibold text-sm mb-1">Siap Mendeteksi</p>
                      <p className="text-gray-400 text-xs">Upload foto dan klik tombol deteksi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── Info Section ── */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">

            {/* Color Legend */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Kelas Kerusakan yang Dideteksi</h2>
              <div className="space-y-3">
                {DAMAGE_CLASSES.map((cls) => (
                  <div key={cls.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: cls.color }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-sm">{cls.label}</span>
                        <span className="font-mono text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">{cls.name}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">ID: {cls.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Threshold Guide */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Panduan Threshold</h2>

              <p className="text-sm font-semibold text-gray-700 mb-3">Confidence (conf)</p>
              <div className="space-y-2 mb-6">
                {[
                  { range: "0.10–0.20", label: "High Recall",    desc: "Banyak deteksi, banyak false positive", color: "text-blue-600"   },
                  { range: "0.25",      label: "Default",        desc: "Seimbang — direkomendasikan",           color: "text-green-600"  },
                  { range: "0.40–0.50", label: "High Precision", desc: "Hanya deteksi yang sangat yakin",       color: "text-orange-600" },
                  { range: "0.70+",     label: "Strict",         desc: "Hampir tanpa false positive",           color: "text-red-600"    },
                ].map((row) => (
                  <div key={row.range} className="flex items-start gap-3 text-xs bg-gray-50 rounded-lg p-2">
                    <span className={`font-mono font-bold w-20 flex-shrink-0 ${row.color}`}>{row.range}</span>
                    <span className="font-semibold text-gray-600 w-28 flex-shrink-0">{row.label}</span>
                    <span className="text-gray-400">{row.desc}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm font-semibold text-gray-700 mb-3">IoU (iou)</p>
              <div className="space-y-2 mb-6">
                {[
                  { range: "0.30–0.40", label: "Agresif",  desc: "Kurangi box yang tumpang tindih",  color: "text-blue-600"   },
                  { range: "0.45",      label: "Default",  desc: "Standard — direkomendasikan",      color: "text-green-600"  },
                  { range: "0.60–0.70", label: "Lembut",   desc: "Izinkan banyak overlapping box",   color: "text-orange-600" },
                ].map((row) => (
                  <div key={row.range} className="flex items-start gap-3 text-xs bg-gray-50 rounded-lg p-2">
                    <span className={`font-mono font-bold w-20 flex-shrink-0 ${row.color}`}>{row.range}</span>
                    <span className="font-semibold text-gray-600 w-28 flex-shrink-0">{row.label}</span>
                    <span className="text-gray-400">{row.desc}</span>
                  </div>
                ))}
              </div>

              {/* Preset combinations */}
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-semibold text-red-700 mb-3">Skenario Kombinasi</p>
                <div className="space-y-2">
                  {CONF_PRESETS.map((p) => (
                    <div key={p.label} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{p.label}</span>
                      <div className="flex gap-3 text-gray-500">
                        <span>conf: <strong className="text-red-600">{p.conf}</strong></span>
                        <span>iou: <strong className="text-orange-600">{p.iou}</strong></span>
                      </div>
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
