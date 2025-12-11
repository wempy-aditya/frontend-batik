"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function CategoriesPage() {
  const router = useRouter();
  const { getUserInfo } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("project"); // default type
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const categoryTypes = [
    {
      value: "project",
      label: "Project Categories",
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "dataset",
      label: "Dataset Categories",
      color: "from-green-500 to-green-600",
    },
    {
      value: "publication",
      label: "Publication Categories",
      color: "from-purple-500 to-purple-600",
    },
    {
      value: "news",
      label: "News Categories",
      color: "from-red-500 to-red-600",
    },
    {
      value: "model",
      label: "AI Model Categories",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      value: "gallery",
      label: "Gallery Categories",
      color: "from-amber-500 to-orange-600",
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, [selectedType]); // refetch when type changes

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/categories?type=${selectedType}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
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
          ? `/api/categories/${selectedCategory.id}?type=${selectedType}`
          : `/api/categories?type=${selectedType}`;
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
        await fetchCategories();
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `/api/categories/${categoryToDelete.id}?type=${selectedType}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await fetchCategories();
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error.message);
    }
  };

  const handleDelete = (category) => {
    openDeleteModal(category);
  };

  const openModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setError("");

    if (mode === "create") {
      resetForm();
    } else if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    }

    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
    });
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
            Loading Categories...
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Categories
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Manage your content categories
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
                <span>Add Category</span>
              </div>
            </button>
          </div>

          {/* Category Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {categoryTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setSelectedType(type.value);
                  setError("");
                }}
                className={`group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 ${
                  selectedType === type.value
                    ? `bg-gradient-to-r ${type.color} text-white shadow-lg hover:shadow-xl transform hover:scale-105`
                    : "bg-white/90 text-slate-700 hover:bg-white border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md"
                }`}
              >
                <span className="font-semibold text-xs sm:text-sm text-center">
                  {type.label.replace(" Categories", "")}
                </span>
                {selectedType === type.value && (
                  <span className="bg-white/25 backdrop-blur-sm text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
                    {categories.length}
                  </span>
                )}
              </button>
            ))}
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

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-6">
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 line-clamp-1 text-lg group-hover:text-amber-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-amber-700 bg-amber-50/80 backdrop-blur-sm px-3 py-1.5 rounded-xl font-mono font-medium mb-3 inline-block">
                    {category.slug}
                  </p>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {category.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                    <span>
                      {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openModal("view", category)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => openModal("edit", category)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {categories.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${
                    categoryTypes.find((t) => t.value === selectedType)
                      ?.color || "from-amber-100 to-orange-100"
                  } rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20`}
                ></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No{" "}
                  {categoryTypes.find((t) => t.value === selectedType)?.label}{" "}
                  Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start organizing your content by creating your first{" "}
                  {selectedType} category
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
                  Create First Category
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                      {modalMode === "create" &&
                        `Create ${categoryTypes
                          .find((t) => t.value === selectedType)
                          ?.label.replace(" Categories", "")} Category`}
                      {modalMode === "edit" &&
                        `Edit ${categoryTypes
                          .find((t) => t.value === selectedType)
                          ?.label.replace(" Categories", "")} Category`}
                      {modalMode === "view" && `Category Details`}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-1">
                      {modalMode === "create" &&
                        "Add a new category to organize your content"}
                      {modalMode === "edit" && "Update category information"}
                      {modalMode === "view" && "View category information"}
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
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Category Name
                      </label>
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl text-slate-900 font-medium border border-slate-200/60">
                        {selectedCategory?.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        URL Slug
                      </label>
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl text-slate-900 font-mono text-sm border border-slate-200/60">
                        {selectedCategory?.slug}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Description
                      </label>
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl text-slate-900 min-h-[80px] border border-slate-200/60">
                        {selectedCategory?.description ||
                          "No description provided"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Created
                        </label>
                        <div className="p-3 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-xl text-slate-900 text-sm border border-slate-200/60">
                          {new Date(
                            selectedCategory?.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          ID
                        </label>
                        <div className="p-3 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-xl text-slate-900 font-mono text-xs break-all border border-slate-200/60">
                          {selectedCategory?.id}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl text-red-700 text-sm flex items-start gap-3 shadow-sm">
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

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Category Name
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={handleNameChange}
                        className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all bg-white hover:border-slate-300"
                        placeholder="Enter category name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        URL Slug
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all font-mono bg-white hover:border-slate-300"
                        placeholder="category-slug"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        URL-friendly version (lowercase, hyphens only)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all resize-none bg-white hover:border-slate-300"
                        placeholder="Add a brief description of this category"
                        rows={4}
                      />
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
                                Update Category
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
                                Create Category
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
                Delete Category?
              </h3>

              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-gray-900 font-semibold text-center mb-6">
                "{categoryToDelete?.name}"?
              </p>
              <p className="text-red-600 text-sm text-center mb-8">
                This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
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
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
