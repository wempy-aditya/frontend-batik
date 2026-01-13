"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [viewGallery, setViewGallery] = useState(null);
  const [galleryToDelete, setGalleryToDelete] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view'

  const [formData, setFormData] = useState({
    prompt: "",
    image_url: "",
    extra_metadata: "",
    model_id: "",
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryGalleryId, setCategoryGalleryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  
  // File Picker states
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    fetchGalleries();
    fetchCategories();
    fetchModels();
  }, [offset]);

  const fetchGalleries = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(
        `/api/gallery?offset=${offset}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gallery fetch error response:', errorText);
        throw new Error(`Failed to fetch galleries: ${response.status}`);
      }

      const data = await response.json();

      let galleriesArray = [];
      let total = 0;

      if (data.data?.data?.data && Array.isArray(data.data.data.data)) {
        galleriesArray = data.data.data.data;
        total = data.data.data.total_count || 0;
      } else if (data.data?.data && Array.isArray(data.data.data)) {
        galleriesArray = data.data.data;
        total = data.data.total_count || data.data.data.length;
      } else if (data.data && Array.isArray(data.data)) {
        galleriesArray = data.data;
        total = data.total_count || data.data.length;
      } else if (Array.isArray(data)) {
        galleriesArray = data;
        total = data.length;
      }

      setGalleries(galleriesArray);
      setTotalCount(total);
      setHasMore(galleriesArray.length === limit);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching galleries:", error);
      setGalleries([]);
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/categories?type=gallery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch gallery categories");
      }

      const data = await response.json();

      let categoriesArray = [];
      if (data.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      }

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/ai-models", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();

      let modelsArray = [];
      if (data.data?.data && Array.isArray(data.data.data)) {
        modelsArray = data.data.data;
      } else if (data.data && Array.isArray(data.data)) {
        modelsArray = data.data;
      } else if (Array.isArray(data)) {
        modelsArray = data;
      }

      setModels(modelsArray);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    }
  };

  const fetchGalleryDetail = async (id) => {
    try {
      setIsLoadingDetail(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/gallery/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch gallery detail");
      }

      const data = await response.json();
      const galleryData = data.data || data;
      setViewGallery(galleryData);
      setModalMode("view");
      setShowViewModal(true);
      setIsLoadingDetail(false);
    } catch (error) {
      console.error("Error fetching gallery detail:", error);
      alert("Failed to load gallery details");
      setIsLoadingDetail(false);
    }
  };

  const openModal = async (mode, gallery = null) => {
    setModalMode(mode);
    if (mode === "create") {
      setCurrentGallery(null);
      setFormData({
        prompt: "",
        image_url: "",
        extra_metadata: "",
        model_id: "",
      });
      setShowModal(true);
    } else if (mode === "edit") {
      setCurrentGallery(gallery);
      setFormData({
        prompt: gallery.prompt || "",
        image_url: gallery.image_url || "",
        extra_metadata: gallery.extra_metadata
          ? JSON.stringify(gallery.extra_metadata, null, 2)
          : "",
        model_id: gallery.model_id || "",
      });
      setShowModal(true);
    } else if (mode === "view") {
      await fetchGalleryDetail(gallery.id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentGallery(null);
    setFormData({
      prompt: "",
      image_url: "",
      extra_metadata: "",
      model_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

      let metadata = null;
      if (formData.extra_metadata.trim()) {
        try {
          metadata = JSON.parse(formData.extra_metadata);
        } catch (e) {
          alert("Invalid JSON in Extra Metadata");
          return;
        }
      }

      const payload = {
        prompt: formData.prompt,
        image_url: formData.image_url,
        extra_metadata: metadata,
        model_id: formData.model_id || undefined,
      };

      const url = currentGallery
        ? `/api/gallery/${currentGallery.id}`
        : "/api/gallery";

      const method = currentGallery ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${currentGallery ? "update" : "create"} gallery`
        );
      }

      await fetchGalleries();
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const handleDelete = async () => {
    if (!galleryToDelete) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/gallery/${galleryToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete gallery");
      }

      await fetchGalleries();
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting gallery:", error);
      alert("Failed to delete gallery");
    }
  };

  const openDeleteModal = (gallery) => {
    setGalleryToDelete(gallery);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setGalleryToDelete(null);
  };

  const openCategoryModal = (gallery) => {
    setCategoryGalleryId(gallery.id);

    const currentCategoryNames = gallery.categories || [];
    const categoryIds = categories
      .filter((cat) => currentCategoryNames.includes(cat.name))
      .map((cat) => cat.id);

    setSelectedCategories(categoryIds);
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryGalleryId(null);
    setSelectedCategories([]);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `/api/gallery/${categoryGalleryId}/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category_ids: selectedCategories,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign categories");
      }

      await fetchGalleries();
      handleCloseCategoryModal();
    } catch (error) {
      console.error("Error assigning categories:", error);
      alert("Failed to assign categories");
    }
  };

  // Fetch files for file picker
  const fetchFilesForPicker = async () => {
    try {
      setIsLoadingFiles(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/files?limit=100&file_type=image', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableFiles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Open file picker modal
  const openFilePicker = () => {
    setIsFilePickerOpen(true);
    fetchFilesForPicker();
  };

  // Select file from picker
  const selectFile = (fileUrl) => {
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;
    setFormData({ ...formData, image_url: fullUrl });
    setIsFilePickerOpen(false);
  };

  const filteredGalleries = galleries.filter((gallery) => {
    const matchesSearch =
      !searchTerm ||
      gallery.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gallery.model_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          <p className="text-slate-700 font-medium text-lg">
            Loading Gallery...
          </p>
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
                Gallery
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Manage AI-generated batik gallery images
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
                <span>Add Gallery Item</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGalleries.map((gallery) => (
            <div
              key={gallery.id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-64 bg-gradient-to-br from-amber-50 to-orange-50">
                {gallery.image_url ? (
                  <img
                    src={gallery.image_url}
                    alt={gallery.prompt || "Gallery"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-amber-600/50"
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
              </div>

              <div className="p-6">
                <p className="font-bold text-slate-900 mb-3 line-clamp-2 text-base group-hover:text-amber-700 transition-colors">
                  {gallery.prompt || "No prompt"}
                </p>

                {gallery.model_name && (
                  <p className="text-sm text-amber-700 bg-amber-50/80 backdrop-blur-sm px-3 py-1.5 rounded-xl font-mono font-medium mb-3 inline-block">
                    {gallery.model_name}
                  </p>
                )}

                {/* Categories */}
                {gallery.categories && gallery.categories.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {gallery.categories.slice(0, 3).map((cat, index) => (
                        <span
                          key={index}
                          className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                        >
                          {typeof cat === "string" ? cat : cat.name}
                        </span>
                      ))}
                      {gallery.categories.length > 3 && (
                        <span className="text-xs text-slate-500 font-medium">
                          +{gallery.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                  <span>
                    {gallery.created_at
                      ? new Date(gallery.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:flex gap-2">
                  <button
                    onClick={() => openModal("view", gallery)}
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
                    onClick={() => openModal("edit", gallery)}
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
                    onClick={() => openCategoryModal(gallery)}
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
                    onClick={() => openDeleteModal(gallery)}
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

          {filteredGalleries.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Gallery Items Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start creating by adding your first gallery item
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
                  Create First Gallery Item
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {modalMode === "create" && "Create Gallery Item"}
                      {modalMode === "edit" && "Edit Gallery Item"}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      {modalMode === "create" &&
                        "Add a new item to your gallery"}
                      {modalMode === "edit" && "Update gallery item"}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="flex-shrink-0 p-1.5 sm:p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
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

              <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Prompt <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.prompt}
                        onChange={(e) =>
                          setFormData({ ...formData, prompt: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        rows="4"
                        required
                        placeholder="Enter the generation prompt..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Image URL <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              image_url: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                          required
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          type="button"
                          onClick={openFilePicker}
                          className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors whitespace-nowrap font-medium"
                        >
                          Browse
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        AI Model
                      </label>
                      <select
                        value={formData.model_id}
                        onChange={(e) =>
                          setFormData({ ...formData, model_id: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                      >
                        <option value="">-- Select Model (Optional) --</option>
                        {Array.isArray(models) &&
                          models.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

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
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    Metadata (Optional)
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Extra Metadata (JSON)
                    </label>
                    <textarea
                      value={formData.extra_metadata}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          extra_metadata: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-mono text-sm"
                      rows="6"
                      placeholder='{"steps": 50, "guidance_scale": 7.5, "seed": 12345}'
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Optional. Enter valid JSON for generation parameters
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
                  >
                    {modalMode === "create"
                      ? "Create Gallery Item"
                      : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-slate-100 text-slate-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Gallery Details
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      View gallery item details
                    </p>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-shrink-0 p-1.5 sm:p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
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

              {isLoadingDetail ? (
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
                      Loading details...
                    </p>
                  </div>
                </div>
              ) : (
                viewGallery && (
                  <div className="space-y-6 p-4 sm:p-6">
                    <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden border border-slate-200">
                      {viewGallery.image_url ? (
                        <img
                          src={viewGallery.image_url}
                          alt={viewGallery.prompt || "Gallery image"}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <svg
                            className="w-24 h-24"
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
                      )}
                    </div>

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
                          <label className="block text-sm font-semibold text-slate-500 mb-1">
                            ID
                          </label>
                          <p className="text-slate-900 font-mono text-sm">
                            {viewGallery.id}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-500 mb-1">
                            Created By
                          </label>
                          <p className="text-slate-900">
                            {viewGallery.creator_name ||
                              viewGallery.created_by ||
                              "N/A"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-500 mb-1">
                            Prompt
                          </label>
                          <p className="text-slate-900 whitespace-pre-wrap">
                            {viewGallery.prompt || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-500 mb-1">
                            AI Model
                          </label>
                          <p className="text-slate-900">
                            {viewGallery.model_name ||
                              (viewGallery.model_id
                                ? `Model ID: ${viewGallery.model_id}`
                                : "N/A")}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-500 mb-1">
                            Categories
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {viewGallery.categories?.length > 0 ? (
                              viewGallery.categories.map((cat, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium"
                                >
                                  {typeof cat === "string" ? cat : cat.name}
                                </span>
                              ))
                            ) : (
                              <p className="text-slate-900">No categories</p>
                            )}
                          </div>
                        </div>
                        {viewGallery.extra_metadata && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-500 mb-1">
                              Extra Metadata
                            </label>
                            <pre className="text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto text-sm font-mono">
                              {JSON.stringify(
                                viewGallery.extra_metadata,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-semibold text-slate-500 mb-1">
                            Created At
                          </label>
                          <p className="text-slate-900">
                            {viewGallery.created_at
                              ? new Date(
                                  viewGallery.created_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-500 mb-1">
                            Updated At
                          </label>
                          <p className="text-slate-900">
                            {viewGallery.updated_at
                              ? new Date(
                                  viewGallery.updated_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl">
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center text-slate-900">
              Delete Gallery Item?
            </h2>
            <p className="text-slate-600 mb-6 text-center">
              Are you sure you want to delete this gallery item? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Assignment Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-6 z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Assign Categories
              </h2>
              <p className="text-amber-50 text-xs sm:text-sm mt-1">
                Select categories for this gallery item
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-5 h-5 text-amber-600 border-slate-300 rounded-lg focus:ring-amber-600"
                      />
                      <span className="text-slate-700 font-medium">
                        {category.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-8">
                    No categories available
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveCategories}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCloseCategoryModal}
                  className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Picker Modal */}
      {isFilePickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Select Image from File Manager
                </h3>
                <button
                  onClick={() => setIsFilePickerOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading files...</p>
                  </div>
                </div>
              ) : availableFiles.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 mb-2">No files available</p>
                  <a href="/dashboard/files" className="text-amber-600 hover:text-amber-700 font-medium">
                    Go to File Manager to upload files
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => selectFile(file.file_url)}
                      className="group relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Image Preview */}
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <img
                          src={file.file_url.startsWith('http') ? file.file_url : `${API_BASE_URL}${file.file_url}`}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='20' dy='.3em'%3ENo Preview%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.file_size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {availableFiles.length} file(s) available
                </p>
                <button
                  onClick={() => setIsFilePickerOpen(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
