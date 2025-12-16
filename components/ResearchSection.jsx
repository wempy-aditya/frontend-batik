"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const ResearchSection = () => {
  const [hoveredPaper, setHoveredPaper] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const carouselRef = useRef(null);

  // Fetch featured publications from API
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('/api/publications/featured?limit=5');
        if (response.ok) {
          const data = await response.json();
          // Ensure data is array
          if (Array.isArray(data)) {
            setPublications(data);
          } else if (data && Array.isArray(data.data)) {
            setPublications(data.data);
          } else {
            console.log('Publications data is not array:', data);
            setPublications([]);
          }
        }
      } catch (error) {
        console.error('Error fetching publications:', error);
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

  const displayPublications = loading ? [] : (publications.length > 0 ? publications : fallbackPublications);
  
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
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
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
    <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.5'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3Cpath d='M10 0v20'/%3E%3Cpath d='M0 10h20'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-slate-200 mb-6">
            <svg
              className="w-4 h-4 text-slate-600 mr-2"
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
            <span className="text-sm font-semibold text-slate-700">
              Research Publications
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Latest Research
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore cutting-edge research contributions advancing the field of
            computer vision and artificial intelligence.
          </p>
        </div>

        {/* Publications Carousel */}
        <div className="relative mb-16">
          {/* Carousel Container */}
          <div className="overflow-hidden px-4 md:px-0">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading publications...</div>
            ) : displayPublications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No publications available</div>
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
                    className={`relative bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 transition-all duration-500 transform hover:-translate-y-1 h-full flex flex-col ${
                      hoveredPaper === paper.id ? "shadow-2xl md:scale-102" : ""
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 text-white"
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
                        <div className="min-w-0">
                          <span className="inline-block px-2 md:px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-1 md:mb-2">
                            {paper.category}
                          </span>
                          <div className="text-xs md:text-sm text-gray-600">
                            {paper.year}
                          </div>
                        </div>
                      </div>

                      {paper.citations && (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {paper.citations}
                          </div>
                          <div className="text-xs text-gray-500">Citations</div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-3">
                      {paper.title}
                    </h3>

                    {/* Abstract */}
                    {paper.abstract && (
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-3 flex-grow">
                        {paper.abstract}
                      </p>
                    )}

                    {/* Authors */}
                    {(paper.authors || paper.author) && (
                      <div className="mb-3 md:mb-4">
                        <div className="text-xs font-semibold text-gray-700 mb-1 md:mb-2">
                          Authors:
                        </div>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {(Array.isArray(paper.authors) ? paper.authors : [paper.authors || paper.author]).map((author, index) => (
                            <span
                              key={index}
                              className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
                            >
                              {author}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Venue */}
                    {(paper.venue || paper.journal) && (
                      <div className="mb-4 md:mb-6">
                        <div className="text-xs font-semibold text-gray-700 mb-1">
                          Published in:
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 font-medium line-clamp-2">
                          {paper.venue || paper.journal}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="mb-4 md:mb-6">
                        <div className="text-xs font-semibold text-gray-700 mb-1 md:mb-2">
                          Keywords:
                        </div>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {paper.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DOI */}
                    {paper.doi && (
                      <div className="text-xs text-gray-500 mb-4 md:mb-6 font-mono truncate">
                        DOI: {paper.doi}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-2 md:gap-3">
                      <button
                        onClick={() => router.push(`/publications/${paper.slug || paper.id}`)}
                        className="flex-1 py-2.5 md:py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                        <span className="text-sm md:text-base">Read</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: paper.title,
                              text: paper.abstract,
                              url: window.location.origin + `/publications/${paper.slug || paper.id}`
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.origin + `/publications/${paper.slug || paper.id}`);
                            alert('Link copied to clipboard!');
                          }
                        }}
                        className="sm:w-auto px-4 py-2.5 md:py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:border-blue-500 hover:text-blue-600 hover:shadow-md flex items-center justify-center gap-2"
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
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                        <span className="text-sm md:text-base">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Navigation Buttons - Hidden on mobile */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg items-center justify-center transition-all duration-300 ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:scale-110"
            }`}
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
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

          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg items-center justify-center transition-all duration-300 ${
              currentIndex === maxIndex
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:scale-110"
            }`}
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
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

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-8 bg-gradient-to-r from-blue-500 to-purple-500"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="flex md:hidden justify-center gap-4 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white active:scale-95"
            }`}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
              currentIndex >= maxIndex
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white active:scale-95"
            }`}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        </div>

        {/* Research Stats */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Research Impact
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-sm text-gray-600">Publications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                1.2K
              </div>
              <div className="text-sm text-gray-600">Total Citations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">15</div>
              <div className="text-sm text-gray-600">Conference Papers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">10</div>
              <div className="text-sm text-gray-600">Journal Articles</div>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button
            onClick={() => (window.location.href = "/publications")}
            className="group inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-gray-50"
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
    </section>
  );
};

export default ResearchSection;
