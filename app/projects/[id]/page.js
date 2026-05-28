"use client";
import { useState, useEffect } from "react";
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
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 pb-5 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(false);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [demoRefreshKey, setDemoRefreshKey] = useState("");

  useEffect(() => {
    setDemoRefreshKey(Date.now().toString());
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/public/${id}`);
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
  }, [id]);

  useEffect(() => {
    const fetchContributors = async () => {
      if (id) {
        setLoadingContributors(true);
        try {
          const response = await fetch(`/api/contributors/project/${id}/contributors`);
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

  const handleDemoChange = (index) => {
    setActiveDemoIndex(index);
    setIframeLoading(true);
    setIframeError(false);
    setDemoRefreshKey(Date.now().toString());
  };

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
          <p className="text-gray-500 mb-6 text-sm">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/projects")}
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

  // Build accordion sections — only show if has data
  const sections = [
    {
      key: "overview",
      label: "Overview",
      show: !!project.full_description,
      iconColor: "text-amber-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      content: <p className="text-gray-600 text-sm leading-relaxed">{project.full_description}</p>,
    },
    {
      key: "challenges",
      label: "Challenges",
      show: !!(project.challenges?.length),
      badge: project.challenges?.length,
      iconColor: "text-orange-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      content: (
        <ul className="space-y-2">
          {project.challenges?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black mt-0.5">{idx + 1}</span>
              <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "achievements",
      label: "Achievements",
      show: !!(project.achievements?.length),
      badge: project.achievements?.length,
      iconColor: "text-green-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <ul className="space-y-2">
          {project.achievements?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="flex-shrink-0 w-4 h-4 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "future_work",
      label: "Future Work",
      show: !!(project.future_work?.length),
      badge: project.future_work?.length,
      iconColor: "text-blue-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      content: (
        <ul className="space-y-2">
          {project.future_work?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="flex-shrink-0 w-4 h-4 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "technologies",
      label: "Technologies",
      show: !!(project.technologies?.length),
      badge: project.technologies?.length,
      iconColor: "text-amber-500",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      content: (
        <div className="flex flex-wrap gap-2">
          {project.technologies?.map((tech, idx) => (
            <span key={idx} className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
              {tech}
            </span>
          ))}
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* ── HERO ── */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-repeat"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-amber-200 text-sm mb-8">
            <button onClick={() => router.push("/")} className="hover:text-white transition-colors">Home</button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <button onClick={() => router.push("/projects")} className="hover:text-white transition-colors">Projects</button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white truncate max-w-xs">{project.title}</span>
          </div>

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
            {/* Thumbnail */}
            <div className="lg:w-2/5 flex-shrink-0">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>

            {/* Info */}
            <div className="lg:w-3/5">
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-white leading-tight">{project.title}</h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-5">{project.description}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 text-amber-200 rounded-full text-sm border border-white/10">
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
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl space-y-6">

          {/* ── SINGLE ACCORDION CARD ── */}
          {sections.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
          )}

          {/* ── DEMO SECTION ── */}
          {hasDemos ? (
            <div>
              {project.demo_url.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.demo_url.map((url, index) => (
                    <button key={index} onClick={() => handleDemoChange(index)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                        activeDemoIndex === index
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      <svg className={`w-4 h-4 flex-shrink-0 ${activeDemoIndex === index ? "text-white" : "text-amber-500"}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate max-w-[200px]">{getDemoLabel(url, index)}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl bg-white relative">
                {iframeError ? (
                  <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-gray-50 to-orange-50 p-8 text-center">
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-2">Preview Unavailable</h3>
                    <p className="text-gray-500 text-sm mb-5 max-w-sm">This demo can't be embedded due to security restrictions.</p>
                    <a href={activeDemoUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in New Tab
                    </a>
                  </div>
                ) : (
                  <>
                    {iframeLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                        <div className="relative w-12 h-12 mb-3">
                          <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Loading demo...</p>
                      </div>
                    )}
                    <iframe 
                      key={`${activeDemoUrl}-${demoRefreshKey}`} 
                      src={activeDemoUrl ? `${activeDemoUrl}${activeDemoUrl.includes('?') ? '&' : '?'}t=${demoRefreshKey}` : ''} 
                      title={`Demo - ${project.title}`}
                      className="w-full" style={{ height: "720px", border: "none", display: "block" }}
                      onLoad={() => { setIframeLoading(false); setIframeError(false); }}
                      onError={() => { setIframeLoading(false); setIframeError(true); }}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-modals"
                      allow="camera; microphone; fullscreen; autoplay" />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-600 mb-1">Demo Not Available</h3>
              <p className="text-gray-400 text-sm">No live demo provided for this project yet.</p>
            </div>
          )}

          {/* ── CTA ── */}
          <div className="bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Interested in This Project?</h2>
              <p className="text-gray-300 mb-7 max-w-xl mx-auto">Learn more about our work or collaborate with us on similar projects.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => router.push("/contact")}
                  className="px-7 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Contact Us
                </button>
                <button onClick={() => router.push("/projects")}
                  className="px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300">
                  View All Projects
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
