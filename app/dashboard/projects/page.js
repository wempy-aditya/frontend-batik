"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { parseApiError } from "@/lib/handleApiError";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Projects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContributorModal, setShowContributorModal] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [projectContributors, setProjectContributors] = useState([]);
  const [selectedContributorIds, setSelectedContributorIds] = useState([]);
  const [contributorRoles, setContributorRoles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterComplexity, setFilterComplexity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 9;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    full_description: "",
    technologies: [],
    challenges: [],
    achievements: [],
    future_work: [],
    thumbnail_url: "",
    demo_url: [],
    tags: [],
    complexity: "medium",
    start_at: "",
    access_level: "public",
    status: "draft",
  });

  // Tech/tags input states
  const [techInput, setTechInput] = useState("");
  const [challengeInput, setChallengeInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");
  const [futureWorkInput, setFutureWorkInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [demoUrlInput, setDemoUrlInput] = useState("");

  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchCategories();
      fetchContributors();
    }
  }, [token, currentPage]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetch(
        `/api/projects?offset=${offset}&limit=${itemsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Handle array structure similar to publications
        let projectsArray = [];
        if (Array.isArray(data.data)) {
          projectsArray = data.data;
        } else if (Array.isArray(data.data?.items)) {
          projectsArray = data.data.items;
        } else if (Array.isArray(data.data?.projects)) {
          projectsArray = data.data.projects;
        } else if (Array.isArray(data.items)) {
          projectsArray = data.items;
        } else if (Array.isArray(data.projects)) {
          projectsArray = data.projects;
        }

        setProjects(projectsArray);
        setTotalCount(data.total_count || 0);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?type=project", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const categoriesArray = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.data)
          ? data.data.data
          : [];
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchContributors = async () => {
    try {
      const response = await fetch("/api/contributors?limit=100");
      if (response.ok) {
        const data = await response.json();
        setContributors(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching contributors:", error);
    }
  };

  const fetchProjectContributors = async (projectId) => {
    try {
      const response = await fetch(`/api/contributors/by-project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Deduplicate contributors by ID to prevent React key errors
        const uniqueContributors = Array.from(
          new Map((data.data || []).map(c => [c.id, c])).values()
        );
        
        setProjectContributors(uniqueContributors);
        setSelectedContributorIds(uniqueContributors.map(c => c.id));
        const roles = {};
        uniqueContributors.forEach(c => {
          roles[c.id] = c.role_in_project || '';
        });
        setContributorRoles(roles);
      }
    } catch (error) {
      console.error("Error fetching project contributors:", error);
    }
  };

  const fetchProjectDetail = async (projectId) => {
    try {
      setIsLoadingDetail(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      } else {
        throw new Error("Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = selectedProject ? "PATCH" : "POST";
      const url = selectedProject
        ? `/api/projects/${selectedProject.id}`
        : "/api/projects";

      // Clean up form data
      const submitData = {
        ...formData,
        technologies: formData.technologies.filter(
          (tech) => tech.trim() !== ""
        ),
        challenges: formData.challenges.filter(
          (challenge) => challenge.trim() !== ""
        ),
        achievements: formData.achievements.filter(
          (achievement) => achievement.trim() !== ""
        ),
        future_work: formData.future_work.filter((work) => work.trim() !== ""),
        demo_url: formData.demo_url.filter((url) => url.trim() !== ""),
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
        start_at: formData.start_at || new Date().toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchProjects();
        setShowModal(false);
        resetForm();
      } else {
        const msg = await parseApiError(response);
        setError(msg);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      setError(error.message);
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title || "",
      slug: project.slug || "",
      description: project.description || "",
      full_description: project.full_description || "",
      technologies: project.technologies || [],
      challenges: project.challenges || [],
      achievements: project.achievements || [],
      future_work: project.future_work || [],
      thumbnail_url: project.thumbnail_url || "",
      demo_url: Array.isArray(project.demo_url) ? project.demo_url : [],
      tags: project.tags || [],
      complexity: project.complexity || "medium",
      start_at: project.start_at ? project.start_at.split("T")[0] : "",
      access_level: project.access_level || "public",
      status: project.status || "draft",
    });
    setShowModal(true);
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchProjects();
        setShowDeleteModal(false);
        setProjectToDelete(null);
      } else {
        const msg = await parseApiError(response);
        setError(msg);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(error.message);
    }
  };

  const handleDelete = (project) => {
    openDeleteModal(project);
  };

  const handleAssignCategories = async (categoryIds) => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `/api/projects/${selectedProject.id}/categories`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category_ids: categoryIds }),
        }
      );

      if (response.ok) {
        await fetchProjects();
        setShowCategoryModal(false);
      }
    } catch (error) {
      console.error("Error assigning categories:", error);
    }
  };

  const handleAssignContributors = async () => {
    if (!selectedProject) return;
    
    try {
      const contributorIds = selectedContributorIds;
      const roles = contributorIds.map(id => contributorRoles[id] || '');
      
      const response = await fetch(
        `/api/contributors/assign/project/${selectedProject.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            contributor_ids: contributorIds,
            roles: roles 
          }),
        }
      );

      if (response.ok) {
        await fetchProjects();
        setShowContributorModal(false);
        setSelectedContributorIds([]);
        setContributorRoles({});
      }
    } catch (error) {
      console.error("Error assigning contributors:", error);
    }
  };

  // Array manipulation functions
  const addToArray = (arrayName, value, inputSetter) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [arrayName]: [...prev[arrayName], value.trim()],
      }));
      inputSetter("");
    }
  };

  const removeFromArray = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setSelectedProject(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      full_description: "",
      technologies: [],
      challenges: [],
      achievements: [],
      future_work: [],
      thumbnail_url: "",
      demo_url: [],
      tags: [],
      complexity: "medium",
      start_at: "",
      access_level: "public",
      status: "draft",
    });
    setTechInput("");
    setChallengeInput("");
    setAchievementInput("");
    setFutureWorkInput("");
    setTagInput("");
    setDemoUrlInput("");
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !selectedProject) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, selectedProject]);

  const fetchFilesForPicker = async () => {
    setIsLoadingFiles(true);
    try {
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

  // Filter projects
  const filteredProjects = (Array.isArray(projects) ? projects : []).filter(
    (project) => {
      const matchesSearch =
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || project.status === filterStatus;
      const matchesComplexity =
        filterComplexity === "all" || project.complexity === filterComplexity;
      return matchesSearch && matchesStatus && matchesComplexity;
    }
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-slate-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm flex-1">{error}</p>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Manage your research projects and portfolios
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
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
                <span>Add Project</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Complexity
              </label>
              <select
                value={filterComplexity}
                onChange={(e) => setFilterComplexity(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
              >
                <option value="all">All Complexity</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterComplexity("all");
                }}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium hover:scale-105"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
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
                Loading Projects
              </p>
              <p className="text-slate-600">
                Please wait while we fetch your data...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Project Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex flex-col items-center justify-center">
                              <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span class="text-slate-400 text-sm mt-2 font-medium">No Image</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-slate-400 text-sm mt-2 font-medium">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Status & Complexity Badges */}
                    <div className="flex gap-2 mb-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-xl ${
                          project.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {project.status}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-xl ${
                          project.complexity === "easy"
                            ? "bg-blue-100 text-blue-800"
                            : project.complexity === "medium"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {project.complexity}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-700 mb-2">
                            Technologies
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.technologies
                              .slice(0, 3)
                              .map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            {project.technologies.length > 3 && (
                              <span className="px-2.5 py-1 text-xs text-slate-500 font-medium">
                                +{project.technologies.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Start Date */}
                    {project.start_at && (
                      <p className="text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
                        Started:{" "}
                        {new Date(project.start_at).toLocaleDateString()}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 sm:flex gap-2">
                      <button
                        onClick={async () => {
                          setShowViewModal(true);
                          const detailData = await fetchProjectDetail(
                            project.id
                          );
                          if (detailData) {
                            setSelectedProject(detailData);
                          } else {
                            setSelectedProject(project);
                          }
                        }}
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
                        onClick={() => handleEdit(project)}
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
                        onClick={() => {
                          setSelectedProject(project);
                          setShowCategoryModal(true);
                        }}
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
                        onClick={async () => {
                          setSelectedProject(project);
                          await fetchProjectContributors(project.id);
                          setShowContributorModal(true);
                        }}
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span className="hidden xs:inline">Team</span>
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>

                <span className="flex items-center px-5 py-2.5 text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
              <div className="max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {selectedProject ? "Edit Project" : "Create Project"}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        {selectedProject
                          ? "Update project information"
                          : "Add a new research project"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
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

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Project title"
                      />
                    </div>

                    {/* Slug */}
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
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 font-mono text-sm"
                        placeholder="project-slug"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Short Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 resize-none"
                      placeholder="Brief description of the project"
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Full Description
                    </label>
                    <textarea
                      value={formData.full_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          full_description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 resize-none"
                      placeholder="Detailed description of the project"
                    />
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Technologies
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(),
                          addToArray("technologies", techInput, setTechInput))
                        }
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Add technology"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addToArray("technologies", techInput, setTechInput)
                        }
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-blue-200 flex items-center gap-2"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() =>
                              removeFromArray("technologies", index)
                            }
                            className="text-blue-600 hover:text-blue-800 hover:scale-125 transition-transform"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Challenges
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={challengeInput}
                        onChange={(e) => setChallengeInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(),
                          addToArray(
                            "challenges",
                            challengeInput,
                            setChallengeInput
                          ))
                        }
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Add challenge"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addToArray(
                            "challenges",
                            challengeInput,
                            setChallengeInput
                          )
                        }
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.challenges.map((challenge, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-orange-200 flex items-center gap-2"
                        >
                          {challenge}
                          <button
                            type="button"
                            onClick={() => removeFromArray("challenges", index)}
                            className="text-orange-600 hover:text-orange-800 hover:scale-125 transition-transform"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Achievements
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(),
                          addToArray(
                            "achievements",
                            achievementInput,
                            setAchievementInput
                          ))
                        }
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Add achievement"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addToArray(
                            "achievements",
                            achievementInput,
                            setAchievementInput
                          )
                        }
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.achievements.map((achievement, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-green-200 flex items-center gap-2"
                        >
                          {achievement}
                          <button
                            type="button"
                            onClick={() =>
                              removeFromArray("achievements", index)
                            }
                            className="text-green-600 hover:text-green-800 hover:scale-125 transition-transform"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Future Work */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Future Work
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={futureWorkInput}
                        onChange={(e) => setFutureWorkInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(),
                          addToArray(
                            "future_work",
                            futureWorkInput,
                            setFutureWorkInput
                          ))
                        }
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Add future work"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addToArray(
                            "future_work",
                            futureWorkInput,
                            setFutureWorkInput
                          )
                        }
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.future_work.map((work, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-purple-200 flex items-center gap-2"
                        >
                          {work}
                          <button
                            type="button"
                            onClick={() =>
                              removeFromArray("future_work", index)
                            }
                            className="text-purple-600 hover:text-purple-800 hover:scale-125 transition-transform"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
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
                          (e.preventDefault(),
                          addToArray("tags", tagInput, setTagInput))
                        }
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="Add tag"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addToArray("tags", tagInput, setTagInput)
                        }
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-slate-200 flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeFromArray("tags", index)}
                            className="text-slate-600 hover:text-slate-800 hover:scale-125 transition-transform"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thumbnail URL */}
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
                          className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
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

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_at}
                        onChange={(e) =>
                          setFormData({ ...formData, start_at: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Demo URLs */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Demo URLs
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={demoUrlInput}
                        onChange={(e) => setDemoUrlInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(),
                          addToArray("demo_url", demoUrlInput, setDemoUrlInput))
                        }
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300"
                        placeholder="https://demo.example.com"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          addToArray("demo_url", demoUrlInput, setDemoUrlInput)
                        }
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.demo_url.map((url, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-indigo-200 flex items-center gap-2 max-w-md"
                        >
                          <span className="truncate">{url}</span>
                          <button
                            type="button"
                            onClick={() => removeFromArray("demo_url", index)}
                            className="text-indigo-600 hover:text-indigo-800 hover:scale-125 transition-transform flex-shrink-0"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Complexity */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Complexity
                      </label>
                      <select
                        value={formData.complexity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            complexity: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 bg-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    {/* Access Level */}
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
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 bg-white"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all hover:border-slate-300 bg-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-8 py-3 text-slate-700 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all duration-200 font-medium border-2 border-slate-200 hover:border-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
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
                          {selectedProject ? "Updating..." : "Creating..."}
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
                              d={
                                selectedProject
                                  ? "M5 13l4 4L19 7"
                                  : "M12 4v16m8-8H4"
                              }
                            />
                          </svg>
                          {selectedProject
                            ? "Update Project"
                            : "Create Project"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
              <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-50 to-amber-50/50 backdrop-blur-sm p-4 sm:p-6 border-b-2 border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                      {isLoadingDetail ? "Loading..." : selectedProject?.title}
                    </h2>
                    {!isLoadingDetail && selectedProject && (
                      <p className="text-slate-600 mt-1 font-mono text-xs sm:text-sm">
                        {selectedProject.slug}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:scale-110 transition-all rounded-xl p-1.5 sm:p-2 hover:bg-slate-100"
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
                      Loading project details...
                    </p>
                  </div>
                </div>
              ) : (
                selectedProject && (
                  <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                    {/* Project Image */}
                    <div className="w-full">
                      {selectedProject.thumbnail_url ? (
                        <img
                          src={selectedProject.thumbnail_url}
                          alt={selectedProject.title}
                          className="w-full h-64 object-cover rounded-2xl"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `
                          <div class="w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                            <svg class="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-slate-400 text-base mt-3 font-medium">No Thumbnail Available</span>
                          </div>
                        `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                          <svg
                            className="w-20 h-20 text-slate-300"
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
                          <span className="text-slate-400 text-base mt-3 font-medium">
                            No Thumbnail Available
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status and Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">
                          Status
                        </p>
                        <p className="font-bold text-slate-900 mt-1">
                          {selectedProject.status}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">
                          Complexity
                        </p>
                        <p className="font-bold text-slate-900 mt-1">
                          {selectedProject.complexity}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">
                          Access
                        </p>
                        <p className="font-bold text-slate-900 mt-1">
                          {selectedProject.access_level}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium">
                          Start Date
                        </p>
                        <p className="font-bold text-slate-900 mt-1">
                          {selectedProject.start_at
                            ? new Date(
                                selectedProject.start_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Description
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Full Description */}
                    {selectedProject.full_description && (
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                          Full Description
                        </h3>
                        <div className="text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          {selectedProject.full_description}
                        </div>
                      </div>
                    )}

                    {/* Technologies */}
                    {selectedProject.technologies &&
                      selectedProject.technologies.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3">
                            Technologies
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-blue-200"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Challenges */}
                    {selectedProject.challenges &&
                      selectedProject.challenges.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3">
                            Challenges
                          </h3>
                          <ul className="space-y-2">
                            {selectedProject.challenges.map(
                              (challenge, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-3 text-slate-600"
                                >
                                  <span className="text-orange-500 mt-1">
                                    •
                                  </span>
                                  <span>{challenge}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Achievements */}
                    {selectedProject.achievements &&
                      selectedProject.achievements.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3">
                            Achievements
                          </h3>
                          <ul className="space-y-2">
                            {selectedProject.achievements.map(
                              (achievement, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-3 text-slate-600"
                                >
                                  <span className="text-green-500 mt-1">✓</span>
                                  <span>{achievement}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Future Work */}
                    {selectedProject.future_work &&
                      selectedProject.future_work.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3">
                            Future Work
                          </h3>
                          <ul className="space-y-2">
                            {selectedProject.future_work.map((work, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-3 text-slate-600"
                              >
                                <span className="text-purple-500 mt-1">→</span>
                                <span>{work}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Tags */}
                    {selectedProject.tags &&
                      selectedProject.tags.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3">
                            Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-slate-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Demo URLs */}
                    {selectedProject.demo_url &&
                      Array.isArray(selectedProject.demo_url) &&
                      selectedProject.demo_url.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
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
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Demo URLs ({selectedProject.demo_url.length})
                          </h3>
                          <div className="space-y-2">
                            {selectedProject.demo_url.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border border-indigo-200 rounded-xl transition-all duration-200 group"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                  {index + 1}
                                </div>
                                <span className="flex-1 text-indigo-700 font-medium text-sm truncate">
                                  {url}
                                </span>
                                <svg
                                  className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Categories */}
                    {selectedProject.categories &&
                      selectedProject.categories.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
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
                            Categories ({selectedProject.categories.length})
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.categories.map(
                              (category, index) => (
                                <span
                                  key={index}
                                  className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                                >
                                  {typeof category === "string"
                                    ? category
                                    : category.name}
                                </span>
                              )
                            )}
                          </div>
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
                            {selectedProject.id}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Creator Name
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedProject.creator_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Created At
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedProject.created_at
                              ? new Date(
                                  selectedProject.created_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Updated At
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 shadow-sm">
                            {selectedProject.updated_at
                              ? new Date(
                                  selectedProject.updated_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Created By (ID)
                          </label>
                          <p className="p-3 bg-white rounded-xl text-gray-900 font-mono text-xs shadow-sm">
                            {selectedProject.created_by || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Category Assignment Modal */}
        {showCategoryModal && selectedProject && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full animate-slideUp overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Assign Categories
                </h2>
                <p className="text-amber-50 mt-1 text-xs sm:text-sm">
                  Select categories for "{selectedProject.title}"
                </p>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border-2 border-transparent hover:border-amber-200"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={selectedProject.categories?.includes(
                          category.name
                        )}
                        className="mr-3 h-5 w-5 text-amber-600 focus:ring-amber-500 border-slate-300 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-bold text-slate-900">
                          {category.name}
                        </span>
                        {category.description && (
                          <span className="ml-2 text-xs text-slate-500">
                            - {category.description}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all duration-200 font-medium border-2 border-slate-200 hover:border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const selectedCategories = Array.from(
                        document.querySelectorAll(
                          'input[type="checkbox"]:checked'
                        )
                      )
                        .map((_, index) =>
                          categories.filter(
                            (_, i) =>
                              document.querySelectorAll(
                                'input[type="checkbox"]'
                              )[i].checked
                          )
                        )
                        .flat()
                        .map((cat) => cat.id);

                      handleAssignCategories(selectedCategories);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105 flex items-center justify-center gap-2"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Assign Categories
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
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
                  Delete Project?
                </h3>

                <p className="text-gray-600 text-center mb-2">
                  Are you sure you want to delete
                </p>
                <p className="text-gray-900 font-semibold text-center mb-6">
                  "{projectToDelete?.title}"?
                </p>
                <p className="text-red-600 text-sm text-center mb-8">
                  This action cannot be undone.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProjectToDelete(null);
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
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contributor Assignment Modal */}
        {showContributorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Assign Contributors to {selectedProject?.title}
                </h3>

                {/* Current Contributors */}
                {projectContributors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Currently Assigned ({projectContributors.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
                      {projectContributors.map((contributor) => (
                        <div
                          key={`current-${contributor.id}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-medium text-gray-900">
                            {contributor.name}
                          </span>
                          <span className="text-gray-600">
                            {contributor.role_in_project || 'No role specified'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Contributors */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Select Contributors
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {contributors.map((contributor) => {
                      const isSelected = selectedContributorIds.includes(contributor.id);
                      
                      return (
                        <div
                          key={`available-${contributor.id}`}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContributorIds([...selectedContributorIds, contributor.id]);
                              } else {
                                setSelectedContributorIds(
                                  selectedContributorIds.filter((id) => id !== contributor.id)
                                );
                                const newRoles = { ...contributorRoles };
                                delete newRoles[contributor.id];
                                setContributorRoles(newRoles);
                              }
                            }}
                            className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {contributor.profile_image && (
                                <img
                                  src={contributor.profile_image}
                                  alt={contributor.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {contributor.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {contributor.email}
                                </p>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Role in Project (optional)
                                </label>
                                <input
                                  type="text"
                                  value={contributorRoles[contributor.id] || ''}
                                  onChange={(e) => {
                                    setContributorRoles({
                                      ...contributorRoles,
                                      [contributor.id]: e.target.value
                                    });
                                  }}
                                  placeholder="e.g., Lead Developer, Data Analyst"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowContributorModal(false);
                      setSelectedContributorIds([]);
                      setContributorRoles({});
                      setProjectContributors([]);
                    }}
                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignContributors}
                    disabled={selectedContributorIds.length === 0}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Assign Contributors ({selectedContributorIds.length})
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
    </div>
  );
}
