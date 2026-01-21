"use client";
import { useEffect, useState } from "react";
import CitationExportModal from "./CitationExportModal";

const PublicationModal = ({ paper, isOpen, onClose }) => {
  const [showCitationModal, setShowCitationModal] = useState(false);
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

  if (!isOpen || !paper) return null;

  return (
    <>
      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-5 rounded-t-2xl flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 text-xs font-semibold bg-white bg-opacity-20 rounded-full">
                  {paper.category || "Research"}
                </span>
                <span className="text-sm opacity-90">
                  {paper.year || "N/A"}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight">
                {paper.title || "Untitled Publication"}
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

          {/* Content - Scrollable */}
          <div className="p-6 space-y-6 overflow-y-auto hide-scrollbar flex-1">
            {/* Abstract */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Abstract</h3>
              <p className="text-gray-700 leading-relaxed">
                {paper.abstract || "No abstract available"}
              </p>
            </div>

            {/* Authors */}
            {paper.authors && paper.authors.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Authors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paper.authors.map((author, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg"
                    >
                      {author}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Publication Details */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              {/* Venue */}
              {paper.venue && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">
                    Published in
                  </div>
                  <div className="text-gray-900">{paper.venue}</div>
                </div>
              )}

              {/* Citations */}
              {paper.citations !== undefined && paper.citations !== null && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">
                    Citations
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-amber-600">
                      {paper.citations}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* DOI */}
              {paper.doi && (
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-gray-500 mb-1">
                    DOI
                  </div>
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-sm break-all"
                  >
                    {paper.doi}
                  </a>
                </div>
              )}

              {/* Status */}
              {paper.status && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">
                    Status
                  </div>
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    {paper.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Sticky Bottom */}
          <div className="flex flex-wrap gap-3 p-6 pt-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <a
              href={`/publications/${paper.uuid || paper.id}`}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:shadow-lg"
            >
              Read Full Paper
            </a>
            {paper.doi && paper.doi !== "N/A" && (
              <button
                onClick={() => setShowCitationModal(true)}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
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
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
                Cite
              </button>
            )}
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:shadow-lg"
              >
                Open DOI Link
              </a>
            )}
          </div>
        </div>

        {/* Citation Export Modal */}
        <CitationExportModal
          publication={paper}
          isOpen={showCitationModal}
          onClose={() => setShowCitationModal(false)}
        />
      </div>
    </>
  );
};

export default PublicationModal;
