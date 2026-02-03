"use client";
import { useState, useEffect, useRef } from "react";

export default function BatchGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("scenario2_1");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(50);
  const [seed, setSeed] = useState(-1);
  const [imageCount, setImageCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [advancedBatikPrompts, setAdvancedBatikPrompts] = useState([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const abortControllerRef = useRef(null);
  
  // Batch API states
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Load batik prompts from JSON file
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const response = await fetch("/data/batik-tiled-prompts.json");
        const data = await response.json();
        const loadedPrompts = data.motifs.map((motif) => motif.prompt);
        setAdvancedBatikPrompts(loadedPrompts);
        setIsLoadingPrompts(false);
      } catch (err) {
        console.error("Failed to load batik prompts:", err);
        setAdvancedBatikPrompts([
          "Create a traditional batik motif with intricate patterns on dark blue background with light beige accents.",
          "Generate a parang batik pattern with diagonal lines and traditional motifs.",
          "Design a kawung batik pattern with circular geometric shapes.",
        ]);
        setIsLoadingPrompts(false);
      }
    };
    loadPrompts();
  }, []);

  // Scenario options with descriptions
  const scenarioOptions = [
    {
      value: "scenario1",
      label: "Scenario 1",
      description: "Nitik - Standard",
    },
    {
      value: "scenario2",
      label: "Scenario 2",
      description: "Nitik - Tiled Patch 1",
    },
    {
      value: "scenario2_1",
      label: "Scenario 2.1",
      description: "Nitik - Tiled Patch 2",
    },
    {
      value: "scenario2_2",
      label: "Scenario 2.2",
      description: "Nitik - Tiled Patch 3",
    },
    {
      value: "scenario2_3",
      label: "Scenario 2.3",
      description: "Nitik - Tiled Patch 4",
    },
    {
      value: "scenario2_4",
      label: "Scenario 2.4",
      description: "Nitik - Tiled Patch 5",
    },
    {
      value: "scenario2_5",
      label: "Scenario 2.5",
      description: "Nitik - Tiled Patch 6",
    },
    {
      value: "scenario3_1",
      label: "Scenario 3.1",
      description: "Parang - Style 1",
    },
    {
      value: "scenario3_2",
      label: "Scenario 3.2",
      description: "Parang - Style 2",
    },
  ];

  // Randomize prompt
  const randomizePrompt = () => {
    if (advancedBatikPrompts.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * advancedBatikPrompts.length,
      );
      setPrompt(advancedBatikPrompts[randomIndex]);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setGuidanceScale(7.5);
    setSteps(50);
    setSeed(-1);
    setSelectedScenario("scenario2_1");
    setImageCount(4);
  };

  // Calculate total generations
  const totalGenerations = prompt.trim() ? imageCount : 0;

  // Create batch job using API
  const createBatchJob = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return null;
    }

    if (imageCount < 1 || imageCount > 1000) {
      setError("Please set between 1 and 1000 images");
      return null;
    }

    try {
      // Build prompts array (all same prompt for now)
      const prompts = Array(imageCount).fill(prompt);
      
      console.log(`[Batch API] Creating job with ${imageCount} prompts...`);
      
      const response = await fetch('https://service-t2i.wempyaw.com/batik_product/devt2i/batch/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: prompts,
          scenario: selectedScenario,
          steps: steps,
          guidance_scale: guidanceScale,
          seed_start: seed === -1 ? Math.floor(Math.random() * 1000000) : seed,
          negative_prompt: "blurry, bad quality, distorted, ugly, deformed"
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log(`[Batch API] Job created:`, data.job_id);
      return data.job_id;
    } catch (err) {
      console.error('[Batch API] Create job error:', err);
      throw err;
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId) => {
    try {
      const response = await fetch(`https://service-t2i.wempyaw.com/batik_product/devt2i/batch/status/${jobId}`);
      const data = await response.json();
      
      console.log(`[Batch API] Status:`, data.status, `- Progress: ${data.completed}/${data.total}`);
      
      setJobStatus(data);
      setProgress({
        current: data.completed || 0,
        total: data.total || imageCount
      });
      
      return data;
    } catch (err) {
      console.error('[Batch API] Poll status error:', err);
      throw err;
    }
  };

  // Download results
  const downloadResults = async (jobId) => {
    try {
      console.log(`[Batch API] Downloading results for job:`, jobId);
      
      // Trigger download
      const downloadUrl = `https://service-t2i.wempyaw.com/batik_product/devt2i/batch/download/${jobId}`;
      window.location.href = downloadUrl;
      
      // Note: Individual images can't be displayed in generatedImages array
      // because batch API returns ZIP file, not individual base64 images
      setGeneratedImages([{
        success: true,
        jobId: jobId,
        message: 'Results downloaded as ZIP file',
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('[Batch API] Download error:', err);
      throw err;
    }
  };

  // Generate batch
  const generateBatch = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (imageCount < 1 || imageCount > 1000) {
      setError("Please set between 1 and 1000 images");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedImages([]);
    setJobId(null);
    setJobStatus(null);
    setProgress({ current: 0, total: imageCount });

    try {
      // Create batch job
      const newJobId = await createBatchJob();
      
      if (!newJobId) {
        throw new Error('Failed to create batch job');
      }
      
      setJobId(newJobId);
      setIsPolling(true);
      
      // Start polling status
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const status = await pollJobStatus(newJobId);
          
          if (status.status === 'completed') {
            console.log('[Batch API] Job completed!');
            clearInterval(pollingIntervalRef.current);
            setIsPolling(false);
            setIsGenerating(false);
            
            // Auto-download results
            await downloadResults(newJobId);
          } else if (status.status === 'failed') {
            console.error('[Batch API] Job failed');
            clearInterval(pollingIntervalRef.current);
            setIsPolling(false);
            setIsGenerating(false);
            setError(`Batch job failed: ${status.error || 'Unknown error'}`);
          }
        } catch (err) {
          console.error('[Batch API] Polling error:', err);
        }
      }, 5000); // Poll every 5 seconds
      
    } catch (err) {
      console.error("Batch generation error:", err);
      setError(`Batch generation failed: ${err.message}`);
      setIsGenerating(false);
      setIsPolling(false);
    }
  };

  // Generate single image
  const generateSingleImage = async (item, signal) => {
    const startTime = Date.now();

    try {
      const response = await fetch("/api/advanced-batik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: item.prompt,
          guidance_scale: guidanceScale,
          steps: steps,
          seed: seed,
          scenario: selectedScenario,
        }),
        signal,
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;

      if (data.error) {
        return {
          ...item,
          success: false,
          error: data.error,
          elapsed,
        };
      }

      let imageUrl = null;
      if (data.success && data.image) {
        const mimeType = data.mimeType || "image/jpeg";
        imageUrl = `data:${mimeType};base64,${data.image}`;
      } else if (data.image_url) {
        imageUrl = data.image_url;
      } else if (data.image) {
        imageUrl = `data:image/png;base64,${data.image}`;
      }

      return {
        ...item,
        success: !!imageUrl,
        imageUrl,
        elapsed,
      };
    } catch (err) {
      if (err.name === "AbortError") {
        throw err;
      }
      return {
        ...item,
        success: false,
        error: err.message,
        elapsed: Date.now() - startTime,
      };
    }
  };

  // Stop generation
  const stopGeneration = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    setIsGenerating(false);
    console.log('[Batch API] Generation stopped by user');
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Download all images (from batch API)
  const downloadAllImages = async () => {
    if (!jobId) {
      setError('No batch job available to download');
      return;
    }
    
    try {
      await downloadResults(jobId);
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-30 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
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
          <div className="flex items-center text-sm text-amber-200 mb-8">
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
            <span className="text-white">Batch Generator</span>
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-200">
                Batch Studio
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Batch Image Generator
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Generate multiple batik images at once with different prompts and
              scenarios. Perfect for exploring variations and creating
              collections.
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
              {/* Prompt Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <svg
                      className="w-7 h-7 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Design Description
                  </h2>
                  <button
                    onClick={randomizePrompt}
                    disabled={isGenerating || isLoadingPrompts}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
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
                    {isLoadingPrompts ? "Loading..." : "Random Example"}
                  </button>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your sophisticated batik design with detailed cultural elements, specific motifs, color schemes, and symbolic meanings..."
                  className="w-full h-40 px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-base leading-relaxed"
                  disabled={isGenerating}
                />
              </div>

              {/* Scenario & Image Count Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="space-y-8">
                  {/* Scenario Selection */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                      <svg
                        className="w-6 h-6 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                      AI Scenario
                    </h2>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-3 min-w-max">
                        {scenarioOptions.map((option) => (
                          <label
                            key={option.value}
                            className={`flex-shrink-0 w-44 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedScenario === option.value
                                ? "border-amber-500 bg-amber-50 shadow-md"
                                : "border-gray-200 hover:border-amber-300 hover:shadow"
                            }`}
                          >
                            <input
                              type="radio"
                              name="scenario"
                              value={option.value}
                              checked={selectedScenario === option.value}
                              onChange={(e) =>
                                setSelectedScenario(e.target.value)
                              }
                              disabled={isGenerating}
                              className="hidden"
                            />
                            <div className="text-center">
                              <div className="font-bold text-gray-900 mb-1">
                                {option.label}
                              </div>
                              <div className="text-xs text-gray-600">
                                {option.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Image Count */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                      <svg
                        className="w-6 h-6 text-orange-600"
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
                      Number of Images
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={imageCount}
                          onChange={(e) =>
                            setImageCount(
                              Math.max(
                                1,
                                Math.min(1000, parseInt(e.target.value) || 1),
                              ),
                            )
                          }
                          disabled={isGenerating}
                          className="w-24 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                        <span className="text-gray-600">images</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={Math.min(imageCount, 100)}
                        onChange={(e) =>
                          setImageCount(parseInt(e.target.value))
                        }
                        disabled={isGenerating}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <div className="text-sm text-gray-500">
                        Generate {imageCount} image{imageCount > 1 ? "s" : ""}{" "}
                        with the same prompt and scenario (max: 1000)
                      </div>

                      {/* Quick Select Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {[1, 5, 10, 20, 50, 100, 200, 500, 1000].map((num) => (
                          <button
                            key={num}
                            onClick={() => setImageCount(num)}
                            disabled={isGenerating}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              imageCount === num
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } disabled:opacity-50`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parameters Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <svg
                      className="w-7 h-7 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    Generation Parameters
                  </h2>
                  <button
                    onClick={resetToDefaults}
                    disabled={isGenerating}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
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
                      Higher values = better quality, longer time
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
                      onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                      placeholder="-1 for random"
                      disabled={isGenerating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Use -1 for random, or specific number for reproducible
                      results
                    </div>
                  </div>
                </div>
              </div>

              {/* Generation Summary & Button */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl shadow-xl p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">Generation Summary</h3>
                    <p className="text-amber-200 mt-1">
                      {imageCount} image{imageCount > 1 ? "s" : ""} using{" "}
                      {selectedScenario}
                    </p>
                  </div>
                  {isGenerating && (
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {progress.current}/{progress.total}
                      </div>
                      <div className="text-amber-200 text-sm">completed</div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="mb-6">
                    <div className="w-full bg-amber-400/30 rounded-full h-3 mb-3">
                      <div
                        className="bg-white rounded-full h-3 transition-all duration-300"
                        style={{
                          width: `${(progress.current / progress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    
                    {/* Job Status Info */}
                    {jobStatus && (
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-amber-100">Job ID:</span>
                          <span className="font-mono">{jobId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-100">Status:</span>
                          <span className="font-semibold capitalize">{jobStatus.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-100">Progress:</span>
                          <span>{jobStatus.completed || 0}/{jobStatus.total || imageCount} ({jobStatus.progress?.toFixed(1) || 0}%)</span>
                        </div>
                        {jobStatus.failed > 0 && (
                          <div className="flex justify-between text-red-300">
                            <span>Failed:</span>
                            <span>{jobStatus.failed}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-300/50 rounded-xl">
                    <div className="flex items-center gap-2">
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
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!isGenerating ? (
                    <button
                      onClick={generateBatch}
                      disabled={!prompt.trim() || imageCount < 1}
                      className="flex-1 py-4 px-6 bg-white text-amber-600 font-bold text-lg rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
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
                      Generate {imageCount} Image{imageCount > 1 ? "s" : ""}
                    </button>
                  ) : (
                    <button
                      onClick={stopGeneration}
                      className="flex-1 py-4 px-6 bg-red-500 text-white font-bold text-lg rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-3"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Stop Generation
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <svg
                      className="w-7 h-7 text-amber-600"
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
                    Results
                  </h2>
                  {generatedImages.filter((img) => img.success).length > 0 && (
                    <button
                      onClick={downloadAllImages}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      ⬇️ Download All
                    </button>
                  )}
                </div>

                {/* Results Stats */}
                {jobStatus && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {jobStatus.completed || 0}
                      </div>
                      <div className="text-xs text-green-700">Completed</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {jobStatus.failed || 0}
                      </div>
                      <div className="text-xs text-red-700">Failed</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {jobStatus.total || imageCount}
                      </div>
                      <div className="text-xs text-amber-700">Total</div>
                    </div>
                  </div>
                )}

                {/* Batch Job Display */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {!jobId && !isGenerating && (
                    <div className="flex items-center justify-center h-60 bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-2xl border-2 border-dashed border-amber-200">
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 text-amber-400 mx-auto mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <div className="text-gray-600 font-medium">
                          No images yet
                        </div>
                        <div className="text-gray-500 text-sm">
                          Configure and start batch generation
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedImages.map((img, index) => (
                    <div
                      key={`image-${img.index}`}
                      className={`rounded-xl overflow-hidden border-2 ${
                        img.success ? "border-green-200" : "border-red-200"
                      }`}
                    >
                      {img.success && img.imageUrl ? (
                        <div className="relative">
                          <img
                            src={img.imageUrl}
                            alt={`Generated batik ${index + 1}`}
                            className="w-full h-auto"
                          />
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = img.imageUrl;
                              link.download = `batch-batik-${selectedScenario}-${img.index + 1}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow"
                          >
                            <svg
                              className="w-4 h-4 text-gray-700"
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
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50">
                          <div className="flex items-center gap-2 text-red-600 text-sm">
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
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Failed</span>
                          </div>
                          {img.error && (
                            <div className="text-red-500 text-xs mt-1 truncate">
                              {img.error}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-3 bg-gray-50">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="font-medium">
                            Image #{img.index + 1}
                          </span>
                          <span>
                            {img.elapsed
                              ? `${(img.elapsed / 1000).toFixed(1)}s`
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              💡 Batch Generation Tips
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Maximize your batch generation efficiency with these tips
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Choose Scenario
                </h3>
                <p className="text-gray-600 text-sm">
                  Each scenario produces different artistic styles. Experiment
                  to find your favorite.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🔢</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Image Count</h3>
                <p className="text-gray-600 text-sm">
                  Generate multiple images to explore variations and pick the
                  best results.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">⚙️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Fine-tune Parameters
                </h3>
                <p className="text-gray-600 text-sm">
                  Adjust guidance scale and steps for different quality levels
                  and styles.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🎲</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Random Prompts</h3>
                <p className="text-gray-600 text-sm">
                  Use the Random Example button to discover new batik design
                  ideas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
