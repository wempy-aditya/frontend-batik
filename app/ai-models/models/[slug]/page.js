"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AiModelDetailPage() {
  const router = useRouter();
  const { slug } = useParams();
  const { token } = useAuth();

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeader = useMemo(() => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const activeToken = localToken || token;
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  }, [token]);

  useEffect(() => {
    const fetchModel = async () => {
      setLoading(true);
      setError("");

      try {
        let response = await fetch(`/api/ai-models/public/slug/${encodeURIComponent(slug)}`, {
          headers: {
            ...authHeader,
          },
        });

        if (!response.ok) {
          response = await fetch(`/api/ai-models/public/${encodeURIComponent(slug)}`, {
            headers: {
              ...authHeader,
            },
          });
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const detail =
            errData?.detail?.detail ||
            errData?.detail?.error ||
            errData?.detail ||
            errData?.error;

          setError(typeof detail === "string" ? detail : "AI model tidak ditemukan.");
          setModel(null);
          return;
        }

        const data = await response.json();
        const item = data?.data || data;
        setModel(item || null);
      } catch {
        setError("Gagal memuat detail AI model.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchModel();
  }, [slug, token]);

  const metricEntries = model?.metrics && typeof model.metrics === "object"
    ? Object.entries(model.metrics)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-slate-50 py-12">
      <div className="container mx-auto px-6 lg:px-8">
        <button
          onClick={() => router.push("/ai-models/models")}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Models
        </button>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading model detail...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        ) : !model ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">AI model tidak ditemukan.</div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {model.image_url ? (
              <img src={model.image_url} alt={model.name} className="w-full h-72 object-cover" />
            ) : (
              <div className="w-full h-72 bg-gradient-to-br from-cyan-500 to-sky-600" />
            )}

            <div className="p-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold">
                  {model.framework || "Unknown Framework"}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  {model.model_type || "Unknown Type"}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  access: {model.access_level || "public"}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  v{model.version || "-"}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-3">{model.name}</h1>
              <p className="text-slate-600 leading-relaxed">{model.description || "No description available."}</p>

              {metricEntries.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Metrics</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {metricEntries.map(([key, value]) => (
                      <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500 capitalize">{key.replaceAll("_", " ")}</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {typeof value === "number" && value >= 0 && value <= 1
                            ? `${(value * 100).toFixed(1)}%`
                            : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
