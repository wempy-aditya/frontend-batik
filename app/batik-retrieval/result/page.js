"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/batik-retrieval';

function RetrievalResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patchA, setPatchA] = useState(null);
  const [patchB, setPatchB] = useState(null);
  const [models, setModels] = useState([]);
  const [generatedImages, setGeneratedImages] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState("");

  const modelLabels = {
    "GAN-SL": "Batik GAN SL",
    "GAN-CL": "Batik GAN CL",
    "RVGAN": "Batik RVGAN",
  };

  useEffect(() => {
    const patchAParam = searchParams.get("patchA");
    const patchBParam = searchParams.get("patchB");
    const modelsParam = searchParams.get("models");

    if (!patchAParam || !patchBParam || !modelsParam) {
      setError("Missing required parameters");
      return;
    }

    setPatchA(patchAParam);
    setPatchB(patchBParam);
    const modelArray = modelsParam.split(",");
    setModels(modelArray);

    // Initialize loading states
    const initialLoadingStates = {};
    modelArray.forEach((model) => {
      initialLoadingStates[model] = true;
    });
    setLoadingStates(initialLoadingStates);

    // Generate images sequentially
    generateImagesSequentially(patchAParam, patchBParam, modelArray);
  }, [searchParams]);

  const generateImagesSequentially = async (patchA, patchB, modelList) => {
    for (const modelName of modelList) {
      await generateImage(patchA, patchB, modelName);
    }
  };

  const generateImage = async (patchA, patchB, modelName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patch_a: ''+patchA,
          patch_b: ''+patchB,
          model_name: modelName,
          return_base64: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGeneratedImages((prev) => ({
            ...prev,
            [modelName]: {
              url: `${API_BASE_URL}${data.image_url}`,
              downloadUrl: `${API_BASE_URL}${data.download_url}`,
              inferenceTime: data.inference_time,
              filename: data.filename,
            },
          }));
        } else {
          console.error(`Error generating image for ${modelName}:`, data);
          setGeneratedImages((prev) => ({
            ...prev,
            [modelName]: "error",
          }));
        }
      } else {
        console.error(`Error generating image for ${modelName}:`, response.statusText);
        setGeneratedImages((prev) => ({
          ...prev,
          [modelName]: "error",
        }));
      }
    } catch (err) {
      console.error(`Error generating image for ${modelName}:`, err);
      setGeneratedImages((prev) => ({
        ...prev,
        [modelName]: "error",
      }));
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [modelName]: false,
      }));
    }
  };

  const handleBackToSearch = () => {
    router.push("/batik-retrieval");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={handleBackToSearch}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Back to Search
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
            Generated Batik Results
          </h1>
          <p className="text-xl text-orange-200">
            Pattern retrieval-based batik generation
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Query Patches */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center gap-3">
              <span className="text-4xl">🎨</span>
              Query Patch Images
            </h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {/* Patch A */}
              <div className="text-center">
                <div className="mb-3 px-4 py-2 bg-orange-100 rounded-full inline-block">
                  <span className="text-orange-800 font-bold">Patch A (Query)</span>
                </div>
                {patchA ? (
                  <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 border-orange-200">
                    <img
                      src={`${API_BASE_URL}${patchA}`}
                      alt="Patch A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-gray-200 animate-pulse"></div>
                )}
              </div>

              {/* Plus Icon */}
              <div className="text-6xl text-orange-600 font-bold">+</div>

              {/* Patch B */}
              <div className="text-center">
                <div className="mb-3 px-4 py-2 bg-orange-100 rounded-full inline-block">
                  <span className="text-orange-800 font-bold">Patch B (Similar)</span>
                </div>
                {patchB ? (
                  <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 border-orange-200">
                    <img
                      src={`${API_BASE_URL}${patchB}`}
                      alt="Patch B"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-gray-200 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Generated Results */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center flex items-center justify-center gap-3">
              <span className="text-4xl">✨</span>
              Generated Batik Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {models.map((modelName) => (
                <div
                  key={modelName}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100 transition-transform duration-300 hover:scale-105"
                >
                  {/* Model Name Header */}
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4">
                    <h3 className="text-xl font-bold text-white text-center">
                      {modelLabels[modelName] || modelName}
                    </h3>
                  </div>

                  {/* Image Container */}
                  <div className="p-6">
                    <div className="relative rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
                      {loadingStates[modelName] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mb-4"></div>
                          <p className="text-gray-600 font-medium">Generating...</p>
                        </div>
                      ) : generatedImages[modelName] === "error" ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <span className="text-6xl mb-4">⚠️</span>
                          <p className="text-red-600 font-medium text-center">
                            Failed to generate image
                          </p>
                        </div>
                      ) : generatedImages[modelName] ? (
                        <>
                          <img
                            src={generatedImages[modelName].url}
                            alt={`Generated by ${modelLabels[modelName]}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Inference Time Badge */}
                          {generatedImages[modelName].inferenceTime && (
                            <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                              ⏱️ {generatedImages[modelName].inferenceTime.toFixed(3)}s
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-gray-500">Waiting...</p>
                        </div>
                      )}
                    </div>

                    {/* Download Button */}
                    {generatedImages[modelName] && generatedImages[modelName] !== "error" && (
                      <a
                        href={generatedImages[modelName].downloadUrl}
                        download={generatedImages[modelName].filename}
                        className="mt-4 w-full block text-center px-4 py-3 bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200 transition-colors"
                      >
                        📥 Download Image
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleBackToSearch}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg border-2 border-orange-600 hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ← New Search
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">ℹ️</span>
              <h3 className="font-bold text-orange-900">About This Generation</h3>
            </div>
            <p className="text-orange-800 text-sm leading-relaxed">
              These batik patterns were generated using similarity-based retrieval. The query patch was selected by you, 
              and the second patch was found using the Bray-Curtis distance algorithm to ensure visual similarity. 
              The GAN models then combined these patches to create unique batik patterns.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function RetrievalResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-600">Loading...</p>
        </div>
      </div>
    }>
      <RetrievalResultContent />
    </Suspense>
  );
}
