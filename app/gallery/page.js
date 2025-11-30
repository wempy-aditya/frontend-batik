"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or masonry

  const categories = [
    { id: "all", name: "All", icon: "🎨" },
    { id: "digital-art", name: "Digital Art", icon: "🖼️" },
    { id: "photorealistic", name: "Photorealistic", icon: "📷" },
    { id: "abstract", name: "Abstract", icon: "🌀" },
    { id: "portrait", name: "Portrait", icon: "👤" },
    { id: "landscape", name: "Landscape", icon: "🏞️" },
    { id: "sci-fi", name: "Sci-Fi", icon: "🚀" },
    { id: "fantasy", name: "Fantasy", icon: "🧙" },
  ];

  const galleryItems = [
    {
      id: 1,
      title: "Cyberpunk Cityscape",
      category: "digital-art",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      model: "DALL-E 3",
      prompt: "Neon-lit cyberpunk city at night with flying cars",
      likes: 1240,
      views: 5420,
      downloads: 320,
    },
    {
      id: 2,
      title: "Aurora Mountain",
      category: "landscape",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      model: "Midjourney",
      prompt:
        "Serene mountain landscape with aurora borealis dancing in the sky",
      likes: 2156,
      views: 8920,
      downloads: 540,
    },
    {
      id: 3,
      title: "Geometric Dreams",
      category: "abstract",
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
      model: "Stable Diffusion",
      prompt:
        "Abstract geometric patterns with flowing motion and vibrant colors",
      likes: 890,
      views: 3240,
      downloads: 210,
    },
    {
      id: 4,
      title: "Steampunk Robot",
      category: "digital-art",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      model: "DALL-E 3",
      prompt: "Vintage robot working in a Victorian steampunk laboratory",
      likes: 1876,
      views: 6780,
      downloads: 450,
    },
    {
      id: 5,
      title: "Ethereal Portrait",
      category: "portrait",
      gradient: "from-orange-600 via-amber-600 to-yellow-500",
      model: "Midjourney",
      prompt:
        "Ethereal portrait with flowing light effects and dreamy atmosphere",
      likes: 3240,
      views: 12500,
      downloads: 890,
    },
    {
      id: 6,
      title: "Space Station Orbit",
      category: "sci-fi",
      gradient: "from-amber-500 via-yellow-500 to-orange-500",
      model: "Stable Diffusion",
      prompt: "Futuristic space station orbiting a mysterious alien planet",
      likes: 1654,
      views: 7120,
      downloads: 380,
    },
    {
      id: 7,
      title: "Mystical Forest",
      category: "fantasy",
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      model: "DALL-E 3",
      prompt:
        "Enchanted forest with bioluminescent creatures and magical atmosphere",
      likes: 2890,
      views: 10340,
      downloads: 670,
    },
    {
      id: 8,
      title: "Art Deco Architecture",
      category: "photorealistic",
      gradient: "from-red-500 via-orange-500 to-amber-500",
      model: "Midjourney",
      prompt: "Stunning art deco building photographed during golden hour",
      likes: 1450,
      views: 5890,
      downloads: 420,
    },
    {
      id: 9,
      title: "Cosmic Nebula",
      category: "abstract",
      gradient: "from-purple-500 via-pink-500 to-orange-500",
      model: "Stable Diffusion",
      prompt: "Colorful cosmic nebula with swirling gases and star formations",
      likes: 2340,
      views: 9120,
      downloads: 560,
    },
    {
      id: 10,
      title: "Dragon's Lair",
      category: "fantasy",
      gradient: "from-red-600 via-orange-600 to-yellow-500",
      model: "DALL-E 3",
      prompt: "Majestic dragon resting in a treasure-filled mountain cave",
      likes: 3890,
      views: 15200,
      downloads: 1020,
    },
    {
      id: 11,
      title: "Urban Sunset",
      category: "photorealistic",
      gradient: "from-orange-400 via-amber-400 to-yellow-400",
      model: "Midjourney",
      prompt: "Modern city skyline at sunset with dramatic cloud formations",
      likes: 1980,
      views: 7650,
      downloads: 490,
    },
    {
      id: 12,
      title: "Future Metropolis",
      category: "sci-fi",
      gradient: "from-cyan-500 via-blue-500 to-purple-500",
      model: "Stable Diffusion",
      prompt:
        "Futuristic metropolis with holographic displays and flying vehicles",
      likes: 2670,
      views: 11230,
      downloads: 720,
    },
    {
      id: 13,
      title: "Abstract Waves",
      category: "abstract",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      model: "DALL-E 3",
      prompt:
        "Flowing abstract waves with gradient colors and smooth transitions",
      likes: 1230,
      views: 4890,
      downloads: 340,
    },
    {
      id: 14,
      title: "Desert Wanderer",
      category: "landscape",
      gradient: "from-yellow-600 via-orange-600 to-red-600",
      model: "Midjourney",
      prompt: "Lone wanderer crossing vast sand dunes under a burning sun",
      likes: 1560,
      views: 6340,
      downloads: 410,
    },
    {
      id: 15,
      title: "Neon Samurai",
      category: "digital-art",
      gradient: "from-pink-500 via-purple-500 to-blue-500",
      model: "Stable Diffusion",
      prompt: "Cyberpunk samurai warrior in neon-lit Tokyo street",
      likes: 4120,
      views: 18900,
      downloads: 1340,
    },
    {
      id: 16,
      title: "Crystal Cave",
      category: "fantasy",
      gradient: "from-blue-400 via-cyan-400 to-teal-400",
      model: "DALL-E 3",
      prompt: "Underground cave filled with glowing crystal formations",
      likes: 2780,
      views: 10890,
      downloads: 680,
    },
    {
      id: 17,
      title: "Renaissance Portrait",
      category: "portrait",
      gradient: "from-amber-600 via-orange-600 to-red-600",
      model: "Midjourney",
      prompt: "Classical Renaissance-style portrait with dramatic lighting",
      likes: 1890,
      views: 7230,
      downloads: 520,
    },
    {
      id: 18,
      title: "Ocean Depths",
      category: "landscape",
      gradient: "from-blue-600 via-cyan-500 to-teal-500",
      model: "Stable Diffusion",
      prompt: "Mysterious underwater scene with bioluminescent sea creatures",
      likes: 2340,
      views: 9560,
      downloads: 590,
    },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  const openModal = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-400 mb-8">
            <button
              onClick={() => router.push("/")}
              className="hover:text-amber-400 transition-colors"
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
            <span className="text-amber-400">Gallery</span>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <svg
                className="w-4 h-4 text-amber-400 mr-2"
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
              <span className="text-sm font-semibold text-amber-200">
                AI Art Collection
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Gallery Showcase
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our curated collection of AI-generated artwork from
              various styles and models
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Grid View
              </button>
              <button
                onClick={() => setViewMode("masonry")}
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === "masonry"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
                  />
                </svg>
                Masonry View
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/20"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  viewMode === "masonry" && index % 3 === 0
                    ? "md:row-span-2"
                    : ""
                }`}
                onClick={() => openModal(item)}
              >
                {/* Image Container */}
                <div
                  className={`relative ${
                    viewMode === "masonry" && index % 3 === 0 ? "h-96" : "h-72"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}
                  >
                    {/* Overlay Pattern */}
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

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-white mx-auto mb-2"
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
                      <p className="text-white font-semibold">View Details</p>
                    </div>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-300">{item.model}</span>
                    <div className="flex items-center gap-3 text-gray-300">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                        {item.likes}
                      </span>
                      <span className="flex items-center">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {item.views}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <svg
                className="w-5 h-5 mr-2"
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
              Load More Images
            </button>
          </div>
        </div>
      </section>

      {/* Modal for Image Details */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors"
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

            <div className="grid md:grid-cols-2 gap-6 bg-stone-900 rounded-2xl overflow-hidden">
              {/* Image */}
              <div
                className={`relative h-96 md:h-[600px] bg-gradient-to-br ${selectedImage.gradient}`}
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

              {/* Details */}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {selectedImage.title}
                </h2>

                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 text-sm font-medium bg-amber-500/20 text-amber-300 rounded-full">
                    {selectedImage.model}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-white/10 text-gray-300 rounded-full">
                    {
                      categories.find((c) => c.id === selectedImage.category)
                        ?.name
                    }
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    PROMPT
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedImage.prompt}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <svg
                      className="w-6 h-6 text-amber-400 mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    <p className="text-white font-bold">
                      {selectedImage.likes}
                    </p>
                    <p className="text-gray-400 text-xs">Likes</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <svg
                      className="w-6 h-6 text-amber-400 mx-auto mb-2"
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
                    <p className="text-white font-bold">
                      {selectedImage.views}
                    </p>
                    <p className="text-gray-400 text-xs">Views</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <svg
                      className="w-6 h-6 text-amber-400 mx-auto mb-2"
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
                    <p className="text-white font-bold">
                      {selectedImage.downloads}
                    </p>
                    <p className="text-gray-400 text-xs">Downloads</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                    <svg
                      className="w-5 h-5 inline mr-2"
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
                    Download
                  </button>
                  <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </button>
                  <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300">
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
