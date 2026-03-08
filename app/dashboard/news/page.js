"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { parseApiError } from "@/lib/handleApiError";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function NewsPage() {
  const router = useRouter();
  const { getUserInfo } = useAuth();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view'
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    thumbnail_url: "",
    tags: [],
    access_level: "public",
    status: "draft",
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch("/api/news", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data.data?.data || []);
      } else {
        throw new Error("Failed to fetch news");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Failed to load news");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("/api/categories?type=news", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const url =
        modalMode === "edit" ? `/api/news/${selectedNews.id}` : "/api/news";
      const method = modalMode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchNews();
        setIsModalOpen(false);
        resetForm();
      } else {
        const msg = await parseApiError(response);
        setError(msg);
        return;
      }
    } catch (error) {
      console.error("Error saving news:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (newsItem) => {
    setNewsToDelete(newsItem);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!newsToDelete) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/news/${newsToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchNews();
        setIsDeleteModalOpen(false);
        setNewsToDelete(null);
      } else {
        const msg = await parseApiError(response);
        setError(msg);
        return;
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      setError(error.message);
    }
  };

  const handleDelete = (newsItem) => {
    openDeleteModal(newsItem);
  };

  const handleAssignCategories = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/news/${selectedNews.id}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category_ids: selectedCategories }),
      });

      if (response.ok) {
        setIsCategoryModalOpen(false);
        setSelectedCategories([]);
      } else {
        throw new Error("Failed to assign categories");
      }
    } catch (error) {
      console.error("Error assigning categories:", error);
      setError("Failed to assign categories");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchNewsDetail = async (newsId) => {
    try {
      setIsLoadingDetail(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/news/${newsId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract the actual data from the response wrapper
        return data.data || data;
      } else {
        throw new Error("Failed to fetch news details");
      }
    } catch (error) {
      console.error("Error fetching news details:", error);
      setError("Failed to load news details: " + error.message);
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const openModal = async (mode, newsItem = null) => {
    setModalMode(mode);
    setError("");
    setIsModalOpen(true);

    if (mode === "create") {
      setSelectedNews(null);
      resetForm();
    } else if (mode === "view" && newsItem) {
      // Fetch detail data from API for view mode
      const detailData = await fetchNewsDetail(newsItem.id);
      if (detailData) {
        setSelectedNews(detailData);
      } else {
        setSelectedNews(newsItem);
      }
    } else if (newsItem) {
      // For edit mode, use the newsItem from list and populate form
      setSelectedNews(newsItem);
      setFormData({
        title: newsItem.title,
        slug: newsItem.slug,
        content: newsItem.content || "",
        thumbnail_url: newsItem.thumbnail_url || "",
        tags: newsItem.tags || [],
        access_level: newsItem.access_level || "public",
        status: newsItem.status || "draft",
      });
    }
  };

  const openCategoryModal = (newsItem) => {
    setSelectedNews(newsItem);
    setSelectedCategories([]);
    setIsCategoryModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      thumbnail_url: "",
      tags: [],
      access_level: "public",
      status: "draft",
    });
    setTagInput("");
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: "bg-gray-100 text-gray-700",
      published: "bg-green-100 text-green-700",
      archived: "bg-red-100 text-red-700",
    };
    return badges[status] || badges.draft;
  };

  const fetchFilesForPicker = async () => {
    setIsLoadingFiles(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/api/files?limit=100&file_type=image",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAvailableFiles(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const openFilePicker = () => {
    setIsFilePickerOpen(true);
    fetchFilesForPicker();
  };

  const selectFile = (fileUrl) => {
    // Convert relative path to full URL if needed
    const fullUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${API_BASE_URL}${fileUrl}`;
    setFormData({ ...formData, thumbnail_url: fullUrl });
    setIsFilePickerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-xl"></div>
            <svg
              className="absolute inset-0 w-full h-full p-5 text-amber-600 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p className="text-slate-700 font-medium text-lg">Loading News...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
      {/* Page Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                News
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Manage news articles and posts
              </p>
            </div>
            <button
              onClick={() => openModal("create")}
              className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Add News</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl text-red-700 flex items-start gap-3 shadow-sm">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((newsItem) => (
            <div
              key={newsItem.id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-white">
                {newsItem.thumbnail_url ? (
                  <img
                    src={newsItem.thumbnail_url}
                    alt={newsItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-slate-300"
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
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-xl ${getStatusBadge(
                      newsItem.status
                    )}`}
                  >
                    {newsItem.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 text-lg group-hover:text-amber-700 transition-colors">
                  {newsItem.title}
                </h3>
                <p className="text-sm text-amber-700 bg-amber-50/80 backdrop-blur-sm px-3 py-1.5 rounded-xl font-mono font-medium mb-3 inline-block">
                  {newsItem.slug}
                </p>

                {/* Tags */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {newsItem.tags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {newsItem.tags?.length > 3 && (
                      <span className="text-xs text-slate-500 font-medium">
                        +{newsItem.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex justify-between items-center text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                  <span>
                    {new Date(newsItem.created_at).toLocaleDateString()}
                  </span>
                  <span className="bg-slate-100/80 backdrop-blur-sm px-2.5 py-1 rounded-lg font-medium">
                    {newsItem.access_level}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:flex gap-2">
                  <button
                    onClick={() => openModal("view", newsItem)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="hidden xs:inline">View</span>
                  </button>
                  <button
                    onClick={() => openModal("edit", newsItem)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span className="hidden xs:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => openCategoryModal(newsItem)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span className="hidden xs:inline">Tags</span>
                  </button>
                  <button
                    onClick={() => handleDelete(newsItem)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="hidden xs:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {news.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/20">
                  <svg
                    className="w-16 h-16 text-white"
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
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No News Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start sharing updates by creating your first news article
                </p>
                <button
                  onClick={() => openModal("create")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create First News
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {modalMode === "create" && "Create News"}
                      {modalMode === "edit" && "Edit News"}
                      {modalMode === "view" && "News Details"}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      {modalMode === "create" && "Publish a new news article"}
                      {modalMode === "edit" && "Update news article"}
                      {modalMode === "view" && "View news article details"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 sm:p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110 flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                </div>
              </div>

              {modalMode === "view" ? (
                isLoadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4">
                        <svg
                          className="w-full h-full text-amber-600 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Loading news details...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 p-4 sm:p-6">
                    {/* View Mode Content */}

                    {/* Basic Information */}
                    <div className="bg-gradient-to-r from-slate-50 to-amber-50/50 p-4 rounded-2xl border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-amber-600"
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
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedNews?.title}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Slug
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-mono shadow-sm">
                            {selectedNews?.slug}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                          </label>
                          <p
                            className={`inline-block px-4 py-2 rounded-xl font-semibold ${getStatusBadge(
                              selectedNews?.status
                            )}`}
                          >
                            {selectedNews?.status}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Access Level
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 capitalize shadow-sm">
                            {selectedNews?.access_level}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail Preview */}
                    {selectedNews?.thumbnail_url && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-pink-600"
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
                          Thumbnail
                        </label>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                          <img
                            src={selectedNews.thumbnail_url}
                            alt={selectedNews.title}
                            className="w-full h-64 object-cover rounded-xl mb-3"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                          <a
                            href={selectedNews.thumbnail_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 underline break-all"
                          >
                            {selectedNews.thumbnail_url}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        Tags ({selectedNews?.tags?.length || 0})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedNews?.tags && selectedNews.tags.length > 0 ? (
                          selectedNews.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No tags</p>
                        )}
                      </div>
                    </div>

                    {/* Categories */}
                    {selectedNews?.categories &&
                      selectedNews.categories.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            Categories ({selectedNews.categories.length})
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedNews.categories.map((category, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                              >
                                {typeof category === "string"
                                  ? category
                                  : category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Content (Markdown)
                      </label>
                      <div className="p-4 bg-gray-900 rounded-2xl max-h-96 overflow-y-auto border border-gray-700">
                        <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                          {selectedNews?.content || "No content"}
                        </pre>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-2xl border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-slate-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Metadata
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ID
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">
                            {selectedNews?.id}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Creator Name
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedNews?.creator_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Created At
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedNews?.created_at
                              ? new Date(
                                  selectedNews.created_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Updated At
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedNews?.updated_at
                              ? new Date(
                                  selectedNews.updated_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Created By (ID)
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">
                            {selectedNews?.created_by || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Enter news title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 font-mono text-sm"
                        placeholder="news-slug"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Thumbnail URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            thumbnail_url: e.target.value,
                          })
                        }
                        className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105 flex items-center gap-2"
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
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                        Browse
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 resize-none font-mono text-sm"
                      placeholder="Enter content in markdown format..."
                      rows={8}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Supports markdown formatting
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddTag())
                        }
                        className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Enter tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-amber-200 flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-amber-600 hover:text-amber-800 hover:scale-125 transition-transform"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Access Level
                      </label>
                      <select
                        value={formData.access_level}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            access_level: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        {/* <option value="archived">Archived</option> */}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-medium hover:border-slate-300"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 px-6 py-3 rounded-2xl text-white transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
                        isSubmitting
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {modalMode === "edit" ? "Update" : "Create"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Assignment Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden transform animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Assign Categories
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  Select categories for this news article
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <svg
                  className="w-6 h-6"
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
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-amber-300 cursor-pointer transition-all duration-200 group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([
                            ...selectedCategories,
                            category.id,
                          ]);
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter(
                              (id) => id !== category.id
                            )
                          );
                        }
                      }}
                      className="w-5 h-5 text-amber-600 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-amber-500/20 transition-all mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {category.name}
                      </p>
                      <p className="text-sm text-slate-500 font-mono mt-0.5">
                        {category.slug}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-medium hover:border-slate-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCategories}
                  disabled={isSubmitting || selectedCategories.length === 0}
                  className={`flex-1 px-6 py-3 rounded-2xl text-white transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
                    isSubmitting || selectedCategories.length === 0
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    <>
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Assign Categories
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Delete News?
              </h3>

              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-gray-900 font-semibold text-center mb-6">
                "{newsToDelete?.title}"?
              </p>
              <p className="text-red-600 text-sm text-center mb-8">
                This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setNewsToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete News
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Picker Modal */}
      {isFilePickerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden transform animate-slideUp">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Select Image from File Manager
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  Choose an image to use as thumbnail
                </p>
              </div>
              <button
                onClick={() => setIsFilePickerOpen(false)}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <svg
                  className="w-6 h-6"
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
            </div>

            {/* File Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                      <svg
                        className="w-full h-full text-blue-600 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-600 font-medium">Loading images...</p>
                  </div>
                </div>
              ) : availableFiles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-slate-400"
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
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Images Found
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Upload images in File Manager first
                  </p>
                  <button
                    onClick={() => window.open('/dashboard/files', '_blank')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    Go to File Manager
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableFiles.map((file) => {
                    const fullImageUrl = file.file_url.startsWith('http') 
                      ? file.file_url 
                      : `${API_BASE_URL}${file.file_url}`;
                    
                    return (
                    <div
                      key={file.id}
                      onClick={() => selectFile(file.file_url)}
                      className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                    >
                      {/* Image Preview */}
                      <div className="relative aspect-square bg-slate-100">
                        <img
                          src={fullImageUrl}
                          alt={file.original_filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-white rounded-full p-3 shadow-lg">
                              <svg
                                className="w-6 h-6 text-blue-600"
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
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-slate-900 truncate mb-1">
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.file_size / 1024).toFixed(2)} KB
                        </p>
                      </div>

                      {/* Selected Indicator */}
                      {formData.thumbnail_url === fullImageUrl && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 rounded-full p-1.5 shadow-lg">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
