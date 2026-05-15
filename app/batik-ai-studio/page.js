"use client";
import { useMemo, useState } from "react";

const API_PROXY_BASE = "/api/batik-ai-studio";
const API_V1_PREFIX = "/api/v1";

const NEGATIVE_PROMPT = "blurry, distorted, realistic, photo, 3d";

const STEP_ORDER = [1, 2, 3, 4];
const STEPS = [
  { id: 1, title: "Stage 1", subtitle: "Generate motifs" },
  { id: 2, title: "Stage 2", subtitle: "Compose fabric" },
  { id: 3, title: "Stage 3", subtitle: "Fabric summary" },
  { id: 4, title: "Stage 4", subtitle: "Apply FLUX" },
];

const SCENARIO_OPTIONS = [
  { value: "scenario2", label: "Scenario 2", description: "Tiled patch" },
  { value: "scenario4_1", label: "Scenario 4.1", description: "Nitik 4 patch" },
];

const STYLE_OPTIONS = [
  { value: "kemeja", label: "Kemeja" },
  { value: "batik", label: "Batik" },
  { value: "casual", label: "Casual" },
];

const GENDER_OPTIONS = [
  { value: "pria", label: "Pria" },
  { value: "wanita", label: "Wanita" },
];

const SLEEVE_OPTIONS = [
  { value: "panjang", label: "Panjang" },
  { value: "pendek", label: "Pendek" },
];

const defaultFabricParams = {
  grid_rows: 10,
  grid_cols: 10,
  output_width_cm: 110,
  output_height_cm: 240,
  dpi: 150,
};

function resolveFileUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith(API_V1_PREFIX)) {
    return `${API_PROXY_BASE}${url.slice(API_V1_PREFIX.length)}`;
  }
  if (url.startsWith("/")) {
    return `${API_PROXY_BASE}${url}`;
  }
  return url;
}

function isEven(value) {
  return Number.isFinite(value) && value % 2 === 0;
}

export default function BatikAIStudioPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [scenario, setScenario] = useState("scenario4_1");
  const [numMotifs, setNumMotifs] = useState(4);

  const [sessionId, setSessionId] = useState("");
  const [generatedMotifs, setGeneratedMotifs] = useState([]);
  const [selectedMotifs, setSelectedMotifs] = useState([]);

  const [fabricParams, setFabricParams] = useState(defaultFabricParams);
  const [fabricData, setFabricData] = useState(null);

  const [style, setStyle] = useState("kemeja");
  const [gender, setGender] = useState("pria");
  const [sleeve, setSleeve] = useState("panjang");
  const [resultPrompt, setResultPrompt] = useState("");
  const [resultData, setResultData] = useState(null);

  const [isStage1Loading, setIsStage1Loading] = useState(false);
  const [isStage2Loading, setIsStage2Loading] = useState(false);
  const [isStage3Loading, setIsStage3Loading] = useState(false);

  const [previewModal, setPreviewModal] = useState({
    open: false,
    title: "",
    url: "",
  });

  const [consoleMessages, setConsoleMessages] = useState([
    {
      id: "init",
      type: "info",
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      message: "Ready to start Batik AI Studio pipeline.",
    },
  ]);

  const stepIndex = STEP_ORDER.indexOf(currentStep);

  const canComposeFabric = selectedMotifs.length === 2;
  const hasFabric = Boolean(fabricData?.id);

  const addConsoleMessage = (type, message) => {
    setConsoleMessages((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        message,
      },
      ...prev,
    ].slice(0, 25));
  };

  const openPreview = (title, url) => {
    if (!url) return;
    setPreviewModal({ open: true, title, url });
  };

  const closePreview = () => {
    setPreviewModal({ open: false, title: "", url: "" });
  };

  const apiPost = async (path, payload) => {
    const response = await fetch(`${API_PROXY_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const message = data?.error || data?.detail || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data || {};
  };

  const handleGenerateMotifs = async () => {
    if (!prompt.trim()) {
      addConsoleMessage("error", "Prompt is required before generating motifs.");
      return;
    }

    setIsStage1Loading(true);
    addConsoleMessage("info", "Stage 1: generating motif variations...");

    try {
      const data = await apiPost("/stage1/generate", {
        prompt: prompt.trim(),
        scenario,
        steps: 40,
        guidance_scale: 9.0,
        negative_prompt: NEGATIVE_PROMPT,
        num_motifs: numMotifs,
        seed: -1,
      });

      setSessionId(data?.session_id || "");
      setGeneratedMotifs(data?.motifs || []);
      setSelectedMotifs([]);
      setFabricData(null);
      setResultData(null);
      setCurrentStep(1);

      addConsoleMessage(
        "success",
        `Stage 1 complete. Generated ${data?.motifs?.length || 0} motifs.`
      );
    } catch (error) {
      addConsoleMessage("error", `Stage 1 failed: ${error.message}`);
    } finally {
      setIsStage1Loading(false);
    }
  };

  const toggleMotif = (motif) => {
    setSelectedMotifs((prev) => {
      const exists = prev.find((item) => item.id === motif.id);
      if (exists) {
        return prev.filter((item) => item.id !== motif.id);
      }
      if (prev.length >= 2) {
        addConsoleMessage("error", "Select exactly two motifs.");
        return prev;
      }
      return [...prev, motif];
    });
  };

  const handleComposeFabric = async () => {
    if (!canComposeFabric) {
      addConsoleMessage("error", "Select exactly two motifs before composing.");
      return;
    }

    if (!isEven(fabricParams.grid_rows) || !isEven(fabricParams.grid_cols)) {
      addConsoleMessage("error", "Grid rows and columns must be even numbers.");
      return;
    }

    setIsStage2Loading(true);
    addConsoleMessage("info", "Stage 2: composing fabric...");

    try {
      const data = await apiPost("/stage2/compose", {
        motif_a_id: selectedMotifs[0].id,
        motif_b_id: selectedMotifs[1].id,
        grid_rows: fabricParams.grid_rows,
        grid_cols: fabricParams.grid_cols,
        output_width_cm: fabricParams.output_width_cm,
        output_height_cm: fabricParams.output_height_cm,
        dpi: fabricParams.dpi,
        pattern: "checkerboard",
      });

      setFabricData(data);
      setResultData(null);
      setCurrentStep(3);
      addConsoleMessage("success", "Stage 2 complete. Fabric composed.");
    } catch (error) {
      addConsoleMessage("error", `Stage 2 failed: ${error.message}`);
    } finally {
      setIsStage2Loading(false);
    }
  };

  const handleApplyFlux = async () => {
    if (!fabricData?.id) {
      addConsoleMessage("error", "Compose fabric first before applying FLUX.");
      return;
    }

    setIsStage3Loading(true);
    addConsoleMessage("info", "Stage 4: applying FLUX to fabric...");

    try {
      const data = await apiPost("/stage3/apply-flux", {
        fabric_id: fabricData.id,
        prompt: resultPrompt.trim() || undefined,
        style,
        gender,
        sleeve,
        max_px: 1024,
      });

      setResultData(data);
      setCurrentStep(4);
      addConsoleMessage("success", "Stage 4 complete. Result ready.");
    } catch (error) {
      addConsoleMessage("error", `Stage 3 failed: ${error.message}`);
    } finally {
      setIsStage3Loading(false);
    }
  };

  const handleResetAll = () => {
    setCurrentStep(1);
    setPrompt("");
    setScenario("scenario4_1");
    setNumMotifs(4);
    setSessionId("");
    setGeneratedMotifs([]);
    setSelectedMotifs([]);
    setFabricParams(defaultFabricParams);
    setFabricData(null);
    setStyle("kemeja");
    setGender("pria");
    setSleeve("panjang");
    setResultPrompt("");
    setResultData(null);
    addConsoleMessage("info", "Pipeline reset to initial state.");
  };

  const stepStatus = useMemo(() => {
    return STEPS.map((step) => {
      const index = STEP_ORDER.indexOf(step.id);
      return {
        ...step,
        isActive: step.id === currentStep,
        isComplete: index !== -1 && index < stepIndex,
      };
    });
  }, [currentStep, stepIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <section className="relative py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-orange-200 mb-8">
            <button
              onClick={() => (window.location.href = "/")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <svg
              className="w-4 h-4 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-white">Batik AI Studio</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <span className="text-sm font-semibold text-gray-200">
                Batik AI Studio Pipeline
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Generate Batik From Prompt
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-300 leading-relaxed mb-8">
              Stage-by-stage workflow for motif generation, fabric composition,
              and FLUX rendering. This page follows the Batik AI Studio
              documentation flow from Stage 1 to Stage 3.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-200">
              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20">
                Select 2 motifs
              </div>
              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20">
                Checkerboard fabric
              </div>
              <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20">
                FLUX Kontext output
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900 to-transparent"></div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-100 p-6 md:p-8 mb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stepStatus.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                    step.isActive
                      ? "border-orange-400 bg-orange-50"
                      : step.isComplete
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold ${
                      step.isActive
                        ? "bg-orange-500 text-white"
                        : step.isComplete
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="mt-4 text-xs text-gray-500">
              Stage 3 (Select Garment) is skipped for FLUX-only workflow.
            </div> */}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {currentStep === 1 && (
                <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stage 1</h2>
                    <p className="text-gray-500">Generate motif variations from prompt.</p>
                  </div>
                  <div className="text-xs text-gray-400">Session: {sessionId || "-"}</div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Prompt</label>
                      <textarea
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        rows={4}
                        className="w-full mt-2 rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Describe batik motif for Stage 1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Scenario</label>
                        <select
                          value={scenario}
                          onChange={(event) => setScenario(event.target.value)}
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                          {SCENARIO_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-1 text-xs text-gray-400">
                          {SCENARIO_OPTIONS.find((option) => option.value === scenario)
                            ?.description || ""}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Variations
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={numMotifs}
                          onChange={(event) => setNumMotifs(Number(event.target.value))}
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <div className="mt-1 text-xs text-gray-400">1 - 8 motifs</div>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateMotifs}
                      disabled={isStage1Loading}
                      className="w-full mt-2 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60"
                    >
                      {isStage1Loading ? "Generating..." : "Generate Motifs"}
                    </button>

                    <div className="text-xs text-gray-400">
                      Negative prompt: {NEGATIVE_PROMPT}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">Motif Results</h3>
                      <span className="text-xs text-gray-400">
                        Selected {selectedMotifs.length} / 2
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {generatedMotifs.length === 0 && (
                        <div className="col-span-2 text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
                          Generate motifs to preview results here.
                        </div>
                      )}
                      {generatedMotifs.map((motif) => {
                        const isSelected = selectedMotifs.some((item) => item.id === motif.id);
                        return (
                          <button
                            key={motif.id}
                            type="button"
                            onClick={() => toggleMotif(motif)}
                            className={`relative rounded-xl border-2 overflow-hidden transition ${
                              isSelected
                                ? "border-orange-500 ring-2 ring-orange-200"
                                : "border-gray-200 hover:border-orange-300"
                            }`}
                          >
                            <img
                              src={resolveFileUrl(motif.url)}
                              alt={`Motif ${motif.id}`}
                              className="w-full h-28 object-contain bg-gray-50"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                Selected
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canComposeFabric}
                    className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 font-semibold hover:bg-orange-50 transition disabled:opacity-50"
                  >
                    Continue to Stage 2
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Reset All
                  </button>
                </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stage 2</h2>
                    <p className="text-gray-500">Compose two motifs into a fabric.</p>
                  </div>
                  <span className="text-xs text-gray-400">Pattern: checkerboard</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Grid Rows</label>
                        <input
                          type="number"
                          min={2}
                          value={fabricParams.grid_rows}
                          onChange={(event) =>
                            setFabricParams((prev) => ({
                              ...prev,
                              grid_rows: Number(event.target.value),
                            }))
                          }
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        {!isEven(fabricParams.grid_rows) && (
                          <div className="text-xs text-red-500 mt-1">Must be even</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Grid Cols</label>
                        <input
                          type="number"
                          min={2}
                          value={fabricParams.grid_cols}
                          onChange={(event) =>
                            setFabricParams((prev) => ({
                              ...prev,
                              grid_cols: Number(event.target.value),
                            }))
                          }
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        {!isEven(fabricParams.grid_cols) && (
                          <div className="text-xs text-red-500 mt-1">Must be even</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Width (cm)</label>
                        <input
                          type="number"
                          min={10}
                          value={fabricParams.output_width_cm}
                          onChange={(event) =>
                            setFabricParams((prev) => ({
                              ...prev,
                              output_width_cm: Number(event.target.value),
                            }))
                          }
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Height (cm)</label>
                        <input
                          type="number"
                          min={10}
                          value={fabricParams.output_height_cm}
                          onChange={(event) =>
                            setFabricParams((prev) => ({
                              ...prev,
                              output_height_cm: Number(event.target.value),
                            }))
                          }
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700">DPI</label>
                      <input
                        type="number"
                        min={72}
                        value={fabricParams.dpi}
                        onChange={(event) =>
                          setFabricParams((prev) => ({
                            ...prev,
                            dpi: Number(event.target.value),
                          }))
                        }
                        className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <button
                      onClick={handleComposeFabric}
                      disabled={isStage2Loading}
                      className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60"
                    >
                      {isStage2Loading ? "Composing..." : "Compose Fabric"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-gray-700">Selected Motifs</div>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedMotifs.length === 0 && (
                        <div className="col-span-2 text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
                          Select two motifs in Stage 1.
                        </div>
                      )}
                      {selectedMotifs.map((motif) => (
                        <img
                          key={motif.id}
                          src={resolveFileUrl(motif.url)}
                          alt={`Selected motif ${motif.id}`}
                          className="w-full h-24 object-contain bg-gray-50 rounded-xl border border-orange-200"
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-400">
                      Pattern is fixed to checkerboard as per documentation.
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Back to Stage 1
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!hasFabric}
                    className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 font-semibold hover:bg-orange-50 transition disabled:opacity-50"
                  >
                    Continue to Stage 3
                  </button>
                </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stage 3</h2>
                    <p className="text-gray-500">Review fabric output and parameters.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    {fabricData?.url ? (
                      <div className="relative group">
                        <img
                          src={resolveFileUrl(fabricData.url)}
                          alt="Composed fabric"
                          className="w-full h-56 object-contain bg-white rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => openPreview("Composed Fabric", resolveFileUrl(fabricData.url))}
                          className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-white"
                        >
                          <span>Zoom</span>
                          <span aria-hidden="true">🔍</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-56 rounded-xl bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                        Compose fabric to preview result.
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                      <div className="text-sm font-semibold text-orange-700 mb-2">
                        Fabric Parameters
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>Grid Rows: {fabricParams.grid_rows}</li>
                        <li>Grid Cols: {fabricParams.grid_cols}</li>
                        <li>Width: {fabricParams.output_width_cm} cm</li>
                        <li>Height: {fabricParams.output_height_cm} cm</li>
                        <li>DPI: {fabricParams.dpi}</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-400">
                      Fabric ID: {fabricData?.id || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Back to Stage 2
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    disabled={!hasFabric}
                    className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 font-semibold hover:bg-orange-50 transition disabled:opacity-50"
                  >
                    Continue to Stage 4
                  </button>
                </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stage 4</h2>
                    <p className="text-gray-500">Apply FLUX Kontext to render garment.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Prompt (optional)</label>
                      <textarea
                        value={resultPrompt}
                        onChange={(event) => setResultPrompt(event.target.value)}
                        rows={3}
                        className="w-full mt-2 rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Optional style prompt for FLUX"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Style</label>
                        <select
                          value={style}
                          onChange={(event) => setStyle(event.target.value)}
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                          {STYLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Gender</label>
                        <select
                          value={gender}
                          onChange={(event) => setGender(event.target.value)}
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                          {GENDER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Sleeve</label>
                        <select
                          value={sleeve}
                          onChange={(event) => setSleeve(event.target.value)}
                          className="w-full mt-2 rounded-xl border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                          {SLEEVE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleApplyFlux}
                      disabled={isStage3Loading}
                      className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60"
                    >
                      {isStage3Loading ? "Generating..." : "Generate Result"}
                    </button>

                    <div className="text-xs text-gray-400">
                      Mode: FLUX Kontext. Output max size: 1024 px.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    {resultData?.front_url ? (
                      <div className="space-y-3">
                        <div className="relative group">
                          <img
                            src={resolveFileUrl(resultData.front_url)}
                            alt="FLUX result"
                            className="w-full h-60 object-contain bg-white rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => openPreview("FLUX Result", resolveFileUrl(resultData.front_url))}
                            className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-white"
                          >
                            <span>Zoom</span>
                            <span aria-hidden="true">🔍</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={resolveFileUrl(resultData.front_url)}
                            download
                            className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 font-semibold hover:bg-orange-50 transition"
                          >
                            Download Front
                          </a>
                          <button
                            onClick={handleResetAll}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            Reset All
                          </button>
                        </div>
                        <div className="text-xs text-gray-400">
                          Result ID: {resultData.result_id || "-"}
                        </div>
                      </div>
                    ) : (
                      <div className="h-60 rounded-xl bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                        Generate FLUX result to preview.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Back to Stage 3
                  </button>
                </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Agent History</h3>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {consoleMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        msg.type === "success"
                          ? "border-green-200 bg-green-50 text-green-800"
                          : msg.type === "error"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1">
                        {msg.type} · {msg.time}
                      </div>
                      <div>{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Endpoint Summary</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <span className="font-semibold text-gray-800">Stage 1:</span> POST /api/v1/stage1/generate
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Stage 2:</span> POST /api/v1/stage2/compose
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Stage 3:</span> POST /api/v1/stage3/apply-flux
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Files:</span> GET /api/v1/files/{"{category}"}/{"{filename}"}
                  </div>
                </div>
              </div> */}
            </aside>
          </div>
        </div>
      </section>

      {previewModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
          onClick={closePreview}
        >
          <div
            className="relative max-h-full w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-800">{previewModal.title}</div>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="bg-gray-50 p-4">
              <img
                src={previewModal.url}
                alt={previewModal.title}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
