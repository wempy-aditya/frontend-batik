"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";

function PDFViewerContent({ pdfLoaded }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);

  // Default PDF configuration
  const DEFAULT_PDF_ID = "1nAU-FZKtgaSj6xKKkEr2X9njkWwWwqhK";
  const DEFAULT_PAGE = 10;

  // Force header to be visible (not transparent) on this page
  useEffect(() => {
    // Force header to be solid by adding inline styles
    const header = document.querySelector("header");
    if (header) {
      const originalBg = header.style.background;
      const originalBackdrop = header.style.backdropFilter;
      const originalShadow = header.style.boxShadow;

      // Force solid background
      header.style.background = "rgba(255, 255, 255, 0.98)";
      header.style.backdropFilter = "blur(12px)";
      header.style.boxShadow =
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";

      return () => {
        // Restore original styles when leaving page
        if (header) {
          header.style.background = originalBg;
          header.style.backdropFilter = originalBackdrop;
          header.style.boxShadow = originalShadow;
        }
      };
    }
  }, []);

  const [fileId, setFileId] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [gotoPage, setGotoPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [useHybridMode, setUseHybridMode] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [fullPdfReady, setFullPdfReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const renderTaskRef = useRef(null);
  const pageCache = useRef(new Map());
  const backgroundLoadRef = useRef(null);
  const maxRetries = 3;
  const LOCAL_PDF_PATH = "/document-spmi-umm.pdf";
  const LOCAL_PDF_DEFAULT_PAGE = 10;

  // Get proxy URL - Using local Next.js API route (faster!)
  const getProxyUrl = (id) => {
    // Option 1: Local Next.js proxy (recommended - same server, lebih cepat)
    return `/api/proxy-pdf?id=${encodeURIComponent(id)}`;

    // Option 2: Cloudflare Workers (backup jika local proxy gagal)
    // return `https://bitter-darkness-fab2.wahyukusuma.workers.dev/pdf?id=${encodeURIComponent(id)}`;
  };

  // Load initial params from URL dan auto-load PDF
  useEffect(() => {
    const id = searchParams.get("id") || DEFAULT_PDF_ID;
    const page = parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10);

    setFileId(id);
    setPageNum(page);
    setGotoPage(page);

    // Auto-load PDF saat pertama kali dan PDF.js sudah ready
    if (pdfLoaded && id && !hasAutoLoaded) {
      console.log("🚀 Auto-loading PDF on mount:", id);
      setHasAutoLoaded(true);
      loadPDFWithRetry(id, page);
    }
  }, [searchParams, pdfLoaded]);

  // Update URL params
  const updateURL = (id, page) => {
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    params.set("page", String(page || 1));
    router.push(`/pdf-viewer?${params.toString()}`, { scroll: false });
  };

  // Load PDF with auto-retry mechanism
  const loadPDFWithRetry = async (id, initialPage = 1, currentRetry = 0) => {
    try {
      setShowRetryPrompt(false);
      setUsingLocalFallback(false);
      await loadPDF(id, initialPage);
    } catch (err) {
      console.error(`❌ Load attempt ${currentRetry + 1} failed:`, err);

      if (currentRetry < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, currentRetry), 5000); // 1s, 2s, 4s max
        console.log(
          `🔄 Retrying in ${delay}ms... (Attempt ${currentRetry + 2}/${maxRetries + 1})`,
        );
        setStatus(
          `Loading failed. Retrying in ${delay / 1000}s... (${currentRetry + 2}/${maxRetries + 1})`,
        );
        setRetryCount(currentRetry + 1);

        setTimeout(() => {
          loadPDFWithRetry(id, initialPage, currentRetry + 1);
        }, delay);
      } else {
        // Semua retry gagal - Load dari local PDF sebagai fallback
        console.warn(
          "❌ All proxy attempts failed. Loading local fallback PDF...",
        );
        setStatus("Loading local document...");
        setRetryCount(0);

        try {
          await loadLocalPDF(LOCAL_PDF_DEFAULT_PAGE);
          setUsingLocalFallback(true);
          setError("");
          setShowRetryPrompt(false);
          setIsLoading(false);
        } catch (localErr) {
          console.error("❌ Local PDF load also failed:", localErr);
          setError(
            `Failed to load PDF after ${maxRetries + 1} attempts. Local fallback also failed.`,
          );
          setShowRetryPrompt(true);
          setIsLoading(false);
        }
      }
    }
  };

  // Load PDF from local public folder (fallback)
  const loadLocalPDF = async (initialPage = LOCAL_PDF_DEFAULT_PAGE) => {
    console.log("📁 Loading local PDF from:", LOCAL_PDF_PATH);

    setError("");
    setIsLoading(true);
    setStatus("Loading local document...");
    setUseHybridMode(true);
    setFullPdfReady(false);
    setIsBackgroundLoading(false);

    // Clear any previous background loading
    if (backgroundLoadRef.current) {
      clearTimeout(backgroundLoadRef.current);
      backgroundLoadRef.current = null;
    }

    try {
      // Load local PDF with hybrid mode
      const loadingTask = window.pdfjsLib.getDocument({
        url: LOCAL_PDF_PATH,
        withCredentials: false,
        disableRange: false,
        disableStream: false,
        disableAutoFetch: true,
        rangeChunkSize: 65536,
      });

      const pdf = await loadingTask.promise;

      console.log("✅ Local PDF loaded:", {
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint,
        initialPage,
      });

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setStatus(`Local Document - Page ${initialPage} of ${pdf.numPages}`);

      const startPage = Math.min(Math.max(1, initialPage), pdf.numPages);
      await renderPageHybrid(pdf, startPage);
      setIsLoading(false);

      // Background load full PDF
      console.log("🔄 Starting background full PDF load for local document...");
      setIsBackgroundLoading(true);
      backgroundLoadRef.current = setTimeout(() => {
        loadFullPDFInBackgroundLocal(pdf, startPage);
      }, 1000);
    } catch (err) {
      console.error("❌ Local PDF Load Error:", err);
      throw err; // Re-throw untuk di-catch oleh loadPDFWithRetry
    }
  };

  // Load Full Local PDF in Background
  const loadFullPDFInBackgroundLocal = async (currentPdf, currentPage) => {
    try {
      console.log("🔄 Background loading full local PDF...");

      const loadingTask = window.pdfjsLib.getDocument({
        url: LOCAL_PDF_PATH,
        withCredentials: false,
        disableRange: false,
        disableStream: false,
        disableAutoFetch: false,
      });

      loadingTask.onProgress = (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setStatus(
            `Page ${pageNum} / ${totalPages} (background: ${percent}%)`,
          );
        }
      };

      const pdf = await loadingTask.promise;

      console.log("✅ Full local PDF loaded in background");

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setFullPdfReady(true);
      setIsBackgroundLoading(false);
      setUseHybridMode(false);
      setStatus(`Local Document Ready - Page ${pageNum} / ${pdf.numPages}`);

      await renderPage(pdf, currentPage);
    } catch (err) {
      console.error("⚠️ Background local load failed:", err);
      setIsBackgroundLoading(false);
    }
  };

  // Load PDF
  const loadPDF = async (id, initialPage = 1) => {
    if (!id) {
      setError(
        "File ID kosong. Tambahkan ?id=... pada URL atau isi input File ID.",
      );
      return;
    }

    setError("");
    setIsLoading(true);
    setStatus("Loading page...");
    setUseHybridMode(true); // LANGSUNG pakai Hybrid Mode untuk speed
    setFullPdfReady(false);
    setIsBackgroundLoading(false);

    // Clear any previous background loading
    if (backgroundLoadRef.current) {
      clearTimeout(backgroundLoadRef.current);
      backgroundLoadRef.current = null;
    }

    // STRATEGY: Load hybrid mode first (single page, super fast!)
    try {
      console.log("⚡ FAST LOAD: Loading single page", initialPage, "first");
      await loadPDFHybrid(id, initialPage);
      setIsLoading(false);

      // BACKGROUND: Setelah page pertama sukses, load full PDF di background
      console.log("🔄 Starting background full PDF load...");
      setIsBackgroundLoading(true);
      backgroundLoadRef.current = setTimeout(() => {
        loadFullPDFInBackground(id, initialPage);
      }, 1000); // Delay 1 detik biar page pertama smooth dulu
    } catch (err) {
      console.error("❌ Fast Load Error:", err);
      setError(`Failed to load PDF: ${err.message}`);
      setUseHybridMode(false);
      setIsLoading(false);
    }
  };

  // Load Full PDF in Background (after first page is shown)
  const loadFullPDFInBackground = async (id, currentPage) => {
    try {
      const url = getProxyUrl(id);
      console.log("🔄 Background loading full PDF...");

      const loadingTask = window.pdfjsLib.getDocument({
        url,
        withCredentials: false,
        disableRange: false,
        disableStream: false,
        disableAutoFetch: false, // Load everything!
      });

      // Silent progress tracking
      loadingTask.onProgress = (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setStatus(
            `Page ${pageNum} / ${totalPages} (background: ${percent}%)`,
          );
        }
      };

      const pdf = await loadingTask.promise;

      console.log("✅ Full PDF loaded in background:", {
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint,
      });

      // Replace hybrid PDF dengan full PDF
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setFullPdfReady(true);
      setIsBackgroundLoading(false);
      setUseHybridMode(false); // Switch ke full mode
      setStatus(`Full PDF Ready - Page ${pageNum} / ${pdf.numPages}`);

      // Re-render current page dengan full PDF
      await renderPage(pdf, currentPage);
    } catch (err) {
      console.error("⚠️ Background load failed (staying in hybrid mode):", err);
      setIsBackgroundLoading(false);
      // Tetap pakai hybrid mode kalau background load gagal
    }
  };

  // Load PDF in Hybrid Mode - metadata + on-demand page rendering
  const loadPDFHybrid = async (id, initialPage = 1) => {
    const url = getProxyUrl(id);
    console.log("⚡ Loading PDF in HYBRID mode (single page first):", url);

    // Load dengan range request - hanya metadata + halaman yang dibutuhkan
    const loadingTask = window.pdfjsLib.getDocument({
      url,
      withCredentials: false,
      disableRange: false, // Enable range request
      disableStream: false,
      disableAutoFetch: true, // PENTING: Jangan auto-fetch semua pages
      rangeChunkSize: 65536, // 64KB chunks
    });

    const pdf = await loadingTask.promise;

    console.log("✅ PDF metadata + first page loaded:", {
      numPages: pdf.numPages,
      fingerprint: pdf.fingerprint,
      initialPage,
    });

    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
    setStatus(`Fast Preview - Page ${initialPage} of ${pdf.numPages}`);

    const startPage = Math.min(Math.max(1, initialPage), pdf.numPages);
    await renderPageHybrid(pdf, startPage);
  };

  // Render page in Hybrid Mode - with caching
  const renderPageHybrid = async (pdf, pageNumber) => {
    if (!pdf || !canvasRef.current) return;

    // Cancel previous render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setStatus(`Loading page ${pageNumber}...`);

    // Check cache first
    const cacheKey = `${pdf.fingerprint}-${pageNumber}-${scale}`;
    if (pageCache.current.has(cacheKey)) {
      console.log("📦 Using cached page:", pageNumber);
      const cachedData = pageCache.current.get(cacheKey);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = cachedData.width;
      canvas.height = cachedData.height;
      context.putImageData(cachedData.imageData, 0, 0);
      setPageNum(pageNumber);
      setGotoPage(pageNumber);
      setStatus(`Page ${pageNumber} / ${totalPages} (cached)`);
      updateURL(fileId, pageNumber);
      return;
    }

    // Load page on-demand (hanya page ini, bukan semua PDF)
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale, rotation: 0 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const renderTask = page.render({
      canvasContext: context,
      viewport: viewport,
    });

    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;

      // Cache rendered page
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      pageCache.current.set(cacheKey, {
        imageData,
        width: canvas.width,
        height: canvas.height,
      });

      // Limit cache size (max 10 pages)
      if (pageCache.current.size > 10) {
        const firstKey = pageCache.current.keys().next().value;
        pageCache.current.delete(firstKey);
      }

      setPageNum(pageNumber);
      setGotoPage(pageNumber);
      setStatus(`Page ${pageNumber} / ${totalPages} (hybrid)`);
      updateURL(fileId, pageNumber);
    } catch (err) {
      if (err.name === "RenderingCancelledException") {
        console.log("Rendering cancelled");
      } else {
        throw err;
      }
    } finally {
      renderTaskRef.current = null;
    }
  };

  // Render specific page
  const renderPage = async (pdf, pageNumber) => {
    if (!pdf || !canvasRef.current) return;

    // Cancel previous render jika masih berjalan
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale, rotation: 0 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    setStatus(`Rendering page ${pageNumber}...`);

    const renderTask = page.render({
      canvasContext: context,
      viewport: viewport,
    });

    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;
      setPageNum(pageNumber);
      setGotoPage(pageNumber);
      setStatus(`Page ${pageNumber} / ${totalPages}`);
      updateURL(fileId, pageNumber);
    } catch (err) {
      if (err.name === "RenderingCancelledException") {
        console.log("Rendering cancelled");
      } else {
        throw err;
      }
    } finally {
      renderTaskRef.current = null;
    }
  };

  // Navigation handlers
  const handlePrev = () => {
    if (fullPdfReady && pdfDoc) {
      // Kalau full PDF ready, pakai render biasa (cepat!)
      if (pageNum <= 1) return;
      renderPage(pdfDoc, pageNum - 1);
    } else if (useHybridMode && pdfDoc) {
      // Kalau masih hybrid, load on-demand
      if (pageNum <= 1) return;
      renderPageHybrid(pdfDoc, pageNum - 1);
    } else {
      if (!pdfDoc || pageNum <= 1) return;
      renderPage(pdfDoc, pageNum - 1);
    }
  };

  const handleNext = () => {
    if (fullPdfReady && pdfDoc) {
      // Kalau full PDF ready, pakai render biasa (cepat!)
      if (pageNum >= totalPages) return;
      renderPage(pdfDoc, pageNum + 1);
    } else if (useHybridMode && pdfDoc) {
      // Kalau masih hybrid, load on-demand
      if (pageNum >= totalPages) return;
      renderPageHybrid(pdfDoc, pageNum + 1);
    } else {
      if (!pdfDoc || pageNum >= totalPages) return;
      renderPage(pdfDoc, pageNum + 1);
    }
  };

  const handleGoto = () => {
    if (fullPdfReady && pdfDoc) {
      // Kalau full PDF ready, pakai render biasa (cepat!)
      const target = Math.min(Math.max(1, gotoPage), totalPages);
      renderPage(pdfDoc, target);
    } else if (useHybridMode && pdfDoc) {
      // Kalau masih hybrid, load on-demand
      const target = Math.min(Math.max(1, gotoPage), totalPages);
      renderPageHybrid(pdfDoc, target);
    } else {
      if (!pdfDoc) return;
      const target = Math.min(Math.max(1, gotoPage), totalPages);
      renderPage(pdfDoc, target);
    }
  };

  const handleZoomIn = () => {
    if (!pdfDoc) return;
    const newScale = Math.min(scale + 0.1, 3.0);
    setScale(newScale);
    if (fullPdfReady) {
      setTimeout(() => renderPage(pdfDoc, pageNum), 0);
    } else if (useHybridMode) {
      setTimeout(() => renderPageHybrid(pdfDoc, pageNum), 0);
    } else {
      setTimeout(() => renderPage(pdfDoc, pageNum), 0);
    }
  };

  const handleZoomOut = () => {
    if (!pdfDoc) return;
    const newScale = Math.max(scale - 0.1, 0.4);
    setScale(newScale);
    if (fullPdfReady) {
      setTimeout(() => renderPage(pdfDoc, pageNum), 0);
    } else if (useHybridMode) {
      setTimeout(() => renderPageHybrid(pdfDoc, pageNum), 0);
    } else {
      setTimeout(() => renderPage(pdfDoc, pageNum), 0);
    }
  };

  const handleLoad = () => {
    setFullPdfReady(false);
    pageCache.current.clear();
    setRetryCount(0);
    setShowRetryPrompt(false);
    loadPDFWithRetry(fileId, pageNum);
  };

  // Manual trigger untuk load full PDF immediately
  const loadFullPDFNow = () => {
    if (backgroundLoadRef.current) {
      clearTimeout(backgroundLoadRef.current);
      backgroundLoadRef.current = null;
    }
    setIsBackgroundLoading(true);
    loadFullPDFInBackground(fileId, pageNum);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-24">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4">
          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 pb-4 border-b">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Drive File ID
              </label>
              <input
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                placeholder="Masukkan File ID dari Google Drive..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Halaman
              </label>
              <input
                type="number"
                min="1"
                value={pageNum}
                onChange={(e) => setPageNum(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="sm:w-auto sm:self-end">
              <button
                onClick={handleLoad}
                disabled={isLoading || !fileId}
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-2.5 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Loading..." : "Load PDF"}
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Page Navigation */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePrev}
                disabled={!pdfDoc || pageNum <= 1}
                className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-600">Page</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages || 999}
                  value={gotoPage}
                  onChange={(e) => setGotoPage(parseInt(e.target.value) || 1)}
                  onKeyDown={(e) => e.key === "Enter" && handleGoto()}
                  className="w-16 text-center border-0 focus:ring-0 p-0 text-sm"
                />
                <span className="text-sm text-gray-600">
                  / {totalPages || "—"}
                </span>
                <button
                  onClick={handleGoto}
                  disabled={!pdfDoc}
                  className="ml-2 text-amber-600 hover:text-amber-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={!pdfDoc || pageNum >= totalPages}
                className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Next →
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-1">Zoom:</span>
              <button
                onClick={handleZoomOut}
                disabled={!pdfDoc}
                className="border border-gray-300 rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                −
              </button>
              <span className="text-sm font-medium text-gray-700 w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={!pdfDoc}
                className="border border-gray-300 rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Status Bar */}
          {(status || error || showRetryPrompt || usingLocalFallback) && (
            <div className="mt-4 pt-4 border-t">
              {/* Local Fallback Notice */}
              {usingLocalFallback && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">
                        📁 Loading Local Document
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Remote PDF unavailable. Displaying local SPMI UMM
                        document as fallback.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status && !showRetryPrompt && (
                <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  {retryCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Retry {retryCount}/{maxRetries}
                    </span>
                  )}
                  {status}
                </div>
              )}
              {error && (
                <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 whitespace-pre-wrap">
                  {error}
                </div>
              )}
              {showRetryPrompt && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-yellow-800 mb-1">
                        PDF Failed to Load
                      </h3>
                      <p className="text-sm text-yellow-700 mb-3">
                        The PDF could not be loaded after multiple attempts.
                        This might be due to network issues or browser
                        compatibility.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                          Refresh Page
                        </button>
                        <button
                          onClick={() => {
                            setShowRetryPrompt(false);
                            setError("");
                            setRetryCount(0);
                            loadPDFWithRetry(fileId, pageNum);
                          }}
                          className="inline-flex items-center justify-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-lg text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas Viewer */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-4">
          <div className="overflow-auto">
            <canvas
              ref={canvasRef}
              className="mx-auto"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </div>

        {/* Status Notification - Professional Style */}
        {(fullPdfReady || (useHybridMode && !fullPdfReady)) && (
          <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {fullPdfReady ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fullPdfReady ? "Full PDF Ready" : "Fast Preview Mode"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fullPdfReady
                      ? "All pages loaded. Navigation and zoom operations are now instant."
                      : isBackgroundLoading
                        ? "Loading complete document in background. You can continue navigating."
                        : "Pages are loaded on-demand for faster initial load time."}
                  </p>
                </div>
              </div>
              {useHybridMode && !fullPdfReady && !isBackgroundLoading && (
                <button
                  onClick={loadFullPDFNow}
                  className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Load Complete PDF
                </button>
              )}
            </div>
          </div>
        )}
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
            console.log("✅ PDF.js loaded and ready");
            setScriptLoaded(true);
          }
        }}
        strategy="afterInteractive"
      />
      {scriptLoaded ? (
        <PDFViewerContent pdfLoaded={scriptLoaded} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading PDF.js...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <PDFViewerWrapper />
    </Suspense>
  );
}
