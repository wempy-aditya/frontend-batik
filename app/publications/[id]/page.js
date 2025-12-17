"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publicationId = params.id;
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("abstract");
  const [selectedCitation, setSelectedCitation] = useState("bibtex");

  // Fetch publication detail from API
  useEffect(() => {
    const fetchPublication = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/publications/public/${publicationId}`);
        if (response.ok) {
          const data = await response.json();
          setPublication(data);
        } else {
          setPublication(null);
        }
      } catch (error) {
        console.error('Error fetching publication:', error);
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    if (publicationId) {
      fetchPublication();
    }
  }, [publicationId]);

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

  // Citation formats for the publication
  const citationFormats = {
    bibtex: `@article{${displayPublication?.authors?.[0]?.split(" ")?.pop()?.toLowerCase() || 'author'}${
      displayPublication?.year || '2024'
    }${displayPublication?.title?.split(" ")?.[0]?.toLowerCase() || 'title'},
  title={${displayPublication?.title || 'Title'}},
  author={${displayPublication?.authors?.join(" and ") || 'Author'}},
  journal={${displayPublication?.journal_name || displayPublication?.venue || 'Venue'}},
  year={${displayPublication?.year || '2024'}},
  doi={${displayPublication?.doi || 'DOI'}}
}`,
    apa: `${displayPublication?.authors?.join(", ") || 'Authors'} (${displayPublication?.year || '2024'}). ${
      displayPublication?.title || 'Title'
    }. ${displayPublication?.journal_name || displayPublication?.venue || 'Venue'}. https://doi.org/${displayPublication?.doi || 'DOI'}`,
    mla: `${displayPublication?.authors?.join(", ") || 'Authors'}. "${displayPublication?.title || 'Title'}." ${
      displayPublication?.journal_name || displayPublication?.venue || 'Venue'
    }, ${displayPublication?.year || '2024'}. doi:${displayPublication?.doi || 'DOI'}`,
    chicago: `${displayPublication?.authors?.join(", ") || 'Authors'}. "${displayPublication?.title || 'Title'}." ${
      displayPublication?.journal_name || displayPublication?.venue || 'Venue'
    } (${displayPublication?.year || '2024'}). https://doi.org/${displayPublication?.doi || 'DOI'}`,
    ieee: `${displayPublication?.authors?.map((author, index) => {
      const parts = author.trim().split(' ');
      const lastName = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map(n => n.charAt(0) + '.').join(' ');
      return `${initials} ${lastName}`;
    }).join(', ') || 'Authors'}, "${displayPublication?.title || 'Title'}," ${displayPublication?.journal_name || displayPublication?.venue || 'Venue'}, vol. ${displayPublication?.volume || 'X'}, no. ${displayPublication?.issue || 'X'}, pp. ${displayPublication?.pages || 'X-X'}, ${displayPublication?.year || '2024'}, doi: ${displayPublication?.doi || 'DOI'}.`,
  };

  // Helper function for impact color
  const getImpactColor = (impact) => {
    const impactValue = parseFloat(impact);
    if (impactValue >= 5.0) return 'bg-red-100 text-red-800 border-red-300';
    if (impactValue >= 3.0) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
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
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Publication Not Found</h2>
          <p className="text-gray-500 mb-8">The publication you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/publications')}
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
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getImpactColor(displayPublication?.impact || "0")}`}>
                    Impact: {displayPublication?.impact || "N/A"}
                  </span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-white/10 text-white border border-white/20">
                    {displayPublication?.citations || 0} Citations
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
                    {(displayPublication?.authors || []).map((author, index) => (
                      <span
                        key={index}
                        className="text-sm text-amber-100 bg-white/10 px-4 py-2 rounded-full border border-white/20"
                      >
                        {author}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publication Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div>
                    <div className="text-sm text-amber-200 mb-1">
                      Published In
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {displayPublication?.journal_name || displayPublication?.venue}
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

                  {/* Keywords */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(displayPublication?.keywords || []).map((keyword, index) => (
                        <span
                          key={index}
                          className="text-sm text-amber-700 bg-amber-100 px-4 py-2 rounded-full border border-amber-200"
                        >
                          {keyword}
                        </span>
                      ))}
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

                  {displayPublication?.methodology && displayPublication.methodology !== "N/A" && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Methodology
                      </h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {displayPublication.methodology}
                      </p>
                    </div>
                  )}

                  {displayPublication?.results && displayPublication.results !== "N/A" && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Results
                      </h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {displayPublication.results}
                      </p>
                    </div>
                  )}

                  {displayPublication?.conclusions && displayPublication.conclusions !== "N/A" && (
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
                    {displayPublication?.volume && displayPublication.volume !== "N/A" && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          Volume/Issue
                        </div>
                        <div className="text-sm text-gray-600">
                          Vol. {displayPublication.volume}, Issue {displayPublication.issue}
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Cite This Publication
                  </h2>

                  <div className="space-y-6">
                    {/* Citation Format Selector */}
                    <div className="flex flex-wrap gap-3">
                      {["bibtex", "apa", "mla", "chicago", "ieee"].map((format) => (
                        <button
                          key={format}
                          onClick={() => setSelectedCitation(format)}
                          className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                            selectedCitation === format
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Citation Text */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {citationFormats[selectedCitation]}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            citationFormats[selectedCitation]
                          );
                          alert("Citation copied to clipboard!");
                        }}
                        className="mt-4 px-6 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors duration-300"
                      >
                        Copy to Clipboard
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
