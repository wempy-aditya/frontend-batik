"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DatasetsPreview = () => {
  const [hoveredDataset, setHoveredDataset] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch featured datasets from API
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await fetch('/api/datasets/featured?limit=3');
        if (response.ok) {
          const data = await response.json();
          // Ensure data is array
          if (Array.isArray(data)) {
            setDatasets(data);
          } else if (data && Array.isArray(data.data)) {
            setDatasets(data.data);
          } else {
            console.log('Datasets data is not array:', data);
            setDatasets([]);
          }
        }
      } catch (error) {
        console.error('Error fetching datasets:', error);
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const fallbackDatasets = [
    {
      id: 1,
      name: "ImageNet-2024",
      description: "Large-scale dataset with over 14 million images across 20,000+ categories for object recognition research.",
      size: "150GB",
      samples: "14.2M",
      categories: "20K+",
      accessType: "Public",
      downloadCount: "250K+",
      lastUpdated: "2024-01-15",
      previewGradient: "from-amber-500 to-orange-500",
      accessColor: "bg-green-100 text-green-800"
    },
    {
      id: 2,
      name: "COCO-Enhanced",
      description: "Extended version of MS COCO dataset with additional annotations for instance segmentation and panoptic understanding.",
      size: "45GB",
      samples: "330K",
      categories: "150",
      accessType: "Registered",
      downloadCount: "125K+",
      lastUpdated: "2023-11-20",
      previewGradient: "from-orange-500 to-red-500",
      accessColor: "bg-blue-100 text-blue-800"
    },
    {
      id: 3,
      name: "Artistic Styles DB",
      description: "Curated collection of artistic images spanning various styles, periods, and techniques for neural style transfer research.",
      size: "12GB",
      samples: "85K",
      categories: "50",
      accessType: "Premium",
      downloadCount: "45K+",
      lastUpdated: "2024-02-10",
      previewGradient: "from-yellow-500 to-amber-500",
      accessColor: "bg-amber-100 text-amber-800"
    }
  ];

  const displayDatasets = loading ? [] : (datasets.length > 0 ? datasets : fallbackDatasets);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-6">
            <svg className="w-4 h-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Research Datasets</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Curated Datasets
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Access high-quality, well-annotated datasets for training and benchmarking 
            your computer vision models with confidence.
          </p>
        </div>

        {/* Datasets Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-gray-400">Loading datasets...</div>
          ) : displayDatasets.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-400">No datasets available</div>
          ) : displayDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="group relative"
              onMouseEnter={() => setHoveredDataset(dataset.id)}
              onMouseLeave={() => setHoveredDataset(null)}
            >
              {/* Dataset Card */}
              <div className={`relative bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 transition-all duration-500 transform hover:-translate-y-1 ${
                hoveredDataset === dataset.id ? 'shadow-2xl scale-102' : ''
              }`}>
                
                {/* Header with Preview */}
                <div className="relative h-40 overflow-hidden">
                  {/* Background - Gradient or Image */}
                  {dataset.sample_image_url ? (
                    <>
                      <img 
                        src={dataset.sample_image_url}
                        alt={`${dataset.title || dataset.name} preview`}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                          hoveredDataset === dataset.id ? 'scale-110' : ''
                        }`}
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div 
                        className={`hidden absolute inset-0 bg-gradient-to-br ${dataset.previewGradient || 'from-gray-400 to-gray-600'} transition-transform duration-700 ${
                          hoveredDataset === dataset.id ? 'scale-110' : ''
                        }`}
                      ></div>
                      {/* Overlay for better text visibility */}
                      <div className="absolute inset-0 bg-black/20"></div>
                    </>
                  ) : (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${dataset.previewGradient || 'from-gray-400 to-gray-600'} transition-transform duration-700 ${
                        hoveredDataset === dataset.id ? 'scale-110' : ''
                      }`}></div>
                      
                      {/* Sample Grid Overlay - only shown when no image */}
                      <div className="absolute inset-0 p-4">
                        <div className="grid grid-cols-4 gap-2 h-full opacity-30">
                          {Array.from({length: 8}).map((_, index) => (
                            <div
                              key={index}
                              className="bg-white/40 rounded-lg backdrop-blur-sm animate-pulse"
                              style={{ animationDelay: `${index * 100}ms` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Access Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${dataset.accessColor || 'bg-green-100 text-green-800'} shadow-md`}>
                      {dataset.accessType || dataset.access_level || 'Public'}
                    </span>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-10">
                    <div className="flex justify-between text-white text-sm font-medium">
                      <span>{dataset.samples ? dataset.samples.toLocaleString() : 'N/A'} samples</span>
                      <span>{dataset.size ? `${(dataset.size / (1024 * 1024 * 1024)).toFixed(1)}GB` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {dataset.title || dataset.name}
                    </h3>
                    {dataset.downloadCount && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        {dataset.downloadCount}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {dataset.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">{dataset.categories}</div>
                      <div className="text-xs text-gray-600">Categories</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">{dataset.samples}</div>
                      <div className="text-xs text-gray-600">Samples</div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  {(dataset.updated_at || dataset.lastUpdated) && (
                    <div className="text-xs text-gray-500 mb-4">
                      Last updated: {new Date(dataset.updated_at || dataset.lastUpdated).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => router.push(`/datasets/${dataset.slug || dataset.id}`)}
                      className={`w-full py-3 px-4 bg-gradient-to-r ${dataset.previewGradient || 'from-indigo-500 to-purple-500'} text-white font-semibold rounded-xl transition-all duration-300 transform ${
                        hoveredDataset === dataset.id ? 'scale-105 shadow-lg' : 'hover:scale-105'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Dataset</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Custom Dataset?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We can help you create, annotate, and validate custom datasets tailored to your specific research needs.
            </p>
            <button 
              onClick={() => window.location.href = '/contact'}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <span>Contact Our Team</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>

          <button 
            onClick={() => {
              console.log('Navigating to datasets page');
              window.location.href = '/datasets';
            }}
            className="group inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-gray-50"
          >
            <span>Browse All Datasets</span>
            <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DatasetsPreview;
