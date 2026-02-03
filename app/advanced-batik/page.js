"use client";
import { useState, useEffect } from "react";

export default function AdvancedBatikPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("scenario2_1");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(50);
  const [seed, setSeed] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [advancedBatikPrompts, setAdvancedBatikPrompts] = useState([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);

  // Load batik prompts from JSON file
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const response = await fetch('/data/batik-tiled-prompts.json');
        const data = await response.json();
        const prompts = data.motifs.map(motif => motif.prompt);
        setAdvancedBatikPrompts(prompts);
        setIsLoadingPrompts(false);
      } catch (err) {
        console.error('Failed to load batik prompts:', err);
        // Fallback to default prompts if loading fails
        setAdvancedBatikPrompts([
          "Create a traditional batik motif with intricate patterns on dark blue background with light beige accents.",
        ]);
        setIsLoadingPrompts(false);
      }
    };
    loadPrompts();
  }, []);

  // Scenario options with descriptions
  const scenarioOptions = [
    {
      value: "scenario2",
      label: "Scenario 2",
      description: "Tiled Patch 1",
    },
    {
      value: "scenario2_1",
      label: "Scenario 2.1",
      description: "Tiled Patch 2",
    },
    {
      value: "scenario2_2",
      label: "Scenario 2.2",
      description: "Tiled Patch 3",
    },
    {
      value: "scenario2_3",
      label: "Scenario 2.3",
      description: "Tiled Patch 4",
    },
    {
      value: "scenario2_4",
      label: "Scenario 2.4",
      description: "Tiled Patch 5",
    },
    {
      value: "scenario2_5",
      label: "Scenario 2.5",
      description: "Tiled Patch 6",
    },
  ];

  const randomizePrompt = () => {
    if (advancedBatikPrompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * advancedBatikPrompts.length);
      setPrompt(advancedBatikPrompts[randomIndex]);
    }
  };

  const resetToDefaults = () => {
    setGuidanceScale(7.5);
    setSteps(50);
    setSeed(-1);
    setSelectedScenario("scenario2_1");
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedImage(null);
    setResponseData(null);

    try {
      const response = await fetch("/api/advanced-batik", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          guidance_scale: guidanceScale,
          steps: steps,
          seed: seed,
          scenario: selectedScenario,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponseData(data);

      // Check if there's an error in the response
      if (data.error) {
        setError(
          `API Error: ${data.error}${data.details ? ` - ${data.details}` : ""}`
        );
        return;
      }

      // Handle different response formats
      if (data.success && data.image) {
        // New format: base64 image with mimeType
        const mimeType = data.mimeType || "image/jpeg";
        setGeneratedImage(`data:${mimeType};base64,${data.image}`);
      } else if (data.image_url) {
        // Direct image URL
        setGeneratedImage(data.image_url);
      } else if (data.image) {
        // Base64 data without wrapper
        setGeneratedImage(`data:image/png;base64,${data.image}`);
      } else if (data.output_image) {
        // Alternative response structure
        setGeneratedImage(data.output_image);
      } else {
        console.log("Full response data:", data);
        setError(
          "No image data received from API. Response: " + JSON.stringify(data)
        );
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
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
            <span className="text-white">Advanced Batik</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-200">
                Advanced Studio
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Batik Text To Image: Nitik
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Unlock the full potential of AI batik generation with advanced
              parameters and multiple rendering scenarios. Create masterpieces
              with precision control.
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
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Advanced Batik Creation
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Fine-tune every aspect of your batik generation with
                    professional-grade controls and multiple AI scenarios.
                  </p>
                </div>

                {/* Prompt Input */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-lg font-semibold text-gray-800">
                      Design Description
                    </label>
                    <button
                      onClick={randomizePrompt}
                      disabled={isGenerating || isLoadingPrompts || advancedBatikPrompts.length === 0}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {isLoadingPrompts ? 'Loading...' : 'Advanced Examples'}
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your sophisticated batik design with detailed cultural elements, specific motifs, color schemes, and symbolic meanings..."
                    className="w-full h-40 px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-base leading-relaxed"
                    disabled={isGenerating}
                  />
                </div>

                {/* Advanced Parameters */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Scenario Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      AI Scenario
                    </label>
                    <div className="space-y-2">
                      {scenarioOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name="scenario"
                            value={option.value}
                            checked={selectedScenario === option.value}
                            onChange={(e) =>
                              setSelectedScenario(e.target.value)
                            }
                            className="mt-1 text-amber-600"
                            disabled={isGenerating}
                          />
                          <div>
                            <div className="font-semibold text-gray-800">
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              {option.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Parameter Controls */}
                  <div className="space-y-6">
                    {/* Guidance Scale */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Guidance Scale: {guidanceScale}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={guidanceScale}
                        onChange={(e) =>
                          setGuidanceScale(parseFloat(e.target.value))
                        }
                        disabled={isGenerating}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Controls how closely the AI follows your prompt
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Generation Steps: {steps}
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        disabled={isGenerating}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Higher values = better quality, longer generation time
                      </div>
                    </div>

                    {/* Seed */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Seed
                      </label>
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) =>
                          setSeed(parseInt(e.target.value) || -1)
                        }
                        placeholder="-1 for random"
                        disabled={isGenerating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Use -1 for random, or specific number for reproducible
                        results
                      </div>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={resetToDefaults}
                      disabled={isGenerating}
                      className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className={`w-full py-5 px-6 text-lg font-bold rounded-xl transition-all duration-300 transform ${isGenerating || !prompt.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-105 hover:shadow-2xl shadow-lg"
                    }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="w-6 h-6 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Crafting Masterpiece...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>⚡ Generate Advanced Batik</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <svg
                    className="w-7 h-7 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Your Masterpiece
                </h2>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">Error:</span>
                    </div>
                    <div className="text-red-600 mt-1">{error}</div>
                  </div>
                )}

                {/* Loading State */}
                {isGenerating && (
                  <div className="flex items-center justify-center h-80 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <div className="text-amber-800 font-bold text-lg mb-2">
                        ⚡ Advanced Processing
                      </div>
                      <div className="text-amber-700 text-sm">
                        Using {selectedScenario} with {steps} steps...
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Image */}
                {generatedImage && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={generatedImage}
                        alt="Generated Advanced Batik Pattern"
                        className="w-full h-auto object-contain bg-gray-100"
                        onError={(e) => {
                          console.error("Image load error:", e);
                          setError("Failed to load generated image");
                        }}
                      />
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = generatedImage;
                        link.download = `advanced-batik-${selectedScenario}-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Masterpiece
                    </button>

                    {/* Generation Info */}
                    <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <strong>Scenario:</strong> {selectedScenario}
                      </div>
                      <div>
                        <strong>Guidance:</strong> {guidanceScale}
                      </div>
                      <div>
                        <strong>Steps:</strong> {steps}
                      </div>
                      <div>
                        <strong>Seed:</strong> {seed}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!generatedImage && !isGenerating && !error && (
                  <div className="flex items-center justify-center h-80 bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-2xl border-2 border-dashed border-amber-200">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-amber-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <div className="text-gray-700 font-bold text-lg mb-2">
                        ⚡ Ready for Advanced Creation
                      </div>
                      <div className="text-gray-600 text-sm">
                        Configure parameters and generate
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              ⚡ Advanced Creation Tips
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Master the art of AI-driven batik creation with these professional
              techniques
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Scenario Selection
                </h3>
                <p className="text-gray-600 text-sm">
                  Each scenario offers different artistic interpretations.
                  Experiment to find your preferred style.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">⚙️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Parameter Tuning
                </h3>
                <p className="text-gray-600 text-sm">
                  Higher guidance scale = more prompt adherence. More steps =
                  better quality but longer processing.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🎨</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Detailed Prompts
                </h3>
                <p className="text-gray-600 text-sm">
                  Include specific cultural references, color descriptions, and
                  symbolic meanings for best results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
