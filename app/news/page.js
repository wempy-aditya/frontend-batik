"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newsArticles, setNewsArticles] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Fetch all news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news/public");
        if (response.ok) {
          const data = await response.json();
          setNewsArticles(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Fetch featured news
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch("/api/news/public/featured?limit=2");
        if (response.ok) {
          const data = await response.json();
          setFeaturedNews(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching featured news:", error);
      }
    };

    fetchFeatured();
  }, []);

  const categories = [
    { id: "all", name: "All News", count: newsArticles.length },
    {
      id: "research",
      name: "Research",
      count: newsArticles.filter((a) => a.tags?.includes("research")).length,
    },
    {
      id: "product",
      name: "Product Updates",
      count: newsArticles.filter((a) => a.tags?.includes("product")).length,
    },
    {
      id: "company",
      name: "Company News",
      count: newsArticles.filter((a) => a.tags?.includes("company")).length,
    },
    {
      id: "events",
      name: "Events",
      count: newsArticles.filter((a) => a.tags?.includes("events")).length,
    },
  ];

  const fallbackNews = [
    {
      id: 1,
      title: "AI Vision Lab Launches Advanced Neural Style Transfer Model",
      excerpt:
        "Our new neural style transfer model achieves 60% faster processing times while maintaining exceptional output quality. The breakthrough comes from optimized architecture and innovative training techniques.",
      category: "product",
      date: "2024-01-15",
      author: "Dr. Sarah Chen",
      readTime: "5 min read",
      image: "from-amber-500 to-orange-500",
      featured: true,
    },
    {
      id: 2,
      title: "Research Paper Accepted at CVPR 2024",
      excerpt:
        "Our groundbreaking research on real-time object detection has been accepted for presentation at the Computer Vision and Pattern Recognition conference. This marks our third consecutive year of CVPR publications.",
      category: "research",
      date: "2024-01-12",
      author: "Dr. Michael Zhang",
      readTime: "4 min read",
      image: "from-blue-500 to-indigo-500",
      featured: true,
    },
    {
      id: 3,
      title: "AI Vision Lab Opens New Research Facility",
      excerpt:
        "We're excited to announce the opening of our state-of-the-art research facility in Silicon Valley. The 50,000 sq ft space will house our growing team of AI researchers and engineers.",
      category: "company",
      date: "2024-01-10",
      author: "Emma Rodriguez",
      readTime: "3 min read",
      image: "from-green-500 to-teal-500",
      featured: false,
    },
    {
      id: 4,
      title: "New Dataset Release: ImageNet-2024",
      excerpt:
        "We're releasing ImageNet-2024, featuring 14.2 million annotated images across 20,000+ categories. This comprehensive dataset represents our largest release to date.",
      category: "product",
      date: "2024-01-08",
      author: "Dr. James Wilson",
      readTime: "6 min read",
      image: "from-purple-500 to-pink-500",
      featured: false,
    },
    {
      id: 5,
      title: "AI Vision Lab Wins Best Innovation Award",
      excerpt:
        "Our facial recognition system with privacy-first design has been recognized with the Best Innovation Award at the Global AI Summit 2024.",
      category: "company",
      date: "2024-01-05",
      author: "Lisa Anderson",
      readTime: "4 min read",
      image: "from-yellow-500 to-orange-500",
      featured: false,
    },
    {
      id: 6,
      title: "Breakthrough in Medical Image Analysis",
      excerpt:
        "Our AI-powered diagnostic tool achieved 95% accuracy in detecting early-stage cancers from medical imaging. This advancement could revolutionize early disease detection.",
      category: "research",
      date: "2024-01-03",
      author: "Dr. Rachel Kim",
      readTime: "7 min read",
      image: "from-red-500 to-pink-500",
      featured: false,
    },
    {
      id: 7,
      title: "Upcoming Webinar: Future of Computer Vision",
      excerpt:
        "Join our expert panel discussion on the future of computer vision and AI. Register now for exclusive insights and live Q&A session with our research team.",
      category: "events",
      date: "2024-01-02",
      author: "Marketing Team",
      readTime: "2 min read",
      image: "from-indigo-500 to-purple-500",
      featured: false,
    },
    {
      id: 8,
      title: "Partnership with Leading Universities",
      excerpt:
        "AI Vision Lab announces research partnerships with MIT, Stanford, and CMU to advance computer vision research and education.",
      category: "company",
      date: "2023-12-28",
      author: "John Smith",
      readTime: "5 min read",
      image: "from-teal-500 to-green-500",
      featured: false,
    },
    {
      id: 9,
      title: "New API Release: Real-Time Style Transfer",
      excerpt:
        "Developers can now integrate our real-time style transfer capabilities into their applications with our new API. Documentation and SDKs available now.",
      category: "product",
      date: "2023-12-25",
      author: "Dev Team",
      readTime: "4 min read",
      image: "from-orange-500 to-red-500",
      featured: false,
    },
    {
      id: 10,
      title: "AI Ethics Workshop Series Announced",
      excerpt:
        "We're launching a quarterly workshop series focused on ethical AI development and responsible computer vision applications.",
      category: "events",
      date: "2023-12-20",
      author: "Dr. Sarah Chen",
      readTime: "3 min read",
      image: "from-cyan-500 to-blue-500",
      featured: false,
    },
    {
      id: 11,
      title: "Advanced 3D Reconstruction Model Released",
      excerpt:
        "Our latest 3D object reconstruction model can now create detailed 3D models from just 5 images, reducing requirements by 50%.",
      category: "research",
      date: "2023-12-18",
      author: "Dr. Michael Zhang",
      readTime: "6 min read",
      image: "from-pink-500 to-rose-500",
      featured: false,
    },
    {
      id: 12,
      title: "Year in Review: 2023 Achievements",
      excerpt:
        "Looking back at our remarkable achievements in 2023 - from breakthrough research to product launches and community growth.",
      category: "company",
      date: "2023-12-15",
      author: "Emma Rodriguez",
      readTime: "8 min read",
      image: "from-amber-600 to-yellow-500",
      featured: false,
    },
  ];

  // Display news with fallback
  const displayNews = loading
    ? []
    : newsArticles.length > 0
      ? newsArticles
      : fallbackNews;
  const displayFeatured =
    featuredNews.length > 0
      ? featuredNews
      : fallbackNews.filter((n) => n.featured);

  const filteredNews =
    selectedCategory === "all"
      ? displayNews
      : displayNews.filter(
          (article) =>
            article.tags?.includes(selectedCategory) ||
            article.category === selectedCategory,
        );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Extract category from tags (use first tag as category)
  const getCategory = (article) => {
    if (article.category) return article.category;
    if (article.tags && article.tags.length > 0) return article.tags[0];
    return "news";
  };

  // Calculate read time from content
  const getReadTime = (content) => {
    if (!content) return "3 min read";
    const words = content.split(" ").length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
            <span className="text-white">News</span>
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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <span className="text-sm font-semibold text-amber-200">
                Latest Updates & Announcements
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                News & Updates
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Stay informed about our latest research, product updates, and
              company announcements. Discover what's happening at AI Vision Lab.
            </p>
          </div>
        </div>
      </section>

      {/* News Section */}
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

          {/* Featured News */}
          {selectedCategory === "all" && displayFeatured.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Featured Stories
              </h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {displayFeatured.map((article) => (
                  <div
                    key={article.id}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  >
                    {/* Thumbnail Image */}
                    {article.thumbnail_url ? (
                      <div className="h-64 relative overflow-hidden">
                        <img
                          src={article.thumbnail_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-full capitalize">
                            {getCategory(article)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`h-64 bg-gradient-to-br ${article.image || "from-amber-500 to-orange-500"} relative`}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-full capitalize">
                            {getCategory(article)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>
                          {formatDate(article.created_at || article.date)}
                        </span>
                        <span>•</span>
                        <span>
                          {getReadTime(article.content) || article.readTime}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                        {article.excerpt ||
                          article.content?.substring(0, 150) + "..." ||
                          ""}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                            {(article.creator_name || article.author || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {article.creator_name ||
                                article.author ||
                                "Admin"}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push(`/news/${article.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All News Grid */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {selectedCategory === "all" ? "All News" : "Filtered News"}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                <p className="text-gray-600">Loading news...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No news found.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
                {filteredNews.map((article) => (
                  <div
                    key={article.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  >
                    {/* Thumbnail */}
                    {article.thumbnail_url ? (
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={article.thumbnail_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full capitalize">
                            {getCategory(article)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`h-48 bg-gradient-to-br ${article.image || "from-gray-500 to-slate-500"} relative`}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full capitalize">
                            {getCategory(article)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span>
                          {formatDate(article.created_at || article.date)}
                        </span>
                        <span>•</span>
                        <span>
                          {getReadTime(article.content) || article.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {article.excerpt ||
                          article.content?.substring(0, 100) + "..." ||
                          ""}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-600">
                          By {article.creator_name || article.author || "Admin"}
                        </div>
                        <button
                          onClick={() => router.push(`/news/${article.id}`)}
                          className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
                        >
                          Read →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
