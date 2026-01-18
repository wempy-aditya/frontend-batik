"use client";
import { useState, useEffect, useCallback } from "react";
import {
  fetchCitation,
  fetchMultipleCitations,
  generateFallbackCitation,
  isValidDOI,
  formatDOIUrl,
  CITATION_STYLES,
  CITATION_LOCALES,
} from "@/lib/citationUtils";

const CitationExportModal = ({ publication, isOpen, onClose }) => {
  const [selectedStyle, setSelectedStyle] = useState("apa");
  const [selectedLocale, setSelectedLocale] = useState("en-US");
  const [citations, setCitations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [useApiCitation, setUseApiCitation] = useState(true);

  const availableStyles = ["apa", "mla", "chicago", "ieee", "bibtex"];

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Fetch citations when modal opens or locale changes
  const fetchAllCitations = useCallback(async () => {
    if (!publication?.doi || !isValidDOI(publication.doi)) {
      // Use fallback citations if DOI is invalid
      setUseApiCitation(false);
      const fallbackCitations = {};
      availableStyles.forEach((style) => {
        fallbackCitations[style] = generateFallbackCitation(publication, style);
      });
      setCitations(fallbackCitations);
      if (publication?.doi && publication.doi !== "N/A") {
        setError(
          `Invalid DOI format (${publication.doi}). Using generated citations based on available metadata.`
        );
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { citations: fetchedCitations, errors } =
        await fetchMultipleCitations(
          publication.doi,
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
              publication,
              style
            );
            failedStyles.push(style.toUpperCase());
          }
        });

        setCitations(mergedCitations);
        setUseApiCitation(true);

        if (failedStyles.length > 0) {
          setError(
            `Some citation styles could not be fetched from DOI (${failedStyles.join(
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
            publication,
            style
          );
        });
        setCitations(fallbackCitations);
        setError(
          `Could not fetch citations from DOI service for "${publication.doi}". The DOI may not be registered or the service is unavailable. Using generated citations based on available metadata.`
        );
      }
    } catch (err) {
      console.error("Error fetching citations:", err);
      setUseApiCitation(false);
      const fallbackCitations = {};
      availableStyles.forEach((style) => {
        fallbackCitations[style] = generateFallbackCitation(publication, style);
      });
      setCitations(fallbackCitations);
      setError(
        `Network error while fetching citations: ${err.message}. Using generated citations based on available metadata.`
      );
    } finally {
      setLoading(false);
    }
  }, [publication, selectedLocale]);

  useEffect(() => {
    if (isOpen && publication) {
      fetchAllCitations();
    }
  }, [isOpen, publication, fetchAllCitations]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    const citation = citations[selectedStyle];
    if (citation) {
      try {
        await navigator.clipboard.writeText(citation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // Handle download as text file
  const handleDownload = () => {
    const citation = citations[selectedStyle];
    if (citation) {
      const blob = new Blob([citation], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `citation-${selectedStyle}.${
        selectedStyle === "bibtex" ? "bib" : "txt"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen || !publication) return null;

  return (
    <>
      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-5 rounded-t-2xl flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
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
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
                <span className="text-lg font-semibold">Export Citation</span>
              </div>
              <h2 className="text-sm font-medium leading-tight opacity-90 line-clamp-2">
                {publication.title || "Untitled Publication"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
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

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto hide-scrollbar flex-1">
            {/* DOI Info */}
            {publication.doi && publication.doi !== "N/A" && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
                    href={formatDOIUrl(publication.doi)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:underline"
                  >
                    {publication.doi}
                  </a>
                </span>
                {useApiCitation && (
                  <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    ✓ Official Citation
                  </span>
                )}
              </div>
            )}

            {/* Error/Info Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
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
                <span className="text-sm text-amber-700">{error}</span>
              </div>
            )}

            {/* Citation Style Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Citation Style
              </label>
              <div className="flex flex-wrap gap-2">
                {availableStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedStyle === style
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {style.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Language / Locale
              </label>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all duration-200"
              >
                {Object.entries(CITATION_LOCALES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Citation Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Citation Preview
                </label>
                {loading && (
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
              <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[120px]">
                {loading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-pulse text-gray-400">
                      Loading citation...
                    </div>
                  </div>
                ) : (
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {citations[selectedStyle] || "No citation available"}
                  </pre>
                )}
              </div>
            </div>

            {/* Style Description */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <strong className="text-gray-700">
                {CITATION_STYLES[selectedStyle]?.name ||
                  selectedStyle.toUpperCase()}
                :
              </strong>{" "}
              {CITATION_STYLES[selectedStyle]?.description || "Citation format"}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <button
              onClick={handleCopy}
              disabled={loading || !citations[selectedStyle]}
              className={`flex-1 py-3 px-4 font-semibold rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg"
              } ${
                loading || !citations[selectedStyle]
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
              onClick={handleDownload}
              disabled={loading || !citations[selectedStyle]}
              className={`flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                loading || !citations[selectedStyle]
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
              Download {selectedStyle === "bibtex" ? ".bib" : ".txt"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CitationExportModal;
