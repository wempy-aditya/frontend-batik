"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/batik-rvgan';

export default function BatikGeneratorPage() {
  const router = useRouter();
  const [activeDataset, setActiveDataset] = useState("nitik");
  const [nitikPatches, setNitikPatches] = useState([]);
  const [itbPatches, setItbPatches] = useState([]);
  const [selectedPatches, setSelectedPatches] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const MAX_PATCHES = 2;
  const models = [
    { value: "batikgan_sl", label: "Batik GAN SL" },
    { value: "batikgan_cl", label: "Batik GAN CL" },
    { value: "batikrvgan", label: "Batik RVGAN" },
  ];

  useEffect(() => {
    fetchPatches();
  }, []);

  const fetchPatches = async () => {
    setIsLoading(true);
    try {
      // Fetch Nitik patches (18 random patches)
      const nitikResponse = await fetch(`${API_BASE_URL}/patches/random`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset: 'nitik',
          count: 18
        })
      });
      if (nitikResponse.ok) {
        const nitikData = await nitikResponse.json();
        if (nitikData.success) {
          setNitikPatches(nitikData.patches || []);
        }
      }

      // Fetch ITB patches (18 random patches)
      const itbResponse = await fetch(`${API_BASE_URL}/patches/random`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset: 'itb',
          count: 18
        })
      });
      if (itbResponse.ok) {
        const itbData = await itbResponse.json();
        if (itbData.success) {
          setItbPatches(itbData.patches || []);
        }
      }
    } catch (err) {
      console.error("Error fetching patches:", err);
      setError("Failed to load patches");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatchToggle = (patchIndex) => {
    setSelectedPatches((prev) => {
      if (prev.includes(patchIndex)) {
        return prev.filter((p) => p !== patchIndex);
      } else {
        if (prev.length >= MAX_PATCHES) {
          setError(`You can only select up to ${MAX_PATCHES} patches`);
          setTimeout(() => setError(""), 3000);
          return prev;
        }
        return [...prev, patchIndex];
      }
    });
  };

  const handleModelToggle = (modelValue) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelValue)) {
        return prev.filter((m) => m !== modelValue);
      } else {
        return [...prev, modelValue];
      }
    });
  };

  const handleGenerate = () => {
    if (selectedPatches.length !== MAX_PATCHES) {
      setError(`Please select exactly ${MAX_PATCHES} patches`);
      return;
    }
    if (selectedModels.length === 0) {
      setError("Please select at least one model");
      return;
    }

    // Navigate to result page with query params
    const params = new URLSearchParams({
      dataset: activeDataset,
      patches: selectedPatches.join(","),
      models: selectedModels.join(","),
    });
    router.push(`/batik-generator/result?${params.toString()}`);
  };

  const currentPatches = activeDataset === "nitik" ? nitikPatches : itbPatches;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
            <span className="text-purple-200 text-sm font-medium">
              ✨ AI-Powered Batik Generator
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Generate Beautiful
            <span className="block mt-2 bg-gradient-to-r from-purple-400 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
              Batik Patterns
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Combine traditional batik patches with cutting-edge AI models to create unique patterns
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Info Box */}
          <div className="mb-12 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
            <div className="flex items-start gap-4">
              <span className="text-5xl">ℹ️</span>
              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-3">How It Works</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>📊 Datasets:</strong> Choose from <strong>Nitik</strong> (120 patches) or <strong>ITB</strong> (138 patches) traditional batik patterns</p>
                  <p><strong>🤖 AI Models:</strong> Three GAN models - <strong>BatikGAN-SL</strong> (68.86 MB), <strong>BatikGAN-CL</strong> (68.86 MB), and <strong>BatikRVGAN</strong> (147.89 MB)</p>
                  <p><strong>🎨 Process:</strong> Select 2 patches (Patch A + Patch B), choose models, and generate unique batik patterns</p>
                  <p><strong>💾 Random Selection:</strong> Each page load shows 18 random patches from the selected dataset for variety</p>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🤖</span>
              Select AI Models
            </h2>
            <p className="text-gray-600 mb-6">
              Choose one or more models to generate batik patterns. Each model has unique characteristics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {models.map((model) => (
                <label
                  key={model.value}
                  className={`relative flex items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedModels.includes(model.value)
                      ? "border-purple-500 bg-purple-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.value)}
                    onChange={() => handleModelToggle(model.value)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    {model.label}
                  </span>
                  {selectedModels.includes(model.value) && (
                    <span className="absolute top-3 right-3 text-purple-500">✓</span>
                  )}
                </label>
              ))}
            </div>
            {selectedModels.length > 0 && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-purple-800 font-medium">
                  {selectedModels.length} model{selectedModels.length > 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>

          {/* Patch Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🎨</span>
              Select Patch Images
            </h2>
            <p className="text-gray-600 mb-6">
              Select exactly {MAX_PATCHES} patches to combine. The order matters - first selected will be Patch A, second will be Patch B.
            </p>

            {/* Dataset Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveDataset("nitik");
                  setSelectedPatches([]);
                }}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                  activeDataset === "nitik"
                    ? "text-purple-600 border-purple-600"
                    : "text-gray-500 border-transparent hover:text-purple-500"
                }`}
              >
                🌸 Nitik Patches
              </button>
              <button
                onClick={() => {
                  setActiveDataset("itb");
                  setSelectedPatches([]);
                }}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                  activeDataset === "itb"
                    ? "text-purple-600 border-purple-600"
                    : "text-gray-500 border-transparent hover:text-purple-500"
                }`}
              >
                🎭 ITB Patches
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Selection Status */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center">
                <p className="text-purple-800 font-medium">
                  Selected: {selectedPatches.length} / {MAX_PATCHES} patches
                </p>
                {selectedPatches.length > 0 && (
                  <button
                    onClick={() => setSelectedPatches([])}
                    className="text-purple-600 hover:text-purple-800 font-medium underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              {selectedPatches.length > 0 && (
                <div className="mt-2 text-sm text-purple-700">
                  {selectedPatches.map((idx, order) => (
                    <span key={idx} className="mr-4">
                      Patch {order === 0 ? "A" : "B"}: #{idx}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Patches Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Loading patches...</p>
              </div>
            ) : currentPatches.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No patches available for {activeDataset}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {currentPatches.map((patch) => {
                  const isSelected = selectedPatches.includes(patch.index);
                  const selectionOrder = selectedPatches.indexOf(patch.index);
                  
                  return (
                    <div
                      key={patch.index}
                      onClick={() => handlePatchToggle(patch.index)}
                      className={`relative cursor-pointer group rounded-xl overflow-hidden transition-all duration-300 ${
                        isSelected
                          ? "ring-4 ring-purple-500 shadow-xl scale-95"
                          : "ring-1 ring-gray-200 hover:ring-purple-300 hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      <img
                        src={`${API_BASE_URL}/patch/image/${activeDataset}/${patch.index}`}
                        alt={`Patch ${patch.index}`}
                        className="w-full h-auto aspect-square object-cover"
                        loading="lazy"
                      />
                      
                      {/* Selection Badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                          {selectionOrder === 0 ? "A" : "B"}
                        </div>
                      )}
                      
                      {/* Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white text-purple-600 w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                          ✓
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 ${isSelected ? 'opacity-100' : ''}`}>
                        <span className="text-white font-semibold">
                          Patch #{patch.index}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="mt-12 text-center">
            <button
              onClick={handleGenerate}
              disabled={selectedPatches.length !== MAX_PATCHES || selectedModels.length === 0}
              className={`px-12 py-5 rounded-xl font-bold text-lg transition-all duration-300 ${
                selectedPatches.length === MAX_PATCHES && selectedModels.length > 0
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transform"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedPatches.length === MAX_PATCHES && selectedModels.length > 0
                ? `🚀 Generate Batik with ${selectedModels.length} Model${selectedModels.length > 1 ? "s" : ""}`
                : selectedPatches.length !== MAX_PATCHES
                ? `Select ${MAX_PATCHES - selectedPatches.length} more patch${MAX_PATCHES - selectedPatches.length > 1 ? "es" : ""}`
                : "Select at least one model"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
