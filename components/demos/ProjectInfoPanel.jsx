"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// Usage: <ProjectInfoPanel projectId=\"your-uuid\" />
// On demo pages, this panel is informational only — it does NOT enforce
// access control. If the project fetch fails the panel still renders a
// placeholder so users aren't blocked from using the demo.
export default function ProjectInfoPanel({ projectId }) {
  const { user, token } = useAuth();
  const [open, setOpen]                 = useState(false);
  const [project, setProject]           = useState(null);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("overview");
  const [imgErr, setImgErr]             = useState(false);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = token ? `/api/projects/${projectId}` : `/api/projects/public/${projectId}`;
        const res = await fetch(url, { headers });
        if (res.ok) setProject(await res.json());
      } catch {/* silent */} finally { setLoading(false); }
    })();
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/contributors/project/${projectId}/contributors`, { headers });
        if (res.ok) { const d = await res.json(); setContributors(d.data || []); }
      } catch { setContributors([]); }
    })();
  }, [projectId]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  if (!projectId) return null;

  // ── Access Control ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Verifikasi akses...</p>
      </div>
    );
  }

  const level = project?.access_level || "public";
  let hasAccess = false;
  if (level === "public") {
    hasAccess = true;
  } else if (user) {
    if (user.role === "admin" || user.is_superuser) {
      hasAccess = true;
    } else if (level === "registered" && (user.role === "registered" || user.role === "premium")) {
      hasAccess = true;
    } else if (level === "premium" && user.role === "premium") {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Akses Terbatas</h1>
        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed text-sm">
          Project ini berstatus <span className="font-bold text-amber-600 capitalize">{level}</span> dan membutuhkan hak akses yang sesuai untuk melihat demo.
        </p>
        <a href="/projects" className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300">
          Kembali ke Daftar Project
        </a>
      </div>
    );
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const TABS = [
    {
      key: "overview", label: "Overview",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      show: true, badge: null,
      accent: "#f59e0b",
      render: () => (
        <div className="space-y-4">
          {project.description && (
            <p className="text-[13px] text-amber-700 font-medium bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 leading-relaxed">
              {project.description}
            </p>
          )}
          {project.full_description
            ? <p className="text-[13px] text-gray-600 leading-[1.75]">{project.full_description}</p>
            : !project.description && <p className="text-gray-400 text-sm italic text-center py-8">Belum ada deskripsi.</p>
          }
        </div>
      ),
    },
    {
      key: "challenges", label: "Challenges",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
      show: project.challenges?.length > 0, badge: project.challenges?.length || 0,
      accent: "#f97316",
      render: () => (
        <div className="space-y-2.5">
          {project.challenges.map((item, i) => (
            <div key={i} className="group flex items-start gap-3 rounded-2xl p-3.5 bg-white border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-orange-100/60 transition-all duration-200">
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white text-[10px] font-black shadow-sm mt-0.5">
                {i + 1}
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">{item}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "achievements", label: "Achievements",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 0 11-18 0 9 9 0 0118 0z" />,
      show: project.achievements?.length > 0, badge: project.achievements?.length || 0,
      accent: "#22c55e",
      render: () => (
        <div className="space-y-2.5">
          {project.achievements.map((item, i) => (
            <div key={i} className="group flex items-start gap-3 rounded-2xl p-3.5 bg-white border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-green-100/60 transition-all duration-200">
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">{item}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "future_work", label: "Future Work",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      show: project.future_work?.length > 0, badge: project.future_work?.length || 0,
      accent: "#3b82f6",
      render: () => (
        <div className="space-y-2.5">
          {project.future_work.map((item, i) => (
            <div key={i} className="group flex items-start gap-3 rounded-2xl p-3.5 bg-white border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-blue-100/60 transition-all duration-200">
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">{item}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "technologies", label: "Tech Stack",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
      show: project.technologies?.length > 0, badge: project.technologies?.length || 0,
      accent: "#f59e0b",
      render: () => (
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, i) => (
            <span key={i}
              className="group inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 hover:shadow-amber-100 transition-all duration-200 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex-shrink-0" />
              {tech}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "contributors", label: "Team",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
      show: contributors.length > 0, badge: contributors.length,
      accent: "#a855f7",
      render: () => (
        <div className="space-y-2.5">
          {contributors.map((c, i) => (
            <div key={`${c.id}-${i}`}
              className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-purple-100/40 transition-all duration-200">
              <div className="relative flex-shrink-0">
                {c.profile_image && !imgErr
                  ? <img src={c.profile_image} alt={c.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-200 ring-offset-1"
                      onError={() => setImgErr(true)} />
                  : <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-base shadow-md">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{c.role_in_project || c.role}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {c.github_url && (
                  <a href={c.github_url} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-xl bg-gray-900 hover:bg-gray-700 flex items-center justify-center transition-colors shadow-sm">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                {c.linkedin_url && (
                  <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded-xl bg-[#0077b5] hover:bg-[#005f8f] flex items-center justify-center transition-colors shadow-sm">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ].filter(t => t.show);

  const currentTab = TABS.find(t => t.key === activeTab) || TABS[0];

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 z-[998] transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(10,8,6,0.5)", backdropFilter: open ? "blur(4px)" : "none" }}
        onClick={() => setOpen(false)}
      />

      {/* ── Panel ── */}
      <div
        className={`fixed top-0 right-0 h-full z-[999] flex flex-col transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(420px, 95vw)", boxShadow: "-20px 0 60px rgba(0,0,0,0.25)" }}
      >

        {/* ── HERO HEADER ── */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ minHeight: 180 }}>
          {/* Background: thumbnail or gradient */}
          {project?.thumbnail_url && !imgErr
            ? <img src={project.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" onError={() => setImgErr(true)} />
            : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1c1917 0%,#3b2a1a 50%,#1c1917 100%)" }} />
          }

          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-60" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.8) 100%)" }} />

          {/* Decorative glow */}
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-orange-500/15 blur-2xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-5 pt-12 flex flex-col justify-end h-full">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Label pill */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Project Info
              </span>
            </div>

            {/* Title */}
            {loading ? (
              <div className="h-6 w-3/4 bg-white/20 rounded-lg animate-pulse mb-2" />
            ) : project && (
              <h2 className="text-lg font-black text-white leading-snug drop-shadow-lg mb-2.5">
                {project.title}
              </h2>
            )}

            {/* Tags */}
            {project?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.slice(0, 5).map((tag, i) => (
                  <span key={i}
                    className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-[10px] font-semibold">
                    #{tag}
                  </span>
                ))}
                {project.tags.length > 5 && (
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/50 text-[10px] font-semibold">
                    +{project.tags.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Pill Tabs ── */}
        {TABS.length > 0 && (
          <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 py-2.5">
            <div className="flex gap-1.5 overflow-x-auto pip-scroll-x pb-1">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tab.icon}
                  </svg>
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white/90"
                        : "bg-white text-gray-500 border border-gray-200"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50/80 pip-scroll">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-full border-2 border-amber-100" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Memuat info project…</p>
            </div>
          ) : currentTab ? (
            <div className="p-4" key={activeTab} style={{ animation: "pipIn 0.22s ease-out" }}>
              {currentTab.render()}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle project info"
        className={`fixed bottom-6 right-6 z-[997] group flex items-center gap-2 font-bold text-[13px] rounded-2xl transition-all duration-300 ${
          open
            ? "bg-white text-gray-700 border border-gray-200 px-4 py-2.5 shadow-lg hover:bg-gray-50"
            : "text-white px-4 py-3 hover:scale-105 hover:pr-5"
        }`}
        style={open ? { boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } : {
          background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
          boxShadow: "0 8px 30px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {open ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Tutup
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Project Info</span>
            <svg className="w-3 h-3 opacity-60 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      <style jsx global>{`
        @keyframes pipIn {
          from { opacity: 0; transform: translateY(10px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        
        /* Custom thin horizontal scrollbar for tabs */
        .pip-scroll-x::-webkit-scrollbar { height: 4px; }
        .pip-scroll-x::-webkit-scrollbar-track { background: transparent; }
        .pip-scroll-x::-webkit-scrollbar-thumb {
          background: #d1d5db; /* gray-300 */
          border-radius: 999px;
        }
        .pip-scroll-x::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; /* gray-400 */
        }
        
        /* Custom thin vertical scrollbar for panel content */
        .pip-scroll::-webkit-scrollbar { width: 4px; }
        .pip-scroll::-webkit-scrollbar-track { background: transparent; }
        .pip-scroll::-webkit-scrollbar-thumb {
          background: #f59e0b;
          border-radius: 999px;
        }
        .pip-scroll::-webkit-scrollbar-thumb:hover {
          background: #d97706;
        }
        
        /* Firefox */
        .pip-scroll { scrollbar-width: thin; scrollbar-color: #f59e0b transparent; }
        .pip-scroll-x { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
      `}</style>
    </>
  );
}
