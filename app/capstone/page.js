"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CapstonePage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 9;

  // Parse CSV data
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch("/list_capstone.csv");
        const csvText = await response.text();

        // Parse CSV manually
        const lines = csvText.split("\n");
        const headers = lines[0].split(",");

        const parsedData = [];
        let currentRow = [];
        let currentField = "";
        let insideQuotes = false;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === "," && !insideQuotes) {
              currentRow.push(currentField.trim());
              currentField = "";
            } else {
              currentField += char;
            }
          }

          // Check if row is complete (has all fields)
          if (!insideQuotes && currentRow.length === headers.length - 1) {
            currentRow.push(currentField.trim());

            // Create project object
            const project = {
              no: currentRow[0],
              judul: currentRow[1],
              deskripsi: currentRow[2],
              nama: currentRow[3],
              proposal: currentRow[4],
              laporan: currentRow[5],
              apk: currentRow[6],
              source_code: currentRow[7],
              poster: currentRow[8],
              tanggal: currentRow[9] || "",
            };

            parsedData.push(project);
            currentRow = [];
            currentField = "";
          } else if (!insideQuotes) {
            currentField += "\n";
          }
        }

        setProjects(parsedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading CSV:", error);
        setLoading(false);
      }
    };

    loadCSVData();
  }, []);

  // Filter projects based on search
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.judul?.toLowerCase().includes(query) ||
      project.nama?.toLowerCase().includes(query) ||
      project.deskripsi?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDownload = (url, fileName) => {
    if (!url || url === "") return;
    window.open(url, "_blank");
  };

  const openModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    document.body.style.overflow = "unset";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 text-white overflow-hidden">
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

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="text-sm font-semibold text-amber-200">
                Student Innovation Portfolio
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                Capstone Projects
              </span>
            </h1>
            <p className="text-xl text-amber-100 mb-8 leading-relaxed">
              Discover innovative solutions and groundbreaking applications
              developed by our talented students
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span>{projects.length} Projects</span>
              </div>
              <div className="w-1 h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>Mobile & Web Development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Search and Stats */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects by title, team members, or description..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-lg"
              />
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-3 text-center text-gray-600">
                Found{" "}
                <span className="font-semibold text-amber-600">
                  {filteredProjects.length}
                </span>{" "}
                projects
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && currentProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentProjects.map((project, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredProject(index)}
                onMouseLeave={() => setHoveredProject(null)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
              >
                {/* Project Header */}
                <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                        #{project.no}
                      </span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full bg-white/60 ${hoveredProject === index ? "animate-pulse" : ""}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold leading-tight line-clamp-2 min-h-[3.5rem]">
                      {project.judul}
                    </h3>
                  </div>
                </div>

                {/* Project Body */}
                <div className="p-6">
                  {/* Team Members */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">
                        Team Members
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.nama}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {project.deskripsi}
                    </p>
                  </div>

                  {/* Detail Button */}
                  <div className="mb-4">
                    <button
                      onClick={() => openModal(project)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      View Details
                    </button>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Resources
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {project.proposal && (
                        <button
                          onClick={() =>
                            handleDownload(project.proposal, "Proposal")
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-medium transition-all duration-300 group/btn"
                        >
                          <svg
                            className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
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
                          Proposal
                        </button>
                      )}
                      {project.laporan && (
                        <button
                          onClick={() =>
                            handleDownload(project.laporan, "Laporan")
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-medium transition-all duration-300 group/btn"
                        >
                          <svg
                            className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
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
                          Report
                        </button>
                      )}
                      {project.apk && (
                        <button
                          onClick={() => handleDownload(project.apk, "APK")}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-medium transition-all duration-300 group/btn"
                        >
                          <svg
                            className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          APK
                        </button>
                      )}
                      {project.source_code && (
                        <button
                          onClick={() =>
                            handleDownload(project.source_code, "Source Code")
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-all duration-300 group/btn"
                        >
                          <svg
                            className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
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
                          Code
                        </button>
                      )}
                      {project.poster && (
                        <button
                          onClick={() =>
                            handleDownload(project.poster, "Poster")
                          }
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-medium transition-all duration-300 group/btn col-span-2"
                        >
                          <svg
                            className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
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
                          Poster
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
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
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any projects matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredProjects.length > itemsPerPage && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                        : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 text-white px-8 py-6 rounded-t-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
                      Project #{selectedProject.no}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                      {selectedProject.judul}
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
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

              {/* Modal Body */}
              <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                {/* Team Members */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Team Members
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedProject.nama}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-orange-600"
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
                    <h3 className="text-lg font-bold text-gray-900">
                      Project Description
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedProject.deskripsi}
                    </p>
                  </div>
                </div>

                {/* Download Resources */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Download Resources
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.proposal && (
                      <button
                        onClick={() =>
                          handleDownload(selectedProject.proposal, "Proposal")
                        }
                        className="flex items-center gap-3 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-medium transition-all duration-300 group/btn border border-amber-200"
                      >
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span>Download Proposal</span>
                      </button>
                    )}
                    {selectedProject.laporan && (
                      <button
                        onClick={() =>
                          handleDownload(selectedProject.laporan, "Laporan")
                        }
                        className="flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-all duration-300 group/btn border border-green-200"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span>Download Report</span>
                      </button>
                    )}
                    {selectedProject.apk && (
                      <button
                        onClick={() =>
                          handleDownload(selectedProject.apk, "APK")
                        }
                        className="flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-medium transition-all duration-300 group/btn border border-orange-200"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span>Download APK</span>
                      </button>
                    )}
                    {selectedProject.source_code && (
                      <button
                        onClick={() =>
                          handleDownload(
                            selectedProject.source_code,
                            "Source Code",
                          )
                        }
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-300 group/btn border border-gray-200"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-gray-600"
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
                        </div>
                        <span>Download Source Code</span>
                      </button>
                    )}
                    {selectedProject.poster && (
                      <button
                        onClick={() =>
                          handleDownload(selectedProject.poster, "Poster")
                        }
                        className="flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-medium transition-all duration-300 group/btn border border-orange-200 sm:col-span-2"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                          <svg
                            className="w-5 h-5 text-orange-600"
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
                        <span>Download Poster</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
