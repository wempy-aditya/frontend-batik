"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_CLASSIFY_API_URL || 'http://localhost:5002';

export default function ClassifyBatikPage() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [queryImages, setQueryImages] = useState([]);
  const [batikClasses, setBatikClasses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("select"); // "select" or "upload"

  useEffect(() => {
    fetchModels();
    fetchQueryImages();
    fetchClasses();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models`);
      const data = await response.json();
      if (data.success) {
        setModels(data.models);
        if (data.models.length > 0) {
          setSelectedModel(data.models[0].name);
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

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes`);
      const data = await response.json();
      if (data.success) {
        setBatikClasses(data.classes);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const handleImageSelect = (imagePath) => {
    setSelectedImage(imagePath);
    setUploadedFile(null);
    setImagePreview(`${API_BASE_URL}/${imagePath}`);
    setResult(null);
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
      setResult(null);
      setError("");
    }
  };

  const classifyImage = async () => {
    if (!selectedModel) {
      setError("Please select a model");
      return;
    }

    if (!selectedImage && !uploadedFile) {
      setError("Please select or upload an image");
      return;
    }

    setIsClassifying(true);
    setError("");
    setResult(null);

    try {
      let response;

      if (uploadedFile) {
        // Upload and classify
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("model_name", selectedModel);

        response = await fetch(`${API_BASE_URL}/api/predict/upload`, {
          method: "POST",
          body: formData,
        });
      } else {
        // Classify selected image
        response = await fetch(`${API_BASE_URL}/api/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_name: selectedModel,
            image_path: selectedImage,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || "Classification failed");
      }
    } catch (err) {
      console.error("Error classifying image:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsClassifying(false);
    }
  };

  const getProgressBarColor = (confidence) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 70) return "bg-blue-500";
    if (confidence >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-blue-200 mb-8">
            <button
              onClick={() => (window.location.href = "/")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Batik Classification</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">AI Classification</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                Batik Pattern Classification
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Classify batik patterns using advanced deep learning models. Choose from CNN, MobileNetV2, or VGG19 for accurate pattern recognition across 16 traditional batik classes.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Classify Batik Pattern
                </h2>

                {/* Model Selection */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-gray-800 mb-4">Select Model</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {models.map((model) => (
                      <label
                        key={model.name}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedModel === model.name
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="model"
                          value={model.name}
                          checked={selectedModel === model.name}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="mr-3 text-blue-600"
                        />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {model.name.split("_").slice(-2).join(" ").toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {model.size_mb.toFixed(2)} MB
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tab Selection */}
                <div className="mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab("select")}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === "select"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Select from Gallery
                    </button>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === "upload"
                          ? "border-b-2 border-blue-500 text-blue-600"
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
                    <label className="block text-lg font-semibold text-gray-800 mb-4">Upload Your Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="text-gray-600 font-semibold mb-2">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-sm text-gray-500">
                          JPG, JPEG or PNG (MAX. 10MB)
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Select Tab */}
                {activeTab === "select" && (
                  <div className="mb-8">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                      Select from Query Images
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                      {queryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleImageSelect(img.path)}
                          className={`relative rounded-lg overflow-hidden border-4 transition-all transform hover:scale-105 ${
                            selectedImage === img.path
                              ? "border-blue-500 shadow-lg"
                              : "border-gray-200 hover:border-blue-300"
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

                {/* Classify Button */}
                <button
                  onClick={classifyImage}
                  disabled={isClassifying || (!selectedImage && !uploadedFile)}
                  className={`w-full py-5 px-6 text-lg font-bold rounded-xl transition-all duration-300 transform ${
                    isClassifying || (!selectedImage && !uploadedFile)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:scale-105 hover:shadow-2xl shadow-lg"
                  }`}
                >
                  {isClassifying ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Classifying Pattern...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>🔍 Classify Batik</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Preview & Result Section */}
            <div className="space-y-8">
              {/* Image Preview */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Input Image
                </h2>

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto rounded-xl shadow-md"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-gray-600 font-semibold">No image selected</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
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

              {/* Result Display */}
              {result && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Classification Result</h2>
                  
                  {/* Prediction Summary */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-6 mb-6">
                    <div className="text-sm font-semibold mb-2">Predicted Class</div>
                    <div className="text-3xl font-bold mb-4">{result.predicted_class}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Confidence: {result.confidence.toFixed(2)}%</span>
                      <span>Time: {result.inference_time.toFixed(4)}s</span>
                    </div>
                    <div className="mt-4 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Probability Table */}
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 text-sm font-semibold text-gray-700">#</th>
                          <th className="text-left py-3 text-sm font-semibold text-gray-700">Class</th>
                          <th className="text-right py-3 text-sm font-semibold text-gray-700">Probability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.probabilities)
                          .sort((a, b) => b[1] - a[1])
                          .map(([className, prob], idx) => (
                            <tr
                              key={className}
                              className={`border-b border-gray-100 ${
                                className === result.predicted_class ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="py-3 text-sm text-gray-600">{idx + 1}</td>
                              <td className="py-3 text-sm font-medium text-gray-900">
                                {className}
                                {className === result.predicted_class && (
                                  <span className="ml-2 text-blue-600">✓</span>
                                )}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`${getProgressBarColor(prob)} rounded-full h-2 transition-all duration-500`}
                                      style={{ width: `${prob}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700 w-16">
                                    {prob.toFixed(2)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              🔍 About Batik Classification
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Our AI models can recognize 16 traditional Indonesian batik patterns with high accuracy
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {batikClasses.slice(0, 8).map((cls) => (
                <div key={cls.index} className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">{cls.index + 1}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{cls.name}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => window.location.href = "/compare-batik"}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Compare Multiple Models →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
