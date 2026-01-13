"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_BATIKGAN_API_URL || 'http://localhost:5001';

export default function BatikGANGalleryPage() {
  const router = useRouter();
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGalleryImages(data.images || []);
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

  const formatFileSize = (sizeKb) => {
    if (sizeKb < 1024) {
      return `${sizeKb.toFixed(1)} KB`;
    }
    return `${(sizeKb / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm-45 0c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-teal-500/20 backdrop-blur-sm rounded-full border border-teal-400/30">
            <span className="text-teal-200 text-sm font-medium">
              🖼️ BatikGAN Collection
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Generated Batik
            <span className="block mt-2 bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore batik patterns created by multiple GAN models
          </p>
          <button
            onClick={() => router.push("/batikgan")}
            className="px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🎨 Create New Batik
          </button>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Stats Bar */}
          {!isLoading && galleryImages.length > 0 && (
            <div className="mb-12 bg-white rounded-2xl shadow-xl p-6 border border-teal-100">
              <div className="flex justify-center items-center gap-8 flex-wrap">
                <div className="text-center">
                  <div className="text-4xl font-bold text-teal-600">{galleryImages.length}</div>
                  <div className="text-gray-600 font-medium">Generated Images</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-600">6</div>
                  <div className="text-gray-600 font-medium">GAN Models</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">
                    {formatFileSize(
                      galleryImages.reduce((sum, img) => sum + (img.size_kb || 0), 0)
                    )}
                  </div>
                  <div className="text-gray-600 font-medium">Total Size</div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Loading gallery...</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-teal-100">
              <span className="text-8xl mb-6 block">🎨</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No images in gallery yet
              </h3>
              <p className="text-gray-600 mb-8">
                Start generating batik patterns to build your collection
              </p>
              <button
                onClick={() => router.push("/batikgan")}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 inline-block"
              >
                Generate First Batik
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => openImageModal(image)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={`${API_BASE_URL}/${image.image_url}`}
                      alt={image.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-semibold text-sm mb-1">
                          🔍 View Full Image
                        </p>
                        {image.size_kb && (
                          <p className="text-teal-200 text-xs">
                            {formatFileSize(image.size_kb)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* File Size Badge */}
                    {image.size_kb && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatFileSize(image.size_kb)}
                      </div>
                    )}
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
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-xl">Batik Pattern</h3>
                {selectedImage.filename && (
                  <p className="text-teal-100 text-sm">{selectedImage.filename}</p>
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
            <div className="p-6 max-h-[calc(90vh-12rem)] overflow-auto">
              <img
                src={`${API_BASE_URL}/${selectedImage.image_url}`}
                alt="Full size batik"
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-200 flex-wrap gap-4">
              <div className="text-gray-600 text-sm">
                {selectedImage.created_at && (
                  <p className="mb-1">
                    <span className="font-medium">Created:</span> {formatDate(selectedImage.created_at)}
                  </p>
                )}
                {selectedImage.size_kb && (
                  <p>
                    <span className="font-medium">Size:</span> {formatFileSize(selectedImage.size_kb)}
                  </p>
                )}
              </div>
              <a
                href={`${API_BASE_URL}/${selectedImage.download_url || selectedImage.image_url}`}
                download={selectedImage.filename || `batik-${Date.now()}.png`}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
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
