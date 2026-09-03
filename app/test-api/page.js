"use client";
import ProjectInfoPanel from "@/components/demos/ProjectInfoPanel";

import { useState, useEffect } from "react";
import { withBasePath } from "@/lib/basePath";

export default function TestApiPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [batikPrompts, setBatikPrompts] = useState([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);

  // Load batik prompts from JSON file
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const response = await fetch('/data/batik-nitik-prompts.json');
        const data = await response.json();
        const prompts = data.motifs.map(motif => motif.prompt);
        setBatikPrompts(prompts);
        setIsLoadingPrompts(false);
      } catch (err) {
        console.error('Failed to load batik prompts:', err);
        // Fallback to default prompts if loading fails
        setBatikPrompts([
          "Create a traditional batik motif with intricate patterns on dark blue background with light beige accents.",
        ]);
        setIsLoadingPrompts(false);
      }
    };
    loadPrompts();
  }, []);

  const randomizePrompt = () => {
    if (batikPrompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * batikPrompts.length);
      setPrompt(batikPrompts[randomIndex]);
    }
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
      const response = await fetch("/api/generate-batik", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          guidance_scale: 7.5,
          steps: 50,
          seed: -1,
          scenario: "scenario1",
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
            <span className="text-white">Test API</span>
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-200">
                Indonesian Heritage
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Batik Creator Studio
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Create stunning traditional Indonesian batik patterns with the
              power of artificial intelligence. Preserve and celebrate our
              cultural heritage through modern technology.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl space-y-8">
        
        {/* 1. Input Section: Design Your Batik Masterpiece */}
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Design Your Batik Masterpiece
            </h2>
            <p className="text-gray-600 text-lg">
              Tell us about the batik design you envision. Describe the
              patterns, symbols, and meanings you&apos;d like to see come to
              life.
            </p>
          </div>

          {/* Prompt Input */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-semibold text-gray-800">
                Describe Your Vision
              </label>
              <button
                onClick={randomizePrompt}
                disabled={isGenerating || isLoadingPrompts || batikPrompts.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                {isLoadingPrompts ? 'Loading...' : 'Inspire Me'}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the batik pattern you want to create - mention colors, shapes, cultural symbols, or traditional motifs like flowers, geometric patterns, or nature elements..."
              className="w-full h-36 px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none text-gray-700 placeholder-gray-400 text-base leading-relaxed"
              disabled={isGenerating}
            />
            <div className="text-sm text-gray-500 mt-3">
               Click &quot;Inspire Me&quot; for traditional examples, or describe
              your own unique vision
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-5 px-6 text-lg font-bold rounded-xl transition-all duration-300 transform ${isGenerating || !prompt.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 hover:shadow-2xl shadow-lg"
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
                <span>Creating Your Batik...</span>
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span> Create My Batik</span>
              </div>
            )}
          </button>
        </div>

        {/* 2. Output Section: Your Batik Creation */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <svg
              className="w-8 h-8 text-orange-600"
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
            Your Batik Creation
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
            <div className="flex items-center justify-center h-96 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300">
              <div className="text-center">
                <svg
                  className="w-20 h-20 text-amber-600 animate-spin mx-auto mb-6"
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
                <div className="text-amber-800 font-bold text-xl mb-2">
                   Weaving Your Masterpiece
                </div>
                <div className="text-amber-700 text-base">
                  Our AI artisan is carefully crafting your unique batik
                  design...
                </div>
                <div className="text-amber-600 text-sm mt-3">
                  This may take a few moments as we create something truly
                  special
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
                  alt="Generated Batik Pattern"
                  className="w-full h-auto max-h-96 object-contain bg-gray-100"
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
                  link.download = `batik-pattern-${Date.now()}.png`;
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
                Download Image
              </button>
            </div>
          )}

          {/* Empty State */}
          {!generatedImage && !isGenerating && !error && (
            <div className="flex items-center justify-center h-96 bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-2xl border-2 border-dashed border-amber-200">
              <div className="text-center">
                <svg
                  className="w-20 h-20 text-amber-400 mx-auto mb-6"
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
                <div className="text-gray-700 font-bold text-xl mb-2">
                   Ready to Create
                </div>
                <div className="text-gray-600 text-base">
                  Describe your dream batik design above
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  Or click &quot;Inspire Me&quot; for traditional examples
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Traditional Batik Info */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Traditional Batik Knowledge
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-gray-800 mb-2">
                Famous Batik Motifs:
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div>
                  • <strong>Parang:</strong> Diagonal wave patterns
                  symbolizing strength
                </div>
                <div>
                  • <strong>Kawung:</strong> Circular motifs representing
                  four cardinal directions
                </div>
                <div>
                  • <strong>Mega Mendung:</strong> Cloud patterns
                  symbolizing patience
                </div>
                <div>
                  • <strong>Sekar Jagad:</strong> Floral universe
                  representing diversity
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-gray-800 mb-2">
                Cultural Elements to Include:
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div>
                  • Symbolic meanings (prosperity, protection, wisdom)
                </div>
                <div>
                  • Traditional color schemes (indigo, brown, gold)
                </div>
                <div>
                  • Natural elements (flowers, animals, geometric shapes)
                </div>
                <div>
                  • Regional influences (Javanese, Balinese, Sumatra)
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      </section>
    
      {/* Floating Project Info Panel */}
      <ProjectInfoPanel projectId="019bbed6-aed3-7951-aa77-34c31d5f3dd2" />
</div>
  );
}
