"use client";
import { useState, useRef, useEffect } from 'react';

const GalleryCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);

  const galleryImages = [
    {
      id: 1,
      gradient: "from-purple-500 via-pink-500 to-red-500",
      prompt: "Cyberpunk cityscape at neon-lit night",
      style: "Digital Art",
      model: "DALL-E 3"
    },
    {
      id: 2,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      prompt: "Serene mountain landscape with aurora borealis",
      style: "Photorealistic",
      model: "Midjourney"
    },
    {
      id: 3,
      gradient: "from-green-500 via-emerald-500 to-cyan-500",
      prompt: "Abstract geometric patterns in motion",
      style: "Abstract",
      model: "Stable Diffusion"
    },
    {
      id: 4,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      prompt: "Vintage robot in steampunk laboratory",
      style: "Steampunk",
      model: "DALL-E 3"
    },
    {
      id: 5,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      prompt: "Ethereal portrait with flowing light effects",
      style: "Portrait",
      model: "Midjourney"
    },
    {
      id: 6,
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      prompt: "Futuristic space station orbiting alien planet",
      style: "Sci-Fi",
      model: "Stable Diffusion"
    },
    {
      id: 7,
      gradient: "from-teal-500 via-blue-500 to-purple-500",
      prompt: "Mystical forest with bioluminescent creatures",
      style: "Fantasy",
      model: "DALL-E 3"
    },
    {
      id: 8,
      gradient: "from-rose-500 via-pink-500 to-purple-500",
      prompt: "Art deco architecture in golden hour",
      style: "Architecture",
      model: "Midjourney"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, galleryImages.length]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <svg className="w-4 h-4 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-purple-200">AI Generated Gallery</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Generative Showcase
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Explore stunning AI-generated artwork created with state-of-the-art 
            generative models and creative prompting techniques.
          </p>
        </div>

        {/* Main Carousel */}
        <div className="relative mb-12">
          {/* Main Display */}
          <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl"
               onMouseEnter={() => setIsAutoPlaying(false)}
               onMouseLeave={() => setIsAutoPlaying(true)}>
            
            <div className={`absolute inset-0 bg-gradient-to-br ${galleryImages[currentIndex].gradient} transition-all duration-1000`}>
              {/* Overlay Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full"
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                       backgroundSize: '60px 60px'
                     }}
                ></div>
              </div>
            </div>

            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full">
                    {galleryImages[currentIndex].style}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-purple-500/30 backdrop-blur-sm text-purple-200 rounded-full">
                    {galleryImages[currentIndex].model}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {galleryImages[currentIndex].prompt}
                </h3>
                <div className="flex items-center text-gray-300 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generated with {galleryImages[currentIndex].model}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex justify-center mt-8">
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`w-16 h-16 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    index === currentIndex 
                      ? 'ring-2 ring-white scale-105' 
                      : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${image.gradient} rounded-xl`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">10K+ Images</h3>
            <p className="text-gray-300">Generated and curated</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">50+ Models</h3>
            <p className="text-gray-300">Different AI architectures</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100+ Styles</h3>
            <p className="text-gray-300">Artistic variations</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Your Own</span>
            <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default GalleryCarousel;
