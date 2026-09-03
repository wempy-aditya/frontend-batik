"use client";
import { withBasePath } from "@/lib/basePath";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useParams, useRouter } from "next/navigation";

// ── Accordion Row Component ──
function AccordionRow({ icon, iconColor, label, badge, children, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={!isLast ? "border-b border-gray-100" : ""}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors duration-150 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className={`${iconColor} transition-transform duration-200 ${open ? "scale-110" : ""}`}>
            {icon}
          </span>
          <span className="text-sm font-bold text-gray-800">{label}</span>
          {badge > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-400 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-all duration-200 flex-shrink-0 ${open ? "rotate-180 text-amber-400" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-5 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Demo Modal Component ──
function DemoModal({ isOpen, onClose, project, activeDemoIndex, setActiveDemoIndex, getDemoLabel, iframeLoading, setIframeLoading, iframeError, setIframeError, demoRefreshKey, setDemoRefreshKey }) {
  const activeDemoUrl = project?.demo_url?.[activeDemoIndex] ?? null;
  const iframeLoadCount = useRef(0);
  const [navBlocked, setNavBlocked] = useState(false);

  const handleDemoChange = (index) => {
    setActiveDemoIndex(index);
    setIframeLoading(true);
    setIframeError(false);
    setDemoRefreshKey(Date.now().toString());
    iframeLoadCount.current = 0; // Reset counter saat ganti tab demo
  };

  // Reset load counter setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      iframeLoadCount.current = 0;
      setNavBlocked(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Handle browser back button & beforeunload while modal is open
  useEffect(() => {
    if (!isOpen) return;

    // Push a fake history entry so back button closes modal instead of navigating away
    window.history.pushState({ demoModal: true }, "");

    const handlePopState = () => {
      onClose();
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Demo sedang berjalan. Yakin ingin meninggalkan halaman?";
      return e.returnValue;
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal window */}
      <div
        className="relative w-full max-w-7xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          height: "90vh",
          animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Browser-style title bar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center group"
              title="Tutup"
            >
              <svg className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
          </div>

          {/* Multi-demo tabs */}
          {project.demo_url.length > 1 && (
            <div className="flex gap-1.5">
              {project.demo_url.map((url, index) => (
                <button key={index} onClick={() => handleDemoChange(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${activeDemoIndex === index
                      ? "bg-amber-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  {getDemoLabel(url, index)}
                </button>
              ))}
            </div>
          )}

          {/* Address bar */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-400 truncate font-mono flex items-center gap-2">
              <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{activeDemoUrl}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Reset to demo button */}
            <button
              onClick={() => {
                iframeLoadCount.current = 0;
                setIframeLoading(true);
                setIframeError(false);
                setDemoRefreshKey(Date.now().toString());
              }}
              title="Reset ke halaman demo awal"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            <a href={activeDemoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Buka
            </a>
            <button onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Tutup
            </button>
          </div>
        </div>

        {/* Navigation warning banner */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/80 border-b border-amber-800/50 flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-300 flex-1">
            <span className="font-bold">Mode Demo Terbatas</span> — Navigasi dalam demo dibatasi. Gunakan tombol <span className="font-bold">Reset</span> untuk kembali ke halaman demo, atau <span className="font-bold">Buka</span> untuk melihat di tab baru.
          </p>
        </div>

        {/* Iframe content */}
        <div className="flex-1 relative bg-white overflow-hidden">
          {/* Navigation blocked toast */}
          {navBlocked && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-2xl pointer-events-none"
              style={{ animation: "slideUp 0.2s ease-out" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Navigasi diblokir — dikembalikan ke demo
            </div>
          )}
          {iframeError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-3">Preview Tidak Tersedia</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md leading-relaxed">
                Demo ini tidak dapat di-embed karena pembatasan keamanan (X-Frame-Options atau CSP). Silakan buka langsung di tab baru.
              </p>
              <a href={activeDemoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Buka Demo di Tab Baru
              </a>
            </div>
          ) : (
            <>
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="relative w-16 h-16 mb-5">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-gray-700 text-base font-bold">Memuat demo...</p>
                  <p className="text-gray-400 text-xs mt-1">Mohon tunggu sebentar</p>
                </div>
              )}
              <iframe
                key={`${activeDemoUrl}-${demoRefreshKey}`}
                src={activeDemoUrl ? `${activeDemoUrl}${activeDemoUrl.includes("?") ? "&" : "?"}t=${demoRefreshKey}` : ""}
                title={`Demo - ${project.title}`}
                className="w-full h-full"
                style={{ border: "none", display: "block" }}
                onLoad={() => {
                  iframeLoadCount.current += 1;
                  if (iframeLoadCount.current === 1) {
                    // Load pertama (normal)
                    setIframeLoading(false);
                    setIframeError(false);
                  } else {
                    // Load ke-2+ = user navigasi di dalam iframe → reset
                    iframeLoadCount.current = 0;
                    setNavBlocked(true);
                    setIframeLoading(true);
                    setDemoRefreshKey(Date.now().toString());
                    setTimeout(() => setNavBlocked(false), 3000);
                  }
                }}
                onError={() => { setIframeLoading(false); setIframeError(true); }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-modals"
                allow="camera; microphone; fullscreen; autoplay"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(false);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [demoRefreshKey, setDemoRefreshKey] = useState("");
  const [navBlocked, setNavBlocked] = useState(false);
  const iframeLoadCount = useRef(0);

  useEffect(() => {
    setDemoRefreshKey(Date.now().toString());
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = token ? `/api/projects/${id}` : `/api/projects/public/${id}`;
        const response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id, token]);

  useEffect(() => {
    const fetchContributors = async () => {
      if (id) {
        setLoadingContributors(true);
        try {
          const response = await fetch(withBasePath(`/api/contributors/project/${id}/contributors`));
          if (response.ok) {
            const data = await response.json();
            setContributors(data.data || []);
          }
        } catch {
          setContributors([]);
        } finally {
          setLoadingContributors(false);
        }
      }
    };
    fetchContributors();
  }, [id]);

  const getDemoLabel = (url, index) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      const meaningful = [...parts].reverse().find((p) => p.length > 2 && !/^\d+$/.test(p));
      if (meaningful) {
        return meaningful.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }
      const host = u.hostname.replace("www.", "").split(".")[0];
      return host.charAt(0).toUpperCase() + host.slice(1);
    } catch {
      return `Demo ${index + 1}`;
    }
  };

  const resetDemo = useCallback(() => {
    iframeLoadCount.current = 0;
    setIframeLoading(true);
    setIframeError(false);
    setDemoRefreshKey(Date.now().toString());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-12 shadow-xl max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">The project you&#39;re looking for doesn&#39;t exist.</p>
          <button
            onClick={() => router.push(withBasePath("/projects"))}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const hasDemos = project.demo_url && Array.isArray(project.demo_url) && project.demo_url.length > 0;
  const activeDemoUrl = hasDemos ? project.demo_url[activeDemoIndex] : null;

  const sections = [
    {
      key: "overview",
      label: "Overview",
      show: true,
      iconColor: "text-amber-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      content: project.full_description ? (
        <p className="text-gray-600 text-sm leading-relaxed">{project.full_description}</p>
      ) : (
        <p className="text-gray-400 text-sm italic">Belum ada deskripsi lengkap yang ditambahkan.</p>
      ),
    },
    {
      key: "challenges",
      label: "Challenges",
      show: true,
      badge: project.challenges?.length,
      iconColor: "text-orange-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      content: project.challenges?.length ? (
        <ul className="space-y-2">
          {project.challenges.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black mt-0.5">{idx + 1}</span>
              <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm italic">Belum ada challenges yang ditambahkan.</p>
      ),
    },
    {
      key: "achievements",
      label: "Achievements",
      show: true,
      badge: project.achievements?.length,
      iconColor: "text-green-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: project.achievements?.length ? (
        <ul className="space-y-2">
          {project.achievements.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="flex-shrink-0 w-4 h-4 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm italic">Belum ada achievements yang ditambahkan.</p>
      ),
    },
    {
      key: "future_work",
      label: "Future Work",
      show: true,
      badge: project.future_work?.length,
      iconColor: "text-blue-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      content: project.future_work?.length ? (
        <ul className="space-y-2">
          {project.future_work.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="flex-shrink-0 w-4 h-4 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm italic">Belum ada rencana pengembangan yang ditambahkan.</p>
      ),
    },
    {
      key: "technologies",
      label: "Technologies",
      show: true,
      badge: project.technologies?.length,
      iconColor: "text-amber-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      content: project.technologies?.length ? (
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, idx) => (
            <span key={idx} className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
              {tech}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">Belum ada teknologi yang ditambahkan.</p>
      ),
    },
    {
      key: "contributors",
      label: "Contributors",
      show: true,
      badge: contributors.length || 0,
      iconColor: "text-amber-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      content: loadingContributors ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
          <span className="text-xs text-gray-400">Loading...</span>
        </div>
      ) : contributors.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-2">
          {contributors.map((c, idx) => (
            <div key={`${c.id}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              {c.profile_image ? (
                <img src={c.profile_image} alt={c.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "flex"; }} />
              ) : null}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ display: c.profile_image ? "none" : "flex" }}>
                {c.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-amber-600 truncate">{c.role_in_project || c.role}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {c.github_url && (
                  <a href={c.github_url} target="_blank" rel="noopener noreferrer"
                    className="w-6 h-6 rounded-md bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    <svg className="w-3.5 h-3.5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                {c.linkedin_url && (
                  <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="w-6 h-6 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-100 flex items-center justify-center transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No contributors listed.</p>
      ),
    },
  ].filter((s) => s.show);

  return (
    <div className="min-h-screen" style={{ background: "#f5f0e8" }}>

      {/* ── HERO ── */}
      <section className="relative py-12 pt-24 md:py-20 md:pt-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-repeat"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-amber-200 text-xs md:text-sm mb-5 md:mb-8 flex-wrap">
            <button onClick={() => router.push("/")} className="hover:text-white transition-colors">Home</button>
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button onClick={() => router.push("/projects")} className="hover:text-white transition-colors">Projects</button>
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white truncate max-w-[160px] md:max-w-xs">{project.title}</span>
          </div>

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            {/* Thumbnail — hidden on mobile, visible on lg+ */}
            <div className="hidden lg:block lg:w-2/5 flex-shrink-0">
              <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "flex"; }} />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
                  style={{ display: project.thumbnail_url ? "none" : "flex" }}>
                  <span className="text-white text-7xl font-black opacity-30">{project.title?.charAt(0)}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>

            {/* Info */}
            <div className="w-full lg:w-3/5">
              {/* Mobile thumbnail — compact strip */}
              {project.thumbnail_url && (
                <div className="lg:hidden relative h-40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 mb-5">
                  <img src={project.thumbnail_url} alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 text-white leading-tight">{project.title}</h1>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-4 md:mb-5">{project.description}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/10 text-amber-200 rounded-full text-xs md:text-sm border border-white/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {/* Mobile: demo first, then sidebar. Desktop: sidebar left, demo right */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">

            {/* ── LEFT SIDEBAR: Sections — shown below demo on mobile, left on desktop ── */}
            <div className="lg:w-72 flex-shrink-0 w-full order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-6">
                {sections.map((s, i) => (
                  <AccordionRow
                    key={s.key}
                    icon={s.icon}
                    iconColor={s.iconColor}
                    label={s.label}
                    badge={s.badge}
                    isLast={i === sections.length - 1}
                  >
                    {s.content}
                  </AccordionRow>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Demo Panel — shown first on mobile ── */}
            <div className="flex-1 min-w-0 space-y-4 md:space-y-6 w-full order-1 lg:order-2">
              {hasDemos ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                  {/* Demo Header */}
                  <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
                    {/* Row 1: Icon+Title + Buka Tab Baru */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">Live Demo</h3>
                          <p className="text-xs text-gray-400 hidden sm:block">Preview langsung proyek ini</p>
                        </div>
                      </div>
                      {/* Buka Tab Baru */}
                      <a
                        href={activeDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-600 transition-colors font-medium flex-shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="hidden sm:inline">Buka Tab Baru</span>
                        <span className="sm:hidden">Buka</span>
                      </a>
                    </div>
                    {/* Row 2: Demo Tabs */}
                    {project.demo_url.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.demo_url.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setActiveDemoIndex(index);
                              iframeLoadCount.current = 0;
                              setIframeLoading(true);
                              setIframeError(false);
                              setDemoRefreshKey(Date.now().toString());
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${activeDemoIndex === index
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700"
                              }`}
                          >
                            {getDemoLabel(url, index)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Browser Chrome */}
                  <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 bg-gray-50 border-b border-gray-100">
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => resetDemo()}
                        title="Reset demo"
                        className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors"
                      />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg border border-gray-200 px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1.5 md:gap-2 min-w-0">
                      <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-gray-400 font-mono truncate">{activeDemoUrl}</span>
                    </div>
                  </div>

                  {/* Iframe Area — responsive height */}
                  <div className="relative" style={{ height: "clamp(320px, 55vw, 600px)" }}>
                    {/* Nav blocked toast */}
                    {navBlocked && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-2xl pointer-events-none"
                        style={{ animation: "fadeIn 0.2s ease-out" }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Navigasi diblokir — dikembalikan ke demo
                      </div>
                    )}

                    {iframeError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 p-8 text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
                          <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-3">Preview Tidak Tersedia</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-md leading-relaxed">
                          Demo ini tidak dapat di-embed. Silakan buka langsung di tab baru.
                        </p>
                        <a href={activeDemoUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Buka Demo di Tab Baru
                        </a>
                      </div>
                    ) : (
                      <>
                        {iframeLoading && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                            <div className="relative w-16 h-16 mb-5">
                              <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
                              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-gray-700 text-base font-bold">Memuat demo...</p>
                            <p className="text-gray-400 text-xs mt-1">Mohon tunggu sebentar</p>
                          </div>
                        )}
                        <iframe
                          key={`${activeDemoUrl}-${demoRefreshKey}`}
                          src={activeDemoUrl ? `${activeDemoUrl}${activeDemoUrl.includes("?") ? "&" : "?"}t=${demoRefreshKey}` : ""}
                          title={`Demo - ${project.title}`}
                          className="w-full h-full"
                          style={{ border: "none", display: "block" }}
                          onLoad={() => {
                            iframeLoadCount.current += 1;
                            if (iframeLoadCount.current === 1) {
                              setIframeLoading(false);
                              setIframeError(false);
                            } else {
                              iframeLoadCount.current = 0;
                              setNavBlocked(true);
                              setIframeLoading(true);
                              setDemoRefreshKey(Date.now().toString());
                              setTimeout(() => setNavBlocked(false), 3000);
                            }
                          }}
                          onError={() => { setIframeLoading(false); setIframeError(true); }}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-modals"
                          allow="camera; microphone; fullscreen; autoplay"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* No demo card */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Demo Belum Tersedia</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                      Proyek ini belum memiliki demo langsung. Silakan hubungi kami untuk informasi lebih lanjut.
                    </p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                </div>
                <div className="relative z-10">
                  <h2 className="text-xl md:text-2xl font-black text-white mb-2">Interested in This Project?</h2>
                  <p className="text-gray-300 mb-5 text-sm max-w-xl mx-auto">Learn more about our work or collaborate with us on similar projects.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => router.push("/contact")}
                      className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm">
                      Contact Us
                    </button>
                    <button onClick={() => router.push("/projects")}
                      className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 text-sm">
                      View All Projects
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
