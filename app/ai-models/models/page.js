"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function PublicAiModelsPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [models, setModels] = useState([]);
  const [featuredModels, setFeaturedModels] = useState([]);
  const [latestModels, setLatestModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const authHeader = useMemo(() => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const activeToken = localToken || token;
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  }, [token]);

  const fetchAllModels = async () => {
    setLoading(true);
    setApiError("");

    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("items_per_page", itemsPerPage.toString());

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const basePath =
        selectedFramework !== "all"
          ? `/api/ai-models/public/framework/${encodeURIComponent(selectedFramework)}`
          : "/api/ai-models/public";

      const response = await fetch(`${basePath}?${params.toString()}`, {
        headers: {
          ...authHeader,
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
            : "Gagal memuat AI models. Coba login ulang."
        );
        setModels([]);
        setTotalItems(0);
        setTotalPages(1);
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

      const filtered = searchQuery.trim()
        ? list.filter((m) => {
            const q = searchQuery.toLowerCase();
            return (
              m.name?.toLowerCase().includes(q) ||
              m.description?.toLowerCase().includes(q) ||
              m.framework?.toLowerCase().includes(q) ||
              m.model_type?.toLowerCase().includes(q)
            );
          })
        : list;

      setModels(filtered);

      const total = data?.total_count || data?.total || filtered.length;
      const totalPage = data?.pages || Math.max(1, Math.ceil(total / itemsPerPage));
      setTotalItems(total);
      setTotalPages(totalPage);
    } catch (error) {
      setApiError("Gagal memuat AI models dari server.");
      setModels([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedModels = async () => {
    try {
      const response = await fetch("/api/ai-models/public/featured?limit=3", {
        headers: {
          ...authHeader,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setFeaturedModels(list);
      }
    } catch {
      setFeaturedModels([]);
    }
  };

  const fetchLatestModels = async () => {
    try {
      const response = await fetch("/api/ai-models/public/latest?limit=4", {
        headers: {
          ...authHeader,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setLatestModels(list);
      }
    } catch {
      setLatestModels([]);
    }
  };

  useEffect(() => {
    fetchAllModels();
  }, [currentPage, itemsPerPage, selectedFramework, searchQuery, token]);

  useEffect(() => {
    fetchFeaturedModels();
    fetchLatestModels();
  }, [token]);

  const frameworkOptions = useMemo(() => {
    const fromList = Array.from(
      new Set([
        ...models.map((m) => m.framework).filter(Boolean),
        ...featuredModels.map((m) => m.framework).filter(Boolean),
        ...latestModels.map((m) => m.framework).filter(Boolean),
      ])
    ).sort((a, b) => a.localeCompare(b));

    return [{ id: "all", name: "All Frameworks" }, ...fromList.map((framework) => ({ id: framework, name: framework }))];
  }, [models, featuredModels, latestModels]);

  const formatMetric = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number") {
      if (value >= 0 && value <= 1) return `${(value * 100).toFixed(1)}%`;
      return value.toFixed(3);
    }
    return String(value);
  };

  const safeMetricsEntries = (metrics) => {
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) return [];
    return Object.entries(metrics).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-slate-50">
      <section className="relative py-20 pt-32 bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          ></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center text-sm text-cyan-200 mb-8">
            <button onClick={() => router.push("/")} className="hover:text-white transition-colors">
              Home
            </button>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">AI Models</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"
                />
              </svg>
              <span className="text-sm font-semibold text-cyan-200">AI Model Registry</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-sky-200 bg-clip-text text-transparent">
                AI Models Catalog
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Explore production-ready models across frameworks, metrics, and tasks. Access level follows your current login role.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-6 lg:px-8">
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {apiError}
            </div>
          )}

          {/* {featuredModels.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">Featured Models</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {featuredModels.map((model) => (
                  <div key={model.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded-full">
                        Featured
                      </span>
                      <span className="text-xs text-slate-500">{model.framework || "-"}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{model.name}</h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{model.description || "No description"}</p>
                    <div className="mt-4 text-xs text-slate-500">Type: {model.model_type || "N/A"}</div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          <div className="mb-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Search by name, framework, type..."
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-cyan-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Framework</label>
                <select
                  value={selectedFramework}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSelectedFramework(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-cyan-500 focus:bg-white focus:outline-none"
                >
                  {frameworkOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* {latestModels.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Latest Models</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestModels.map((model) => (
                  <div key={model.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs text-cyan-600 font-semibold mb-1">{model.framework || "Unknown"}</p>
                    <p className="font-semibold text-slate-900 line-clamp-1">{model.name}</p>
                    <p className="text-xs text-slate-500 mt-1">v{model.version || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
              <p className="mt-4 text-slate-600">Loading AI models...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-700 text-xl">No AI models found.</p>
              <p className="text-slate-500 mt-2">Try a different keyword or framework filter.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              {models.map((model) => (
                <div key={model.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {model.image_url ? (
                    <img src={model.image_url} alt={model.name} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-cyan-500 to-sky-600" />
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {model.framework || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-500">{model.access_level || "public"}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{model.name}</h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{model.description || "No description"}</p>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="bg-slate-50 rounded-lg p-2.5">
                        <p className="text-slate-500">Type</p>
                        <p className="font-semibold text-slate-800">{model.model_type || "-"}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5">
                        <p className="text-slate-500">Version</p>
                        <p className="font-semibold text-slate-800">{model.version || "-"}</p>
                      </div>
                    </div>

                    {safeMetricsEntries(model.metrics).length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Metrics</p>
                        <div className="space-y-1.5">
                          {safeMetricsEntries(model.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-slate-500 capitalize">{key.replaceAll("_", " ")}</span>
                              <span className="font-semibold text-slate-800">{formatMetric(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => router.push(`/ai-models/models/${model.slug || model.id}`)}
                      className="mt-5 w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-sky-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      View Model
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && models.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white text-slate-700 hover:bg-cyan-50 border border-slate-200"
                }`}
              >
                Previous
              </button>

              <span className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold text-sm">
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white text-slate-700 hover:bg-cyan-50 border border-slate-200"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
