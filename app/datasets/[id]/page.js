"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Helper functions
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const getGradientClass = (gradientString) => {
  // Placeholder - map hex colors to Tailwind gradient classes
  // You can enhance this to dynamically generate gradients
  if (!gradientString) return "from-gray-400 to-gray-600";
  return "from-amber-500 to-orange-500"; // Default fallback
};

export default function DatasetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSample, setSelectedSample] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareTooltip, setShareTooltip] = useState(false);

  // Fetch dataset detail from API
  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const response = await fetch(`/api/datasets/public/${datasetId}`);
        if (response.ok) {
          const data = await response.json();
          setDataset(data);
          // Increment view count after successful fetch
          incrementViewCount();
        } else {
          // API failed, will use fallback data
          setDataset(null);
        }
      } catch (error) {
        console.error('Error fetching dataset:', error);
        // Error occurred, will use fallback data
        setDataset(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (datasetId) {
      fetchDataset();
    }
  }, [datasetId]);

  // Increment view count
  const incrementViewCount = async () => {
    try {
      await fetch(`/api/datasets/public/${datasetId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  // Increment download count and trigger download
  const handleDownloadDataset = async () => {
    try {
      // Increment download counter
      await fetch(`/api/datasets/public/${datasetId}/download`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
    
    // Open download - this could be file_url or a download page
    if (displayDataset?.file_url) {
      window.open(displayDataset.file_url, '_blank');
    } else {
      // Scroll to download section if no direct URL
      setActiveTab('overview');
      // You can add logic to show download modal or instructions
    }
  };

  // Handle share dataset
  const handleShareDataset = async () => {
    const shareUrl = window.location.href;
    const shareTitle = displayDataset?.name || 'Dataset';
    const shareText = displayDataset?.tagline || 'Check out this dataset';

    // Try native Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Link: ' + shareUrl);
      }
    }
  };

  // Fallback dataset data (API-compliant structure)
  const datasets = {
    "019ae4b2-d4c7-7a18-890d-80db7143746a": {
      id: "019ae4b2-d4c7-7a18-890d-80db7143746a",
      name: "Indonesian Batik Patterns",
      slug: "indonesian-batik-patterns",
      description: "Comprehensive collection of traditional Indonesian batik patterns from various regions including Java, Sumatra, and Bali. Features high-resolution images with detailed annotations.",
      tagline: "Traditional Indonesian batik patterns dataset",
      samples: 50000,
      download_count: 1250,
      gradient: "#FF6B6B,#4ECDC4",
      version: "2024.1",
      format: "JPEG, PNG",
      license: "CC BY-NC 4.0",
      citation: "Indonesian Batik Research Institute (2024). Indonesian Batik Patterns Dataset.",
      key_features: [
        "50,000 high-resolution batik images",
        "Multiple regional styles",
        "Detailed pattern annotations",
        "Cultural context metadata",
        "Expert verification"
      ],
      use_cases: [
        "Pattern Recognition",
        "Cultural Heritage Preservation",
        "Machine Learning Training",
        "Design Inspiration",
        "Academic Research"
      ],
      technical_specs: {
        type: "Image Classification",
        access: "Public",
        format: "JPEG, PNG",
        license: "CC BY-NC 4.0",
        version: "2024.1",
        lastUpdate: "March 2024"
      },
      statistics: {
        avgImageSize: "2.5MB",
        qualityScore: "96.8%",
        totalAnnotations: 50000,
        avgImagesPerCategory: 850,
        maxImagesPerCategory: 1200,
        minImagesPerCategory: 500
      },
      sample_images: [],
      sample_image_url: null,
      file_url: null,
      source: "Indonesian Batik Research Institute",
      size: 125000000000,
      access_level: "public",
      status: "published",
      created_by: "019ae4b1-0000-0000-0000-000000000001",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-03-20T00:00:00Z",
      categories: ["Traditional Patterns", "Cultural Heritage", "Southeast Asian Art"],
      creator_name: "IBRI Research Team",
      downloadOptions: [
        {
          type: "Full Dataset",
          size: formatFileSize(125000000000),
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Training Set",
          size: formatFileSize(100000000000),
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Validation Set",
          size: formatFileSize(15000000000),
          format: "ZIP",
          speed: "Fast servers",
        },
        {
          type: "Test Set",
          size: formatFileSize(10000000000),
          format: "ZIP",
          speed: "Fast servers",
        },
      ],
      relatedPapers: [
        {
          title: "Pattern Recognition in Traditional Textiles",
          year: "2024",
          citations: "850",
        },
        {
          title: "Deep Learning for Cultural Heritage",
          year: "2023",
          citations: "620",
        },
        {
          title: "Batik Classification using CNN",
          year: "2024",
          citations: "430",
        },
      ],
    }
  };

  // Use API data if available, otherwise use fallback
  const currentDataset = dataset || datasets[datasetId] || datasets["019ae4b2-d4c7-7a18-890d-80db7143746a"];

  // Debug: Log dataset to check available fields
  useEffect(() => {
    if (dataset) {
      console.log('Dataset received from API:', dataset);
      console.log('Documentation URL:', dataset.documentation_url);
      console.log('External URL:', dataset.external_url);
      console.log('File URL:', dataset.file_url);
    }
  }, [dataset]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading dataset...</p>
        </div>
      </div>
    );
  }

  // Default fallback dataset (API-compliant structure)
  const defaultDataset = {
    id: "unknown",
    name: "Dataset Not Found",
    slug: "not-found",
    tagline: "This dataset is not available",
    description: "The requested dataset could not be found.",
    samples: 0,
    download_count: 0,
    gradient: "#9CA3AF,#6B7280",
    version: "1.0",
    format: "N/A",
    license: "N/A",
    citation: "N/A",
    key_features: ["Dataset not available"],
    use_cases: ["N/A"],
    technical_specs: {
      type: "N/A",
      access: "Public",
      format: "N/A",
      license: "N/A",
      version: "1.0",
      lastUpdate: "N/A"
    },
    statistics: {
      avgImageSize: "0KB",
      qualityScore: "0%",
      totalAnnotations: 0,
      avgImagesPerCategory: 0,
      maxImagesPerCategory: 0,
      minImagesPerCategory: 0
    },
    sample_images: [],
    sample_image_url: null,
    file_url: null,
    source: "N/A",
    size: 0,
    access_level: "public",
    status: "published",
    created_by: "unknown",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: [],
    creator_name: "Unknown",
    downloadOptions: [],
    relatedPapers: [],
  };

  // Determine display dataset with proper fallback chain
  const displayDataset = currentDataset || defaultDataset;

  // Not found state - only show if no dataset available at all
  if (!loading && !displayDataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dataset Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The dataset you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/datasets")}
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            Back to Datasets
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: "M4 6h16M4 12h16m-7 6h7" },
    {
      id: "samples",
      name: "Sample Data",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      id: "technical",
      name: "Metadata",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className={`relative py-20 pt-32 bg-gradient-to-r ${getGradientClass(displayDataset?.gradient)} overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='m30 60l30-30h-60l30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-white/80 mb-8">
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
            <button
              onClick={() => router.push("/datasets")}
              className="hover:text-white transition-colors"
            >
              Datasets
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
            <span className="text-white">{displayDataset?.name}</span>
          </div>

          {/* Title and Info */}
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                <svg
                  className="w-4 h-4 text-white mr-2"
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
                <span className="text-sm font-semibold text-white">
                  {(displayDataset?.access_level || 'public').charAt(0).toUpperCase() + (displayDataset?.access_level || 'public').slice(1)} Dataset
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {displayDataset?.name}
              </h1>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                {displayDataset?.tagline}
              </p>

              {/* Counter Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {displayDataset?.view_count || 0} Views
                </span>
                <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                  <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {displayDataset?.download_count || 0} Downloads
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {formatNumber(displayDataset?.samples)}
                  </div>
                  <div className="text-white/80 text-sm">Samples</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {formatFileSize(displayDataset?.size)}
                  </div>
                  <div className="text-white/80 text-sm">Total Size</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {displayDataset?.categories?.length || 0}
                  </div>
                  <div className="text-white/80 text-sm">Categories</div>
                </div>
              </div>
            </div>

            {/* Sidebar Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadDataset}
                    className="w-full px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
                  >
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Dataset
                  </button>
                  
                  {displayDataset?.documentation_url || displayDataset?.external_url || displayDataset?.file_url ? (
                    <a
                      href={displayDataset?.documentation_url || displayDataset?.external_url || displayDataset?.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
                    >
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
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      View Documentation
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full px-6 py-3 bg-white/10 text-white/50 font-semibold rounded-xl border border-white/20 cursor-not-allowed flex items-center justify-center gap-2"
                    >
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
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      No Documentation
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={handleShareDataset}
                      className="w-full px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center justify-center gap-2"
                    >
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
                      Share Dataset
                    </button>
                    {shareTooltip && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
                        Link copied!
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Version:</span>
                      <span className="font-semibold text-white">
                        {displayDataset?.version}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Format:</span>
                      <span className="font-semibold text-white">
                        {displayDataset?.format}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>License:</span>
                      <span className="font-semibold text-white">
                        {displayDataset?.license}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Updated:</span>
                      <span className="font-semibold text-white">
                        {new Date(displayDataset?.updated_at || displayDataset?.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-white border-b sticky top-20 z-40">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
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
                      d={tab.icon}
                    />
                  </svg>
                  {tab.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-12">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Description */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      About This Dataset
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {displayDataset?.description}
                    </p>

                    {/* Key Features */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {(displayDataset?.key_features || []).map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Common Use Cases
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {(displayDataset?.use_cases || []).map((useCase, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                        >
                          <div className="text-blue-600 font-semibold">
                            {useCase}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Citation */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Citation
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <code className="text-sm text-gray-700">
                        {displayDataset?.citation}
                      </code>
                    </div>
                    <button className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      Copy Citation
                    </button>
                  </div>

                  {/* Related Papers */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Related Publications
                    </h3>
                    <div className="space-y-4">
                      {(displayDataset?.relatedPapers || []).map((paper, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-gray-900 text-sm mb-1">
                            {paper.title}
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{paper.year}</span>
                            <span>{paper.citations} citations</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Samples Tab */}
          {activeTab === "samples" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sample Data Preview
                </h2>
                <p className="text-gray-600 text-lg">
                  Explore representative samples from this dataset
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(displayDataset?.sample_images || []).length > 0 ? (
                  displayDataset.sample_images.map((imageUrl, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedSample(imageUrl)}
                      className="group cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Sample ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='20' dy='.3em'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-600">Sample {index + 1}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No sample images available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Tab - Update field names */}
          {activeTab === "technical" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Technical Specifications */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Technical Specifications
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Type</span>
                      <span className="font-semibold text-gray-900">
                        {displayDataset?.technical_specs?.type}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Format</span>
                      <span className="font-semibold text-gray-900">
                        {displayDataset?.format}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">License</span>
                      <span className="font-semibold text-gray-900">
                        {displayDataset?.license}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Access Level</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {displayDataset?.access_level}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Version</span>
                      <span className="font-semibold text-gray-900">
                        {displayDataset?.version}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Update</span>
                      <span className="font-semibold text-gray-900">
                        {displayDataset?.technical_specs?.lastUpdate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Dataset Statistics
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Avg. Image Size</span>
                      <span className="font-semibold text-gray-900">
                        {displayDataset?.statistics?.avgImageSize}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Quality Score</span>
                      <span className="font-semibold text-gray-900">
                        {displayDataset?.statistics?.qualityScore}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Total Annotations</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(displayDataset?.statistics?.totalAnnotations)}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Avg. per Category</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(displayDataset?.statistics?.avgImagesPerCategory)}
                      </span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Max per Category</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(displayDataset?.statistics?.maxImagesPerCategory)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min per Category</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(displayDataset?.statistics?.minImagesPerCategory)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sample Modal */}
      {selectedSample && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSample(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSample(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
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

            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img 
                  src={selectedSample} 
                  alt="Sample preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='24' dy='.3em'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
