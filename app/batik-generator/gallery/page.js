"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/batik-rvgan';

export default function BatikGalleryPage() {
  const router = useRouter();
  const [activeDataset, setActiveDataset] = useState("nitik");
  const [nitikGallery, setNitikGallery] = useState([]);
  const [itbGallery, setItbGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      // Fetch all generated images
      const response = await fetch(`${API_BASE_URL}/gallery`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.images) {
          // Group images by dataset based on filename
          const nitikImages = data.images.filter(img => 
            img.filename.toLowerCase().includes('nitik')
          );
          const itbImages = data.images.filter(img => 
            img.filename.toLowerCase().includes('itb')
          );
          
          setNitikGallery(nitikImages);
          setItbGallery(itbImages);
        }
      }
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const currentGallery = activeDataset === "nitik" ? nitikGallery : itbGallery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
            <span className="text-purple-200 text-sm font-medium">
              🖼️ AI-Generated Collection
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Batik Pattern
            <span className="block mt-2 bg-gradient-to-r from-purple-400 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of AI-generated batik patterns
          </p>
          <button
            onClick={() => router.push("/batik-generator")}
            className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🎨 Create Your Own Batik
          </button>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Dataset Tabs */}
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setActiveDataset("nitik")}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  activeDataset === "nitik"
                    ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🌸 Nitik Gallery
                {nitikGallery.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                    {nitikGallery.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveDataset("itb")}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  activeDataset === "itb"
                    ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🎭 ITB Gallery
                {itbGallery.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                    {itbGallery.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Loading gallery...</p>
            </div>
          ) : currentGallery.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-purple-100">
              <span className="text-8xl mb-6 block">🎨</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No images in {activeDataset === "nitik" ? "Nitik" : "ITB"} gallery yet
              </h3>
              <p className="text-gray-600 mb-8">
                Start generating batik patterns to build your collection
              </p>
              <button
                onClick={() => router.push("/batik-generator")}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 inline-block"
              >
                Generate First Batik
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {currentGallery.map((image, index) => (
                <div
                  key={index}
                  onClick={() => openImageModal(image)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={`${API_BASE_URL}${image.image_url}`}
                      alt={`Batik ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-semibold text-sm">
                          🔍 View Full Image
                        </p>
                        {image.created_at && (
                          <p className="text-purple-200 text-xs mt-1">
                            {new Date(image.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-xl">{selectedImage.filename}</h3>
                {selectedImage.size_kb && (
                  <p className="text-purple-100 text-sm">{selectedImage.size_kb.toFixed(2)} KB</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(90vh-8rem)] overflow-auto">
              <img
                src={`${API_BASE_URL}${selectedImage.image_url}`}
                alt="Full size batik"
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-200">
              <div className="text-gray-600">
                {selectedImage.created_at && (
                  <p className="text-sm">
                    Created: {new Date(selectedImage.created_at).toLocaleString()}
                  </p>
                )}
              </div>
              <a
                href={`${API_BASE_URL}${selectedImage.download_url}`}
                download={selectedImage.filename}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                📥 Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
