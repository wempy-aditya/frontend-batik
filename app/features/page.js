"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeaturesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const router = useRouter();

  const categories = [
    { id: "all", name: "All Features", count: 16 },
    { id: "image-processing", name: "Image Processing", count: 6 },
    { id: "machine-learning", name: "Machine Learning", count: 5 },
    { id: "computer-vision", name: "Computer Vision", count: 3 },
    { id: "generative-ai", name: "Generative AI", count: 2 },
  ];

  const features = [
    {
      id: 1,
      title: "Advanced Image Retrieval",
      description:
        "Find similar images instantly using state-of-the-art computer vision algorithms, deep learning models, and semantic search capabilities.",
      category: "image-processing",
      icon: "🔍",
      gradient: "from-amber-500 to-orange-500",
      features: [
        "Vector similarity search",
        "Semantic image matching",
        "Real-time indexing",
        "Batch processing",
      ],
      status: "Active",
      complexity: "Advanced",
    },
    {
      id: 2,
      title: "Neural Image Classification",
      description:
        "AI-powered scene understanding with state-of-the-art neural networks for accurate categorization and object detection.",
      category: "machine-learning",
      icon: "🧠",
      gradient: "from-orange-500 to-red-500",
      features: [
        "Multi-class classification",
        "Object detection",
        "Scene recognition",
        "Custom model training",
      ],
      status: "Active",
      complexity: "Intermediate",
    },
    {
      id: 3,
      title: "Generative AI Studio",
      description:
        "Create stunning visuals from text prompts using cutting-edge diffusion models and neural networks.",
      category: "generative-ai",
      icon: "✨",
      gradient: "from-yellow-500 to-amber-500",
      features: [
        "Text-to-image generation",
        "Style transfer",
        "Image editing",
        "Batch generation",
      ],
      status: "Beta",
      complexity: "Advanced",
    },
    {
      id: 4,
      title: "Real-time Object Detection",
      description:
        "Lightning-fast object detection and tracking with optimized inference pipelines and cloud computing power.",
      category: "computer-vision",
      icon: "👁️",
      gradient: "from-amber-600 to-orange-600",
      features: [
        "Real-time detection",
        "Multiple object tracking",
        "Custom model support",
        "Edge deployment",
      ],
      status: "Active",
      complexity: "Advanced",
    },
    {
      id: 5,
      title: "Image Enhancement Suite",
      description:
        "Professional-grade image enhancement tools including super-resolution, denoising, and color correction.",
      category: "image-processing",
      icon: "🎨",
      gradient: "from-red-500 to-orange-500",
      features: [
        "Super-resolution",
        "Noise reduction",
        "Color enhancement",
        "HDR processing",
      ],
      status: "Active",
      complexity: "Intermediate",
    },
    {
      id: 6,
      title: "Semantic Segmentation",
      description:
        "Pixel-level understanding of images with advanced semantic segmentation models for precise analysis.",
      category: "computer-vision",
      icon: "🖼️",
      gradient: "from-orange-600 to-amber-600",
      features: [
        "Pixel-level segmentation",
        "Multiple classes",
        "Custom datasets",
        "Real-time processing",
      ],
      status: "Active",
      complexity: "Advanced",
    },
    {
      id: 7,
      title: "Face Recognition System",
      description:
        "Advanced facial recognition and analysis with privacy-focused design and high accuracy rates.",
      category: "computer-vision",
      icon: "👤",
      gradient: "from-amber-500 to-yellow-500",
      features: [
        "Face detection",
        "Identity verification",
        "Emotion analysis",
        "Privacy protection",
      ],
      status: "Active",
      complexity: "Advanced",
    },
    {
      id: 8,
      title: "Document OCR Scanner",
      description:
        "Extract text from documents and images with high accuracy optical character recognition technology.",
      category: "image-processing",
      icon: "📄",
      gradient: "from-yellow-600 to-amber-600",
      features: [
        "Multi-language support",
        "Table extraction",
        "Handwriting recognition",
        "PDF processing",
      ],
      status: "Active",
      complexity: "Intermediate",
    },
    {
      id: 9,
      title: "Style Transfer Engine",
      description:
        "Transform images with artistic styles using neural style transfer and advanced deep learning techniques.",
      category: "generative-ai",
      icon: "🎭",
      gradient: "from-orange-500 to-amber-500",
      features: [
        "Artistic style transfer",
        "Custom style training",
        "Video style transfer",
        "Real-time processing",
      ],
      status: "Beta",
      complexity: "Advanced",
    },
    {
      id: 10,
      title: "Image Quality Assessment",
      description:
        "Automatically assess and score image quality using perceptual metrics and machine learning models.",
      category: "machine-learning",
      icon: "⭐",
      gradient: "from-amber-400 to-orange-400",
      features: [
        "Quality scoring",
        "Defect detection",
        "Aesthetic analysis",
        "Automated sorting",
      ],
      status: "Active",
      complexity: "Intermediate",
    },
    {
      id: 11,
      title: "Medical Image Analysis",
      description:
        "Specialized tools for medical imaging analysis including X-ray, MRI, and CT scan processing.",
      category: "machine-learning",
      icon: "🏥",
      gradient: "from-red-400 to-orange-400",
      features: [
        "DICOM support",
        "Anomaly detection",
        "3D reconstruction",
        "Report generation",
      ],
      status: "Coming Soon",
      complexity: "Expert",
    },
    {
      id: 12,
      title: "Satellite Image Processing",
      description:
        "Advanced processing and analysis of satellite imagery for environmental monitoring and urban planning.",
      category: "image-processing",
      icon: "🛰️",
      gradient: "from-orange-400 to-yellow-400",
      features: [
        "Multi-spectral analysis",
        "Change detection",
        "Land use classification",
        "Time series analysis",
      ],
      status: "Active",
      complexity: "Expert",
    },
    {
      id: 13,
      title: "3D Object Recognition",
      description:
        "Recognize and analyze 3D objects from 2D images using advanced computer vision and depth estimation.",
      category: "machine-learning",
      icon: "📦",
      gradient: "from-amber-600 to-red-500",
      features: [
        "3D pose estimation",
        "Object reconstruction",
        "Depth mapping",
        "Volume calculation",
      ],
      status: "Beta",
      complexity: "Expert",
    },
    {
      id: 14,
      title: "Video Content Analysis",
      description:
        "Analyze video content for objects, scenes, and activities using temporal deep learning models.",
      category: "machine-learning",
      icon: "🎬",
      gradient: "from-yellow-500 to-orange-500",
      features: [
        "Action recognition",
        "Scene detection",
        "Object tracking",
        "Content moderation",
      ],
      status: "Active",
      complexity: "Advanced",
    },
    {
      id: 15,
      title: "Automated Annotation",
      description:
        "Automatically generate annotations and labels for images to accelerate dataset creation.",
      category: "image-processing",
      icon: "🏷️",
      gradient: "from-orange-500 to-red-400",
      features: [
        "Auto-labeling",
        "Bounding boxes",
        "Segmentation masks",
        "Quality validation",
      ],
      status: "Active",
      complexity: "Intermediate",
    },
    {
      id: 16,
      title: "Image Forensics Tools",
      description:
        "Detect image manipulation and forgeries using advanced forensic analysis techniques.",
      category: "image-processing",
      icon: "🕵️",
      gradient: "from-red-500 to-amber-500",
      features: [
        "Manipulation detection",
        "Source identification",
        "Metadata analysis",
        "Integrity verification",
      ],
      status: "Coming Soon",
      complexity: "Expert",
    },
  ];

  const filteredFeatures =
    selectedCategory === "all"
      ? features
      : features.filter((feature) => feature.category === selectedCategory);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Beta":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Coming Soon":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "Intermediate":
        return "bg-amber-100 text-amber-800";
      case "Advanced":
        return "bg-orange-100 text-orange-800";
      case "Expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
            <span className="text-white">Features</span>
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
              <span className="text-sm font-semibold text-amber-200">
                Complete Feature Suite
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                All AI Features
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Explore our comprehensive suite of AI-powered image processing and
              computer vision tools. From basic enhancements to advanced neural
              networks, we have everything you need.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  16+
                </div>
                <div className="text-sm text-gray-400">AI Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  5
                </div>
                <div className="text-sm text-gray-400">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  24/7
                </div>
                <div className="text-sm text-gray-400">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
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

          {/* Features Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {filteredFeatures.map((feature) => (
              <div
                key={feature.id}
                className="group relative"
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Feature Card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full">
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  {/* Animated Border Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500 scale-105`}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`text-3xl p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500`}
                      >
                        {feature.icon}
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            feature.status
                          )}`}
                        >
                          {feature.status}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getComplexityColor(
                            feature.complexity
                          )}`}
                        >
                          {feature.complexity}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Key Features:
                      </h4>
                      <ul className="space-y-2">
                        {feature.features.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <svg
                              className={`w-4 h-4 mr-3 text-amber-500`}
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
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/features/${feature.id}`)}
                      className={`w-full py-3 px-4 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-xl transition-all duration-300 transform group-hover:scale-105`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Learn More</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
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
                      </div>
                    </button>
                  </div>

                  {/* Feature Number */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-bold rounded-full flex items-center justify-center">
                    {feature.id}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Choose from our comprehensive suite of AI tools and start
                building amazing applications today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/pricing")}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => router.push("/pricing")}
                  className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300"
                >
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
