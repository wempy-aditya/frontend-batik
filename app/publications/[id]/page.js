"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchCitation,
  fetchMultipleCitations,
  generateFallbackCitation,
  isValidDOI,
  formatDOIUrl,
  CITATION_STYLES,
  CITATION_LOCALES,
} from "@/lib/citationUtils";

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publicationId = params.id;
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("abstract");
  const [selectedCitation, setSelectedCitation] = useState("apa");
  const [selectedLocale, setSelectedLocale] = useState("en-US");
  const [citations, setCitations] = useState({});
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [citationError, setCitationError] = useState(null);
  const [useApiCitation, setUseApiCitation] = useState(true);
  const [copied, setCopied] = useState(false);

  const availableStyles = ["apa", "mla", "chicago", "ieee", "bibtex"];

  // Fetch publication detail from API
  useEffect(() => {
    const fetchPublication = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/publications/public/${publicationId}`
        );
        if (response.ok) {
          const data = await response.json();
          setPublication(data);

          // Increment view count
          incrementViewCount();
        } else {
          setPublication(null);
        }
      } catch (error) {
        console.error("Error fetching publication:", error);
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    if (publicationId) {
      fetchPublication();
    }
  }, [publicationId]);

  // Increment view count
  const incrementViewCount = async () => {
    try {
      await fetch(`/api/publications/public/${publicationId}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  // Increment download count and open PDF
  const handleDownloadPDF = async () => {
    try {
      // Increment download counter
      await fetch(`/api/publications/public/${publicationId}/download`, {
        method: "POST",
      });

      // Open PDF in new tab
      if (displayPublication?.pdf_url) {
        window.open(displayPublication.pdf_url, "_blank");
      }
    } catch (error) {
      console.error("Error incrementing download count:", error);
      // Still open PDF even if counter fails
      if (displayPublication?.pdf_url) {
        window.open(displayPublication.pdf_url, "_blank");
      }
    }
  };

  // Default fallback publication
  const defaultPublication = {
    id: "default",
    title: "Publication Not Found",
    abstract: "The requested publication could not be found.",
    authors: ["N/A"],
    venue: "N/A",
    year: new Date().getFullYear(),
    citations: 0,
    doi: "N/A",
    keywords: [],
    status: "published",
    impact: "0",
    pages: "N/A",
    volume: "N/A",
    issue: "N/A",
    publisher: "N/A",
    journal_name: "N/A",
    pdf_url: null,
    graphical_abstract_url: null,
    methodology: "N/A",
    results: "N/A",
    conclusions: "N/A",
  };

  // Display logic: use API data if available, otherwise use fallback
  const displayPublication = publication || defaultPublication;

  // Fetch citations from DOI API
  const fetchAllCitations = useCallback(async () => {
    if (!displayPublication?.doi || !isValidDOI(displayPublication.doi)) {
      // Use fallback citations if DOI is invalid
      setUseApiCitation(false);
      const fallbackCitations = {};
      availableStyles.forEach((style) => {
        fallbackCitations[style] = generateFallbackCitation(
          displayPublication,
          style
        );
      });
      setCitations(fallbackCitations);
      if (displayPublication?.doi && displayPublication.doi !== "N/A") {
        setCitationError(
          `Invalid DOI format. Using generated citations based on available metadata.`
        );
      }
      return;
    }

    setCitationsLoading(true);
    setCitationError(null);

    try {
      const { citations: fetchedCitations, errors } =
        await fetchMultipleCitations(
          displayPublication.doi,
          availableStyles,
          selectedLocale
        );

      // Check if any citations were successfully fetched
      const hasValidCitations = Object.values(fetchedCitations).some(
        (c) => c !== null
      );

      if (hasValidCitations) {
        // Fill in any failed styles with fallbacks
        const mergedCitations = {};
        const failedStyles = [];

        availableStyles.forEach((style) => {
          if (fetchedCitations[style]) {
            mergedCitations[style] = fetchedCitations[style];
          } else {
            mergedCitations[style] = generateFallbackCitation(
              displayPublication,
              style
            );
            failedStyles.push(style.toUpperCase());
          }
        });

        setCitations(mergedCitations);
        setUseApiCitation(true);

        if (failedStyles.length > 0) {
          setCitationError(
            `Some citation styles could not be fetched (${failedStyles.join(
              ", "
            )}). Using generated citations for those styles.`
          );
        }
      } else {
        // All API calls failed, use fallbacks
        setUseApiCitation(false);
        const fallbackCitations = {};
        availableStyles.forEach((style) => {
          fallbackCitations[style] = generateFallbackCitation(
            displayPublication,
            style
          );
        });
        setCitations(fallbackCitations);
        setCitationError(
          "Could not fetch citations from DOI service. The DOI may not be registered or the service is unavailable. Using generated citations."
        );
      }
    } catch (err) {
      console.error("Error fetching citations:", err);
      setUseApiCitation(false);
      const fallbackCitations = {};
      availableStyles.forEach((style) => {
        fallbackCitations[style] = generateFallbackCitation(
          displayPublication,
          style
        );
      });
      setCitations(fallbackCitations);
      setCitationError(
        `Network error while fetching citations. Using generated citations based on available metadata.`
      );
    } finally {
      setCitationsLoading(false);
    }
  }, [displayPublication, selectedLocale, availableStyles]);

  // Fetch citations when publication is loaded or locale changes
  useEffect(() => {
    if (displayPublication && displayPublication.id !== "default") {
      fetchAllCitations();
    }
  }, [displayPublication?.id, selectedLocale]);

  // Handle copy citation to clipboard
  const handleCopyCitation = async () => {
    const citation = citations[selectedCitation];
    if (citation) {
      try {
        await navigator.clipboard.writeText(citation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        alert("Citation copied to clipboard!");
      }
    }
  };

  // Handle download citation
  const handleDownloadCitation = () => {
    const citation = citations[selectedCitation];
    if (citation) {
      const blob = new Blob([citation], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `citation-${selectedCitation}.${
        selectedCitation === "bibtex" ? "bib" : "txt"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Helper function for impact color
  const getImpactColor = (impact) => {
    const impactValue = parseFloat(impact);
    if (impactValue >= 5.0) return "bg-red-100 text-red-800 border-red-300";
    if (impactValue >= 3.0)
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading publication...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!loading && !displayPublication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Publication Not Found
          </h2>
          <p className="text-gray-500 mb-8">
            The publication you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/publications")}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors duration-300"
          >
            Back to Publications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3Cpath d='M10 0v20'/%3E%3Cpath d='M0 10h20'/%3E%3C/g%3E%3C/svg%3E")`,
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
          <div className="mb-8">
            <div className="flex items-center gap-2 text-amber-200">
              <div
                onClick={() => (window.location.href = "/")}
                className="hover:text-white transition-colors duration-300 cursor-pointer"
              >
                Home
              </div>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <div
                onClick={() => (window.location.href = "/publications")}
                className="hover:text-white transition-colors duration-300 cursor-pointer"
              >
                Publications
              </div>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-white truncate max-w-md">
                {displayPublication?.title?.length > 50
                  ? displayPublication.title.substring(0, 50) + "..."
                  : displayPublication?.title}
              </span>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Publication Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Publication Icon */}
              <div className="lg:w-1/4">
                <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <svg
                      className="w-20 h-20 text-white mb-4"
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
                    <div className="text-white text-4xl font-bold opacity-80">
                      {displayPublication?.year}
                    </div>
                  </div>
                </div>
              </div>

              {/* Publication Info */}
              <div className="lg:w-3/4">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span
                    className={`px-4 py-2 text-sm font-semibold rounded-full border ${getImpactColor(
                      displayPublication?.impact || "0"
                    )}`}
                  >
                    Impact: {displayPublication?.impact || "N/A"}
                  </span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                    {displayPublication?.citations || 0} Citations
                  </span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                    <svg
                      className="w-4 h-4 inline-block mr-1 -mt-0.5"
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
                    {displayPublication?.view_count || 0} Views
                  </span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                    <svg
                      className="w-4 h-4 inline-block mr-1 -mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {displayPublication?.download_count || 0} Downloads
                  </span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20 capitalize">
                    {displayPublication?.status || "published"}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                  {displayPublication?.title}
                </h1>

                {/* Authors */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {(displayPublication?.authors || []).map(
                      (author, index) => (
                        <span
                          key={index}
                          className="text-sm text-amber-100 bg-white/10 px-4 py-2 rounded-full border border-white/20"
                        >
                          {author}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Publication Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div>
                    <div className="text-sm text-amber-200 mb-1">
                      Published In
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {displayPublication?.journal_name ||
                        displayPublication?.venue}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-amber-200 mb-1">Year</div>
                    <div className="text-sm font-semibold text-white">
                      {displayPublication?.year}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-amber-200 mb-1">Pages</div>
                    <div className="text-sm font-semibold text-white">
                      {displayPublication?.pages}
                    </div>
                  </div>
                </div>

                {/* Download PDF Button */}
                {displayPublication?.pdf_url && (
                  <div className="mt-6">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("abstract")}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
                  activeTab === "abstract"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Abstract
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
                  activeTab === "content"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
                  activeTab === "details"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("citation")}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
                  activeTab === "citation"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Citation
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              {/* Abstract Tab */}
              {activeTab === "abstract" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      Abstract
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {displayPublication?.abstract}
                    </p>
                  </div>

                  {/* Graphical Abstract */}
                  {displayPublication?.graphical_abstract_url && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Graphical Abstract
                      </h3>
                      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <img
                          src={displayPublication.graphical_abstract_url}
                          alt="Graphical Abstract"
                          className="w-full h-auto object-contain max-h-[600px]"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div className="hidden w-full h-64 flex-col items-center justify-center bg-gray-100 text-gray-400">
                          <svg
                            className="w-16 h-16 mb-2"
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
                          <p>Image not available</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(displayPublication?.keywords || []).map(
                        (keyword, index) => (
                          <span
                            key={index}
                            className="text-sm text-amber-700 bg-amber-100 px-4 py-2 rounded-full border border-amber-200"
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      Paper Content
                    </h2>
                  </div>

                  {displayPublication?.methodology &&
                    displayPublication.methodology !== "N/A" && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Methodology
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          {displayPublication.methodology}
                        </p>
                      </div>
                    )}

                  {displayPublication?.results &&
                    displayPublication.results !== "N/A" && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Results
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          {displayPublication.results}
                        </p>
                      </div>
                    )}

                  {displayPublication?.conclusions &&
                    displayPublication.conclusions !== "N/A" && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Conclusions
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          {displayPublication.conclusions}
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* Details Tab */}
              {activeTab === "details" && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Publication Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        DOI
                      </div>
                      <div className="text-sm text-blue-600 font-mono break-all">
                        {displayPublication?.doi}
                      </div>
                    </div>
                    {displayPublication?.volume &&
                      displayPublication.volume !== "N/A" && (
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">
                            Volume/Issue
                          </div>
                          <div className="text-sm text-gray-600">
                            Vol. {displayPublication.volume}, Issue{" "}
                            {displayPublication.issue}
                          </div>
                        </div>
                      )}
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        Publisher
                      </div>
                      <div className="text-sm text-gray-600">
                        {displayPublication?.publisher}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        Status
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {displayPublication?.status}
                      </div>
                    </div>
                    {displayPublication?.pdf_url && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          PDF
                        </div>
                        <a
                          href={displayPublication.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Download PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Citation Tab */}
              {activeTab === "citation" && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Cite This Publication
                  </h2>

                  {/* DOI Status Badge */}
                  {displayPublication?.doi &&
                    displayPublication.doi !== "N/A" && (
                      <div className="mb-6 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <svg
                          className="w-5 h-5 text-blue-600 flex-shrink-0"
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
                        <span className="text-sm text-blue-700">
                          DOI:{" "}
                          <a
                            href={formatDOIUrl(displayPublication.doi)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono hover:underline"
                          >
                            {displayPublication.doi}
                          </a>
                        </span>
                        {useApiCitation && !citationsLoading && (
                          <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
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
                            Official Citation from DOI
                          </span>
                        )}
                      </div>
                    )}

                  {/* Error/Info Message */}
                  {citationError && (
                    <div className="mb-6 flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0"
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
                      <span className="text-sm text-amber-700">
                        {citationError}
                      </span>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Citation Format Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Citation Style
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {availableStyles.map((format) => (
                          <button
                            key={format}
                            onClick={() => setSelectedCitation(format)}
                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                              selectedCitation === format
                                ? "bg-amber-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {format.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language/Locale Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Language / Locale
                      </label>
                      <select
                        value={selectedLocale}
                        onChange={(e) => setSelectedLocale(e.target.value)}
                        className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all duration-200"
                      >
                        {Object.entries(CITATION_LOCALES).map(
                          ([code, name]) => (
                            <option key={code} value={code}>
                              {name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Citation Text */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-700">
                          Citation Preview
                        </label>
                        {citationsLoading && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg
                              className="w-4 h-4 animate-spin"
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
                            Fetching from DOI...
                          </span>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-[120px]">
                        {citationsLoading ? (
                          <div className="flex items-center justify-center h-20">
                            <div className="animate-pulse text-gray-400">
                              Loading citation...
                            </div>
                          </div>
                        ) : (
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                            {citations[selectedCitation] ||
                              "No citation available"}
                          </pre>
                        )}
                      </div>
                    </div>

                    {/* Style Description */}
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      <strong className="text-gray-700">
                        {CITATION_STYLES[selectedCitation]?.name ||
                          selectedCitation.toUpperCase()}
                        :
                      </strong>{" "}
                      {CITATION_STYLES[selectedCitation]?.description ||
                        "Citation format"}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleCopyCitation}
                        disabled={
                          citationsLoading || !citations[selectedCitation]
                        }
                        className={`flex-1 sm:flex-none px-6 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          copied
                            ? "bg-green-500 text-white"
                            : "bg-amber-500 text-white hover:bg-amber-600"
                        } ${
                          citationsLoading || !citations[selectedCitation]
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {copied ? (
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
                            Copied!
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
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDownloadCitation}
                        disabled={
                          citationsLoading || !citations[selectedCitation]
                        }
                        className={`flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          citationsLoading || !citations[selectedCitation]
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download{" "}
                        {selectedCitation === "bibtex" ? ".bib" : ".txt"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 rounded-3xl p-12 text-center max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Interested in This Research?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Collaborate with us or explore more publications in related areas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div
                onClick={() => (window.location.href = "/contact")}
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                Contact Authors
              </div>
              <div
                onClick={() => (window.location.href = "/publications")}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                View All Publications
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
