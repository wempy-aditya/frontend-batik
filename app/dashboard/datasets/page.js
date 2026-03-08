"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { parseApiError } from "@/lib/handleApiError";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ManageDatasetsPage() {
  const { getUserInfo } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view'
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  
  // File Picker states
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [filePickerMode, setFilePickerMode] = useState('file_url'); // 'file_url' or 'sample_image'
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // // File Picker states
  // const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  // const [filePickerMode, setFilePickerMode] = useState('file_url'); // 'file_url' or 'sample_image'
  // const [availableFiles, setAvailableFiles] = useState([]);
  // const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    tagline: "",
    samples: 0,
    download_count: 0,
    gradient: "#FF6B6B,#4ECDC4",
    version: "1.0",
    format: "JSON",
    license: "MIT",
    citation: "",
    key_features: [],
    use_cases: [],
    technical_specs: {
      type: "supervised",
      access: "public",
      format: "JSON",
      license: "MIT",
      version: "1.0",
      lastUpdate: new Date().toISOString().split("T")[0],
    },
    statistics: {
      avgImageSize: "512x512",
      qualityScore: 0,
      totalAnnotations: 0,
      avgImagesPerCategory: 0,
      maxImagesPerCategory: 0,
      minImagesPerCategory: 0,
    },
    sample_images: [],
    sample_image_url: null,
    file_url: "",
    source: "",
    size: 0,
    access_level: "public",
    status: "draft",
  });
  const [keyFeatureInput, setKeyFeatureInput] = useState("");
  const [useCaseInput, setUseCaseInput] = useState("");
  const [sampleImageInput, setSampleImageInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchDatasets();
    fetchCategories();
  }, []);

  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      console.log("Token available:", !!token);
      console.log("Making request to /api/datasets");

      const response = await fetch("/api/datasets", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Datasets response:", data);
        setDatasets(data.data || []);
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch datasets: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setError("Failed to load datasets: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("/api/categories?type=dataset", {
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
        modalMode === "edit"
          ? `/api/datasets/${selectedDataset.id}`
          : "/api/datasets";
      const method = modalMode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchDatasets();
        setIsModalOpen(false);
        resetForm();
      } else {
        const msg = await parseApiError(response);
        setError(msg);
        return;
      }
    } catch (error) {
      console.error("Error saving dataset:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (dataset) => {
    setDatasetToDelete(dataset);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!datasetToDelete) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/datasets/${datasetToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchDatasets();
        setIsDeleteModalOpen(false);
        setDatasetToDelete(null);
      } else {
        const msg = await parseApiError(response);
        setError(msg);
        return;
      }
    } catch (error) {
      console.error("Error deleting dataset:", error);
      setError(error.message);
    }
  };

  const handleDelete = (dataset) => {
    openDeleteModal(dataset);
  };

  const handleAssignCategories = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `/api/datasets/${selectedDataset.id}/categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category_ids: selectedCategories }),
        }
      );

      if (response.ok) {
        setIsCategoryModalOpen(false);
        setSelectedCategories([]);
        await fetchDatasets(); // Refresh to show updated categories
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

  const fetchDatasetDetail = async (datasetId) => {
    try {
      setIsLoadingDetail(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to fetch dataset details");
      }
    } catch (error) {
      console.error("Error fetching dataset details:", error);
      setError("Failed to load dataset details: " + error.message);
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const openModal = async (mode, dataset = null) => {
    setModalMode(mode);
    setError("");
    setIsModalOpen(true);

    if (mode === "create") {
      setSelectedDataset(null);
      resetForm();
    } else if (mode === "view" && dataset) {
      // Fetch detail data from API for view mode
      const detailData = await fetchDatasetDetail(dataset.id);
      if (detailData) {
        setSelectedDataset(detailData);
      } else {
        setSelectedDataset(dataset);
      }
    } else if (dataset) {
      // For edit mode, use the dataset from list and populate form
      setSelectedDataset(dataset);
      setFormData({
        name: dataset.name || "",
        slug: dataset.slug || "",
        description: dataset.description || "",
        tagline: dataset.tagline || "",
        samples: dataset.samples || 0,
        download_count: dataset.download_count || 0,
        gradient: dataset.gradient || "#FF6B6B,#4ECDC4",
        version: dataset.version || "1.0",
        format: dataset.format || "JSON",
        license: dataset.license || "MIT",
        citation: dataset.citation || "",
        key_features: dataset.key_features || [],
        use_cases: dataset.use_cases || [],
        technical_specs: dataset.technical_specs || {
          type: "supervised",
          access: "public",
          format: "JSON",
          license: "MIT",
          version: "1.0",
          lastUpdate: new Date().toISOString().split("T")[0],
        },
        statistics: dataset.statistics || {
          avgImageSize: "512x512",
          qualityScore: 0,
          totalAnnotations: 0,
          avgImagesPerCategory: 0,
          maxImagesPerCategory: 0,
          minImagesPerCategory: 0,
        },
        sample_images: dataset.sample_images || [],
        sample_image_url: dataset.sample_image_url || null,
        file_url: dataset.file_url || "",
        source: dataset.source || "",
        size: dataset.size || 0,
        access_level: dataset.access_level || "public",
        status: dataset.status || "draft",
      });
    }
  };

  const openCategoryModal = (dataset) => {
    setSelectedDataset(dataset);
    setSelectedCategories([]);
    setIsCategoryModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      tagline: "",
      samples: 0,
      download_count: 0,
      gradient: "#FF6B6B,#4ECDC4",
      version: "1.0",
      format: "JSON",
      license: "MIT",
      citation: "",
      key_features: [],
      use_cases: [],
      technical_specs: {
        type: "supervised",
        access: "public",
        format: "JSON",
        license: "MIT",
        version: "1.0",
        lastUpdate: new Date().toISOString().split("T")[0],
      },
      statistics: {
        avgImageSize: "512x512",
        qualityScore: 0,
        totalAnnotations: 0,
        avgImagesPerCategory: 0,
        maxImagesPerCategory: 0,
        minImagesPerCategory: 0,
      },
      sample_images: [],
      sample_image_url: null,
      file_url: "",
      source: "",
      size: 0,
      access_level: "public",
      status: "draft",
    });
    setKeyFeatureInput("");
    setUseCaseInput("");
    setSampleImageInput("");
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleAddKeyFeature = () => {
    if (
      keyFeatureInput.trim() &&
      !formData.key_features.includes(keyFeatureInput.trim())
    ) {
      setFormData({
        ...formData,
        key_features: [...formData.key_features, keyFeatureInput.trim()],
      });
      setKeyFeatureInput("");
    }
  };

  const handleRemoveKeyFeature = (featureToRemove) => {
    setFormData({
      ...formData,
      key_features: formData.key_features.filter(
        (feature) => feature !== featureToRemove
      ),
    });
  };

  const handleAddUseCase = () => {
    if (
      useCaseInput.trim() &&
      !formData.use_cases.includes(useCaseInput.trim())
    ) {
      setFormData({
        ...formData,
        use_cases: [...formData.use_cases, useCaseInput.trim()],
      });
      setUseCaseInput("");
    }
  };

  const handleRemoveUseCase = (useCaseToRemove) => {
    setFormData({
      ...formData,
      use_cases: formData.use_cases.filter(
        (useCase) => useCase !== useCaseToRemove
      ),
    });
  };

  const handleAddSampleImage = () => {
    if (
      sampleImageInput.trim() &&
      !formData.sample_images.includes(sampleImageInput.trim())
    ) {
      setFormData({
        ...formData,
        sample_images: [...formData.sample_images, sampleImageInput.trim()],
      });
      setSampleImageInput("");
    }
  };

  const handleRemoveSampleImage = (imageToRemove) => {
    setFormData({
      ...formData,
      sample_images: formData.sample_images.filter(
        (image) => image !== imageToRemove
      ),
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: "bg-gray-100 text-gray-700",
      published: "bg-green-100 text-green-700",
      archived: "bg-red-100 text-red-700",
    };
    return badges[status] || badges.draft;
  };

  const getAccessBadge = (accessLevel) => {
    const badges = {
      public: "bg-green-100 text-green-700",
      private: "bg-red-100 text-red-700",
      premium: "bg-amber-100 text-amber-700",
    };
    return badges[accessLevel] || badges.public;
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
  const openFilePicker = (mode = 'file_url') => {
    setFilePickerMode(mode);
    setIsFilePickerOpen(true);
    fetchFilesForPicker();
  };

  // Select file from picker for file_url
  const selectFileUrl = (fileUrl) => {
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;
    setFormData({ ...formData, file_url: fullUrl });
    setIsFilePickerOpen(false);
  };

  // Select file from picker for sample_images
  const selectSampleImage = (fileUrl) => {
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;
    if (!formData.sample_images.includes(fullUrl)) {
      setFormData({
        ...formData,
        sample_images: [...formData.sample_images, fullUrl],
      });
    }
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
          <p className="text-slate-700 font-medium text-lg">
            Loading Datasets...
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
                Datasets
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Manage your research datasets
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
                <span>Add Dataset</span>
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

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Dataset Header */}
              <div className="relative p-6 bg-white border-b border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg group-hover:text-amber-700 transition-colors">
                      {dataset.name}
                    </h3>
                    <p className="text-sm text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-xl font-mono font-medium mb-2 inline-block border border-amber-200">
                      {dataset.slug}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {dataset.description}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-xl ${getStatusBadge(
                        dataset.status
                      )}`}
                    >
                      {dataset.status}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-xl ${getAccessBadge(
                        dataset.access_level
                      )}`}
                    >
                      {dataset.access_level}
                    </span>
                  </div>
                </div>

                {/* Dataset Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1 font-medium">
                      Samples
                    </p>
                    <p className="font-bold text-slate-900">
                      {dataset.samples?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1 font-medium">
                      Size
                    </p>
                    <p className="font-bold text-slate-900">
                      {formatFileSize(dataset.size || 0)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1 font-medium">
                      Version
                    </p>
                    <p className="font-bold text-slate-900">
                      {dataset.version || "N/A"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1 font-medium">
                      Downloads
                    </p>
                    <p className="font-bold text-slate-900">
                      {dataset.download_count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white">
                {/* Key Features */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Key Features
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dataset.key_features?.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-medium border border-blue-200"
                      >
                        {feature}
                      </span>
                    ))}
                    {dataset.key_features?.length > 3 && (
                      <span className="text-xs text-slate-500 font-medium">
                        +{dataset.key_features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Use Cases */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Use Cases
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dataset.use_cases?.slice(0, 2).map((useCase, index) => (
                      <span
                        key={index}
                        className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {useCase}
                      </span>
                    ))}
                    {dataset.use_cases?.length > 2 && (
                      <span className="text-xs text-slate-500 font-medium">
                        +{dataset.use_cases.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex justify-between items-center text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                  <span>
                    {new Date(dataset.created_at).toLocaleDateString()}
                  </span>
                  <span className="bg-slate-100/80 backdrop-blur-sm px-2.5 py-1 rounded-lg font-medium">
                    {dataset.format || "JSON"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:flex gap-2">
                  <button
                    onClick={() => openModal("view", dataset)}
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
                    onClick={() => openModal("edit", dataset)}
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
                    onClick={() => openCategoryModal(dataset)}
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
                    onClick={() => handleDelete(dataset)}
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

          {datasets.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/20">
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
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Datasets Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start organizing your research by creating your first dataset
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
                  Create First Dataset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Dataset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {modalMode === "create" && "Create Dataset"}
                      {modalMode === "edit" && "Edit Dataset"}
                      {modalMode === "view" && "Dataset Details"}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      {modalMode === "create" && "Add a new research dataset"}
                      {modalMode === "edit" && "Update dataset information"}
                      {modalMode === "view" && "View dataset information"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 sm:p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 flex-shrink-0"
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

              <div className="p-4 sm:p-6">
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
                          Loading dataset details...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
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
                              Name
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.name}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Slug
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 font-mono shadow-sm">
                              {selectedDataset?.slug}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Status
                            </label>
                            <p
                              className={`inline-block px-4 py-2 rounded-xl font-semibold ${getStatusBadge(
                                selectedDataset?.status
                              )}`}
                            >
                              {selectedDataset?.status}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Access Level
                            </label>
                            <p
                              className={`inline-block px-4 py-2 rounded-xl font-semibold ${getAccessBadge(
                                selectedDataset?.access_level
                              )}`}
                            >
                              {selectedDataset?.access_level}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description & Tagline */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <p className="p-4 bg-gray-50 rounded-xl text-gray-900 leading-relaxed">
                          {selectedDataset?.description}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tagline
                        </label>
                        <p className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl text-gray-900 border border-amber-200">
                          {selectedDataset?.tagline || "N/A"}
                        </p>
                      </div>

                      {/* Dataset Metrics */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Dataset Metrics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-xs text-slate-600 mb-1 font-semibold">
                              Samples
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                              {selectedDataset?.samples?.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-xs text-slate-600 mb-1 font-semibold">
                              Size
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                              {formatFileSize(selectedDataset?.size || 0)}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-xs text-slate-600 mb-1 font-semibold">
                              Downloads
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                              {selectedDataset?.download_count || 0}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-xs text-slate-600 mb-1 font-semibold">
                              Version
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                              {selectedDataset?.version}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Technical Specifications */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50/50 p-4 rounded-2xl border border-purple-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
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
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                          </svg>
                          Technical Specifications
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Format
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.format}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              License
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.license}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Type
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.technical_specs?.type || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Access
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.technical_specs?.access ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Last Update
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.technical_specs?.lastUpdate ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Gradient
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">
                              {selectedDataset?.gradient || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Statistics */}
                      {selectedDataset?.statistics && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 p-4 rounded-2xl border border-green-200">
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                              />
                            </svg>
                            Statistics
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Avg Image Size
                              </label>
                              <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                {selectedDataset?.statistics?.avgImageSize ||
                                  "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quality Score
                              </label>
                              <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                {selectedDataset?.statistics?.qualityScore || 0}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total Annotations
                              </label>
                              <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                {selectedDataset?.statistics?.totalAnnotations?.toLocaleString() ||
                                  0}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Avg Images/Category
                              </label>
                              <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                {selectedDataset?.statistics?.avgImagesPerCategory?.toLocaleString() ||
                                  0}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Max Images/Category
                              </label>
                              <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                {selectedDataset?.statistics?.maxImagesPerCategory?.toLocaleString() ||
                                  0}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Min Images/Category
                              </label>
                              <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                {selectedDataset?.statistics?.minImagesPerCategory?.toLocaleString() ||
                                  0}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Key Features */}
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Key Features
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedDataset?.key_features &&
                          selectedDataset.key_features.length > 0 ? (
                            selectedDataset.key_features.map(
                              (feature, index) => (
                                <span
                                  key={index}
                                  className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                                >
                                  {feature}
                                </span>
                              )
                            )
                          ) : (
                            <p className="text-gray-500 italic">
                              No key features listed
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Use Cases */}
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
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Use Cases
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedDataset?.use_cases &&
                          selectedDataset.use_cases.length > 0 ? (
                            selectedDataset.use_cases.map((useCase, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                              >
                                {useCase}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">
                              No use cases listed
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Categories */}
                      {selectedDataset?.categories &&
                        selectedDataset.categories.length > 0 && (
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
                              Categories
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {selectedDataset.categories.map(
                                (category, index) => (
                                  <span
                                    key={index}
                                    className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                                  >
                                    {category}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Sample Images */}
                      {selectedDataset?.sample_images &&
                        selectedDataset.sample_images.length > 0 && (
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
                              Sample Images (
                              {selectedDataset.sample_images.length})
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {selectedDataset.sample_images.map(
                                (image, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-2 rounded-xl border border-gray-200"
                                  >
                                    <img
                                      src={image}
                                      alt={`Sample ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg mb-2"
                                      onError={(e) =>
                                        (e.target.style.display = "none")
                                      }
                                    />
                                    <p className="text-xs text-gray-600 truncate font-mono">
                                      {image}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* URLs & Source */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Source
                          </label>
                          <p className="p-3 bg-gray-50 rounded-xl text-gray-900">
                            {selectedDataset?.source || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            File URL
                          </label>
                          {selectedDataset?.file_url ? (
                            <a
                              href={selectedDataset.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-blue-50 rounded-xl text-blue-600 hover:text-blue-700 block truncate underline"
                            >
                              {selectedDataset.file_url}
                            </a>
                          ) : (
                            <p className="p-3 bg-gray-50 rounded-xl text-gray-500 italic">
                              No file URL
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Citation */}
                      {selectedDataset?.citation && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Citation
                          </label>
                          <pre className="p-4 bg-gray-900 text-green-400 rounded-xl text-xs font-mono overflow-x-auto">
                            {selectedDataset.citation}
                          </pre>
                        </div>
                      )}

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
                              {selectedDataset?.id}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Creator Name
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.creator_name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Created At
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.created_at
                                ? new Date(
                                    selectedDataset.created_at
                                  ).toLocaleString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Updated At
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                              {selectedDataset?.updated_at
                                ? new Date(
                                    selectedDataset.updated_at
                                  ).toLocaleString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Created By (ID)
                            </label>
                            <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">
                              {selectedDataset?.created_by || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dataset Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={handleNameChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="Enter dataset name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Slug *
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-mono"
                          placeholder="dataset-slug"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none"
                        placeholder="Enter dataset description..."
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) =>
                          setFormData({ ...formData, tagline: e.target.value })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Brief tagline for the dataset"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Samples Count *
                        </label>
                        <input
                          type="number"
                          value={formData.samples}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              samples: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="50000"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          File Size (bytes) *
                        </label>
                        <input
                          type="number"
                          value={formData.size}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              size: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="2048000000"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Version *
                        </label>
                        <input
                          type="text"
                          value={formData.version}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              version: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="1.0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Format *
                        </label>
                        <select
                          value={formData.format}
                          onChange={(e) =>
                            setFormData({ ...formData, format: e.target.value })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          required
                        >
                          <option value="JSON">JSON</option>
                          <option value="CSV">CSV</option>
                          <option value="XML">XML</option>
                          <option value="ZIP">ZIP</option>
                          <option value="TXT">TXT</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          License *
                        </label>
                        <select
                          value={formData.license}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              license: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          required
                        >
                          <option value="MIT">MIT</option>
                          <option value="Apache 2.0">Apache 2.0</option>
                          <option value="GPL">GPL</option>
                          <option value="BSD">BSD</option>
                          <option value="CC BY">CC BY</option>
                          <option value="CC BY-SA">CC BY-SA</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Source
                        </label>
                        <input
                          type="text"
                          value={formData.source}
                          onChange={(e) =>
                            setFormData({ ...formData, source: e.target.value })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="Research Lab or Organization"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          File URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={formData.file_url}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                file_url: e.target.value,
                              })
                            }
                            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                            placeholder="https://example.com/dataset.zip"
                          />
                          <button
                            type="button"
                            onClick={() => openFilePicker('file_url')}
                            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            Browse
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Citation
                      </label>
                      <textarea
                        value={formData.citation}
                        onChange={(e) =>
                          setFormData({ ...formData, citation: e.target.value })
                        }
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none font-mono"
                        placeholder="@dataset{example_2024, author={Author}, title={Dataset Title}}"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Key Features
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={keyFeatureInput}
                          onChange={(e) => setKeyFeatureInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddKeyFeature())
                          }
                          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="Enter key feature and press Enter"
                        />
                        <button
                          type="button"
                          onClick={handleAddKeyFeature}
                          className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.key_features.map((feature, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyFeature(feature)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Use Cases
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={useCaseInput}
                          onChange={(e) => setUseCaseInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddUseCase())
                          }
                          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="Enter use case and press Enter"
                        />
                        <button
                          type="button"
                          onClick={handleAddUseCase}
                          className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.use_cases.map((useCase, index) => (
                          <span
                            key={index}
                            className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {useCase}
                            <button
                              type="button"
                              onClick={() => handleRemoveUseCase(useCase)}
                              className="text-amber-500 hover:text-amber-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sample Images (URLs)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="url"
                          value={sampleImageInput}
                          onChange={(e) => setSampleImageInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddSampleImage())
                          }
                          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          type="button"
                          onClick={() => openFilePicker('sample_image')}
                          className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors whitespace-nowrap"
                        >
                          Browse
                        </button>
                        <button
                          type="button"
                          onClick={handleAddSampleImage}
                          className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.sample_images.map((image, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Image {index + 1}
                            <button
                              type="button"
                              onClick={() => handleRemoveSampleImage(image)}
                              className="text-purple-500 hover:text-purple-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      {formData.sample_images.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formData.sample_images.length} sample image(s) added
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                        >
                          <option value="public">Public</option>
                          <option value="registered">Registered</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
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
                        className="flex-1 px-6 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 px-6 py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 ${
                          isSubmitting
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105"
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="w-5 h-5 animate-spin"
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
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {modalMode === "edit" ? (
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
                                Update Dataset
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                Create Dataset
                              </>
                            )}
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Assignment Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Assign Categories
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">
                      Select categories for this dataset
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
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
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all duration-200"
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
                        className="w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500 focus:ring-4 focus:ring-amber-500/10"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {category.name}
                        </p>
                        <p className="text-sm text-slate-500 font-mono">
                          {category.slug}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 px-6 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignCategories}
                    disabled={isSubmitting || selectedCategories.length === 0}
                    className={`flex-1 px-6 py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 ${
                      isSubmitting || selectedCategories.length === 0
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
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
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
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
                      </span>
                    )}
                  </button>
                </div>
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
                Delete Dataset?
              </h3>

              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-gray-900 font-semibold text-center mb-6">
                "{datasetToDelete?.name}"?
              </p>
              <p className="text-red-600 text-sm text-center mb-8">
                This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDatasetToDelete(null);
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
                  Delete Dataset
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
                  Select File from File Manager
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
                      onClick={() => filePickerMode === 'file_url' ? selectFileUrl(file.file_url) : selectSampleImage(file.file_url)}
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
