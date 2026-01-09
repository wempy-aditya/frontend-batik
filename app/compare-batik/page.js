"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_CLASSIFY_API_URL || 'http://localhost:5002';

export default function CompareBatikPage() {
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [queryImages, setQueryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("select");

  useEffect(() => {
    fetchModels();
    fetchQueryImages();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models`);
      const data = await response.json();
      if (data.success) {
        setModels(data.models);
        // Select first model by default
        if (data.models.length > 0) {
          setSelectedModels([data.models[0].name]);
        }
      }
    } catch (err) {
      console.error("Error fetching models:", err);
      setError("Failed to load models");
    }
  };

  const fetchQueryImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/query_images`);
      const data = await response.json();
      if (data.success) {
        setQueryImages(data.images);
      }
    } catch (err) {
      console.error("Error fetching query images:", err);
    }
  };

  const handleModelToggle = (modelName) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelName)) {
        // Keep at least one model selected
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== modelName);
      } else {
        return [...prev, modelName];
      }
    });
  };

  const handleImageSelect = (imagePath) => {
    setSelectedImage(imagePath);
    setUploadedFile(null);
    setImagePreview(`${API_BASE_URL}/${imagePath}`);
    setResults(null);
    setError("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setSelectedImage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResults(null);
      setError("");
    }
  };

  const compareModels = async () => {
    if (selectedModels.length === 0) {
      setError("Please select at least one model");
      return;
    }

    if (!selectedImage && !uploadedFile) {
      setError("Please select or upload an image");
      return;
    }

    setIsComparing(true);
    setError("");
    setResults(null);

    try {
      let response;

      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("compare", "true");
        selectedModels.forEach((model) => {
          formData.append("models", model);
        });

        response = await fetch(`${API_BASE_URL}/api/predict/upload`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/predict/compare`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            models: selectedModels,
            image_path: selectedImage,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.message || "Comparison failed");
      }
    } catch (err) {
      console.error("Error comparing models:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsComparing(false);
    }
  };

  const getFastestModel = () => {
    if (!results || !results.results) return null;
    return results.results.reduce((fastest, current) =>
      current.inference_time < fastest.inference_time ? current : fastest
    );
  };

  const getSlowestModel = () => {
    if (!results || !results.results) return null;
    return results.results.reduce((slowest, current) =>
      current.inference_time > slowest.inference_time ? current : slowest
    );
  };

  const getSpeedRatio = () => {
    const fastest = getFastestModel();
    const slowest = getSlowestModel();
    if (!fastest || !slowest) return 0;
    return (slowest.inference_time / fastest.inference_time).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-green-200 mb-8">
            <button
              onClick={() => (window.location.href = "/")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button
              onClick={() => (window.location.href = "/classify-batik")}
              className="hover:text-white transition-colors"
            >
              Classify
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Compare Models</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">Model Comparison</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                Compare AI Models
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Compare performance and accuracy of multiple deep learning models side-by-side. Evaluate CNN, MobileNetV2, and VGG19 on the same batik pattern.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          {/* Model Selection */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Select Models to Compare
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {models.map((model) => (
                <label
                  key={model.name}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModels.includes(model.name)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  } ${selectedModels.length === 1 && selectedModels.includes(model.name) ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.name)}
                    onChange={() => handleModelToggle(model.name)}
                    disabled={selectedModels.length === 1 && selectedModels.includes(model.name)}
                    className="mr-3 text-green-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      {model.name.split("_").slice(-2).join(" ").toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {model.size_mb.toFixed(2)} MB • {model.loaded ? "✓ Loaded" : "Not loaded"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Selected: {selectedModels.length} model{selectedModels.length !== 1 ? "s" : ""} (at least 1 required)
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Select Image</h2>

                {/* Tab Selection */}
                <div className="mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab("select")}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === "select"
                          ? "border-b-2 border-green-500 text-green-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Select from Gallery
                    </button>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === "upload"
                          ? "border-b-2 border-green-500 text-green-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Upload Image
                    </button>
                  </div>
                </div>

                {/* Upload Tab */}
                {activeTab === "upload" && (
                  <div className="mb-8">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload-compare"
                      />
                      <label htmlFor="file-upload-compare" className="cursor-pointer">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="text-gray-600 font-semibold mb-2">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-sm text-gray-500">
                          JPG, JPEG or PNG
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Select Tab */}
                {activeTab === "select" && (
                  <div className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                      {queryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleImageSelect(img.path)}
                          className={`relative rounded-lg overflow-hidden border-4 transition-all transform hover:scale-105 ${
                            selectedImage === img.path
                              ? "border-green-500 shadow-lg"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <img
                            src={`${API_BASE_URL}/${img.path}`}
                            alt={img.class}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-semibold text-center">
                              {img.class}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compare Button */}
                <button
                  onClick={compareModels}
                  disabled={isComparing || selectedModels.length === 0 || (!selectedImage && !uploadedFile)}
                  className={`w-full py-5 px-6 text-lg font-bold rounded-xl transition-all duration-300 transform ${
                    isComparing || selectedModels.length === 0 || (!selectedImage && !uploadedFile)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 hover:shadow-2xl shadow-lg"
                  }`}
                >
                  {isComparing ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Comparing Models...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>📊 Compare Models</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Input Image</h2>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto rounded-xl shadow-md"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-gray-600 font-semibold">No image selected</div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {results && results.results && (
            <div className="mt-12 space-y-8">
              {/* Performance Summary */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-8">
                <h2 className="text-3xl font-bold mb-6">Performance Comparison</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-sm font-semibold mb-2">Fastest Model</div>
                    <div className="text-2xl font-bold">
                      {getFastestModel()?.model_name.split("_").slice(-2).join(" ").toUpperCase()}
                    </div>
                    <div className="text-sm mt-2">
                      {getFastestModel()?.inference_time.toFixed(4)}s
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-sm font-semibold mb-2">Slowest Model</div>
                    <div className="text-2xl font-bold">
                      {getSlowestModel()?.model_name.split("_").slice(-2).join(" ").toUpperCase()}
                    </div>
                    <div className="text-sm mt-2">
                      {getSlowestModel()?.inference_time.toFixed(4)}s
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="text-sm font-semibold mb-2">Speed Ratio</div>
                    <div className="text-2xl font-bold">{getSpeedRatio()}x</div>
                    <div className="text-sm mt-2">faster</div>
                  </div>
                </div>
              </div>

              {/* Individual Results */}
              {results.results.map((result, idx) => {
                const isFastest = result.model_name === getFastestModel()?.model_name;
                const isSlowest = result.model_name === getSlowestModel()?.model_name;

                return (
                  <div key={idx} className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {result.model_name.split("_").slice(-2).join(" ").toUpperCase()}
                        {isFastest && (
                          <span className="text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            ⚡ Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="text-sm font-normal text-red-600 bg-red-50 px-3 py-1 rounded-full">
                            🐢 Slowest
                          </span>
                        )}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {result.inference_time.toFixed(4)}s
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 mb-6">
                      <div className="text-sm font-semibold mb-2">Predicted Class</div>
                      <div className="text-3xl font-bold mb-2">{result.predicted_class}</div>
                      <div className="text-sm">Confidence: {result.confidence.toFixed(2)}%</div>
                      <div className="mt-4 bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-2 font-semibold text-gray-700">Class</th>
                            <th className="text-right py-2 font-semibold text-gray-700">Probability</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(result.probabilities)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([className, prob]) => (
                              <tr key={className} className="border-b border-gray-100">
                                <td className="py-2 font-medium text-gray-900">
                                  {className}
                                  {className === result.predicted_class && (
                                    <span className="ml-2 text-green-600">✓</span>
                                  )}
                                </td>
                                <td className="py-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-green-500 rounded-full h-1.5"
                                        style={{ width: `${prob}%` }}
                                      ></div>
                                    </div>
                                    <span className="font-semibold text-gray-700 w-14">
                                      {prob.toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
