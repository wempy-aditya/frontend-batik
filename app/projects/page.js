"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredProject, setHoveredProject] = useState(null);
  const router = useRouter();

  const categories = [
    { id: "all", name: "All Projects", count: 12 },
    { id: "generative-ai", name: "Generative AI", count: 4 },
    { id: "computer-vision", name: "Computer Vision", count: 3 },
    { id: "enhancement", name: "Enhancement", count: 3 },
    { id: "research", name: "Research", count: 2 },
  ];

  const projects = [
    {
      id: 1,
      title: "Neural Style Transfer",
      description:
        "Transform artistic styles using advanced neural networks. Create stunning artwork by combining content and style images through deep learning algorithms powered by VGG-19 architecture.",
      technologies: [
        "TensorFlow",
        "VGG-19",
        "Neural Networks",
        "Style Transfer",
      ],
      thumbnail: "from-amber-500 to-orange-500",
      category: "generative-ai",
      status: "Active",
      complexity: "Advanced",
      duration: "6 months",
      team: 4,
    },
    {
      id: 2,
      title: "Object Detection & Segmentation",
      description:
        "Real-time object detection and instance segmentation using YOLO and Mask R-CNN architectures for precise image analysis with high accuracy rates.",
      technologies: ["YOLO", "Mask R-CNN", "OpenCV", "PyTorch"],
      thumbnail: "from-orange-500 to-red-500",
      category: "computer-vision",
      status: "Completed",
      complexity: "Expert",
      duration: "8 months",
      team: 6,
    },
    {
      id: 3,
      title: "Image Super-Resolution",
      description:
        "Enhance image quality and resolution using ESRGAN and SRCNN models. Upscale images while preserving fine details and textures with GANs technology.",
      technologies: ["ESRGAN", "SRCNN", "GANs", "Image Enhancement"],
      thumbnail: "from-yellow-500 to-amber-500",
      category: "enhancement",
      status: "Beta",
      complexity: "Advanced",
      duration: "4 months",
      team: 3,
    },
    {
      id: 4,
      title: "Facial Recognition System",
      description:
        "Advanced facial recognition and analysis with privacy-focused design, emotion detection, and real-time processing capabilities for security applications.",
      technologies: [
        "OpenCV",
        "Face Recognition",
        "Deep Learning",
        "Privacy AI",
      ],
      thumbnail: "from-amber-600 to-orange-600",
      category: "computer-vision",
      status: "Active",
      complexity: "Expert",
      duration: "10 months",
      team: 5,
    },
    {
      id: 5,
      title: "Text-to-Image Generator",
      description:
        "Generate high-quality images from text descriptions using diffusion models and transformer architectures. Create art, illustrations, and concept designs from prompts.",
      technologies: ["Stable Diffusion", "CLIP", "Transformers", "PyTorch"],
      thumbnail: "from-red-500 to-orange-500",
      category: "generative-ai",
      status: "Beta",
      complexity: "Expert",
      duration: "12 months",
      team: 8,
    },
    {
      id: 6,
      title: "Medical Image Analysis",
      description:
        "AI-powered medical imaging analysis for X-rays, MRIs, and CT scans. Detect anomalies, assist diagnosis, and provide detailed medical reports.",
      technologies: ["Medical AI", "DICOM", "3D Analysis", "TensorFlow"],
      thumbnail: "from-orange-600 to-amber-600",
      category: "research",
      status: "In Progress",
      complexity: "Expert",
      duration: "15 months",
      team: 7,
    },
    {
      id: 7,
      title: "Automated Video Editing",
      description:
        "Smart video editing using AI for automatic scene detection, transition effects, and content optimization. Perfect for content creators and marketers.",
      technologies: ["OpenCV", "Video Processing", "ML", "FFmpeg"],
      thumbnail: "from-yellow-600 to-amber-600",
      category: "enhancement",
      status: "Active",
      complexity: "Advanced",
      duration: "6 months",
      team: 4,
    },
    {
      id: 8,
      title: "3D Object Reconstruction",
      description:
        "Reconstruct 3D objects from 2D images using photogrammetry and neural networks. Create detailed 3D models for gaming, AR/VR, and design.",
      technologies: [
        "3D Reconstruction",
        "Photogrammetry",
        "Neural Radiance Fields",
        "Blender",
      ],
      thumbnail: "from-amber-500 to-yellow-500",
      category: "computer-vision",
      status: "Research",
      complexity: "Expert",
      duration: "18 months",
      team: 6,
    },
    {
      id: 9,
      title: "AI Art Restoration",
      description:
        "Restore damaged artwork and historical images using advanced inpainting techniques and style-aware neural networks to preserve cultural heritage.",
      technologies: [
        "Inpainting",
        "Style Transfer",
        "Cultural Heritage AI",
        "Restoration",
      ],
      thumbnail: "from-orange-400 to-amber-400",
      category: "enhancement",
      status: "Active",
      complexity: "Advanced",
      duration: "9 months",
      team: 5,
    },
    {
      id: 10,
      title: "Voice-to-Image Synthesis",
      description:
        "Generate images from voice descriptions using multimodal AI. Convert speech to visual content with emotion and tone awareness for creative applications.",
      technologies: [
        "Speech Recognition",
        "Multimodal AI",
        "Voice Processing",
        "Image Synthesis",
      ],
      thumbnail: "from-red-400 to-orange-400",
      category: "generative-ai",
      status: "Beta",
      complexity: "Expert",
      duration: "14 months",
      team: 9,
    },
    {
      id: 11,
      title: "Drone Image Analysis",
      description:
        "Analyze aerial and drone footage for environmental monitoring, agriculture, and urban planning using computer vision and geospatial AI technologies.",
      technologies: [
        "Drone AI",
        "Geospatial Analysis",
        "Environmental AI",
        "Satellite Imagery",
      ],
      thumbnail: "from-yellow-400 to-orange-400",
      category: "research",
      status: "In Progress",
      complexity: "Advanced",
      duration: "12 months",
      team: 6,
    },
    {
      id: 12,
      title: "Real-time Style Transfer",
      description:
        "Apply artistic styles to live video feeds and camera streams in real-time. Perfect for live streaming, video calls, and interactive art installations.",
      technologies: [
        "Real-time Processing",
        "Style Transfer",
        "WebRTC",
        "Edge Computing",
      ],
      thumbnail: "from-amber-400 to-red-400",
      category: "generative-ai",
      status: "Active",
      complexity: "Advanced",
      duration: "7 months",
      team: 4,
    },
  ];

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Beta":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Research":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
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
            <span className="text-white">Projects</span>
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
              <span className="text-sm font-semibold text-amber-200">
                Complete Project Portfolio
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                All AI Projects
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Explore our comprehensive collection of AI and computer vision
              projects. From research prototypes to production-ready solutions,
              discover innovation at every level.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  12+
                </div>
                <div className="text-sm text-gray-400">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  5
                </div>
                <div className="text-sm text-gray-400">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  50+
                </div>
                <div className="text-sm text-gray-400">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  2M+
                </div>
                <div className="text-sm text-gray-400">Images Processed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
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

          {/* Projects Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Project Card */}
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full">
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${project.thumbnail} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  {/* Animated Border Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${project.thumbnail} rounded-3xl opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500 scale-105`}
                  ></div>

                  {/* Thumbnail/Hero Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${project.thumbnail} transition-all duration-700 group-hover:scale-110`}
                    >
                      {/* Animated Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-4 right-8 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="absolute top-12 right-16 w-1 h-1 bg-white rounded-full animate-bounce"></div>
                      <div className="absolute top-8 right-4 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                    </div>

                    {/* Status & Complexity Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getComplexityColor(
                          project.complexity
                        )}`}
                      >
                        {project.complexity}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-6 space-y-4">
                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {project.description}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-2">
                        Technologies:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-md border border-amber-200"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-md">
                            +{project.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Meta */}
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {project.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {project.team} team members
                      </div>
                    </div>

                    {/* Action Button */}
                    <div
                      onClick={() => {
                        console.log(
                          `Navigating to project ${project.id} details`
                        );
                        window.location.href = `/projects/${project.id}`;
                      }}
                      className={`w-full py-3 px-4 bg-gradient-to-r ${project.thumbnail} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 mt-4 cursor-pointer`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>View Details</span>
                        <svg
                          className="w-4 h-4 transition-transform duration-300"
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
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Want to Collaborate?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join our team of researchers and developers working on
                cutting-edge AI projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div
                  onClick={() => {
                    console.log("Navigating to contact page");
                    window.location.href = "/contact";
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                  Get in Touch
                </div>
                <div
                  onClick={() => {
                    console.log("Navigating to publications page");
                    window.location.href = "/publications";
                  }}
                  className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 cursor-pointer"
                >
                  View Research
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
