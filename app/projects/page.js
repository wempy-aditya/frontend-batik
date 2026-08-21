"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// ── Manual mapping: project ID → internal demo page route ──
// Nilai bisa berupa string (1 demo) atau array string (multi demo)
const DEMO_PAGE_MAP = {
  // Arabica Coffee Bean Quality Classification
  "01a013cc-e6fd-7e2f-9e77-d9d330b299bb": "/coffee-bean",

  // Batik Ai Flux
  "019e2df1-8907-7354-af61-13ad7c2d5107": "/batik-ai-studio",

  // Batik Inpainting (Mask-Based Motif Editor)
  "019cf595-2665-7da1-b2d1-344508351c9f": "/inpainting",

  // Batik Text To Image — 4 demo pages
  "019bbed6-aed3-7951-aa77-34c31d5f3dd2": [
    { label: "Advanced Batik",   route: "/advanced-batik" },
    { label: "Parang Batik",     route: "/parang-batik" },
    { label: "Batch Generator",  route: "/batch-generator" },
    { label: "Test API",         route: "/test-api" },
  ],

  // Batik RVGAN
  "019bbed4-bbe7-7072-bf9d-849f21ce7b1d": "/batik-generator",

  // Batik GAN
  "019bbed3-bd9f-7e62-9df2-1ca95c0e9b81": "/batikgan",

  // Batik GAN CL
  "019bbed2-2106-799a-b49b-7008d555f69b": "/batikgan",

  // Batik Classification — 2 demo pages
  "019bbed1-2aa7-7cfa-abeb-9493a6464433": [
    { label: "Classify Batik",  route: "/classify-batik" },
    { label: "Compare Batik",   route: "/compare-batik" },
  ],

  // Batik Retrieval
  "019bbed0-222c-76b1-af2d-676c2fc6668a": "/batik-retrieval",
};

// Helper: ambil mapping project, return { type: 'single'|'multi', route?, options? }
function getDemoMapping(projectId) {
  const map = DEMO_PAGE_MAP[projectId];
  if (!map) return null;
  if (typeof map === "string") return { type: "single", route: map };
  if (Array.isArray(map)) return { type: "multi", options: map };
  return null;
}

export default function ProjectsPage() {
  const { token, user, getUserInfo, isLoading: authLoading } = useAuth();

  // Fetch user info on mount so `user` is populated for access checks
  useEffect(() => {
    if (token && !user) {
      getUserInfo().catch((err) => {
        if (err.message !== "UNAUTHORIZED") {
          console.error("Failed to get user info:", err);
        }
      });
    }
  }, [token, user, getUserInfo]);
  
  // Helper to check if current user can access a project
  const canAccessProject = (project) => {
    const level = project.access_level || "public";
    if (level === "public") return true;
    if (!user) return false;
    const role = user.role;
    if (level === "registered") {
      return role === "registered" || role === "premium" || role === "admin";
    }
    if (level === "premium") {
      return role === "premium" || role === "admin";
    }
    return false;
  };

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [hoveredProject, setHoveredProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [apiError, setApiError] = useState("");
  const [demoPickerOpen, setDemoPickerOpen] = useState(null); // project.id yang picker-nya terbuka
  const router = useRouter();

  // Handle click-away to close the picker
  useEffect(() => {
    if (!demoPickerOpen) return;
    const handleDocumentClick = () => {
      setDemoPickerOpen(null);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [demoPickerOpen]);


  const sortOptions = [
    { id: "latest", name: "Latest" },
    { id: "oldest", name: "Oldest" },
    { id: "title", name: "Title (A-Z)" },
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/projects/categories");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            // Add "All" category at the beginning
            const allCategories = [
              { id: "all", name: "All Projects", slug: "all" },
              ...data,
            ];
            setCategories(allCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Set default categories if API fails
        setCategories([{ id: "all", name: "All Projects", slug: "all" }]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setApiError("");
      try {
        // Build query params sesuai dokumentasi API
        const params = new URLSearchParams();

        // Pagination - convert page to offset/limit
        const limit = 12;
        const offset = (currentPage - 1) * limit;
        params.append("offset", offset.toString());
        params.append("limit", limit.toString());

        // Search
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        // Category filter
        if (selectedCategory !== "all") {
          params.append("category_id", selectedCategory);
        }

        // Featured filter
        if (isFeatured) {
          params.append("is_featured", "true");
        }

        // Sort
        params.append("sort_by", sortBy);

        const url = `/api/projects/public?${params.toString()}`;

        const localToken = localStorage.getItem("access_token");
        const activeToken = localToken || token;
        const response = await fetch(url, {
          headers: {
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const backendDetail =
            errData?.detail?.detail ||
            errData?.detail?.error ||
            errData?.detail ||
            errData?.error;
          setApiError(
            typeof backendDetail === "string"
              ? backendDetail
              : "Gagal memuat proyek. Coba login ulang."
          );
          setProjects([]);
          setTotalItems(0);
          setTotalPages(1);
          return;
        }

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setProjects(data.data);
          setTotalItems(data.total || 0);
          setTotalPages(Math.ceil((data.total || 0) / limit));
        } else if (Array.isArray(data)) {
          setProjects(data);
          setTotalItems(data.length);
          setTotalPages(1);
        } else {
          setProjects([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setApiError("Gagal memuat proyek dari server.");
        setProjects([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [selectedCategory, isFeatured, sortBy, searchQuery, currentPage, token]);

  const fallbackProjects = [];

  const displayProjects = loading
    ? []
    : projects.length > 0
      ? projects
      : fallbackProjects;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "archived":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
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
            <span className="text-white">Projects</span>
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span className="text-sm font-semibold text-amber-200">
                Complete Project Portfolio
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                All AI Projects
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Explore our comprehensive collection of AI and computer vision
              projects. From research prototypes to production-ready solutions,
              discover innovation at every level.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Filters Section - Compact Unified Container */}
          <div className="mb-12 bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {apiError}
              </div>
            )}
            {/* Main Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mb-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search projects..."
                  className="w-full px-6 py-3 pl-12 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
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

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-48 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id || category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-40 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Featured Toggle Button */}
              <button
                onClick={() => {
                  setIsFeatured(!isFeatured);
                  setCurrentPage(1);
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 border-2 whitespace-nowrap ${
                  isFeatured
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                Featured
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Active Filters & Results Count Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Active Filters */}
              <div className="flex flex-wrap gap-2 items-center flex-1">
                <span className="text-sm font-semibold text-gray-700">
                  Active filters:
                </span>

                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                    <span className="font-semibold">Category:</span>
                    {
                      categories.find(
                        (c) =>
                          c.id === selectedCategory ||
                          c.slug === selectedCategory,
                      )?.name
                    }
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:bg-amber-200 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                )}

                {isFeatured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                    Featured
                    <button
                      onClick={() => {
                        setIsFeatured(false);
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:bg-amber-200 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                )}

                {sortBy !== "latest" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                    <span className="font-semibold">Sort:</span>
                    {sortOptions.find((s) => s.id === sortBy)?.name}
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    <span className="font-semibold">Search:</span>"
                    {searchQuery.substring(0, 20)}
                    {searchQuery.length > 20 ? "..." : ""}"
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                )}

                {selectedCategory === "all" &&
                  !isFeatured &&
                  sortBy === "latest" &&
                  !searchQuery && (
                    <span className="text-sm text-gray-500">None</span>
                  )}

                {(selectedCategory !== "all" ||
                  isFeatured ||
                  sortBy !== "latest" ||
                  searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setIsFeatured(false);
                      setSortBy("latest");
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors border border-red-200"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Results Count */}
              <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                <p className="text-gray-600 text-sm whitespace-nowrap">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {displayProjects.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">{totalItems}</span>{" "}
                  projects
                </p>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : displayProjects.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xl text-gray-600">No projects found</p>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
              {displayProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative cursor-pointer"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onClick={(e) => {
                    if (!canAccessProject(project)) return;
                    const mapping = getDemoMapping(project.id);
                    if (!mapping) {
                      router.push(`/projects/${project.id}`);
                    } else if (mapping.type === "single") {
                      router.push(mapping.route);
                    } else {
                      // multi — toggle picker
                      e.stopPropagation();
                      setDemoPickerOpen(prev => prev === project.id ? null : project.id);
                    }
                  }}
                >
                  {/* Project Card */}
                  <div className={`relative bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200/50 transition-all duration-500 transform h-full flex flex-col ${canAccessProject(project) ? "hover:shadow-2xl hover:-translate-y-3 hover:scale-105" : "opacity-80 grayscale-[20%]"}`}>

                    {/* Thumbnail/Hero Image */}
                    <div className="relative h-48 overflow-hidden">
                      {project.thumbnail_url ? (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "block";
                          }}
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 transition-all duration-700 group-hover:scale-110"
                        style={{
                          display: project.thumbnail_url ? "none" : "block",
                        }}
                      >
                        {/* Animated Overlay */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                      </div>


                      {/* Status Badge */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            project.status,
                          )}`}
                        >
                          {project.status
                            ? project.status.charAt(0).toUpperCase() +
                              project.status.slice(1)
                            : "Published"}
                        </span>
                      </div>
                      {/* Complexity + Live Demo badge */}
                      <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getComplexityColor(
                            project.complexity,
                          )}`}
                        >
                          {project.complexity
                            ? project.complexity.charAt(0).toUpperCase() +
                              project.complexity.slice(1)
                            : "Medium"}
                        </span>
                        {project.demo_url && project.demo_url.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-green-500 text-white shadow-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Live Demo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-6 space-y-4 flex-1 flex flex-col">
                      {/* Title & Description */}
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors duration-300">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300 line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            Technologies
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies
                              .slice(0, 3)
                              .map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-md border border-amber-200"
                                >
                                  {tech}
                                </span>
                              ))}
                            {project.technologies.length > 3 && (
                              <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-md">
                                +{project.technologies.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-md">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button - Sticky Bottom */}
                      <div className="mt-auto pt-4 relative">
                        {(() => {
                          const mapping = getDemoMapping(project.id);
                          const isMulti = mapping?.type === "multi";
                          const isPickerOpen = demoPickerOpen === project.id;

                          return (
                            <>
                              {/* Demo Picker Popover */}
                              {isMulti && isPickerOpen && (
                                <div
                                  className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                                  style={{ animation: "fadeUp 0.15s ease-out" }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-600">Pilih Demo</span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setDemoPickerOpen(null); }}
                                      className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                    >
                                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  {mapping.options.map((opt, idx) => (
                                    <button
                                      key={idx}
                                      onClick={(e) => { e.stopPropagation(); router.push(opt.route); }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0 group/opt"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 group-hover/opt:from-amber-500 group-hover/opt:to-orange-500 transition-all">
                                        <svg className="w-3.5 h-3.5 text-amber-600 group-hover/opt:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                                        </svg>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-700 group-hover/opt:text-amber-700 transition-colors">{opt.label}</span>
                                      <svg className="w-4 h-4 text-gray-300 group-hover/opt:text-amber-500 ml-auto transition-all group-hover/opt:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Main button */}
                              {canAccessProject(project) ? (
                                <div className={`w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 group-hover:from-amber-400 group-hover:to-orange-400 group-hover:shadow-lg ${isPickerOpen ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}>
                                  <div className="flex items-center justify-center gap-2">
                                    <span>{isMulti ? "Pilih Demo" : "View Details"}</span>
                                    <svg
                                      className={`w-4 h-4 transition-all duration-300 ${isMulti ? (isPickerOpen ? "rotate-180" : "rotate-90") : "group-hover:translate-x-1"}`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={isMulti ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
                                      />
                                    </svg>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full py-3 px-4 bg-gray-100 text-gray-400 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span>{isMulti ? "Pilih Demo" : "View Details"}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && displayProjects.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
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
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-lg border-2 border-gray-100">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Want to Collaborate?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join our team of researchers and developers working on
                cutting-edge AI projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div
                  onClick={() => {
                    console.log("Navigating to contact page");
                    window.location.href = "/contact";
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                  Get in Touch
                </div>
                <div
                  onClick={() => {
                    console.log("Navigating to publications page");
                    window.location.href = "/publications";
                  }}
                  className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 cursor-pointer"
                >
                  View Research
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
