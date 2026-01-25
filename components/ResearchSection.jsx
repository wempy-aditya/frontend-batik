"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import PublicationModal from "./PublicationModal";
import CitationExportModal from "./CitationExportModal";

// Helper function to truncate text by character count
const truncateText = (text, maxLength = 200) => {
  if (!text) return "No description available";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const ResearchSection = () => {
  const [hoveredPaper, setHoveredPaper] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [citationPaper, setCitationPaper] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const carouselRef = useRef(null);

  // Fetch featured publications from API
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch("/api/publications/featured?limit=5");
        if (response.ok) {
          const data = await response.json();
          // Ensure data is array
          if (Array.isArray(data)) {
            setPublications(data);
          } else if (data && Array.isArray(data.data)) {
            setPublications(data.data);
          } else {
            console.log("Publications data is not array:", data);
            setPublications([]);
          }
        }
      } catch (error) {
        console.error("Error fetching publications:", error);
        setPublications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  const fallbackPublications = [
    {
      id: 1,
      title:
        "Attention-Based Neural Networks for Image Classification: A Comprehensive Survey",
      abstract:
        "This paper presents a comprehensive survey of attention mechanisms in neural networks for image classification tasks. We analyze various attention architectures, including spatial attention, channel attention, and self-attention mechanisms, providing insights into their effectiveness across different datasets and computational requirements.",
      authors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. Elena Kovač"],
      venue: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
      year: 2024,
      citations: 127,
      category: "Survey Paper",
      doi: "10.1109/TPAMI.2024.3156789",
      keywords: [
        "Attention Mechanisms",
        "Deep Learning",
        "Image Classification",
        "Neural Networks",
      ],
      status: "Published",
    },
    {
      id: 2,
      title:
        "Generative Adversarial Networks for High-Resolution Image Synthesis: Recent Advances",
      abstract:
        "We explore recent developments in generative adversarial networks (GANs) for creating high-resolution, photorealistic images. Our work introduces a novel progressive training strategy that significantly improves training stability and output quality while reducing computational costs by 40%.",
      authors: ["Dr. James Park", "Dr. Lisa Wang", "Prof. David Thompson"],
      venue:
        "Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
      year: 2024,
      citations: 89,
      category: "Conference Paper",
      doi: "10.1109/CVPR.2024.00892",
      keywords: ["GANs", "Image Synthesis", "Deep Learning", "Computer Vision"],
      status: "Published",
    },
    {
      id: 3,
      title: "Transfer Learning in Medical Image Analysis: A Systematic Review",
      abstract:
        "This systematic review examines the application of transfer learning techniques in medical imaging, demonstrating significant improvements in diagnostic accuracy across radiology, pathology, and dermatology domains with limited training data.",
      authors: ["Dr. Amanda Foster", "Prof. Robert Kim", "Dr. Maria Santos"],
      venue: "Medical Image Analysis Journal",
      year: 2024,
      citations: 156,
      category: "Journal Article",
      doi: "10.1016/j.media.2024.102678",
      keywords: [
        "Transfer Learning",
        "Medical Imaging",
        "Deep Learning",
        "Healthcare AI",
      ],
      status: "Published",
    },
    {
      id: 4,
      title:
        "Real-Time Object Detection for Autonomous Vehicles Using Efficient Neural Architectures",
      abstract:
        "We propose a novel efficient neural architecture for real-time object detection in autonomous driving scenarios, achieving 98% accuracy while maintaining 60 FPS processing speed on embedded devices.",
      authors: [
        "Dr. Kevin Zhang",
        "Dr. Sophie Laurent",
        "Prof. Thomas Mueller",
      ],
      venue: "IEEE International Conference on Robotics and Automation (ICRA)",
      year: 2024,
      citations: 73,
      category: "Conference Paper",
      doi: "10.1109/ICRA.2024.01234",
      keywords: [
        "Object Detection",
        "Autonomous Vehicles",
        "Real-Time Processing",
        "Edge Computing",
      ],
      status: "Published",
    },
    {
      id: 5,
      title:
        "Explainable AI in Computer Vision: Bridging the Gap Between Performance and Interpretability",
      abstract:
        "This work addresses the interpretability challenge in computer vision models by introducing a novel framework that provides human-understandable explanations while maintaining state-of-the-art performance across multiple benchmarks.",
      authors: ["Dr. Rachel Green", "Prof. Daniel Patel", "Dr. Yuki Tanaka"],
      venue: "Neural Information Processing Systems (NeurIPS)",
      year: 2024,
      citations: 201,
      category: "Conference Paper",
      doi: "10.5555/neurips.2024.5678",
      keywords: [
        "Explainable AI",
        "Interpretability",
        "Computer Vision",
        "Neural Networks",
      ],
      status: "Published",
    },
  ];

  const displayPublications = loading
    ? []
    : publications.length > 0
      ? publications
      : fallbackPublications;

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

  const maxIndex = Math.max(0, displayPublications.length - itemsPerPage);

  const scrollToIndex = (index) => {
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="py-12 md:py-16 bg-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.5'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3Cpath d='M10 0v20'/%3E%3Cpath d='M0 10h20'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 backdrop-blur-sm rounded-full border border-amber-200 mb-6">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-sm font-semibold text-amber-800">
              Research Publications
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Research
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore cutting-edge research contributions advancing the field of
            computer vision and artificial intelligence.
          </p>
        </div>

        {/* Publications Carousel */}
        <div className="relative mb-8 md:mb-10 py-6 px-2">
          {/* Previous Button - Left Side */}
          <button
            onClick={handlePrevious}
            disabled={
              currentIndex === 0 || loading || displayPublications.length === 0
            }
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
              currentIndex === 0 || loading || displayPublications.length === 0
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
            disabled={
              currentIndex >= maxIndex ||
              loading ||
              displayPublications.length === 0
            }
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
              currentIndex >= maxIndex ||
              loading ||
              displayPublications.length === 0
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
          {/* Carousel Container */}
          <div className="overflow-hidden px-6 sm:px-8 py-4" ref={carouselRef}>
            {loading ? (
              // Loading skeleton
              <div className="flex gap-6">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex-shrink-0"
                    style={{
                      width: `calc(${100 / itemsPerPage}% - ${
                        ((itemsPerPage - 1) * 24) / itemsPerPage
                      }px)`,
                    }}
                  >
                    <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-gray-100 h-full animate-pulse">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded mb-2 w-full"></div>
                      <div className="h-5 bg-gray-200 rounded mb-3 w-2/3"></div>
                      <div className="space-y-2 mb-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <div className="h-9 flex-1 bg-gray-200 rounded-lg"></div>
                        <div className="h-9 flex-1 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayPublications.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md mx-auto">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Publications Available
                  </h3>
                  <p className="text-gray-400">
                    Check back later for new research papers!
                  </p>
                </div>
              </div>
            ) : (
              <div
                ref={carouselRef}
                className="flex transition-transform duration-500 ease-out gap-6"
                style={{
                  transform: `translateX(-${
                    currentIndex * (100 / itemsPerPage)
                  }%)`,
                }}
              >
                {displayPublications.map((paper, index) => (
                  <div
                    key={paper.id}
                    className="flex-shrink-0 group relative"
                    style={{
                      width: `calc(${100 / itemsPerPage}% - ${
                        ((itemsPerPage - 1) * 24) / itemsPerPage
                      }px)`,
                    }}
                    onMouseEnter={() => setHoveredPaper(paper.id)}
                    onMouseLeave={() => setHoveredPaper(null)}
                  >
                    {/* Paper Card */}
                    <div
                      className={`relative bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-100 transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col ${
                        hoveredPaper === paper.id ? "shadow-lg" : ""
                      }`}
                    >
                      {/* Gradient glow on hover */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-15 blur-[2px] transition-all duration-700"></div>

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <span className="inline-block px-3 py-1 text-sm font-semibold text-amber-700 bg-amber-100 rounded-full">
                              {paper.category || "Research"}
                            </span>
                          </div>

                          <div className="text-sm text-gray-500 font-medium">
                            {paper.year || "N/A"}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-amber-600 transition-colors duration-300">
                          {truncateText(paper.title, 100) ||
                            "Untitled Publication"}
                        </h3>

                        {/* Abstract - Truncated */}
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">
                          {truncateText(paper.abstract, 120)}
                        </p>

                        {/* Authors */}
                        {paper.authors || paper.author ? (
                          <div className="mb-3">
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                              Authors:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(paper.authors)
                                ? paper.authors
                                : [paper.authors || paper.author]
                              )
                                .slice(0, 3)
                                .map((author, index) => (
                                  <span
                                    key={index}
                                    className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                                  >
                                    {author}
                                  </span>
                                ))}
                              {(Array.isArray(paper.authors)
                                ? paper.authors
                                : []
                              ).length > 3 && (
                                <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                  +{paper.authors.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Keywords */}
                        {paper.keywords && paper.keywords.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {paper.keywords
                                .slice(0, 4)
                                .map((keyword, index) => (
                                  <span
                                    key={index}
                                    className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Publication Info - Clear Labels */}
                        <div className="space-y-2.5 mb-4 pt-4 border-t border-gray-200">
                          {/* Venue */}
                          {paper.venue && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                                Venue:
                              </span>
                              <span className="text-sm text-gray-600 leading-relaxed">
                                {truncateText(paper.venue, 120)}
                              </span>
                            </div>
                          )}

                          {/* Citations */}
                          {paper.citations !== undefined &&
                            paper.citations !== null && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700">
                                  Total Citations:
                                </span>
                                <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                  {paper.citations}
                                </span>
                              </div>
                            )}

                          {/* DOI */}
                          {paper.doi && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                                DOI:
                              </span>
                              <a
                                href={`https://doi.org/${paper.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-mono break-all"
                              >
                                {paper.doi}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons - Grid Layout */}
                        <div className="mt-auto pt-4 space-y-2">
                          {/* Main Actions: Read + Cite + Copy + Open */}
                          <div className="grid grid-cols-12 gap-2">
                            {/* Read Button - 5 columns */}
                            <button
                              onClick={() =>
                                router.push(
                                  `/publications/${paper.uuid || paper.id}`,
                                )
                              }
                              className="col-span-5 py-3 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-1.5"
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <span>Read</span>
                            </button>

                            {/* Cite Button - 3 columns */}
                            {paper.doi && (
                              <button
                                onClick={() => setCitationPaper(paper)}
                                className="col-span-3 py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-1"
                                title="Export Citation"
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
                                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                  />
                                </svg>
                                <span className="hidden sm:inline">Cite</span>
                              </button>
                            )}

                            {/* Copy DOI - 2 columns (icon only) */}
                            {paper.doi && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(paper.doi);
                                  alert("DOI copied!");
                                }}
                                className="col-span-2 py-3 px-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                                title="Copy DOI"
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
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Open Link - 2 columns (icon only) */}
                            {paper.doi && (
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://doi.org/${paper.doi}`,
                                    "_blank",
                                  )
                                }
                                className="col-span-2 py-3 px-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                                title="Open DOI"
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
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* View More Button */}
                          <button
                            onClick={() => setSelectedPaper(paper)}
                            className="w-full py-2.5 px-4 border-2 border-gray-300 hover:border-amber-500 text-gray-700 hover:text-amber-600 font-semibold text-sm rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>View More Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Indicators Only - Centered */}
        {!loading && displayPublications.length > 0 && (
          <div className="flex justify-center gap-1.5 md:gap-2 mt-6 md:mt-8">
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

        {/* View All Button */}
        <div className="text-center mt-6 md:mt-8">
          <button
            onClick={() => (window.location.href = "/publications")}
            className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <span>View All Publications</span>
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

      {/* Publication Detail Modal */}
      <PublicationModal
        paper={selectedPaper}
        isOpen={!!selectedPaper}
        onClose={() => setSelectedPaper(null)}
      />

      {/* Citation Export Modal */}
      <CitationExportModal
        publication={citationPaper}
        isOpen={!!citationPaper}
        onClose={() => setCitationPaper(null)}
      />
    </section>
  );
};

export default ResearchSection;
