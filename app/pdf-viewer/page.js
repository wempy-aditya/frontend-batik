"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";

function PDFViewerContent({ pdfLoaded }) {
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
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const renderTaskRef = useRef(null);

  // Get proxy URL
  const getProxyUrl = (id) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/api/proxy-pdf?id=${encodeURIComponent(id)}`;
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

    // Cancel previous render jika masih berjalan
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const page = await pdf.getPage(pageNumber);
    
    // Apply rotation correction - jika PDF ter-rotate, kembalikan ke normal
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
    setTimeout(() => renderPage(pdfDoc, pageNum), 0);
  };

  const handleZoomOut = () => {
    if (!pdfDoc) return;
    const newScale = Math.max(scale - 0.1, 0.4);
    setScale(newScale);
    setTimeout(() => renderPage(pdfDoc, pageNum), 0);
  };

  const handleLoad = () => {
    loadPDF(fileId, pageNum);
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
        <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <label className="text-sm">
                <div className="text-gray-600 mb-1">Google Drive File ID</div>
                <input
                  type="text"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  placeholder="contoh: 1AbCDef..."
                  className="w-full sm:w-[360px] border rounded-lg px-3 py-2"
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Halaman awal</div>
                <input
                  type="number"
                  min="1"
                  value={pageNum}
                  onChange={(e) => setPageNum(parseInt(e.target.value) || 1)}
                  className="w-full sm:w-28 border rounded-lg px-3 py-2"
                />
              </label>

              <button
                onClick={handleLoad}
                disabled={isLoading || !fileId}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Load PDF"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handlePrev}
                disabled={!pdfDoc || pageNum <= 1}
                className="border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ◀ Prev
              </button>
              <button
                onClick={handleNext}
                disabled={!pdfDoc || pageNum >= totalPages}
                className="border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ▶
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Page</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages || 1}
                  value={gotoPage}
                  onChange={(e) => setGotoPage(parseInt(e.target.value) || 1)}
                  onKeyDown={(e) => e.key === "Enter" && handleGoto()}
                  className="w-20 border rounded-lg px-2 py-2 text-sm"
                />
                <span className="text-sm text-gray-600">/ {totalPages || "-"}</span>
                <button
                  onClick={handleGoto}
                  disabled={!pdfDoc}
                  className="border rounded-lg px-3 py-2 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={!pdfDoc}
                  className="border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-sm text-gray-600 w-14 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={!pdfDoc}
                  className="border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-gray-500">
              Source: <span className="break-all">{fileId ? getProxyUrl(fileId) : "-"}</span>
            </div>
            {status && (
              <div className="text-sm text-gray-700">{status}</div>
            )}
          </div>

          {error && (
            <div className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 whitespace-pre-wrap">
              {error}
            </div>
          )}

          <details className="mt-3 text-xs text-gray-500">
            <summary className="cursor-pointer">Catatan</summary>
            <div className="mt-2">
              Halaman diatur oleh PDF.js. URL akan di-update otomatis saat pindah halaman.
            </div>
          </details>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-4">
          <div className="overflow-auto">
            <canvas
              ref={canvasRef}
              className="mx-auto"
              style={{ imageRendering: "auto" }}
            />
          </div>
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
