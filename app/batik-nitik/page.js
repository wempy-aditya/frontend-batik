"use client";
import { useState, useEffect } from "react";

const API_URL = "/api/rispro/9004";

const LORA_VARIANTS = [
  {
    id: "replication",
    name: "Replication",
    shortName: "Replication",
    badge: "Baseline",
    badgeColor: "bg-gray-200 text-gray-600",
    clip: "0.3310",
    fid: "170.33",
    best: "",
    desc: "Cukup tulis nama motif. Paling sederhana & cepat.",
    promptHint: "Batik Nitik Cinde Wilis",
    color: "#6b7280",
    border: "border-gray-300",
    bg: "bg-gray-50",
  },
  {
    id: "generic",
    name: "Generic",
    shortName: "Generic",
    badge: "FID Terbaik",
    badgeColor: "bg-blue-100 text-blue-700",
    clip: "0.3218",
    fid: "121.81",
    best: "fid",
    desc: "Prompt umum & sederhana. FID terendah — paling mirip dataset asli.",
    promptHint: "Traditional Batik Nitik motif with geometric patterns.",
    color: "#3b82f6",
    border: "border-blue-300",
    bg: "bg-blue-50",
  },
  {
    id: "descriptive",
    name: "Descriptive",
    shortName: "Descriptive",
    badge: "Detail Visual",
    badgeColor: "bg-purple-100 text-purple-700",
    clip: "0.3259",
    fid: "130.28",
    best: "",
    desc: "Prompt deskriptif & kaya detail visual. Hasil lebih ekspresif.",
    promptHint: "Traditional Batik Nitik motif featuring symmetrical geometric ornaments with dotted textures and floral decorations.",
    color: "#8b5cf6",
    border: "border-purple-300",
    bg: "bg-purple-50",
  },
  {
    id: "cot",
    name: "CoT (Chain-of-Thought)",
    shortName: "CoT",
    badge: "CLIP Tertinggi",
    badgeColor: "bg-amber-100 text-amber-700",
    clip: "0.3448",
    fid: "169.46",
    best: "clip",
    desc: "Prompt bercerita/bertahap. CLIP score tertinggi — paling relevan dengan prompt.",
    promptHint: "Batik Nitik motifs are characterized by repeating geometric patterns and dotted textures. The ornaments are arranged symmetrically, creating a balanced composition. Floral decorative elements enhance the traditional appearance. This is a Batik Nitik Cinde Wilis motif.",
    color: "#f59e0b",
    border: "border-amber-300",
    bg: "bg-amber-50",
  },
];

const LORA_MAP = Object.fromEntries(LORA_VARIANTS.map((v) => [v.id, v]));

const EXAMPLE_PROMPTS = [
  { label: "Cinde Wilis",    text: "Batik Nitik Cinde Wilis" },
  { label: "Cakar Ayam",    text: "Batik Nitik Cakar Ayam dengan pola geometris tradisional" },
  { label: "Arumdalu",      text: "Batik Nitik Arumdalu dengan nuansa floral dan motif nitik khas" },
  { label: "Sekar Jagad",   text: "Batik Nitik Sekar Jagad dengan pola bunga dan garis ornamen" },
  { label: "English Desc",  text: "Traditional Batik Nitik motif featuring symmetrical geometric ornaments with dotted textures and floral decorations." },
  { label: "CoT Style",     text: "Batik Nitik motifs are characterized by repeating geometric patterns and dotted textures. The ornaments are arranged symmetrically, creating a balanced composition. This is a Batik Nitik Cinde Wilis motif." },
];

export default function BatikNitikPage() {
  // Server state
  const [serverStatus, setServerStatus]   = useState("checking");
  const [serverInfo, setServerInfo]       = useState(null);

  // Form state
  const [prompt, setPrompt]               = useState("Batik Nitik Cinde Wilis");
  const [lora, setLora]                   = useState("replication");
  const [cfg, setCfg]                     = useState(7.0);
  const [steps, setSteps]                 = useState(30);
  const [seed, setSeed]                   = useState("");

  // Result state
  const [isGenerating, setIsGenerating]   = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState("");
  const [progress, setProgress]           = useState(0);

  const selectedLora = LORA_MAP[lora] || LORA_VARIANTS[0];

  useEffect(() => { checkHealth(); }, []);

  // Fake progress bar while generating (no real stream from API)
  useEffect(() => {
    if (!isGenerating) { setProgress(0); return; }
    setProgress(5);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 88) { clearInterval(interval); return 88; }
        return p + Math.random() * 4;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isGenerating]);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      const body = {
        prompt: prompt.trim(),
        lora,
        cfg,
        steps,
        seed: seed !== "" ? parseInt(seed) : null,
      };

      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setProgress(100);
      setTimeout(() => setResult(data), 200);

    } catch (err) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result?.image_b64) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${result.image_b64}`;
    link.download = `batik-nitik-${result.lora}-${result.seed}.png`;
    link.click();
  };

  const isOnline   = serverStatus === "online";
  const canGenerate = isOnline && !!prompt.trim() && !isGenerating;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 overflow-hidden">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-72 bg-orange-500 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">

            {/* Server status */}
            <div className="flex justify-center mb-6">
              {serverStatus === "checking" && (
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-700/60 text-stone-300 text-sm font-medium">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Mengecek server...
                </span>
              )}
              {serverStatus === "online" && (
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/60 border border-green-500/30 text-green-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Server Online &mdash; LoRA aktif: {serverInfo?.active_lora} &mdash; {serverInfo?.device}
                </span>
              )}
              {serverStatus === "offline" && (
                <button
                  onClick={checkHealth}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/60 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-800/60 transition-colors"
                >
                  <span className="w-2 h-2 bg-red-400 rounded-full" />
                  Server Offline &mdash; Klik untuk retry
                </button>
              )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Batik Nitik
              <span className="block bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                Text-to-Image Generator
              </span>
            </h1>
            <p className="text-stone-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Generate motif <strong className="text-white">Batik Nitik</strong> dari teks menggunakan
              Stable Diffusion v1.5 yang di fine-tune dengan <strong className="text-amber-300">4 strategi caption LoRA</strong>.
            </p>

            {/* Metric chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {LORA_VARIANTS.map((v) => (
                <span
                  key={v.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-stone-200 font-medium"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                  {v.shortName}
                  {v.best === "clip" && <span className="text-amber-300 text-[9px] font-bold">CLIP&#9651;</span>}
                  {v.best === "fid"  && <span className="text-blue-300 text-[9px] font-bold">FID&#9661;</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps Banner ── */}
      <section className="bg-amber-700 py-3.5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
            {["Tulis prompt motif", "Pilih LoRA variant", "Atur CFG & Steps", "Generate & download"].map((step, i) => (
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

            {/* ── Left: Input Panel (3/5) ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Prompt Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Tulis Prompt Motif
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Deskripsikan motif batik yang ingin di-generate. Gaya prompt berbeda untuk tiap LoRA variant.
                </p>

                {/* Example prompt pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => setPrompt(ex.text)}
                      className="text-xs px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>

                <textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="Contoh: Batik Nitik Cinde Wilis dengan ornamen geometris dan pola nitik khas Yogyakarta"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-300 text-sm leading-relaxed transition-colors"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    Tip: Sesuaikan gaya prompt dengan LoRA yang dipilih
                  </p>
                  <p className="text-xs text-gray-300 font-mono">{prompt.length} karakter</p>
                </div>

                {/* Hint from selected LoRA */}
                {selectedLora.promptHint && (
                  <button
                    onClick={() => setPrompt(selectedLora.promptHint)}
                    className="mt-3 w-full text-left p-3 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors"
                  >
                    <p className="text-xs font-semibold text-amber-700 mb-1">Contoh prompt untuk {selectedLora.shortName}:</p>
                    <p className="text-xs text-amber-600 italic leading-relaxed line-clamp-2">&ldquo;{selectedLora.promptHint}&rdquo;</p>
                    <p className="text-xs text-amber-400 mt-1">Klik untuk gunakan</p>
                  </button>
                )}
              </div>

              {/* LoRA Variant Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Pilih LoRA Variant
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Tiap variant dilatih dengan strategi caption berbeda, mempengaruhi kualitas CLIP dan FID.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {LORA_VARIANTS.map((v) => (
                    <label
                      key={v.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        lora === v.id
                          ? `${v.border} ${v.bg}`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="lora"
                        value={v.id}
                        checked={lora === v.id}
                        onChange={() => setLora(v.id)}
                        className="mt-0.5 accent-amber-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: v.color }}
                          />
                          <span className="text-sm font-bold text-gray-800">{v.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${v.badgeColor}`}>
                            {v.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-2">{v.desc}</p>
                        <div className="flex gap-3 text-xs">
                          <span className={`font-mono font-bold ${v.best === "clip" ? "text-amber-600" : "text-gray-400"}`}>
                            CLIP: {v.clip}
                          </span>
                          <span className={`font-mono font-bold ${v.best === "fid" ? "text-blue-600" : "text-gray-400"}`}>
                            FID: {v.fid}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Parameters Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Parameter Generate
                  </h2>
                  <button
                    onClick={() => { setCfg(7.0); setSteps(30); setSeed(""); }}
                    className="text-sm text-gray-400 hover:text-amber-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  {/* CFG Scale */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">CFG Scale</label>
                      <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{cfg.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="1" max="20" step="0.5"
                      value={cfg}
                      onChange={(e) => setCfg(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Kreatif (1)</span>
                      <span>Ketat (20)</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-blue-500 font-mono">3&ndash;6</span><span>Lebih bebas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500 font-mono">7&ndash;9</span><span>Ideal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-500 font-mono">12+</span><span>Warna jenuh</span>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">Steps</label>
                      <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{steps}</span>
                    </div>
                    <input
                      type="range" min="10" max="100" step="5"
                      value={steps}
                      onChange={(e) => setSteps(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Cepat (10)</span>
                      <span>Detail (100)</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-green-500 font-mono">20&ndash;30</span><span>Cepat &amp; OK</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-500 font-mono">40&ndash;50</span><span>Lebih halus</span>
                      </div>
                    </div>
                  </div>

                  {/* Seed */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seed
                      <span className="text-xs font-normal text-gray-400 ml-1">(kosong = random)</span>
                    </label>
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="Random"
                      min="0"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-sm text-gray-700 placeholder-gray-300"
                    />
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Set angka fixed untuk hasil yang sama persis saat prompt sama
                    </p>
                    {seed === "" && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[42, 123, 999, 2025].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSeed(String(s))}
                            className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors font-mono"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  id="generate-btn"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={`w-full mt-8 py-5 px-6 text-lg font-bold rounded-2xl transition-all duration-300 transform flex items-center justify-center gap-3 ${
                    canGenerate
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-[1.02] hover:shadow-2xl shadow-lg hover:shadow-amber-500/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generating batik... (~4&ndash;5 detik)
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Generate Batik Nitik
                    </>
                  )}
                </button>

                {(!prompt.trim() || !isOnline) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!prompt.trim() && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
                        Isi prompt terlebih dahulu
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
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Hasil Generate
                </h2>

                {/* Error */}
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Generate Gagal
                    </p>
                    <p className="text-red-600 text-xs break-words">{error}</p>
                  </div>
                )}

                {/* Progress bar while generating */}
                {isGenerating && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-amber-700">Generating motif batik...</p>
                      <p className="text-xs text-amber-500 font-mono">{Math.round(progress)}%</p>
                    </div>
                    <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      LoRA: <strong>{lora}</strong> &middot; CFG: <strong>{cfg}</strong> &middot; Steps: <strong>{steps}</strong>
                    </p>
                    {/* Animated preview placeholder */}
                    <div className="mt-4 h-64 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-amber-700 font-semibold text-sm">Menggambar motif...</p>
                        <p className="text-amber-400 text-xs mt-1">Stable Diffusion v1.5 + LoRA</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Image */}
                {result && !isGenerating && (
                  <div className="space-y-4">
                    {/* Image */}
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                      <img
                        src={`data:image/png;base64,${result.image_b64}`}
                        alt="Generated Batik Nitik"
                        className="w-full h-auto"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>

                    {/* Metadata */}
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-amber-700 mb-2">Info Generate</p>
                      <div className="text-xs text-gray-600 space-y-1.5">
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-16 flex-shrink-0">Prompt:</span>
                          <span className="font-medium italic leading-relaxed">&ldquo;{result.prompt}&rdquo;</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-16 flex-shrink-0">LoRA:</span>
                          <span
                            className="font-bold"
                            style={{ color: LORA_MAP[result.lora]?.color || "#f59e0b" }}
                          >
                            {result.lora}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-16 flex-shrink-0">Params:</span>
                          <span className="font-mono">CFG {result.cfg} &middot; Steps {result.steps} &middot; Seed {result.seed}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-16 flex-shrink-0">Output:</span>
                          <span className="font-mono">{result.width}&times;{result.height} px &middot; {(result.inference_time_ms / 1000).toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        id="download-btn"
                        onClick={handleDownload}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PNG
                      </button>
                      <button
                        onClick={() => { setSeed(String(result.seed)); }}
                        className="px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 font-semibold rounded-xl hover:bg-amber-100 transition-colors text-sm"
                        title="Gunakan seed ini untuk reproduce hasil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!result && !isGenerating && !error && (
                  <div className="flex items-center justify-center h-72 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border-2 border-dashed border-amber-200">
                    <div className="text-center px-6">
                      <div
                        className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center opacity-30"
                        style={{
                          backgroundImage: "radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)",
                          backgroundSize: "8px 8px",
                          backgroundColor: "#fef3c7",
                        }}
                      />
                      <p className="text-gray-600 font-semibold text-sm mb-1">Siap Generate</p>
                      <p className="text-gray-400 text-xs">Tulis prompt, pilih LoRA, lalu klik Generate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── LoRA Comparison Table ── */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Perbandingan LoRA Variant</h2>
                <p className="text-gray-400 text-sm">CLIP &uarr; = lebih relevan dengan prompt &nbsp;&middot;&nbsp; FID &darr; = lebih mirip dataset asli</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 px-4 text-left text-gray-500 font-semibold">LoRA Variant</th>
                    <th className="py-3 px-4 text-center text-gray-500 font-semibold">CLIP &uarr;</th>
                    <th className="py-3 px-4 text-center text-gray-500 font-semibold">FID &darr;</th>
                    <th className="py-3 px-4 text-left text-gray-500 font-semibold">Cocok Untuk</th>
                    <th className="py-3 px-4 text-center text-gray-500 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {LORA_VARIANTS.map((v) => (
                    <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${lora === v.id ? v.bg : ""}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                          <span className="font-semibold text-gray-800">{v.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${v.badgeColor}`}>{v.badge}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-bold text-base ${v.best === "clip" ? "text-amber-600" : "text-gray-500"}`}>
                          {v.clip}
                          {v.best === "clip" && <span className="text-amber-400 text-xs ml-1">&#9650;</span>}
                        </span>
                        {v.best === "clip" && (
                          <div className="w-full h-1 bg-amber-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-1 bg-amber-500 rounded-full" style={{ width: "100%" }} />
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-bold text-base ${v.best === "fid" ? "text-blue-600" : "text-gray-500"}`}>
                          {v.fid}
                          {v.best === "fid" && <span className="text-blue-400 text-xs ml-1">&#9660;</span>}
                        </span>
                        {v.best === "fid" && (
                          <div className="w-full h-1 bg-blue-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-1 bg-blue-500 rounded-full" style={{ width: "72%" }} />
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{v.desc}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setLora(v.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                            lora === v.id
                              ? "text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700"
                          }`}
                          style={lora === v.id ? { backgroundColor: v.color } : {}}
                        >
                          {lora === v.id ? "Aktif" : "Pilih"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LoRA Prompt Guide */}
            <div className="mt-8 grid md:grid-cols-2 gap-5">
              {LORA_VARIANTS.map((v) => (
                <div key={v.id} className={`p-4 rounded-2xl border ${v.border} ${v.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="text-sm font-bold" style={{ color: v.color }}>{v.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 italic leading-relaxed border-l-2 pl-3" style={{ borderColor: v.color }}>
                    &ldquo;{v.promptHint}&rdquo;
                  </p>
                  <button
                    onClick={() => { setPrompt(v.promptHint); setLora(v.id); }}
                    className="mt-2 text-xs font-semibold hover:underline"
                    style={{ color: v.color }}
                  >
                    Gunakan prompt ini &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
