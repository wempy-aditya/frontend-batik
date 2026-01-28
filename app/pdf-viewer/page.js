"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";

function PDFViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);

  // Default PDF configuration
  const DEFAULT_PDF_ID = "1nAU-FZKtgaSj6xKKkEr2X9njkWwWwqhK"; // Ganti dengan File ID Google Drive Anda
  const DEFAULT_PAGE = 10;

  const [fileId, setFileId] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [gotoPage, setGotoPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  // Get proxy URL
  const getProxyUrl = (id) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/api/proxy-pdf?id=${encodeURIComponent(id)}`;
  };

  // Load initial params from URL
  useEffect(() => {
    const id = searchParams.get("id") || DEFAULT_PDF_ID;
    const page = parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10);
    
    setFileId(id);
    setPageNum(page);
    setGotoPage(page);

    if (id && pdfLoaded) {
      loadPDF(id, page);
    }
  }, [searchParams, pdfLoaded]);

  // Update URL params
  const updateURL = (id, page) => {
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    params.set("page", String(page || 1));
    router.push(`/pdf-viewer?${params.toString()}`, { scroll: false });
  };

  // Load PDF
  const loadPDF = async (id, initialPage = 1) => {
    if (!id) {
      setError("File ID kosong. Tambahkan ?id=... pada URL atau isi input File ID.");
      return;
    }

    setError("");
    setIsLoading(true);
    setStatus("Loading PDF...");

    try {
      const url = getProxyUrl(id);
      console.log('🔍 PDF Viewer Debug:', {
        fileId: id,
        proxyUrl: url,
        initialPage,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });

      // Test proxy API terlebih dahulu
      setStatus("Checking proxy API...");
      const testResponse = await fetch(url, { method: 'HEAD' }).catch(e => {
        console.error('❌ Proxy API test failed:', e);
        return null;
      });

      if (testResponse) {
        console.log('✅ Proxy API response:', {
          status: testResponse.status,
          statusText: testResponse.statusText,
          contentType: testResponse.headers.get('content-type'),
          contentLength: testResponse.headers.get('content-length')
        });
      }

      setStatus("Loading PDF document...");
      const loadingTask = window.pdfjsLib.getDocument({
        url,
        withCredentials: false,
        disableRange: false,
        disableStream: false,
      });

      // Progress tracking
      loadingTask.onProgress = (progress) => {
        const percent = progress.total > 0 
          ? Math.round((progress.loaded / progress.total) * 100) 
          : 0;
        setStatus(`Loading PDF... ${percent}%`);
        console.log('📥 Download progress:', {
          loaded: progress.loaded,
          total: progress.total,
          percent: percent + '%'
        });
      };

      const pdf = await loadingTask.promise;
      console.log('✅ PDF loaded successfully:', {
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint
      });

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setStatus(`Loaded. Total pages: ${pdf.numPages}`);

      const startPage = Math.min(Math.max(1, initialPage), pdf.numPages);
      await renderPage(pdf, startPage);
    } catch (err) {
      console.error("❌ PDF Load Error:", {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        fileId: id,
        proxyUrl: getProxyUrl(id)
      });

      // Coba fetch manual untuk debug lebih detail
      try {
        const debugResponse = await fetch(getProxyUrl(id));
        const debugText = await debugResponse.text();
        console.error('🔍 Debug Response:', {
          status: debugResponse.status,
          statusText: debugResponse.statusText,
          headers: Object.fromEntries(debugResponse.headers.entries()),
          bodyPreview: debugText.substring(0, 500)
        });
      } catch (debugErr) {
        console.error('🔍 Debug fetch also failed:', debugErr);
      }

      setPdfDoc(null);
      setTotalPages(0);
      setStatus("");
      setError(
        `Gagal memuat PDF.\n\n` +
        `Cek:\n` +
        `1) File ID valid dari Google Drive\n` +
        `2) File bisa diakses publik (Anyone with link)\n` +
        `3) Proxy API berfungsi\n` +
        `4) Browser console untuk detail error\n\n` +
        `Error Type: ${err?.name || 'Unknown'}\n` +
        `Detail: ${err?.message || String(err)}\n\n` +
        `Proxy URL: ${getProxyUrl(id)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render specific page
  const renderPage = async (pdf, pageNumber) => {
    if (!pdf || !canvasRef.current) return;

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    setStatus(`Rendering page ${pageNumber}...`);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    setPageNum(pageNumber);
    setGotoPage(pageNumber);
    setStatus(`Page ${pageNumber} / ${totalPages}`);
    updateURL(fileId, pageNumber);
  };

  // Navigation handlers
  const handlePrev = () => {
    if (!pdfDoc || pageNum <= 1) return;
    renderPage(pdfDoc, pageNum - 1);
  };

  const handleNext = () => {
    if (!pdfDoc || pageNum >= totalPages) return;
    renderPage(pdfDoc, pageNum + 1);
  };

  const handleGoto = () => {
    if (!pdfDoc) return;
    const target = Math.min(Math.max(1, gotoPage), totalPages);
    renderPage(pdfDoc, target);
  };

  const handleZoomIn = () => {
    if (!pdfDoc) return;
    const newScale = Math.min(scale + 0.1, 3.0);
    setScale(newScale);
    renderPage(pdfDoc, pageNum);
  };

  const handleZoomOut = () => {
    if (!pdfDoc) return;
    const newScale = Math.max(scale - 0.1, 0.4);
    setScale(newScale);
    renderPage(pdfDoc, pageNum);
  };

  const handleLoad = () => {
    loadPDF(fileId, pageNum);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-30 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
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
          <div className="flex items-center text-sm text-amber-200 mb-8">
            <button
              onClick={() => (window.location.href = "/")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <svg
              className="w-4 h-4 mx-2"
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
            <span className="text-white">PDF Viewer</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
              <svg
                className="w-4 h-4 text-amber-400"
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
              <span className="text-sm font-semibold text-gray-200">
                Document Viewer
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                PDF Viewer
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              View and navigate PDF documents from Google Drive with ease. Powered by PDF.js technology.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-amber-100">
          <div className="flex flex-col gap-6">
            {/* File ID & Load */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Drive File ID
                </label>
                <input
                  type="text"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  placeholder="contoh: 1xx40VL8dIvWbdMMO5SCDpOcBOzMacveV"
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                />
              </div>
              <div className="sm:w-32">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Halaman
                </label>
                <input
                  type="number"
                  min="1"
                  value={pageNum}
                  onChange={(e) => setPageNum(parseInt(e.target.value) || 1)}
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleLoad}
                  disabled={isLoading || !fileId}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : "Load PDF"}
                </button>
              </div>
            </div>

            {/* Navigation & Controls */}
            {pdfDoc && (
              <div className="flex flex-wrap gap-4 items-center justify-between border-t-2 border-amber-100 pt-6">
                <div className="flex gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={pageNum <= 1}
                    className="px-5 py-2.5 border-2 border-amber-300 rounded-xl hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-amber-900 transition-all hover:shadow-md"
                  >
                    ◀ Prev
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={pageNum >= totalPages}
                    className="px-5 py-2.5 border-2 border-amber-300 rounded-xl hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-amber-900 transition-all hover:shadow-md"
                  >
                    Next ▶
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Page</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={gotoPage}
                    onChange={(e) => setGotoPage(parseInt(e.target.value) || 1)}
                    onKeyDown={(e) => e.key === "Enter" && handleGoto()}
                    className="w-20 border-2 border-amber-200 rounded-lg px-3 py-1.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                  />
                  <span className="text-sm font-medium text-gray-600">/ {totalPages}</span>
                  <button
                    onClick={handleGoto}
                    className="px-4 py-1.5 bg-amber-100 border-2 border-amber-300 rounded-lg hover:bg-amber-200 text-sm font-semibold text-amber-900 transition-all"
                  >
                    Go
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 flex items-center justify-center border-2 border-amber-300 rounded-lg hover:bg-amber-50 font-bold text-xl text-amber-900 transition-all hover:shadow-md"
                  >
                    −
                  </button>
                  <span className="text-sm text-gray-700 w-16 text-center font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 flex items-center justify-center border-2 border-amber-300 rounded-lg hover:bg-amber-50 font-bold text-xl text-amber-900 transition-all hover:shadow-md"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Status */}
            {status && (
              <div className="text-sm text-amber-900 bg-amber-50 rounded-xl px-5 py-3 border border-amber-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {status}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-sm bg-red-50 border-2 border-red-300 text-red-800 rounded-xl p-5 whitespace-pre-wrap">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-amber-100">
          <div className="overflow-auto">
            <canvas
              ref={canvasRef}
              className="mx-auto border border-gray-200 rounded-lg"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Powered by PDF.js • Next.js API Proxy</p>
          </div>
          {fileId && (
            <p className="text-xs">
              Source: <code className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg break-all">
                {getProxyUrl(fileId)}
              </code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PDFViewerWrapper() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={() => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            setScriptLoaded(true);
          }
        }}
        strategy="afterInteractive"
      />
      {scriptLoaded ? <PDFViewerContent /> : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading PDF.js...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PDFViewerWrapper />
    </Suspense>
  );
}
