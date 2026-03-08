"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        setStatsError("");
        const token = localStorage.getItem("access_token");
        const res = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const err = await res.json();
          setStatsError(err?.detail || err?.error || "Gagal memuat statistik.");
          return;
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setStatsError("Gagal terhubung ke server.");
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ label, value, icon, colorClass, bgClass, change }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          {isLoadingStats ? (
            <div className="h-8 w-16 bg-slate-200 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {value ?? "—"}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${bgClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-green-500 text-sm">{change}</span>
          <span className="text-slate-500 text-sm">bulan ini</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {activeSection === "overview" && (
          <div className="space-y-6 w-full">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-white shadow-sm">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                Welcome back, {user?.name || user?.username}!
              </h2>
              <p className="text-amber-100 text-sm sm:text-base lg:text-lg">
                Here's what's happening with your platform today.
              </p>
              <p className="text-amber-200 text-xs sm:text-sm mt-2">
                Member since:{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>

            {/* Error Banner */}
            {statsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{statsError}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full">
              <StatCard
                label="Total Datasets"
                value={stats?.datasets?.total}
                bgClass="bg-blue-100"
                icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
              />
              <StatCard
                label="Publications"
                value={stats?.publications?.total}
                bgClass="bg-green-100"
                icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <StatCard
                label="Active Projects"
                value={stats?.projects?.total}
                bgClass="bg-purple-100"
                icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
              />
              <StatCard
                label="Total Users"
                value={stats?.users?.total}
                change={stats?.users?.new_this_month ? `+${stats.users.new_this_month} baru` : null}
                bgClass="bg-orange-100"
                icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
              />
            </div>

            {/* Extended Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full">
              <StatCard
                label="AI Models"
                value={stats?.ai_models?.total}
                bgClass="bg-cyan-100"
                icon={<svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" /></svg>}
              />
              <StatCard
                label="Gallery"
                value={stats?.gallery?.total}
                bgClass="bg-pink-100"
                icon={<svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              />
              <StatCard
                label="Contributors"
                value={stats?.contributors?.total}
                bgClass="bg-amber-100"
                icon={<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
              <StatCard
                label="Files"
                value={stats?.files?.total ? `${stats.files.total} file (${stats.files.total_size_mb} MB)` : null}
                bgClass="bg-slate-100"
                icon={<svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>}
              />
            </div>

            {/* Detail Cards Row */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full">
                {/* Users detail */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    Pengguna
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Aktif</span><span className="font-medium text-green-600">{stats.users?.active}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tidak aktif</span><span className="font-medium text-red-500">{stats.users?.inactive}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Admin</span><span className="font-medium">{stats.users?.by_role?.admin}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Registered</span><span className="font-medium">{stats.users?.by_role?.registered}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Premium</span><span className="font-medium">{stats.users?.by_role?.premium}</span></div>
                  </div>
                </div>

                {/* Publications detail */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Publikasi
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Published</span><span className="font-medium text-green-600">{stats.publications?.by_status?.published}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Draft</span><span className="font-medium text-amber-500">{stats.publications?.by_status?.draft}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total sitasi</span><span className="font-medium">{stats.publications?.total_citations}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total views</span><span className="font-medium">{stats.publications?.total_views}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total download</span><span className="font-medium">{stats.publications?.total_downloads}</span></div>
                  </div>
                </div>

                {/* Datasets detail */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Dataset
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Published</span><span className="font-medium text-green-600">{stats.datasets?.by_status?.published}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Draft</span><span className="font-medium text-amber-500">{stats.datasets?.by_status?.draft}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total views</span><span className="font-medium">{stats.datasets?.total_views}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total download</span><span className="font-medium">{stats.datasets?.total_downloads}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm w-full">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => router.push("/dashboard/datasets")}
                  className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">
                        Add Dataset
                      </p>
                      <p className="text-sm text-slate-600">
                        Upload new research data
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/dashboard/news")}
                  className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg sm:rounded-xl border-2 border-indigo-200 hover:border-indigo-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">
                        Manage News
                      </p>
                      <p className="text-sm text-slate-600">
                        Create & edit articles
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/dashboard/categories")}
                  className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg sm:rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a1 1 0 01-1-1V3a1 1 0 011-1z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">
                        Manage Categories
                      </p>
                      <p className="text-sm text-slate-600">
                        Project categories
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/dashboard/publications")}
                  className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl border-2 border-green-200 hover:border-green-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 text-white"
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
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">
                        Manage Publications
                      </p>
                      <p className="text-sm text-slate-600">
                        Research papers & articles
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/dashboard/projects")}
                  className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">
                        Manage Projects
                      </p>
                      <p className="text-sm text-slate-600">
                        Research projects
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            {/* <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm w-full">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                Ringkasan Konten
              </h3>
              {isLoadingStats ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-3 w-full">
                  {[
                    { label: "Datasets", published: stats.datasets?.by_status?.published, draft: stats.datasets?.by_status?.draft, color: "bg-blue-100", iconColor: "text-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /> },
                    { label: "Publikasi", published: stats.publications?.by_status?.published, draft: stats.publications?.by_status?.draft, color: "bg-green-100", iconColor: "text-green-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                    { label: "Projects", published: stats.projects?.by_status?.published, draft: stats.projects?.by_status?.draft, color: "bg-purple-100", iconColor: "text-purple-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
                    { label: "News", published: stats.news?.by_status?.published, draft: stats.news?.by_status?.draft, color: "bg-indigo-100", iconColor: "text-indigo-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
                    { label: "AI Models", published: stats.ai_models?.by_status?.published, draft: stats.ai_models?.by_status?.draft, color: "bg-cyan-100", iconColor: "text-cyan-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" /> },
                  ].map(({ label, published, draft, color, iconColor, icon }) => (
                    <div key={label} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{label}</p>
                        <p className="text-sm text-slate-500">
                          {published ?? 0} published · {draft ?? 0} draft
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-slate-800">{(published ?? 0) + (draft ?? 0)}</span>
                        <p className="text-xs text-slate-400">total</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
