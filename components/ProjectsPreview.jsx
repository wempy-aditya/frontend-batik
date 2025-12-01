"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const ProjectsPreview = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const carouselRef = useRef(null);

  const projects = [
    {
      id: 1,
      title: "Neural Style Transfer",
      description:
        "Transform artistic styles using advanced neural networks and deep learning algorithms.",
      category: "Generative AI",
      categoryColor: "from-purple-500 to-pink-500",
      technologies: ["TensorFlow", "VGG-19", "PyTorch", "Neural Networks"],
      icon: (
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      id: 2,
      title: "Object Detection & Segmentation",
      description:
        "Real-time object detection and instance segmentation using YOLO and Mask R-CNN architectures.",
      category: "Computer Vision",
      categoryColor: "from-blue-500 to-cyan-500",
      technologies: ["YOLO", "Mask R-CNN", "OpenCV", "PyTorch"],
      icon: (
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
    },
    {
      id: 3,
      title: "Image Super-Resolution",
      description:
        "Enhance image quality and resolution using ESRGAN and SRCNN models with GANs technology.",
      category: "Image Enhancement",
      categoryColor: "from-green-500 to-emerald-500",
      technologies: ["ESRGAN", "SRCNN", "GANs", "TensorFlow"],
      icon: (
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-500/10 to-amber-500/10",
    },
    {
      id: 4,
      title: "Facial Recognition System",
      description:
        "Advanced facial recognition with privacy-focused design and real-time processing capabilities.",
      category: "Biometric AI",
      categoryColor: "from-indigo-500 to-purple-500",
      technologies: ["FaceNet", "OpenCV", "Dlib", "Python"],
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      gradient: "from-amber-600 to-orange-600",
      bgGradient: "from-amber-600/10 to-orange-600/10",
    },
    {
      id: 5,
      title: "Semantic Image Segmentation",
      description:
        "Pixel-level classification for scene understanding using DeepLab and U-Net architectures.",
      category: "Computer Vision",
      categoryColor: "from-blue-500 to-cyan-500",
      technologies: ["DeepLab", "U-Net", "TensorFlow", "Keras"],
      icon: (
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
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
      gradient: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-500/10 to-cyan-500/10",
    },
    {
      id: 6,
      title: "Text-to-Image Generation",
      description:
        "Create photorealistic images from textual descriptions using Stable Diffusion and DALL-E.",
      category: "Generative AI",
      categoryColor: "from-purple-500 to-pink-500",
      technologies: ["Stable Diffusion", "DALL-E", "Transformers", "PyTorch"],
      icon: (
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-500/10 to-rose-500/10",
    },
    {
      id: 7,
      title: "3D Object Reconstruction",
      description:
        "Generate 3D models from 2D images using Neural Radiance Fields (NeRF) technology.",
      category: "3D Vision",
      categoryColor: "from-violet-500 to-purple-500",
      technologies: ["NeRF", "Point Cloud", "3D CNNs", "PyTorch3D"],
      icon: (
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
            d="Mكعبة20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/10 to-purple-500/10",
    },
    {
      id: 8,
      title: "Medical Image Analysis",
      description:
        "AI-powered diagnosis and disease detection from X-rays, MRIs, and CT scans.",
      category: "Healthcare AI",
      categoryColor: "from-red-500 to-pink-500",
      technologies: ["ResNet", "VGG", "Medical Imaging", "TensorFlow"],
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      gradient: "from-red-500 to-orange-500",
      bgGradient: "from-red-500/10 to-orange-500/10",
    },
    {
      id: 9,
      title: "Video Action Recognition",
      description:
        "Identify and classify human actions in videos using temporal convolutional networks.",
      category: "Video Analysis",
      categoryColor: "from-cyan-500 to-blue-500",
      technologies: ["3D CNNs", "LSTM", "Temporal Networks", "PyTorch"],
      icon: (
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-500/10 to-blue-500/10",
    },
    {
      id: 10,
      title: "Autonomous Vehicle Vision",
      description:
        "Real-time road scene understanding for self-driving cars with lane and obstacle detection.",
      category: "Robotics & Automation",
      categoryColor: "from-slate-500 to-gray-500",
      technologies: ["LiDAR", "Computer Vision", "ROS", "Deep Learning"],
      icon: (
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      gradient: "from-slate-600 to-gray-600",
      bgGradient: "from-slate-600/10 to-gray-600/10",
    },
  ];

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, projects.length - itemsPerPage);

  const scrollToIndex = (index) => {
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
  };

  const handlePrev = () => {
    scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  return (
    <section className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Cpath d='M0 0h40v40H0zm40 40h40v40H40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full text-sm font-medium text-amber-700 mb-6">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Featured AI Projects
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Innovative
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              AI Projects
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover our cutting-edge research and development projects
            showcasing the latest advances in computer vision and machine
            learning technology.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-20">
          {/* Carousel Navigation Buttons */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center transition-all duration-300 ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:scale-110"
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
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center transition-all duration-300 ${
              currentIndex >= maxIndex
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white hover:scale-110"
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

          {/* Projects Carousel */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex transition-transform duration-500 ease-out gap-8"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerPage + 2)
                }%)`,
              }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerPage}% - 1.5rem)` }}
                  onMouseEnter={() => setHoveredCard(project.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Main Card */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-6 hover:scale-105 h-full">
                    {/* Gradient Background on Hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                    ></div>

                    {/* Animated Border Glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${project.gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-700 scale-105`}
                    ></div>

                    {/* Content */}
                    <div className="relative z-10 space-y-6">
                      {/* Icon Container */}
                      <div className="relative">
                        <div
                          className={`w-20 h-20 bg-gradient-to-br ${project.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-700`}
                        >
                          {project.icon}
                        </div>
                        {/* Icon Glow Effect */}
                        <div
                          className={`absolute inset-0 w-20 h-20 bg-gradient-to-br ${project.gradient} rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-700`}
                        ></div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-500">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-500">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-200 hover:bg-gray-200 transition-all duration-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Learn More Link */}
                      <div className="flex items-center justify-between pt-4">
                        <button
                          onClick={() => router.push(`/projects/${project.id}`)}
                          className="flex items-center cursor-pointer"
                        >
                          <span
                            className={`text-sm font-semibold bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent transition-all duration-500 group-hover:translate-x-1`}
                          >
                            View Project
                          </span>
                          <svg
                            className="w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-500"
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

                        {/* Project Number */}
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${project.gradient} text-white text-sm font-bold rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 transition-all duration-500`}
                        >
                          {project.id}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Highlight Line */}
                    <div
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-32 h-1 bg-gradient-to-r ${project.gradient} rounded-full transition-all duration-700`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-gradient-to-r from-amber-500 to-orange-500"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center relative z-50 mt-10">
          <button
            onClick={() => router.push("/projects")}
            className="group inline-flex items-center px-12 py-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span>Explore All Projects</span>
            <svg
              className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1"
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

export default ProjectsPreview;
