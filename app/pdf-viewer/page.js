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
  const [useFallback, setUseFallback] = useState(false);
  const [useHybridMode, setUseHybridMode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [fullPdfReady, setFullPdfReady] = useState(false);
  const renderTaskRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const iframeRef = useRef(null);
  const pageCache = useRef(new Map());
  const backgroundLoadRef = useRef(null);

  // Get proxy URL - Using local Next.js API route (faster!)
  const getProxyUrl = (id) => {
    // Option 1: Local Next.js proxy (recommended - same server, lebih cepat)
    return `/api/proxy-pdf?id=${encodeURIComponent(id)}`;
    
    // Option 2: Cloudflare Workers (backup jika local proxy gagal)
    // return `https://bitter-darkness-fab2.wahyukusuma.workers.dev/pdf?id=${encodeURIComponent(id)}`;
  };

  // Get Google Drive embed URL (fallback)
  const getEmbedUrl = (id, page = 1) => {
    // Force fresh load dengan timestamp
    const timestamp = Date.now();
    // Coba format: /preview dengan multiple parameters
    return `https://drive.google.com/file/d/${id}/preview?embedded=true&rm=minimal&page=${page}&t=${timestamp}`;
  };

  // Force iframe reload dengan page baru - AGGRESSIVE UNMOUNT/REMOUNT
  const forceIframePageChange = (targetPage) => {
    if (useFallback) {
      console.log('🔄 Force reloading iframe to page:', targetPage);
      
      // Update state dulu
      setPageNum(targetPage);
      setGotoPage(targetPage);
      updateURL(fileId, targetPage);
      
      // FORCE UNMOUNT: Set key baru untuk paksa React unmount dan remount iframe
      setIframeKey(prev => prev + 1);
      
      // Fallback: Kalau ada ref, coba ubah src juga
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = getEmbedUrl(fileId, targetPage);
        }
      }, 100);
    }
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
      console.log('🚀 Auto-loading PDF on mount:', id);
      setHasAutoLoaded(true);
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
    setStatus("Loading page...");
    setUseFallback(false);
    setUseHybridMode(true);  // LANGSUNG pakai Hybrid Mode untuk speed
    setFullPdfReady(false);
    setIsBackgroundLoading(false);

    // Clear any previous background loading
    if (backgroundLoadRef.current) {
      clearTimeout(backgroundLoadRef.current);
      backgroundLoadRef.current = null;
    }

    // STRATEGY: Load hybrid mode first (single page, super fast!)
    try {
      console.log('⚡ FAST LOAD: Loading single page', initialPage, 'first');
      await loadPDFHybrid(id, initialPage);
      setIsLoading(false);
      
      // BACKGROUND: Setelah page pertama sukses, load full PDF di background
      console.log('🔄 Starting background full PDF load...');
      setIsBackgroundLoading(true);
      backgroundLoadRef.current = setTimeout(() => {
        loadFullPDFInBackground(id, initialPage);
      }, 1000);  // Delay 1 detik biar page pertama smooth dulu
      
    } catch (err) {
      console.error("❌ Fast Load Error:", err);
      setUseFallback(true);
      setUseHybridMode(false);
      setIsLoading(false);
      setStatus("Using fallback preview mode");
    }
  };

  // Load Full PDF in Background (after first page is shown)
  const loadFullPDFInBackground = async (id, currentPage) => {
    try {
      const url = getProxyUrl(id);
      console.log('🔄 Background loading full PDF...');

      const loadingTask = window.pdfjsLib.getDocument({
        url,
        withCredentials: false,
        disableRange: false,
        disableStream: false,
        disableAutoFetch: false,  // Load everything!
      });

      // Silent progress tracking
      loadingTask.onProgress = (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setStatus(`Page ${pageNum} / ${totalPages} (background: ${percent}%)`);
        }
      };

      const pdf = await loadingTask.promise;
      
      console.log('✅ Full PDF loaded in background:', {
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprint
      });

      // Replace hybrid PDF dengan full PDF
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setFullPdfReady(true);
      setIsBackgroundLoading(false);
      setUseHybridMode(false);  // Switch ke full mode
      setStatus(`Full PDF Ready - Page ${pageNum} / ${pdf.numPages}`);

      // Re-render current page dengan full PDF
      await renderPage(pdf, currentPage);
      
    } catch (err) {
      console.error('⚠️ Background load failed (staying in hybrid mode):', err);
      setIsBackgroundLoading(false);
      // Tetap pakai hybrid mode kalau background load gagal
    }
  };

  // Load PDF in Hybrid Mode - metadata + on-demand page rendering
  const loadPDFHybrid = async (id, initialPage = 1) => {
    const url = getProxyUrl(id);
    console.log('⚡ Loading PDF in HYBRID mode (single page first):', url);

    // Load dengan range request - hanya metadata + halaman yang dibutuhkan
    const loadingTask = window.pdfjsLib.getDocument({
      url,
      withCredentials: false,
      disableRange: false,  // Enable range request
      disableStream: false,
      disableAutoFetch: true,  // PENTING: Jangan auto-fetch semua pages
      rangeChunkSize: 65536,   // 64KB chunks
    });

    const pdf = await loadingTask.promise;
    
    console.log('✅ PDF metadata + first page loaded:', {
      numPages: pdf.numPages,
      fingerprint: pdf.fingerprint,
      initialPage
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
      console.log('📦 Using cached page:', pageNumber);
      const cachedData = pageCache.current.get(cacheKey);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
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
    const context = canvas.getContext('2d');

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
        height: canvas.height
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
      if (err.name === 'RenderingCancelledException') {
        console.log('Rendering cancelled');
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
      if (err.name === 'RenderingCancelledException') {
        console.log('Rendering cancelled');
      } else {
        throw err;
      }
    } finally {
      renderTaskRef.current = null;
    }
  };

  // Navigation handlers
  const handlePrev = () => {
    if (useFallback) {
      const newPage = Math.max(1, pageNum - 1);
      forceIframePageChange(newPage);
    } else if (fullPdfReady && pdfDoc) {
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
    if (useFallback) {
      const newPage = pageNum + 1;
      forceIframePageChange(newPage);
    } else if (fullPdfReady && pdfDoc) {
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
    if (useFallback) {
      const target = Math.max(1, gotoPage);
      forceIframePageChange(target);
    } else if (fullPdfReady && pdfDoc) {
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
    setFullPdfReady(false);  // Reset full PDF state
    pageCache.current.clear();  // Clear cache
    loadPDF(fileId, pageNum);
  };

  const switchToCanvas = () => {
    setUseFallback(false);
    setUseHybridMode(false);
    setFullPdfReady(false);
    pageCache.current.clear();
    loadPDF(fileId, pageNum);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6">
              📄 PDF Viewer
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              View and navigate PDF documents from Google Drive with ease
            </p>
          </div>
        </div>
      </section>

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
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="sm:w-auto sm:self-end">
              <button
                onClick={handleLoad}
                disabled={isLoading || !fileId}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                disabled={(!pdfDoc && !useFallback) || pageNum <= 1}
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
                <span className="text-sm text-gray-600">/ {totalPages || (useFallback ? "—" : "—")}</span>
                <button
                  onClick={handleGoto}
                  disabled={!pdfDoc && !useFallback}
                  className="ml-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={(!pdfDoc && !useFallback) || (!useFallback && pageNum >= totalPages)}
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
          {(status || error) && (
            <div className="mt-4 pt-4 border-t">
              {status && (
                <div className="text-sm text-gray-600 mb-2">
                  {status}
                </div>
              )}
              {error && (
                <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 whitespace-pre-wrap">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas / Embed Viewer */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-4">
          {useFallback ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium">Preview Mode</span>
                </div>
                <button 
                  onClick={switchToCanvas}
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                >
                  Switch to Full Mode
                </button>
              </div>
              <div className="relative" style={{ paddingBottom: '75%' }}>
                <iframe
                  ref={iframeRef}
                  key={`iframe-${iframeKey}-${fileId}-page${pageNum}`}
                  src={getEmbedUrl(fileId, pageNum)}
                  className="absolute top-0 left-0 w-full h-full rounded-lg border"
                  allow="autoplay"
                  title="PDF Preview"
                  onLoad={() => {
                    console.log('✅ Iframe loaded for page:', pageNum, 'at', new Date().toISOString());
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="overflow-auto">
              <canvas
                ref={canvasRef}
                className="mx-auto"
                style={{ imageRendering: "auto" }}
              />
            </div>
          )}
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
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fullPdfReady ? 'Full PDF Ready' : 'Fast Preview Mode'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fullPdfReady 
                      ? 'All pages loaded. Navigation and zoom operations are now instant.' 
                      : isBackgroundLoading 
                        ? 'Loading complete document in background. You can continue navigating.' 
                        : 'Pages are loaded on-demand for faster initial load time.'}
                  </p>
                </div>
              </div>
              {useHybridMode && !fullPdfReady && !isBackgroundLoading && (
                <button 
                  onClick={loadFullPDFNow}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
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
            console.log('✅ PDF.js loaded and ready');
            setScriptLoaded(true);
          }
        }}
        strategy="afterInteractive"
      />
      {scriptLoaded ? <PDFViewerContent pdfLoaded={scriptLoaded} /> : (
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
