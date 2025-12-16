"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DatasetsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState("all");
  const [hoveredDataset, setHoveredDataset] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const accessTypes = [
    { id: "all", name: "All Access" },
    { id: "Public", name: "Public" },
    { id: "Registered", name: "Registered" },
    { id: "Premium", name: "Premium" },
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/datasets/categories');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const allCategories = [
              { id: "all", name: "All Datasets", slug: "all" },
              ...data
            ];
            setCategories(allCategories);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([
          { id: "all", name: "All Datasets", slug: "all" },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        let url = `/api/datasets/public?page=${currentPage}&items_per_page=12`;
        
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        if (selectedCategory !== "all") {
          url = `/api/datasets/category/${selectedCategory}?page=${currentPage}&items_per_page=12`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
          if (data && Array.isArray(data.data)) {
            setDatasets(data.data);
            setTotalPages(data.pages || 1);
          } else if (Array.isArray(data)) {
            setDatasets(data);
          } else {
            console.log('Datasets data structure:', data);
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
  }, [selectedCategory, searchQuery, currentPage]);

  const fallbackDatasets = [
    {
      id: "019ae4b2-d4c7-7a18-890d-80db7143746a",
      name: "ImageNet-2024",
      slug: "imagenet-2024",
      description:
        "Large-scale dataset with over 14 million images across 20,000+ categories for object recognition research and deep learning training.",
      tagline: "Large-scale visual recognition challenge dataset",
      samples: 14200000,
      download_count: 250000,
      gradient: "#FF6B6B,#F59E0B",
      version: "2024.1",
      format: "JPEG",
      license: "Academic Use",
      citation: "Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K., & Fei-Fei, L. (2024). ImageNet: A large-scale hierarchical image database.",
      key_features: [
        "14.2 million annotated images",
        "20,000+ hierarchical categories",
        "Multiple annotation types",
        "High-quality manual verification",
      ],
      use_cases: [
        "Object Recognition",
        "Image Classification",
        "Transfer Learning",
        "Model Benchmarking",
      ],
      technical_specs: {
        type: "supervised",
        access: "public",
        format: "JPEG",
        license: "Academic Use",
        version: "2024.1",
        lastUpdate: "2024-01-15",
      },
      statistics: {
        avgImageSize: "482x482",
        qualityScore: 9.85,
        totalAnnotations: 14200000,
        avgImagesPerCategory: 710,
        maxImagesPerCategory: 1300,
        minImagesPerCategory: 500,
      },
      sample_images: [],
      sample_image_url: null,
      file_url: "https://example.com/imagenet-2024.zip",
      source: "Stanford Vision Lab",
      size: 161061273600,
      access_level: "public",
      status: "published",
      categories: ["Computer Vision", "Image Classification"],
      creator_name: "ImageNet Team",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    },
  ];

  // Display datasets with fallback
  const displayDatasets = loading ? [] : (datasets.length > 0 ? datasets : fallbackDatasets);

  // Local filter for access type (since API doesn't support this filter yet)
  const filteredDatasets = displayDatasets.filter((dataset) => {
    const accessMatch =
      selectedAccess === "all" || dataset.access_level === selectedAccess || dataset.accessType === selectedAccess;
    return accessMatch;
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const getAccessColor = (accessType) => {
    const type = accessType?.toLowerCase();
    switch (type) {
      case "public":
        return "bg-green-100 text-green-800 border-green-200";
      case "registered":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "premium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper functions
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getGradientClass = (gradientString) => {
    // Convert hex gradient to Tailwind classes or use default
    if (!gradientString) return "from-amber-500 to-orange-500";
    // Default gradient for now
    return "from-amber-500 to-orange-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30m-4 0a4 4 0 1 1 8 0a4 4 0 1 1 -8 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-300 mb-8">
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
            <span className="text-white">Datasets</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg
                className="w-4 h-4 text-blue-400"
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
              <span className="text-sm font-semibold text-gray-200">
                Complete Dataset Library
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-gray-100 to-blue-100 bg-clip-text text-transparent">
                Research Datasets
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Explore our comprehensive collection of curated datasets for
              machine learning research. From computer vision to NLP, find the
              perfect data for your next breakthrough.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  18+
                </div>
                <div className="text-sm text-gray-400">Datasets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  50M+
                </div>
                <div className="text-sm text-gray-400">Samples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  1TB+
                </div>
                <div className="text-sm text-gray-400">Total Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  500K+
                </div>
                <div className="text-sm text-gray-400">Downloads</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Datasets Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search datasets by name or description..."
                className="w-full px-6 py-4 pl-12 bg-white rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-12 space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id || category.slug)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
                      selectedCategory === (category.id || category.slug)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Access Type Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Filter by Access
              </h3>
              <div className="flex flex-wrap gap-3">
                {accessTypes.map((access) => (
                  <button
                    key={access.id}
                    onClick={() => setSelectedAccess(access.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
                      selectedAccess === access.id
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    {access.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Datasets Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading datasets...</p>
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-gray-600">No datasets found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {filteredDatasets.map((dataset) => (
              <div
                key={dataset.id}
                className="group relative"
                onMouseEnter={() => setHoveredDataset(dataset.id)}
                onMouseLeave={() => setHoveredDataset(null)}
              >
                {/* Dataset Card */}
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                  {/* Header with Preview */}
                  <div className="relative h-40 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(
                        dataset.gradient
                      )} transition-transform duration-700 ${
                        hoveredDataset === dataset.id ? "scale-110" : ""
                      }`}
                    ></div>

                    {/* Sample Grid Overlay */}
                    <div className="absolute inset-0 p-4">
                      <div className="grid grid-cols-4 gap-2 h-full opacity-30">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div
                            key={index}
                            className="bg-white/40 rounded-lg backdrop-blur-sm animate-pulse"
                            style={{ animationDelay: `${index * 100}ms` }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Access Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getAccessColor(
                          dataset.access_level
                        )}`}
                      >
                        {dataset.access_level || 'Public'}
                      </span>
                    </div>

                    {/* Stats Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <div className="flex justify-between text-white text-sm">
                        <span className="font-medium">
                          {formatNumber(dataset.samples)} samples
                        </span>
                        <span className="font-medium">{formatFileSize(dataset.size)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Title & Downloads */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {dataset.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 ml-2">
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
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                        {dataset.downloadCount}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {dataset.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {dataset.categories?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Categories</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {formatNumber(dataset.samples)}
                        </div>
                        <div className="text-xs text-gray-600">Samples</div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="font-medium">{dataset.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>License:</span>
                        <span className="font-medium">{dataset.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span className="font-medium">
                          {new Date(dataset.updated_at || dataset.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/datasets/${dataset.id}/download`)
                        }
                        className={`w-full py-3 px-4 bg-gradient-to-r ${getGradientClass(dataset.gradient)} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105`}
                      >
                        <div className="flex items-center justify-center gap-2">
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
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                            />
                          </svg>
                          <span>Download Dataset</span>
                        </div>
                      </button>

                      <button
                        onClick={() => router.push(`/datasets/${dataset.id}`)}
                        className="w-full py-2 px-4 text-gray-700 font-medium text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Dataset ID */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full flex items-center justify-center">
                    #
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Pagination */}
          {!loading && filteredDatasets.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === index + 1
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Need a Custom Dataset?
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  We can help you create, annotate, and validate custom datasets
                  tailored to your specific research needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => (window.location.href = "/contact")}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Contact Our Team
                  </button>
                  <button
                    onClick={() => (window.location.href = "/projects")}
                    className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                  >
                    View Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
