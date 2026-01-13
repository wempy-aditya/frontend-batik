"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_BATIKGAN_API_URL || 'http://localhost:5001';

export default function BatikGANPage() {
  const router = useRouter();
  const [patches, setPatches] = useState([]);
  const [selectedPatches, setSelectedPatches] = useState([]);
  const [selectedModels, setSelectedModels] = useState(["GAN_C1"]); // GAN_C1 default checked
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const MAX_PATCHES = 2;

  const models = [
    { value: "GAN_C1", label: "BatikGAN SL C-1", description: "GAN with C=1 parameter", default: true },
    { value: "GAN_C10", label: "BatikGAN SL C-10", description: "GAN with C=10 parameter", default: false },
    { value: "GAN_C100", label: "BatikGAN SL C-100", description: "GAN with C=100 parameter", default: false },
    { value: "GAN_AUG", label: "BatikGAN SL Aug", description: "GAN with data augmentation", default: false },
    { value: "GAN_NO_AUG", label: "BatikGAN SL No Aug", description: "GAN without augmentation", default: false },
    { value: "PATCHGAN", label: "PatchGAN", description: "PatchGAN architecture", default: false },
  ];

  useEffect(() => {
    fetchPatches();
  }, []);

  const fetchPatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patches`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPatches(data.patches || []);
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
        // Prevent unchecking if it's the last selected model
        if (prev.length === 1) {
          setError("At least one model must be selected");
          setTimeout(() => setError(""), 3000);
          return prev;
        }
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
      patchA: selectedPatches[0],
      patchB: selectedPatches[1],
      models: selectedModels.join(","),
    });
    router.push(`/batikgan/result?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-teal-500/20 backdrop-blur-sm rounded-full border border-teal-400/30">
            <span className="text-teal-200 text-sm font-medium">
              🤖 BatikGAN CL/SL Generator
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            GAN-Powered
            <span className="block mt-2 bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Batik Creation
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Compare 6 different GAN models to generate unique batik patterns from patch combinations
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Model Selection */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🧠</span>
              Select GAN Models
            </h2>
            <p className="text-gray-600 mb-6">
              Choose one or more GAN models to compare. Each model uses different training parameters and architectures.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <label
                  key={model.value}
                  className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedModels.includes(model.value)
                      ? "border-teal-500 bg-teal-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-md"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.value)}
                    onChange={() => handleModelToggle(model.value)}
                    className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-800 block">
                      {model.label}
                    </span>
                    <span className="text-sm text-gray-600">
                      {model.description}
                    </span>
                  </div>
                  {selectedModels.includes(model.value) && (
                    <span className="absolute top-3 right-3 text-teal-500 text-xl">✓</span>
                  )}
                </label>
              ))}
            </div>
            {selectedModels.length > 0 && (
              <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-teal-800 font-medium">
                  {selectedModels.length} model{selectedModels.length > 1 ? "s" : ""} selected for comparison
                </p>
              </div>
            )}
          </div>

          {/* Patch Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🎨</span>
              Select Patch Images
            </h2>
            <p className="text-gray-600 mb-6">
              Select exactly {MAX_PATCHES} patches to combine. The order matters - first selected will be Patch A, second will be Patch B.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Selection Status */}
            <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex justify-between items-center">
                <p className="text-teal-800 font-medium">
                  Selected: {selectedPatches.length} / {MAX_PATCHES} patches
                </p>
                {selectedPatches.length > 0 && (
                  <button
                    onClick={() => setSelectedPatches([])}
                    className="text-teal-600 hover:text-teal-800 font-medium underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              {selectedPatches.length > 0 && (
                <div className="mt-2 text-sm text-teal-700">
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
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mb-4"></div>
                <p className="text-gray-600">Loading patches...</p>
              </div>
            ) : patches.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No patches available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {patches.map((patch) => {
                  const isSelected = selectedPatches.includes(patch.index);
                  const selectionOrder = selectedPatches.indexOf(patch.index);
                  
                  return (
                    <div
                      key={patch.index}
                      onClick={() => handlePatchToggle(patch.index)}
                      className={`relative cursor-pointer group rounded-xl overflow-hidden transition-all duration-300 ${
                        isSelected
                          ? "ring-4 ring-teal-500 shadow-xl scale-95"
                          : "ring-1 ring-gray-200 hover:ring-teal-300 hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      <img
                        src={`${API_BASE_URL}/${patch.path}`}
                        alt={`Patch ${patch.index}`}
                        className="w-full h-auto aspect-square object-cover"
                        loading="lazy"
                      />
                      
                      {/* Selection Badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                          {selectionOrder === 0 ? "A" : "B"}
                        </div>
                      )}
                      
                      {/* Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white text-teal-600 w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
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
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transform"
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
