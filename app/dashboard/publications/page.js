"use client";
import { useAuth } from "../../../components/AuthProvider";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PublicationsPage() {
  const { getUserInfo } = useAuth();
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [filePickerTarget, setFilePickerTarget] =
    useState("graphical_abstract"); // 'graphical_abstract' or 'pdf'
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view'
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [publicationToDelete, setPublicationToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    abstract: "",
    authors: [],
    venue: "",
    citations: 0,
    doi: "",
    keywords: [],
    impact: "",
    pages: "",
    volume: "",
    issue: "",
    publisher: "",
    methodology: "",
    results: "",
    conclusions: "",
    pdf_url: "",
    journal_name: "",
    year: new Date().getFullYear(),
    graphical_abstract_url: "",
    access_level: "public",
    status: "draft",
  });
  const [authorInput, setAuthorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchPublications();
    fetchCategories();
  }, []);

  const fetchPublications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch("/api/publications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPublications(data.data?.data || []);
      } else {
        throw new Error("Failed to fetch publications");
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
      setError("Failed to load publications");
      // Use mock data for now
      setPublications([
        {
          id: 1,
          title: "Deep Learning Approaches for Batik Pattern Recognition",
          slug: "deep-learning-batik-pattern-recognition",
          abstract:
            "This research explores the application of deep learning techniques in recognizing and classifying traditional batik patterns...",
          authors: ["Dr. Ahmad Rahman", "Prof. Siti Nurhaliza"],
          publication_date: "2024-03-15",
          journal_name: "Journal of Cultural Heritage Computing",
          volume: "12",
          issue: "3",
          pages: "245-260",
          doi: "10.1234/jchc.2024.03.15",
          keywords: [
            "batik",
            "deep learning",
            "pattern recognition",
            "cultural heritage",
          ],
          access_level: "public",
          status: "published",
          file_url: "https://example.com/paper1.pdf",
          created_at: "2024-03-01T00:00:00Z",
        },
        {
          id: 2,
          title: "Preserving Traditional Batik Through Digital Documentation",
          slug: "preserving-batik-digital-documentation",
          abstract:
            "A comprehensive study on digitizing traditional batik motifs for cultural preservation and education...",
          authors: ["Dr. Maya Sari"],
          publication_date: "2024-02-20",
          journal_name: "Digital Heritage Quarterly",
          volume: "8",
          issue: "1",
          pages: "12-25",
          doi: "10.5678/dhq.2024.02.20",
          keywords: ["digital preservation", "batik", "cultural documentation"],
          access_level: "public",
          status: "published",
          file_url: "https://example.com/paper2.pdf",
          created_at: "2024-02-01T00:00:00Z",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("/api/categories?type=publication", {
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
          ? `/api/publications/${selectedPublication.id}`
          : "/api/publications";
      const method = modalMode === "edit" ? "PUT" : "POST";

      // Sanitize and prepare data
      const submitData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        abstract: formData.abstract.trim(),
        authors: formData.authors.filter((a) => a && a.trim()),
        journal_name: formData.journal_name.trim(),
        year: formData.year,
        access_level: formData.access_level,
        status: formData.status,
      };

      // Add optional fields only if they have values
      if (formData.venue && formData.venue.trim()) {
        submitData.venue = formData.venue.trim();
      }
      if (formData.citations !== undefined && formData.citations >= 0) {
        submitData.citations = formData.citations;
      }
      if (formData.impact && formData.impact.trim()) {
        submitData.impact = formData.impact.trim();
      }
      if (formData.volume && formData.volume.trim()) {
        submitData.volume = formData.volume.trim();
      }
      if (formData.issue && formData.issue.trim()) {
        submitData.issue = formData.issue.trim();
      }
      if (formData.pages && formData.pages.trim()) {
        submitData.pages = formData.pages.trim();
      }
      if (formData.publisher && formData.publisher.trim()) {
        submitData.publisher = formData.publisher.trim();
      }
      if (formData.doi && formData.doi.trim()) {
        submitData.doi = formData.doi.trim();
      }
      if (formData.pdf_url && formData.pdf_url.trim()) {
        submitData.pdf_url = formData.pdf_url.trim();
      }
      if (
        formData.graphical_abstract_url &&
        formData.graphical_abstract_url.trim()
      ) {
        submitData.graphical_abstract_url =
          formData.graphical_abstract_url.trim();
      }
      if (formData.methodology && formData.methodology.trim()) {
        submitData.methodology = formData.methodology.trim();
      }
      if (formData.results && formData.results.trim()) {
        submitData.results = formData.results.trim();
      }
      if (formData.conclusions && formData.conclusions.trim()) {
        submitData.conclusions = formData.conclusions.trim();
      }
      if (formData.keywords && formData.keywords.length > 0) {
        // Remove duplicates and empty strings
        submitData.keywords = [
          ...new Set(formData.keywords.filter((k) => k && k.trim())),
        ];
      }

      console.log("Submitting publication data:", submitData);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchPublications();
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        console.error("Submit error:", errorData);
        throw new Error(
          errorData.error || errorData.message || "Failed to save publication",
        );
      }
    } catch (error) {
      console.error("Error saving publication:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (publication) => {
    setPublicationToDelete(publication);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!publicationToDelete) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `/api/publications/${publicationToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        await fetchPublications();
        setIsDeleteModalOpen(false);
        setPublicationToDelete(null);
      } else {
        throw new Error("Failed to delete publication");
      }
    } catch (error) {
      console.error("Error deleting publication:", error);
      setError("Failed to delete publication: " + error.message);
    }
  };

  const handleDelete = (publication) => {
    openDeleteModal(publication);
  };

  const fetchPublicationDetail = async (publicationId) => {
    try {
      setIsLoadingDetail(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`/api/publications/${publicationId}`, {
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
        throw new Error("Failed to fetch publication details");
      }
    } catch (error) {
      console.error("Error fetching publication details:", error);
      setError("Failed to load publication details: " + error.message);
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleAssignCategories = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `/api/publications/${selectedPublication.id}/categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category_ids: selectedCategories }),
        },
      );

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

  const openModal = async (mode, publication = null) => {
    setModalMode(mode);
    setError("");
    setIsModalOpen(true);

    if (mode === "create") {
      setSelectedPublication(null);
      resetForm();
    } else if (mode === "view" && publication) {
      // Fetch detail data from API for view mode
      const detailData = await fetchPublicationDetail(publication.id);
      if (detailData) {
        setSelectedPublication(detailData);
      } else {
        setSelectedPublication(publication);
      }
    } else if (publication) {
      // For edit mode, use the publication from list and populate form
      setSelectedPublication(publication);
      setFormData({
        title: publication.title,
        slug: publication.slug,
        abstract: publication.abstract || "",
        authors: publication.authors || [],
        venue: publication.venue || "",
        citations: publication.citations || 0,
        doi: publication.doi || "",
        keywords: publication.keywords || [],
        impact: publication.impact || "",
        pages: publication.pages || "",
        volume: publication.volume || "",
        issue: publication.issue || "",
        publisher: publication.publisher || "",
        methodology: publication.methodology || "",
        results: publication.results || "",
        conclusions: publication.conclusions || "",
        pdf_url: publication.pdf_url || "",
        journal_name: publication.journal_name || "",
        year: publication.year || new Date().getFullYear(),
        graphical_abstract_url: publication.graphical_abstract_url || "",
        access_level: publication.access_level || "public",
        status: publication.status || "draft",
      });
    }
  };

  const openCategoryModal = (publication) => {
    setSelectedPublication(publication);
    setSelectedCategories([]);
    setIsCategoryModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      abstract: "",
      authors: [],
      venue: "",
      citations: 0,
      doi: "",
      keywords: [],
      impact: "",
      pages: "",
      volume: "",
      issue: "",
      publisher: "",
      methodology: "",
      results: "",
      conclusions: "",
      pdf_url: "",
      journal_name: "",
      year: new Date().getFullYear(),
      graphical_abstract_url: "",
      access_level: "public",
      status: "draft",
    });
    setAuthorInput("");
    setKeywordInput("");
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Only allow lowercase letters, numbers, spaces, and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
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

  const handleAddAuthor = () => {
    if (authorInput.trim() && !formData.authors.includes(authorInput.trim())) {
      setFormData({
        ...formData,
        authors: [...formData.authors, authorInput.trim()],
      });
      setAuthorInput("");
    }
  };

  const handleRemoveAuthor = (authorToRemove) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter((author) => author !== authorToRemove),
    });
  };

  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(
        (keyword) => keyword !== keywordToRemove,
      ),
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
      const response = await fetch("/api/files?limit=100&file_type=image", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

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

  const openFilePicker = (targetField = "graphical_abstract") => {
    setFilePickerTarget(targetField);
    setIsFilePickerOpen(true);
    fetchFilesForPicker();
  };

  const selectFile = (fileUrl) => {
    // Convert relative path to full URL if needed
    const fullUrl = fileUrl.startsWith("http")
      ? fileUrl
      : `${API_BASE_URL}${fileUrl}`;

    if (filePickerTarget === "pdf") {
      setFormData({ ...formData, pdf_url: fullUrl });
    } else {
      setFormData({ ...formData, graphical_abstract_url: fullUrl });
    }
    setIsFilePickerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-amber-600 animate-spin"
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
          </div>
          <p className="text-xl font-bold text-slate-900 mb-2">
            Loading Publications
          </p>
          <p className="text-slate-600">
            Please wait while we fetch your data...
          </p>
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
                Publications
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Manage your research publications and academic papers
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
                <span>Add Publication</span>
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

        {/* Publications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {publications.map((publication) => (
            <div
              key={publication.id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {publication.title}
                    </h3>
                    <p className="text-sm text-amber-700 bg-amber-50/80 backdrop-blur-sm px-3 py-1.5 rounded-xl font-mono font-medium mb-3 inline-block">
                      {publication.slug}
                    </p>
                    <div className="text-sm text-slate-600 mb-3">
                      <p className="font-bold">{publication.journal_name}</p>
                      {publication.volume && publication.issue && (
                        <p className="text-xs">
                          Vol. {publication.volume}, Issue {publication.issue}
                        </p>
                      )}
                      {publication.pages && (
                        <p className="text-xs">Pages: {publication.pages}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-xl ${getStatusBadge(
                        publication.status,
                      )}`}
                    >
                      {publication.status}
                    </span>
                  </div>
                </div>

                {/* Authors */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Authors
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {publication.authors?.slice(0, 2).map((author, index) => (
                      <span
                        key={index}
                        className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {author}
                      </span>
                    ))}
                    {publication.authors?.length > 2 && (
                      <span className="text-xs text-slate-500 font-medium">
                        +{publication.authors.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {publication.keywords?.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                    {publication.keywords?.length > 3 && (
                      <span className="text-xs text-slate-500 font-medium">
                        +{publication.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Spacer to push content below to bottom */}
                <div className="flex-1"></div>

                {/* Meta Info */}
                <div className="flex justify-between items-center text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                  <span>
                    Published:{" "}
                    {new Date(
                      publication.publication_date,
                    ).toLocaleDateString()}
                  </span>
                  <span className="bg-slate-100/80 backdrop-blur-sm px-2.5 py-1 rounded-lg font-medium">
                    {publication.access_level}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => openModal("view", publication)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium text-xs"
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
                  </button>
                  <button
                    onClick={() => openModal("edit", publication)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 font-medium text-xs"
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
                  </button>
                  <button
                    onClick={() => openCategoryModal(publication)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 font-medium text-xs"
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(publication)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium text-xs"
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
                  </button>
                </div>
              </div>
            </div>
          ))}

          {publications.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Publications Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start building your research portfolio by adding your first
                  publication
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
                  Create First Publication
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {modalMode === "create" && "Create Publication"}
                      {modalMode === "edit" && "Edit Publication"}
                      {modalMode === "view" && "View Publication"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {modalMode === "create" &&
                        "Add a new research publication"}
                      {modalMode === "edit" && "Update publication information"}
                      {modalMode === "view" && "View publication details"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
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
                        Loading publication details...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 space-y-6">
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
                            {selectedPublication?.title}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Slug
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-mono shadow-sm">
                            {selectedPublication?.slug}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                          </label>
                          <p
                            className={`inline-block px-4 py-2 rounded-xl font-semibold ${getStatusBadge(
                              selectedPublication?.status,
                            )}`}
                          >
                            {selectedPublication?.status}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Access Level
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 capitalize shadow-sm">
                            {selectedPublication?.access_level}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Publication Details */}
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
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        Publication Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Journal Name
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.journal_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Venue
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.venue || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Publisher
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.publisher || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Year
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.year || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Volume
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.volume || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Issue
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.issue || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pages
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.pages || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            DOI
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-sm shadow-sm break-all">
                            {selectedPublication?.doi || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Impact & Citations */}
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Impact & Citations
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Citations
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-bold text-lg shadow-sm">
                            {selectedPublication?.citations || 0}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Impact Factor
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-bold text-lg shadow-sm">
                            {selectedPublication?.impact || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Authors */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Authors ({selectedPublication?.authors?.length || 0})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPublication?.authors &&
                        selectedPublication.authors.length > 0 ? (
                          selectedPublication.authors.map((author, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                            >
                              {author}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No authors</p>
                        )}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
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
                        Keywords ({selectedPublication?.keywords?.length || 0})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPublication?.keywords &&
                        selectedPublication.keywords.length > 0 ? (
                          selectedPublication.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                            >
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No keywords</p>
                        )}
                      </div>
                    </div>

                    {/* Categories */}
                    {selectedPublication?.categories &&
                      selectedPublication.categories.length > 0 && (
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
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
                            Categories ({selectedPublication.categories.length})
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedPublication.categories.map(
                              (category, index) => (
                                <span
                                  key={index}
                                  className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                                >
                                  {typeof category === "string"
                                    ? category
                                    : category.name}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Abstract */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Abstract
                      </label>
                      <div className="p-4 bg-slate-50 rounded-2xl max-h-64 overflow-y-auto border border-slate-200">
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">
                          {selectedPublication?.abstract ||
                            "No abstract available"}
                        </p>
                      </div>
                    </div>

                    {/* Research Details */}
                    {(selectedPublication?.methodology ||
                      selectedPublication?.results ||
                      selectedPublication?.conclusions) && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50/50 p-4 rounded-2xl border border-indigo-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-indigo-600"
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
                          Research Details
                        </h3>
                        <div className="space-y-4">
                          {selectedPublication?.methodology && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Methodology
                              </label>
                              <div className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                <p className="text-sm whitespace-pre-wrap">
                                  {selectedPublication.methodology}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedPublication?.results && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Results
                              </label>
                              <div className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                <p className="text-sm whitespace-pre-wrap">
                                  {selectedPublication.results}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedPublication?.conclusions && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Conclusions
                              </label>
                              <div className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                                <p className="text-sm whitespace-pre-wrap">
                                  {selectedPublication.conclusions}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* URLs & Resources */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50/50 p-4 rounded-2xl border border-cyan-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-cyan-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        URLs & Resources
                      </h3>
                      <div className="space-y-3">
                        {selectedPublication?.pdf_url && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              PDF URL
                            </label>
                            <a
                              href={selectedPublication.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 bg-white rounded-xl text-blue-600 hover:text-blue-700 shadow-sm break-all text-sm underline"
                            >
                              {selectedPublication.pdf_url}
                            </a>
                          </div>
                        )}
                        {selectedPublication?.graphical_abstract_url && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Graphical Abstract
                            </label>
                            <a
                              href={selectedPublication.graphical_abstract_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 bg-white rounded-xl text-blue-600 hover:text-blue-700 shadow-sm break-all text-sm underline"
                            >
                              {selectedPublication.graphical_abstract_url}
                            </a>
                          </div>
                        )}
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
                            {selectedPublication?.id}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Creator Name
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.creator_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Created At
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.created_at
                              ? new Date(
                                  selectedPublication.created_at,
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Updated At
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedPublication?.updated_at
                              ? new Date(
                                  selectedPublication.updated_at,
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Created By (ID)
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">
                            {selectedPublication?.created_by || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
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
                        placeholder="Enter publication title"
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
                        placeholder="publication-slug"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Journal Name *
                      </label>
                      <input
                        type="text"
                        value={formData.journal_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            journal_name: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Journal name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            venue: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Conference or Journal Venue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            year:
                              parseInt(e.target.value) ||
                              new Date().getFullYear(),
                          })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="2024"
                        min="1900"
                        max="2100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Publisher
                      </label>
                      <input
                        type="text"
                        value={formData.publisher}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publisher: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Publisher name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Volume
                      </label>
                      <input
                        type="text"
                        value={formData.volume}
                        onChange={(e) =>
                          setFormData({ ...formData, volume: e.target.value })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Issue
                      </label>
                      <input
                        type="text"
                        value={formData.issue}
                        onChange={(e) =>
                          setFormData({ ...formData, issue: e.target.value })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Pages
                      </label>
                      <input
                        type="text"
                        value={formData.pages}
                        onChange={(e) =>
                          setFormData({ ...formData, pages: e.target.value })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="245-260"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Citations
                      </label>
                      <input
                        type="number"
                        value={formData.citations}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            citations: parseInt(e.target.value) || 0,
                          })
                        }
                        onWheel={(e) => e.target.blur()}
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Impact Factor
                      </label>
                      <input
                        type="text"
                        value={formData.impact}
                        onChange={(e) =>
                          setFormData({ ...formData, impact: e.target.value })
                        }
                        className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="5.2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      DOI
                    </label>
                    <input
                      type="text"
                      value={formData.doi}
                      onChange={(e) =>
                        setFormData({ ...formData, doi: e.target.value })
                      }
                      className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 font-mono text-sm"
                      placeholder="10.1234/journal.2024.01.01"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        PDF URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.pdf_url}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pdf_url: e.target.value,
                            })
                          }
                          className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                          placeholder="https://example.com/paper.pdf"
                        />
                        <button
                          type="button"
                          onClick={() => openFilePicker("pdf")}
                          className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105 flex items-center gap-2"
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
                        Graphical Abstract URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.graphical_abstract_url}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              graphical_abstract_url: e.target.value,
                            })
                          }
                          className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                          placeholder="https://example.com/graphical_abstract.png"
                        />
                        <button
                          type="button"
                          onClick={() => openFilePicker("graphical_abstract")}
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
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Abstract *
                    </label>
                    <textarea
                      value={formData.abstract}
                      onChange={(e) =>
                        setFormData({ ...formData, abstract: e.target.value })
                      }
                      className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 resize-none"
                      placeholder="Enter publication abstract..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Methodology
                    </label>
                    <textarea
                      value={formData.methodology}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          methodology: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 resize-none"
                      placeholder="Describe the research methodology..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Results
                    </label>
                    <textarea
                      value={formData.results}
                      onChange={(e) =>
                        setFormData({ ...formData, results: e.target.value })
                      }
                      className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 resize-none"
                      placeholder="Summarize the key results..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Conclusions
                    </label>
                    <textarea
                      value={formData.conclusions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conclusions: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 resize-none"
                      placeholder="State the main conclusions..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Authors
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={authorInput}
                        onChange={(e) => setAuthorInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddAuthor())
                        }
                        className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Enter author name and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddAuthor}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.authors.map((author, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-blue-200 flex items-center gap-2"
                        >
                          {author}
                          <button
                            type="button"
                            onClick={() => handleRemoveAuthor(author)}
                            className="text-blue-600 hover:text-blue-800 hover:scale-125 transition-transform"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Keywords
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddKeyword())
                        }
                        className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Enter keyword and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-amber-200 flex items-center gap-2"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
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
                        <option value="archived">Archived</option>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Assign Categories
                </h2>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  Select categories for this publication
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex-shrink-0 p-1.5 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
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

            <div className="p-4 sm:p-6">
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
                              (id) => id !== category.id,
                            ),
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
                Delete Publication?
              </h3>

              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-gray-900 font-semibold text-center mb-6">
                "{publicationToDelete?.title}"?
              </p>
              <p className="text-red-600 text-sm text-center mb-8">
                This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setPublicationToDelete(null);
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
                  Delete Publication
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
                  Choose an image for graphical abstract
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
                    <p className="text-slate-600 font-medium">
                      Loading images...
                    </p>
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
                    onClick={() => window.open("/dashboard/files", "_blank")}
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
                    const fullImageUrl = file.file_url.startsWith("http")
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
                        {formData.graphical_abstract_url === fullImageUrl && (
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
