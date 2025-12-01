"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DatasetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSample, setSelectedSample] = useState(null);

  // Dataset data (in real app, this would come from an API)
  const datasets = {
    1: {
      id: 1,
      name: "ImageNet-2024",
      tagline: "Large-scale visual recognition challenge dataset",
      description:
        "ImageNet-2024 is the latest iteration of the renowned ImageNet dataset, featuring over 14 million high-quality images across 20,000+ categories. This comprehensive dataset has been meticulously curated for object recognition research, deep learning training, and computer vision advancement.",
      size: "150GB",
      samples: "14.2M",
      categories: "20K+",
      accessType: "Public",
      downloadCount: "250K+",
      lastUpdated: "2024-01-15",
      gradient: "from-amber-500 to-orange-500",
      version: "2024.1",
      format: "JPEG, XML",
      license: "Academic Use",
      citation:
        "Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K., & Fei-Fei, L. (2024). ImageNet: A large-scale hierarchical image database.",
      keyFeatures: [
        "14.2 million annotated images",
        "20,000+ hierarchical categories",
        "Multiple annotation types (bounding boxes, segmentation)",
        "High-quality manual verification",
        "Regular updates and improvements",
        "Comprehensive metadata",
      ],
      useCases: [
        "Object Recognition",
        "Image Classification",
        "Transfer Learning",
        "Model Benchmarking",
        "Feature Extraction",
        "Deep Learning Research",
      ],
      technicalSpecs: {
        format: "Image Dataset",
        type: "Classification & Recognition",
        license: "Academic Use",
        access: "Public",
        lastUpdate: "January 2024",
        version: "2024.1",
      },
      statistics: {
        avgImagesPerCategory: "710",
        minImagesPerCategory: "500",
        maxImagesPerCategory: "1300",
        avgImageSize: "482KB",
        totalAnnotations: "14.2M",
        qualityScore: "98.5%",
      },
      sampleImages: [
        {
          id: 1,
          category: "Golden Retriever",
          confidence: "98.5%",
          gradient: "from-yellow-400 to-amber-500",
        },
        {
          id: 2,
          category: "Sports Car",
          confidence: "97.2%",
          gradient: "from-red-500 to-orange-500",
        },
        {
          id: 3,
          category: "Coffee Cup",
          confidence: "96.8%",
          gradient: "from-amber-600 to-yellow-500",
        },
        {
          id: 4,
          category: "Mountain Landscape",
          confidence: "99.1%",
          gradient: "from-blue-500 to-cyan-500",
        },
        {
          id: 5,
          category: "Laptop Computer",
          confidence: "97.9%",
          gradient: "from-gray-600 to-slate-500",
        },
        {
          id: 6,
          category: "Pizza",
          confidence: "98.3%",
          gradient: "from-red-400 to-yellow-500",
        },
      ],
      downloadOptions: [
        {
          type: "Full Dataset",
          size: "150GB",
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Training Set",
          size: "120GB",
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Validation Set",
          size: "20GB",
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Test Set",
          size: "10GB",
          format: "ZIP",
          speed: "Fast servers",
        },
      ],
      relatedPapers: [
        {
          title: "Deep Residual Learning using ImageNet",
          year: "2024",
          citations: "15K+",
        },
        {
          title: "Vision Transformers on Large Scale Datasets",
          year: "2023",
          citations: "12K+",
        },
        {
          title: "Self-Supervised Learning with ImageNet",
          year: "2024",
          citations: "8K+",
        },
      ],
    },
    2: {
      id: 2,
      name: "COCO-Enhanced",
      tagline: "Extended Microsoft COCO dataset with enhanced annotations",
      description:
        "COCO-Enhanced is an extended version of the Microsoft COCO dataset, featuring additional annotations for instance segmentation, keypoint detection, and panoptic understanding. This comprehensive dataset is ideal for multi-task learning and advanced computer vision research.",
      size: "45GB",
      samples: "330K",
      categories: "150",
      accessType: "Registered",
      downloadCount: "125K+",
      lastUpdated: "2023-11-20",
      gradient: "from-orange-500 to-red-500",
      version: "2023.2",
      format: "JPEG, JSON",
      license: "CC BY 4.0",
      citation:
        "Lin, T.-Y., et al. (2023). Microsoft COCO: Common Objects in Context - Enhanced Edition.",
      keyFeatures: [
        "330,000 diverse images",
        "150 object categories with detailed annotations",
        "Instance segmentation masks",
        "Keypoint annotations for people",
        "Panoptic segmentation data",
        "Caption annotations",
      ],
      useCases: [
        "Object Detection",
        "Instance Segmentation",
        "Keypoint Detection",
        "Panoptic Segmentation",
        "Image Captioning",
        "Multi-Task Learning",
      ],
      technicalSpecs: {
        format: "Image Dataset",
        type: "Object Detection & Segmentation",
        license: "CC BY 4.0",
        access: "Registered Users",
        lastUpdate: "November 2023",
        version: "2023.2",
      },
      statistics: {
        avgImagesPerCategory: "2200",
        minImagesPerCategory: "1000",
        maxImagesPerCategory: "5000",
        avgImageSize: "350KB",
        totalAnnotations: "2.5M",
        qualityScore: "99.2%",
      },
      sampleImages: [
        {
          id: 1,
          category: "Person with Bicycle",
          confidence: "99.2%",
          gradient: "from-blue-500 to-cyan-500",
        },
        {
          id: 2,
          category: "Street Scene",
          confidence: "98.7%",
          gradient: "from-purple-500 to-pink-500",
        },
        {
          id: 3,
          category: "Kitchen Interior",
          confidence: "97.5%",
          gradient: "from-green-500 to-teal-500",
        },
        {
          id: 4,
          category: "Sports Activity",
          confidence: "98.9%",
          gradient: "from-red-500 to-orange-500",
        },
        {
          id: 5,
          category: "Wildlife",
          confidence: "97.8%",
          gradient: "from-amber-500 to-yellow-500",
        },
        {
          id: 6,
          category: "Urban Architecture",
          confidence: "98.4%",
          gradient: "from-slate-600 to-gray-500",
        },
      ],
      downloadOptions: [
        {
          type: "Full Dataset",
          size: "45GB",
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Training Set",
          size: "35GB",
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Validation Set",
          size: "6GB",
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Annotations Only",
          size: "2GB",
          format: "JSON",
          speed: "Instant",
        },
      ],
      relatedPapers: [
        {
          title: "Mask R-CNN for Instance Segmentation",
          year: "2023",
          citations: "25K+",
        },
        {
          title: "Panoptic Segmentation Methods",
          year: "2024",
          citations: "10K+",
        },
        {
          title: "Multi-Task Learning with COCO",
          year: "2023",
          citations: "8K+",
        },
      ],
    },
    // Add more datasets as needed
  };

  const dataset = datasets[datasetId] || datasets[1];

  const tabs = [
    { id: "overview", name: "Overview", icon: "M4 6h16M4 12h16m-7 6h7" },
    {
      id: "samples",
      name: "Sample Data",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      id: "technical",
      name: "Metadata",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className={`relative py-20 pt-32 bg-gradient-to-r ${dataset.gradient} overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-white/80 mb-8">
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
            <button
              onClick={() => router.push("/datasets")}
              className="hover:text-white transition-colors"
            >
              Datasets
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
            <span className="text-white">{dataset.name}</span>
          </div>

          {/* Title and Info */}
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                <svg
                  className="w-4 h-4 text-white mr-2"
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
                <span className="text-sm font-semibold text-white">
                  {dataset.accessType} Dataset
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {dataset.name}
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {dataset.tagline}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {dataset.samples}
                  </div>
                  <div className="text-white/80 text-sm">Samples</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {dataset.size}
                  </div>
                  <div className="text-white/80 text-sm">Total Size</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {dataset.categories}
                  </div>
                  <div className="text-white/80 text-sm">Categories</div>
                </div>
              </div>
            </div>

            {/* Sidebar Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("download")}
                    className="w-full px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Dataset
                  </button>
                  <button className="w-full px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30">
                    View Documentation
                  </button>
                  <button className="w-full px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30">
                    Share Dataset
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Version:</span>
                      <span className="font-semibold text-white">
                        {dataset.version}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Format:</span>
                      <span className="font-semibold text-white">
                        {dataset.format}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>License:</span>
                      <span className="font-semibold text-white">
                        {dataset.license}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Updated:</span>
                      <span className="font-semibold text-white">
                        {new Date(dataset.lastUpdated).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-white border-b sticky top-20 z-40">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
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
                      d={tab.icon}
                    />
                  </svg>
                  {tab.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-12">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Description */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      About This Dataset
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {dataset.description}
                    </p>

                    {/* Key Features */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {dataset.keyFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Common Use Cases
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {dataset.useCases.map((useCase, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                        >
                          <div className="text-blue-600 font-semibold">
                            {useCase}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Citation */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Citation
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <code className="text-sm text-gray-700">
                        {dataset.citation}
                      </code>
                    </div>
                    <button className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      Copy Citation
                    </button>
                  </div>

                  {/* Related Papers */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Related Publications
                    </h3>
                    <div className="space-y-4">
                      {dataset.relatedPapers.map((paper, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-gray-900 text-sm mb-1">
                            {paper.title}
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{paper.year}</span>
                            <span>{paper.citations} citations</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Samples Tab */}
          {activeTab === "samples" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sample Data Preview
                </h2>
                <p className="text-gray-600 text-lg">
                  Explore representative samples from this dataset
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataset.sampleImages.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => setSelectedSample(sample)}
                    className="group cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div
                      className={`aspect-square bg-gradient-to-br ${sample.gradient} relative`}
                    >
                      <div className="absolute inset-0 opacity-20">
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: "60px 60px",
                          }}
                        ></div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">
                        {sample.category}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Tab */}
          {activeTab === "technical" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Dataset Metadata
                </h2>
                <div className="space-y-4">
                  {Object.entries(dataset.technicalSpecs).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="w-48 font-semibold text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </div>
                        <div className="flex-1 text-gray-900">{value}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}


        </div>
      </section>

      {/* Sample Modal */}
      {selectedSample && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSample(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSample(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-8 h-8"
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
            </button>

            <div className="bg-white rounded-2xl overflow-hidden">
              <div
                className={`aspect-video bg-gradient-to-br ${selectedSample.gradient}`}
              >
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: "60px 60px",
                    }}
                  ></div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedSample.category}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
