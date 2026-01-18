"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/batik-rvgan';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dataset, setDataset] = useState("");
  const [patches, setPatches] = useState([]);
  const [models, setModels] = useState([]);
  const [patchImages, setPatchImages] = useState({ patchA: null, patchB: null });
  const [generatedImages, setGeneratedImages] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState("");

  const modelLabels = {
    batikgansl: "Batik GAN SL",
    batikgancl: "Batik GAN CL",
    batikrvgan: "Batik RVGAN",
  };

  useEffect(() => {
    const datasetParam = searchParams.get("dataset");
    const patchesParam = searchParams.get("patches");
    const modelsParam = searchParams.get("models");

    if (!datasetParam || !patchesParam || !modelsParam) {
      setError("Missing required parameters");
      return;
    }

    const patchArray = patchesParam.split(",").map(Number);
    const modelArray = modelsParam.split(",");

    if (patchArray.length !== 2) {
      setError("Exactly 2 patches are required");
      return;
    }

    setDataset(datasetParam);
    setPatches(patchArray);
    setModels(modelArray);

    // Fetch patch images
    fetchPatchImages(datasetParam, patchArray);

    // Initialize loading states
    const initialLoadingStates = {};
    modelArray.forEach((model) => {
      initialLoadingStates[model] = true;
    });
    setLoadingStates(initialLoadingStates);

    // Generate images for each model sequentially
    generateImagesSequentially(datasetParam, patchArray, modelArray);
  }, [searchParams]);

  const fetchPatchImages = async (dataset, patchIndexes) => {
    try {
      setPatchImages({
        patchA: `${API_BASE_URL}/patch/image/${dataset}/${patchIndexes[0]}`,
        patchB: `${API_BASE_URL}/patch/image/${dataset}/${patchIndexes[1]}`,
      });
    } catch (err) {
      console.error("Error setting patch images:", err);
    }
  };

  const generateImagesSequentially = async (dataset, patchIndexes, modelList) => {
    for (const modelName of modelList) {
      await generateImage(dataset, patchIndexes, modelName);
    }
  };

  const generateImage = async (dataset, patchIndexes, modelName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset: dataset,
          patch_a: patchIndexes[0],
          patch_b: patchIndexes[1],
          model_name: modelName,
          return_base64: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.image_url) {
          setGeneratedImages((prev) => ({
            ...prev,
            [modelName]: {
              url: `${API_BASE_URL}${data.image_url}`,
              downloadUrl: `${API_BASE_URL}${data.download_url}`,
              filename: data.filename,
            },
          }));
        } else {
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

  const handleBackToGenerator = () => {
    router.push("/batik-generator");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={handleBackToGenerator}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Back to Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Generated Batik Results
          </h1>
          <p className="text-xl text-purple-200">
            AI-powered batik pattern generation results
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Query Patches */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center gap-3">
              <span className="text-4xl">🎨</span>
              Query Patch Images
            </h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {/* Patch A */}
              <div className="text-center">
                <div className="mb-3 px-4 py-2 bg-purple-100 rounded-full inline-block">
                  <span className="text-purple-800 font-bold">Patch A</span>
                </div>
                {patchImages.patchA ? (
                  <div className="w-64 h-64 rounded-xl overflow-hidden shadow-lg border-4 border-purple-200">
                    <img
                      src={patchImages.patchA}
                      alt="Patch A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 rounded-xl bg-gray-200 animate-pulse"></div>
                )}
              </div>

              {/* Plus Icon */}
              <div className="text-6xl text-purple-600 font-bold">+</div>

              {/* Patch B */}
              <div className="text-center">
                <div className="mb-3 px-4 py-2 bg-purple-100 rounded-full inline-block">
                  <span className="text-purple-800 font-bold">Patch B</span>
                </div>
                {patchImages.patchB ? (
                  <div className="w-64 h-64 rounded-xl overflow-hidden shadow-lg border-4 border-purple-200">
                    <img
                      src={patchImages.patchB}
                      alt="Patch B"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 rounded-xl bg-gray-200 animate-pulse"></div>
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
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 transition-transform duration-300 hover:scale-105"
                >
                  {/* Model Name Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4">
                    <h3 className="text-xl font-bold text-white text-center">
                      {modelLabels[modelName] || modelName}
                    </h3>
                  </div>

                  {/* Image Container */}
                  <div className="p-6">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      {loadingStates[modelName] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
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
                        <img
                          src={generatedImages[modelName].url}
                          alt={`Generated by ${modelLabels[modelName]}`}
                          className="w-full h-full object-cover"
                        />
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
                        className="mt-4 w-full block text-center px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors"
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
          <div className="flex justify-center gap-4">
            <button
              onClick={handleBackToGenerator}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg border-2 border-purple-600 hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ← Generate Another
            </button>
            <button
              onClick={() => router.push("/batik-generator/gallery")}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 shadow-lg"
            >
              View Gallery →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600">Loading...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
