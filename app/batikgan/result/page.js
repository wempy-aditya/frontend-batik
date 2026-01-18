"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_BATIKGAN_API_URL || 'http://localhost:5001';

function BatikGANResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patchA, setPatchA] = useState(null);
  const [patchB, setPatchB] = useState(null);
  const [models, setModels] = useState([]);
  const [patchImages, setPatchImages] = useState({ patchA: null, patchB: null });
  const [generatedImages, setGeneratedImages] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState("");

  const modelLabels = {
    GAN_C1: "BatikGAN SL C-1",
    GAN_C10: "BatikGAN SL C-10",
    GAN_C100: "BatikGAN SL C-100",
    GAN_AUG: "BatikGAN SL Aug",
    GAN_NO_AUG: "BatikGAN SL No Aug",
    PATCHGAN: "PatchGAN",
  };

  useEffect(() => {
    const patchAParam = searchParams.get("patchA");
    const patchBParam = searchParams.get("patchB");
    const modelsParam = searchParams.get("models");

    if (!patchAParam || !patchBParam || !modelsParam) {
      setError("Missing required parameters");
      return;
    }

    const patchAIndex = Number(patchAParam);
    const patchBIndex = Number(patchBParam);
    const modelArray = modelsParam.split(",");

    setPatchA(patchAIndex);
    setPatchB(patchBIndex);
    setModels(modelArray);

    // Fetch patch images
    fetchPatchImages(patchAIndex, patchBIndex);

    // Initialize loading states
    const initialLoadingStates = {};
    modelArray.forEach((model) => {
      initialLoadingStates[model] = true;
    });
    setLoadingStates(initialLoadingStates);

    // Generate images for each model sequentially
    generateImagesSequentially(patchAIndex, patchBIndex, modelArray);
  }, [searchParams]);

  const fetchPatchImages = async (patchAIndex, patchBIndex) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patches`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.patches) {
          const patchAObj = data.patches.find((p) => p.index === patchAIndex);
          const patchBObj = data.patches.find((p) => p.index === patchBIndex);
          setPatchImages({
            patchA: patchAObj ? `${API_BASE_URL}/${patchAObj.path}` : null,
            patchB: patchBObj ? `${API_BASE_URL}/${patchBObj.path}` : null,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching patch images:", err);
    }
  };

  const generateImagesSequentially = async (patchAIndex, patchBIndex, modelList) => {
    for (const modelName of modelList) {
      await generateImage(patchAIndex, patchBIndex, modelName);
    }
  };

  const generateImage = async (patchAIndex, patchBIndex, modelName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patch_a: patchAIndex,
          patch_b: patchBIndex,
          model_name: modelName,
          return_base64: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.image_base64) {
          setGeneratedImages((prev) => ({
            ...prev,
            [modelName]: {
              url: data.image_base64,
              inferenceTime: data.inference_time,
              timestamp: data.timestamp,
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

  const handleBackToGenerator = () => {
    router.push("/batikgan");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={handleBackToGenerator}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Back to Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Generated Batik Results
          </h1>
          <p className="text-xl text-teal-200">
            GAN-powered batik pattern generation from patch combinations
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Query Patches */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center gap-3">
              <span className="text-4xl">🎨</span>
              Query Patch Images
            </h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {/* Patch A */}
              <div className="text-center">
                <div className="mb-3 px-4 py-2 bg-teal-100 rounded-full inline-block">
                  <span className="text-teal-800 font-bold">Patch A</span>
                </div>
                {patchImages.patchA ? (
                  <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 border-teal-200">
                    <img
                      src={patchImages.patchA}
                      alt="Patch A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-gray-200 animate-pulse"></div>
                )}
              </div>

              {/* Plus Icon */}
              <div className="text-6xl text-teal-600 font-bold">+</div>

              {/* Patch B */}
              <div className="text-center">
                <div className="mb-3 px-4 py-2 bg-teal-100 rounded-full inline-block">
                  <span className="text-teal-800 font-bold">Patch B</span>
                </div>
                {patchImages.patchB ? (
                  <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 border-teal-200">
                    <img
                      src={patchImages.patchB}
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
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100 transition-transform duration-300 hover:scale-105"
                >
                  {/* Model Name Header */}
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4">
                    <h3 className="text-xl font-bold text-white text-center">
                      {modelLabels[modelName] || modelName}
                    </h3>
                  </div>

                  {/* Image Container */}
                  <div className="p-6">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      {loadingStates[modelName] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mb-4"></div>
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
                        href={generatedImages[modelName].url}
                        download={`batik-${modelName}-${Date.now()}.png`}
                        className="mt-4 w-full block text-center px-4 py-3 bg-teal-100 text-teal-700 rounded-lg font-semibold hover:bg-teal-200 transition-colors"
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
              onClick={handleBackToGenerator}
              className="px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg border-2 border-teal-600 hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ← Generate Another
            </button>
            <button
              onClick={() => router.push("/batikgan/gallery")}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 shadow-lg"
            >
              View Gallery →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BatikGANResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-600">Loading...</p>
        </div>
      </div>
    }>
      <BatikGANResultContent />
    </Suspense>
  );
}
