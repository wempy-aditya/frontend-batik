"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Helper function to truncate text by character count
const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

const GalleryCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const router = useRouter();

  // Fetch featured gallery from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch("/api/gallery/featured?limit=8");
        if (response.ok) {
          const data = await response.json();
          // Ensure data is array
          if (Array.isArray(data)) {
            setGalleryImages(data);
          } else if (data && Array.isArray(data.data)) {
            setGalleryImages(data.data);
          } else {
            console.log("Gallery data is not array:", data);
            setGalleryImages([]);
          }
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const fallbackGalleryImages = [
    // {
    //   id: 1,
    //   gradient: "from-amber-500 via-orange-500 to-red-500",
    //   prompt: "Cyberpunk cityscape at neon-lit night",
    //   style: "Digital Art",
    //   model: "DALL-E 3",
    // },
    // {
    //   id: 2,
    //   gradient: "from-orange-500 via-red-500 to-pink-500",
    //   prompt: "Serene mountain landscape with aurora borealis",
    //   style: "Photorealistic",
    //   model: "Midjourney",
    // },
    // {
    //   id: 3,
    //   gradient: "from-yellow-500 via-amber-500 to-orange-500",
    //   prompt: "Abstract geometric patterns in motion",
    //   style: "Abstract",
    //   model: "Stable Diffusion",
    // },
    // {
    //   id: 4,
    //   gradient: "from-amber-500 via-orange-500 to-red-500",
    //   prompt: "Vintage robot in steampunk laboratory",
    //   style: "Steampunk",
    //   model: "DALL-E 3",
    // },
    // {
    //   id: 5,
    //   gradient: "from-orange-600 via-amber-600 to-yellow-500",
    //   prompt: "Ethereal portrait with flowing light effects",
    //   style: "Portrait",
    //   model: "Midjourney",
    // },
    // {
    //   id: 6,
    //   gradient: "from-amber-500 via-yellow-500 to-orange-500",
    //   prompt: "Futuristic space station orbiting alien planet",
    //   style: "Sci-Fi",
    //   model: "Stable Diffusion",
    // },
    // {
    //   id: 7,
    //   gradient: "from-orange-500 via-amber-500 to-yellow-500",
    //   prompt: "Mystical forest with bioluminescent creatures",
    //   style: "Fantasy",
    //   model: "DALL-E 3",
    // },
    // {
    //   id: 8,
    //   gradient: "from-red-500 via-orange-500 to-amber-500",
    //   prompt: "Art deco architecture in golden hour",
    //   style: "Architecture",
    //   model: "Midjourney",
    // },
  ];

  const displayGalleryImages = loading
    ? []
    : galleryImages.length > 0
      ? galleryImages
      : fallbackGalleryImages;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || displayGalleryImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayGalleryImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayGalleryImages.length]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayGalleryImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + displayGalleryImages.length) % displayGalleryImages.length,
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
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
              AI Generated Gallery
            </span>
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
          <div
            className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full bg-gray-800/50 animate-pulse">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-white/60">Loading gallery...</div>
                </div>
              </div>
            ) : displayGalleryImages.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-gray-800/50">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-white/30 mx-auto mb-4"
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
                  <h3 className="text-white/80 text-lg font-semibold mb-2">
                    No Gallery Images
                  </h3>
                  <p className="text-white/50">
                    Check back later for exciting AI-generated artwork!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Display actual image if available from API */}
                {displayGalleryImages[currentIndex].image_url ? (
                  <img
                    src={displayGalleryImages[currentIndex].image_url}
                    alt={
                      displayGalleryImages[currentIndex].title ||
                      displayGalleryImages[currentIndex].prompt
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      displayGalleryImages[currentIndex].gradient ||
                      "from-amber-500 to-orange-500"
                    } transition-all duration-1000`}
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
                )}

                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full">
                        {displayGalleryImages[currentIndex].style ||
                          "AI Generated"}
                      </span>
                      {(displayGalleryImages[currentIndex].model ||
                        displayGalleryImages[currentIndex].ai_model) && (
                        <span className="px-3 py-1 text-xs font-medium bg-amber-500/30 backdrop-blur-sm text-amber-200 rounded-full">
                          {displayGalleryImages[currentIndex].model ||
                            displayGalleryImages[currentIndex].ai_model?.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {displayGalleryImages[currentIndex].title ||
                        displayGalleryImages[currentIndex].prompt ||
                        "AI Generated Image"}
                    </h3>
                    {displayGalleryImages[currentIndex].description ? (
                      <p className="text-gray-300 text-sm mb-2">
                        {truncateText(
                          displayGalleryImages[currentIndex].description,
                          120,
                        )}
                      </p>
                    ) : null}
                    <div className="flex items-center text-gray-300 text-sm">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Generated with{" "}
                      {displayGalleryImages[currentIndex].model ||
                        displayGalleryImages[currentIndex].ai_model?.name ||
                        "AI"}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
            >
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5"
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
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
            >
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5"
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

          {/* Thumbnail Strip */}
          {!loading && displayGalleryImages.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                {displayGalleryImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => goToImage(index)}
                    className={`w-16 h-16 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      index === currentIndex
                        ? "ring-2 ring-white scale-105"
                        : "opacity-60 hover:opacity-80"
                    }`}
                  >
                    {image.thumbnail_url || image.image_url ? (
                      <img
                        src={image.thumbnail_url || image.image_url}
                        alt={image.title || `Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${
                          image.gradient || "from-amber-500 to-orange-500"
                        } rounded-xl`}
                      ></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-6 md:mt-8">
          <button
            onClick={() => router.push("/gallery")}
            className="group inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span>View Full Gallery</span>
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

export default GalleryCarousel;
