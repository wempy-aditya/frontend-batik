"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/batik-retrieval';

export default function BatikRetrievalPage() {
  const router = useRouter();
  const [patches, setPatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRandomPatches();
  }, []);

  const fetchRandomPatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patches/random`);
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

  const handlePatchSelect = (patchIndex) => {
    router.push(`/batik-retrieval/similar?index=${patchIndex}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-orange-900 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full border border-orange-400/30">
            <span className="text-orange-200 text-sm font-medium">
              🔍 Batik Pattern Retrieval
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Similarity-Based
            <span className="block mt-2 bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Pattern Search
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Select a patch to find similar patterns using Bray-Curtis distance algorithm
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Instructions */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">📋</span>
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Select Query Patch</h3>
                  <p className="text-gray-600 text-sm">
                    Choose one patch from the 18 random patterns below
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Find Similar Patterns</h3>
                  <p className="text-gray-600 text-sm">
                    System finds 4 most similar patches using Bray-Curtis distance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Generate Batik</h3>
                  <p className="text-gray-600 text-sm">
                    Combine patches with GAN models to create new patterns
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Random Patches */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🎨</span>
              Select a Patch to Find Similar Patterns
            </h2>
            <p className="text-gray-600 mb-6">
              Click on any patch to search for similar patterns. These 18 patches are randomly selected with seed=3 for consistency.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Patches Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-gray-600">Loading patches...</p>
              </div>
            ) : patches.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No patches available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {patches.map((patch) => (
                  <div
                    key={patch.index}
                    onClick={() => handlePatchSelect(patch.index)}
                    className="group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ring-1 ring-gray-200 hover:ring-orange-400 hover:shadow-2xl hover:scale-110 bg-white"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={`${API_BASE_URL}${patch.image_url}`}
                        alt={`Patch ${patch.index}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-white text-4xl mb-2">🔍</div>
                            <p className="text-white font-bold text-sm">Find Similar</p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white font-semibold text-xs text-center">
                            Patch #{patch.index}
                          </p>
                        </div>
                      </div>

                      {/* Index Badge */}
                      <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        #{patch.index}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Box */}
            {patches.length > 0 && (
              <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">ℹ️</span>
                  <h3 className="font-bold text-orange-900">About Random Patches</h3>
                </div>
                <p className="text-orange-800 text-sm leading-relaxed">
                  These {patches.length} patches are randomly selected from a database of 120 patterns using a fixed seed (seed=3) 
                  to ensure consistency across sessions. The Bray-Curtis distance algorithm will be used to find patterns 
                  with similar visual characteristics.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
