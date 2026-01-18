"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Helper function to truncate text by character count
const truncateText = (text, maxLength = 150) => {
  if (!text) return "No description available";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const DatasetsPreview = () => {
  const [hoveredDataset, setHoveredDataset] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const carouselRef = useRef(null);

  // Fetch featured datasets from API
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await fetch("/api/datasets/featured?limit=6");
        if (response.ok) {
          const data = await response.json();
          // Ensure data is array and add default gradient
          let datasetsArray = [];
          if (Array.isArray(data)) {
            datasetsArray = data;
          } else if (data && Array.isArray(data.data)) {
            datasetsArray = data.data;
          } else {
            console.log("Datasets data is not array:", data);
            setDatasets([]);
            return;
          }
          // Add default gradient if not present
          const datasetsWithGradient = datasetsArray.map((dataset) => ({
            ...dataset,
            gradient:
              dataset.gradient || "from-amber-400 via-orange-500 to-orange-600",
          }));
          setDatasets(datasetsWithGradient);
        }
      } catch (error) {
        console.error("Error fetching datasets:", error);
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const fallbackDatasets = [
    {
      id: 1,
      name: "ImageNet-2024",
      description:
        "Large-scale dataset with over 14 million images across 20,000+ categories for object recognition research and deep learning applications.",
      size: 161061273600, // 150GB in bytes
      samples: 14200000,
      categories: ["Computer Vision", "Object Recognition"],
      access_level: "Public",
      downloadCount: "250K+",
      updated_at: "2024-01-15",
      gradient: "from-amber-400 via-orange-500 to-orange-600",
      format: "ImageNet",
      license: "Custom",
    },
    {
      id: 2,
      name: "COCO-Enhanced",
      description:
        "Extended version of MS COCO dataset with additional annotations for instance segmentation, keypoint detection, and panoptic understanding tasks.",
      size: 48318382080, // 45GB in bytes
      samples: 330000,
      categories: ["Segmentation", "Object Detection"],
      access_level: "Registered",
      downloadCount: "125K+",
      updated_at: "2023-11-20",
      gradient: "from-amber-400 via-orange-500 to-orange-600",
      format: "COCO JSON",
      license: "CC BY 4.0",
    },
    {
      id: 3,
      name: "Artistic Styles DB",
      description:
        "Curated collection of artistic images spanning various styles, periods, and techniques for neural style transfer and artistic AI research.",
      size: 12884901888, // 12GB in bytes
      samples: 85000,
      categories: ["Art", "Style Transfer"],
      access_level: "Premium",
      downloadCount: "45K+",
      updated_at: "2024-02-10",
      gradient: "from-amber-400 via-orange-500 to-orange-600",
      format: "PNG/JPG",
      license: "MIT",
    },
  ];

  const displayDatasets = loading
    ? []
    : datasets.length > 0
    ? datasets
    : fallbackDatasets;

  // Responsive items per page
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1); // Mobile
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2); // Tablet
      } else {
        setItemsPerPage(3); // Desktop
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const maxIndex = Math.max(0, displayDatasets.length - itemsPerPage);

  const scrollToIndex = (index) => {
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Helper functions from datasets page
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "N/A";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)}GB`;
  };

  const formatNumber = (num) => {
    if (!num) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGradientClass = (gradientString) => {
    return gradientString || "from-amber-400 via-orange-500 to-orange-600";
  };

  const getAccessColor = (accessType) => {
    switch (accessType) {
      case "Public":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "Registered":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-gradient-to-r from-pink-200 to-orange-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 rounded-full mb-6">
            <svg
              className="w-4 h-4 text-amber-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
            <span className="text-sm font-semibold text-amber-800">
              Research Datasets
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Curated Datasets
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Access high-quality, well-annotated datasets for training and
            benchmarking your computer vision models with confidence.
          </p>
        </div>

        {/* Datasets Carousel Container */}
        <div className="relative mb-8 md:mb-10 py-6">
          {/* Navigation buttons - only show if more than itemsPerPage */}
          {displayDatasets.length > itemsPerPage && (
            <>
              {/* Previous Button - Left Side */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0 || loading}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
                  currentIndex === 0 || loading
                    ? "opacity-0 cursor-not-allowed pointer-events-none"
                    : "hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:scale-110"
                }`}
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Next Button - Right Side */}
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex || loading}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
                  currentIndex >= maxIndex || loading
                    ? "opacity-0 cursor-not-allowed pointer-events-none"
                    : "hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:scale-110"
                }`}
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
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
              </button>
            </>
          )}

          {/* Datasets Carousel */}
          <div className="overflow-hidden px-8 sm:px-12 py-4" ref={carouselRef}>
            <div
              className="flex transition-transform duration-500 ease-out gap-8"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerPage)
                }%)`,
              }}
            >
              {loading ? (
                // Loading skeleton with orange theme
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex-shrink-0"
                    style={{
                      width: `calc(${100 / itemsPerPage}% - ${
                        ((itemsPerPage - 1) * 32) / itemsPerPage
                      }px)`,
                    }}
                  >
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      {/* Header skeleton with orange gradient */}
                      <div className="h-40 bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 relative overflow-hidden">
                        {/* Grid skeleton overlay - same as page.js */}
                        <div className="absolute inset-0 p-4">
                          <div className="grid grid-cols-4 gap-2 h-full opacity-30">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-white/40 rounded-lg backdrop-blur-sm animate-pulse"
                                style={{ animationDelay: `${i * 100}ms` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        {/* Bottom stats skeleton */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                          <div className="flex justify-between">
                            <div className="h-4 w-24 bg-white/50 rounded animate-pulse"></div>
                            <div className="h-4 w-16 bg-white/50 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 rounded mb-3 w-3/4 animate-pulse"></div>
                        <div className="space-y-2 mb-6">
                          <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="h-5 bg-gray-200 rounded mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="h-5 bg-gray-200 rounded mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : displayDatasets.length === 0 ? (
                <div className="w-full text-center py-12">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100 max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Datasets Available
                    </h3>
                    <p className="text-gray-500">
                      Check back later for new datasets!
                    </p>
                  </div>
                </div>
              ) : (
                displayDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="group relative flex-shrink-0"
                    style={{
                      width: `calc(${100 / itemsPerPage}% - ${
                        ((itemsPerPage - 1) * 32) / itemsPerPage
                      }px)`,
                    }}
                    onMouseEnter={() => setHoveredDataset(dataset.id)}
                    onMouseLeave={() => setHoveredDataset(null)}
                  >
                    {/* Dataset Card */}
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                      {/* Header with Preview */}
                      <div className="relative h-40 overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(
                            dataset.gradient
                          )} transition-transform duration-700 ${
                            hoveredDataset === dataset.id ? "scale-110" : ""
                          }`}
                        ></div>

                        {/* Sample Image / Gradient Background */}
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: dataset.preview_image
                              ? `url(${dataset.preview_image})`
                              : `linear-gradient(135deg, #fb923c, #f59e0b)`,
                          }}
                        />

                        {/* Orange Glass Grid Overlay */}
                        <div className="absolute inset-0 p-4 pointer-events-none">
                          <div className="grid grid-cols-5 gap-3 h-full">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className="
                                rounded-lg
                                bg-orange-300/20
                                border border-orange-200/30
                                shadow-inner
                              "
                              />
                            ))}
                          </div>
                        </div>

                        {/* Soft Hover Highlight (bukan gelap) */}
                        <div
                          className="
                          absolute inset-0
                          bg-gradient-to-br from-orange-400/20 to-orange-500/10
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300
                        "
                        />

                        {/* Access Badge */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getAccessColor(
                              dataset.access_level
                            )}`}
                          >
                            {dataset.access_level || "Public"}
                          </span>
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                          <div className="flex justify-between text-white text-sm">
                            <span className="font-medium">
                              {formatNumber(dataset.samples)} samples
                            </span>
                            <span className="font-medium">
                              {formatFileSize(dataset.size)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Title & Downloads */}
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {dataset.name || "Untitled Dataset"}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 ml-2">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                              />
                            </svg>
                            {dataset.downloadCount || "N/A"}
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className="text-gray-600 text-sm leading-relaxed mb-4"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 7,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {dataset.description || "No description available"}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {dataset.categories?.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Categories
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {formatNumber(dataset.samples)}
                            </div>
                            <div className="text-xs text-gray-600">Samples</div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-2 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span className="font-medium">
                              {dataset.format || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>License:</span>
                            <span className="font-medium">
                              {dataset.license || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Updated:</span>
                            <span className="font-medium">
                              {dataset.updated_at || dataset.created_at
                                ? new Date(
                                    dataset.updated_at || dataset.created_at
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          <button
                            onClick={() => {
                              if (dataset.file_url) {
                                window.open(dataset.file_url, "_blank");
                              } else {
                                window.location.href = `/datasets/${dataset.id}/download`;
                              }
                            }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="flex items-center justify-center gap-2">
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
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                              </svg>
                              <span>Download Dataset</span>
                            </div>
                          </button>

                          <button
                            onClick={() =>
                              router.push(`/datasets/${dataset.id}`)
                            }
                            className="w-full py-2 px-4 text-gray-700 font-medium text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Dataset ID */}
                      <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full flex items-center justify-center">
                        #
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Indicators - Only show if more than itemsPerPage */}
          {!loading && displayDatasets.length > itemsPerPage && (
            <div className="flex justify-center gap-1.5 md:gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 md:w-8 bg-gradient-to-r from-amber-500 to-orange-500"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 md:mt-10 text-center">
          <button
            onClick={() => {
              console.log("Navigating to datasets page");
              window.location.href = "/datasets";
            }}
            className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <span>Browse All Datasets</span>
            <svg
              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DatasetsPreview;
