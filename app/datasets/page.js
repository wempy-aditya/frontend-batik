"use client";
import { useState } from "react";

export default function DatasetsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState("all");
  const [hoveredDataset, setHoveredDataset] = useState(null);

  const categories = [
    { id: "all", name: "All Datasets", count: 18 },
    { id: "object-detection", name: "Object Detection", count: 6 },
    { id: "classification", name: "Classification", count: 5 },
    { id: "segmentation", name: "Segmentation", count: 4 },
    { id: "style-transfer", name: "Style Transfer", count: 3 },
  ];

  const accessTypes = [
    { id: "all", name: "All Access", count: 18 },
    { id: "Public", name: "Public", count: 8 },
    { id: "Registered", name: "Registered", count: 6 },
    { id: "Premium", name: "Premium", count: 4 },
  ];

  const datasets = [
    {
      id: 1,
      name: "ImageNet-2024",
      description:
        "Large-scale dataset with over 14 million images across 20,000+ categories for object recognition research and deep learning training.",
      size: "150GB",
      samples: "14.2M",
      categories: "20K+",
      accessType: "Public",
      downloadCount: "250K+",
      lastUpdated: "2024-01-15",
      previewGradient: "from-amber-500 to-orange-500",
      accessColor: "bg-green-100 text-green-800",
      category: "classification",
      format: "JPEG, XML",
      license: "Academic Use",
    },
    {
      id: 2,
      name: "COCO-Enhanced",
      description:
        "Extended version of MS COCO dataset with additional annotations for instance segmentation and panoptic understanding.",
      size: "45GB",
      samples: "330K",
      categories: "150",
      accessType: "Registered",
      downloadCount: "125K+",
      lastUpdated: "2023-11-20",
      previewGradient: "from-orange-500 to-red-500",
      accessColor: "bg-blue-100 text-blue-800",
      category: "object-detection",
      format: "JPEG, JSON",
      license: "CC BY 4.0",
    },
    {
      id: 3,
      name: "Artistic Styles DB",
      description:
        "Curated collection of artistic images spanning various styles, periods, and techniques for neural style transfer research.",
      size: "12GB",
      samples: "85K",
      categories: "50",
      accessType: "Premium",
      downloadCount: "45K+",
      lastUpdated: "2024-02-10",
      previewGradient: "from-yellow-500 to-amber-500",
      accessColor: "bg-amber-100 text-amber-800",
      category: "style-transfer",
      format: "JPEG, PNG",
      license: "Custom",
    },
    {
      id: 4,
      name: "Medical Imaging Dataset",
      description:
        "Comprehensive medical imaging collection including X-rays, MRIs, and CT scans with expert annotations for diagnostic AI.",
      size: "200GB",
      samples: "500K",
      categories: "25",
      accessType: "Registered",
      downloadCount: "75K+",
      lastUpdated: "2024-01-30",
      previewGradient: "from-blue-500 to-cyan-500",
      accessColor: "bg-blue-100 text-blue-800",
      category: "classification",
      format: "DICOM, PNG",
      license: "Medical Research",
    },
    {
      id: 5,
      name: "Street View Segmentation",
      description:
        "Urban scene understanding dataset with pixel-level annotations for autonomous driving and smart city applications.",
      size: "80GB",
      samples: "150K",
      categories: "30",
      accessType: "Public",
      downloadCount: "180K+",
      lastUpdated: "2023-12-05",
      previewGradient: "from-green-500 to-teal-500",
      accessColor: "bg-green-100 text-green-800",
      category: "segmentation",
      format: "PNG, JSON",
      license: "MIT",
    },
    {
      id: 6,
      name: "Fashion Product Images",
      description:
        "High-resolution fashion product dataset with detailed attribute annotations for e-commerce and style recommendation systems.",
      size: "35GB",
      samples: "250K",
      categories: "100",
      accessType: "Premium",
      downloadCount: "60K+",
      lastUpdated: "2024-02-20",
      previewGradient: "from-pink-500 to-rose-500",
      accessColor: "bg-amber-100 text-amber-800",
      category: "classification",
      format: "JPEG, JSON",
      license: "Commercial",
    },
    {
      id: 7,
      name: "Satellite Earth Imagery",
      description:
        "Global satellite imagery dataset for environmental monitoring, agriculture analysis, and climate change research.",
      size: "500GB",
      samples: "2.5M",
      categories: "15",
      accessType: "Registered",
      downloadCount: "95K+",
      lastUpdated: "2024-01-10",
      previewGradient: "from-emerald-500 to-green-500",
      accessColor: "bg-blue-100 text-blue-800",
      category: "classification",
      format: "GeoTIFF, JSON",
      license: "Research Only",
    },
    {
      id: 8,
      name: "3D Object Recognition",
      description:
        "Multi-view 3D object dataset with depth information and pose annotations for robotics and AR/VR applications.",
      size: "120GB",
      samples: "180K",
      categories: "200",
      accessType: "Public",
      downloadCount: "85K+",
      lastUpdated: "2023-11-15",
      previewGradient: "from-purple-500 to-indigo-500",
      accessColor: "bg-green-100 text-green-800",
      category: "object-detection",
      format: "PLY, JSON",
      license: "Apache 2.0",
    },
    {
      id: 9,
      name: "Historic Art Collection",
      description:
        "Digitized historic artwork spanning centuries with detailed metadata for art history research and style analysis.",
      size: "25GB",
      samples: "120K",
      categories: "40",
      accessType: "Premium",
      downloadCount: "35K+",
      lastUpdated: "2024-01-25",
      previewGradient: "from-amber-600 to-yellow-500",
      accessColor: "bg-amber-100 text-amber-800",
      category: "style-transfer",
      format: "TIFF, XML",
      license: "Museum License",
    },
    {
      id: 10,
      name: "Face Recognition Dataset",
      description:
        "Diverse facial recognition dataset with privacy-compliant annotations for identity verification and emotion analysis.",
      size: "60GB",
      samples: "500K",
      categories: "1000",
      accessType: "Registered",
      downloadCount: "110K+",
      lastUpdated: "2023-12-20",
      previewGradient: "from-rose-500 to-pink-500",
      accessColor: "bg-blue-100 text-blue-800",
      category: "classification",
      format: "JPEG, JSON",
      license: "Privacy Compliant",
    },
    {
      id: 11,
      name: "Industrial Defect Detection",
      description:
        "Manufacturing defect dataset for quality control and automated inspection systems in industrial environments.",
      size: "40GB",
      samples: "300K",
      categories: "50",
      accessType: "Premium",
      downloadCount: "25K+",
      lastUpdated: "2024-02-01",
      previewGradient: "from-gray-500 to-slate-500",
      accessColor: "bg-amber-100 text-amber-800",
      category: "object-detection",
      format: "PNG, XML",
      license: "Industrial Use",
    },
    {
      id: 12,
      name: "Document Text Extraction",
      description:
        "Document analysis dataset with OCR annotations for text extraction and document understanding applications.",
      size: "15GB",
      samples: "75K",
      categories: "20",
      accessType: "Public",
      downloadCount: "65K+",
      lastUpdated: "2023-10-30",
      previewGradient: "from-indigo-500 to-blue-500",
      accessColor: "bg-green-100 text-green-800",
      category: "classification",
      format: "PDF, JSON",
      license: "Open Source",
    },
    {
      id: 13,
      name: "Semantic Segmentation Plus",
      description:
        "Advanced semantic segmentation dataset with fine-grained pixel annotations for computer vision research.",
      size: "90GB",
      samples: "200K",
      categories: "80",
      accessType: "Registered",
      downloadCount: "70K+",
      lastUpdated: "2024-01-05",
      previewGradient: "from-cyan-500 to-blue-500",
      accessColor: "bg-blue-100 text-blue-800",
      category: "segmentation",
      format: "PNG, JSON",
      license: "Academic",
    },
    {
      id: 14,
      name: "Modern Art Styles",
      description:
        "Contemporary art dataset featuring modern artistic movements and styles for AI art generation and analysis.",
      size: "18GB",
      samples: "95K",
      categories: "35",
      accessType: "Premium",
      downloadCount: "40K+",
      lastUpdated: "2024-02-15",
      previewGradient: "from-violet-500 to-purple-500",
      accessColor: "bg-amber-100 text-amber-800",
      category: "style-transfer",
      format: "JPEG, JSON",
      license: "Art License",
    },
    {
      id: 15,
      name: "Traffic Sign Detection",
      description:
        "Global traffic sign dataset for autonomous vehicle development and traffic management systems.",
      size: "30GB",
      samples: "180K",
      categories: "100",
      accessType: "Public",
      downloadCount: "120K+",
      lastUpdated: "2023-11-25",
      previewGradient: "from-red-500 to-orange-500",
      accessColor: "bg-green-100 text-green-800",
      category: "object-detection",
      format: "JPEG, XML",
      license: "Traffic Authority",
    },
    {
      id: 16,
      name: "Panoptic Scene Understanding",
      description:
        "Comprehensive scene understanding dataset combining instance and semantic segmentation for holistic AI vision.",
      size: "110GB",
      samples: "220K",
      categories: "120",
      accessType: "Registered",
      downloadCount: "55K+",
      lastUpdated: "2024-01-20",
      previewGradient: "from-teal-500 to-cyan-500",
      accessColor: "bg-blue-100 text-blue-800",
      category: "segmentation",
      format: "PNG, JSON",
      license: "Research",
    },
    {
      id: 17,
      name: "Abstract Art Generator",
      description:
        "Abstract art dataset for generative AI models and creative applications in digital art creation.",
      size: "20GB",
      samples: "110K",
      categories: "25",
      accessType: "Public",
      downloadCount: "80K+",
      lastUpdated: "2023-12-10",
      previewGradient: "from-orange-500 to-amber-500",
      accessColor: "bg-green-100 text-green-800",
      category: "style-transfer",
      format: "PNG, JSON",
      license: "Creative Commons",
    },
    {
      id: 18,
      name: "Drone Surveillance Dataset",
      description:
        "Aerial surveillance dataset for security applications and crowd monitoring with privacy-preserving annotations.",
      size: "75GB",
      samples: "160K",
      categories: "40",
      accessType: "Premium",
      downloadCount: "30K+",
      lastUpdated: "2024-02-05",
      previewGradient: "from-slate-500 to-gray-500",
      accessColor: "bg-amber-100 text-amber-800",
      category: "object-detection",
      format: "MP4, JSON",
      license: "Security License",
    },
  ];

  const filteredDatasets = datasets.filter((dataset) => {
    const categoryMatch =
      selectedCategory === "all" || dataset.category === selectedCategory;
    const accessMatch =
      selectedAccess === "all" || dataset.accessType === selectedAccess;
    return categoryMatch && accessMatch;
  });

  const getAccessColor = (accessType) => {
    switch (accessType) {
      case "Public":
        return "bg-green-100 text-green-800 border-green-200";
      case "Registered":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Premium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30m-4 0a4 4 0 1 1 8 0a4 4 0 1 1 -8 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-300 mb-8">
            <button
              onClick={() => router.push("/")}
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
            <span className="text-white">Datasets</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg
                className="w-4 h-4 text-blue-400"
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
              <span className="text-sm font-semibold text-gray-200">
                Complete Dataset Library
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-gray-100 to-blue-100 bg-clip-text text-transparent">
                Research Datasets
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Explore our comprehensive collection of curated datasets for
              machine learning research. From computer vision to NLP, find the
              perfect data for your next breakthrough.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  18+
                </div>
                <div className="text-sm text-gray-400">Datasets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  50M+
                </div>
                <div className="text-sm text-gray-400">Samples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  1TB+
                </div>
                <div className="text-sm text-gray-400">Total Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  500K+
                </div>
                <div className="text-sm text-gray-400">Downloads</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Datasets Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-12 space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
                      selectedCategory === category.id
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {category.name}
                    <span className="ml-2 text-sm opacity-75">
                      ({category.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Access Type Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Filter by Access
              </h3>
              <div className="flex flex-wrap gap-3">
                {accessTypes.map((access) => (
                  <button
                    key={access.id}
                    onClick={() => setSelectedAccess(access.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
                      selectedAccess === access.id
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    {access.name}
                    <span className="ml-2 text-sm opacity-75">
                      ({access.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredDatasets.length}</span>{" "}
              datasets
            </p>
          </div>

          {/* Datasets Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {filteredDatasets.map((dataset) => (
              <div
                key={dataset.id}
                className="group relative"
                onMouseEnter={() => setHoveredDataset(dataset.id)}
                onMouseLeave={() => setHoveredDataset(null)}
              >
                {/* Dataset Card */}
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                  {/* Header with Preview */}
                  <div className="relative h-40 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        dataset.previewGradient
                      } transition-transform duration-700 ${
                        hoveredDataset === dataset.id ? "scale-110" : ""
                      }`}
                    ></div>

                    {/* Sample Grid Overlay */}
                    <div className="absolute inset-0 p-4">
                      <div className="grid grid-cols-4 gap-2 h-full opacity-30">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div
                            key={index}
                            className="bg-white/40 rounded-lg backdrop-blur-sm animate-pulse"
                            style={{ animationDelay: `${index * 100}ms` }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Access Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getAccessColor(
                          dataset.accessType
                        )}`}
                      >
                        {dataset.accessType}
                      </span>
                    </div>

                    {/* Stats Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <div className="flex justify-between text-white text-sm">
                        <span className="font-medium">
                          {dataset.samples} samples
                        </span>
                        <span className="font-medium">{dataset.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Title & Downloads */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {dataset.name}
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
                        {dataset.downloadCount}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {dataset.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {dataset.categories}
                        </div>
                        <div className="text-xs text-gray-600">Categories</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {dataset.samples}
                        </div>
                        <div className="text-xs text-gray-600">Samples</div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="font-medium">{dataset.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>License:</span>
                        <span className="font-medium">{dataset.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span className="font-medium">
                          {new Date(dataset.lastUpdated).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/datasets/${dataset.id}/download`)
                        }
                        className={`w-full py-3 px-4 bg-gradient-to-r ${dataset.previewGradient} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105`}
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
                          (window.location.href = `/datasets/${dataset.id}`)
                        }
                        className="w-full py-2 px-4 text-gray-700 font-medium text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Dataset ID */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full flex items-center justify-center">
                    {dataset.id}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Need a Custom Dataset?
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  We can help you create, annotate, and validate custom datasets
                  tailored to your specific research needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => (window.location.href = "/contact")}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Contact Our Team
                  </button>
                  <button
                    onClick={() => (window.location.href = "/services")}
                    className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                  >
                    View Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
