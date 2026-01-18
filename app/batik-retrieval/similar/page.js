"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/batik-retrieval';

function SimilarPatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [queryIndex, setQueryIndex] = useState(null);
  const [queryPatch, setQueryPatch] = useState(null);
  const [similarPatches, setSimilarPatches] = useState([]);
  const [selectedPatch, setSelectedPatch] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const models = [
    { value: "GAN-SL", label: "Batik GAN SL", description: "GAN Single Loss" },
    { value: "GAN-CL", label: "Batik GAN CL", description: "GAN Combined Loss" },
    { value: "RVGAN", label: "Batik RVGAN", description: "Relativistic GAN" },
  ];

  useEffect(() => {
    const index = searchParams.get("index");
    if (!index) {
      setError("No patch index provided");
      setIsLoading(false);
      return;
    }

    const patchIndex = Number(index);
    setQueryIndex(patchIndex);
    fetchSimilarPatches(patchIndex);
  }, [searchParams]);

  const fetchSimilarPatches = async (index) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patches/similar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index: index }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Similar patches response:', data); // Debug log
        if (data.success) {
          setSimilarPatches(data.similar_patches || []);
          
          // Try to get query patch from response
          // Method 1: Check if there's a query_patch field
          if (data.query_patch) {
            setQueryPatch({
              index: data.query_patch.index || index,
              image_url: data.query_patch.image_url,
              path: data.query_patch.path,
            });
          }
          // Method 2: Get first patch with distance 0 (query itself)
          else if (data.similar_patches && data.similar_patches.length > 0) {
            const queryPatchData = data.similar_patches.find(p => p.distance === 0);
            if (queryPatchData) {
              setQueryPatch({
                index: queryPatchData.index,
                image_url: queryPatchData.image_url,
                path: queryPatchData.path,
              });
            } else {
              // Method 3: Use first patch as query if no distance 0 found
              const firstPatch = data.similar_patches[0];
              setQueryPatch({
                index: index,
                image_url: firstPatch.image_url,
                path: firstPatch.path,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching similar patches:", err);
      setError("Failed to load similar patches");
    } finally {
      setIsLoading(false);
    }
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

  const handlePatchSelect = (patchPath) => {
    setSelectedPatch(patchPath);
  };

  const handleGenerate = () => {
    if (!queryPatch) {
      setError("Query patch not loaded");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!selectedPatch) {
      setError("Please select a similar patch");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (selectedModels.length === 0) {
      setError("Please select at least one model");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Navigate to result page
    const params = new URLSearchParams({
      patchA: queryPatch.image_url,
      patchB: selectedPatch,
      models: selectedModels.join(","),
    });
    router.push(`/batik-retrieval/result?${params.toString()}`);
  };

  if (error && !queryIndex) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push("/batik-retrieval")}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-gray-900 via-orange-900 to-amber-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Similar Patterns Found
          </h1>
          <p className="text-xl text-orange-200">
            Bray-Curtis distance algorithm results
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Query Patch */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center gap-3">
              <span className="text-4xl">🔍</span>
              Your Query Patch
            </h2>
            <div className="flex justify-center">
              <div className="text-center">
                <div className="mb-4 px-4 py-2 bg-orange-100 rounded-full inline-block">
                  <span className="text-orange-800 font-bold">Patch #{queryIndex}</span>
                </div>
                {queryPatch && (
                  <div className="w-64 h-64 rounded-xl overflow-hidden shadow-lg border-4 border-orange-200 mx-auto">
                    <img
                      src={`${API_BASE_URL}${queryPatch.image_url}`}
                      alt="Query Patch"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🤖</span>
              Select GAN Models
            </h2>
            <p className="text-gray-600 mb-6">
              Choose one or more models to generate batik patterns from the patch combination.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {models.map((model) => (
                <label
                  key={model.value}
                  className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedModels.includes(model.value)
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.value)}
                    onChange={() => handleModelToggle(model.value)}
                    className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
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
                    <span className="absolute top-3 right-3 text-orange-500 text-xl">✓</span>
                  )}
                </label>
              ))}
            </div>
            {selectedModels.length > 0 && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-orange-800 font-medium">
                  {selectedModels.length} model{selectedModels.length > 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>

          {/* Similar Patches */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">📊</span>
              Similar Patches (Bray-Curtis Distance)
            </h2>
            <p className="text-gray-600 mb-6">
              Select one of the similar patches below to combine with your query patch.
            </p>

            {/* Error Message */}
            {error && queryIndex && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Selection Status */}
            {selectedPatch && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-orange-800 font-medium">
                  ✓ Selected patch: {selectedPatch}
                </p>
              </div>
            )}

            {/* Similar Patches Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-gray-600">Finding similar patterns...</p>
              </div>
            ) : similarPatches.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No similar patches found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {similarPatches.map((patch, index) => {
                  const isSelected = selectedPatch === patch.image_url;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handlePatchSelect(patch.image_url)}
                      className={`relative cursor-pointer group rounded-xl overflow-hidden transition-all duration-300 ${
                        isSelected
                          ? "ring-4 ring-orange-500 shadow-xl scale-95"
                          : "ring-1 ring-gray-200 hover:ring-orange-300 hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={`${API_BASE_URL}${patch.image_url}`}
                          alt={`Similar patch ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        
                        {/* Checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                            ✓
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 ${isSelected ? 'opacity-100' : ''}`}>
                          <span className="text-white font-semibold">
                            Similar #{index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info Box */}
            {similarPatches.length > 0 && (
              <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">ℹ️</span>
                  <h3 className="font-bold text-orange-900">About Bray-Curtis Distance</h3>
                </div>
                <p className="text-orange-800 text-sm leading-relaxed">
                  The Bray-Curtis dissimilarity is a statistical measure used to quantify the compositional dissimilarity 
                  between two different sites. In this context, it measures the visual similarity between batik patterns. 
                  Lower distances indicate more similar patterns.
                </p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={() => router.push("/batik-retrieval")}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg border-2 border-orange-600 hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ← Back to Search
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedPatch || selectedModels.length === 0}
              className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                selectedPatch && selectedModels.length > 0
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transform"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedPatch && selectedModels.length > 0
                ? `🚀 Generate Batik`
                : !selectedPatch
                ? "Select a similar patch"
                : "Select at least one model"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SimilarPatchesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-600">Loading...</p>
        </div>
      </div>
    }>
      <SimilarPatchesContent />
    </Suspense>
  );
}
