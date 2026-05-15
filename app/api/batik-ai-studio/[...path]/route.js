import { NextResponse } from "next/server";

// Prefer environment variable so production can override the backend host.
// Fallback to NEXT_PUBLIC_API_URL / NEXT_PUBLIC_BACKEND_URL for convenience,
// then to the historical default.
const API_ROOT =
  process.env.BATIK_AI_STUDIO_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://batik-studio.wempyaw.com';

function buildTargetUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ROOT}/api/v1${normalizedPath}`;
}

async function proxyRequest(request, params, method) {
  if (!API_ROOT) {
    return NextResponse.json(
      { error: "Backend URL is not configured" },
      { status: 500 }
    );
  }

  const resolvedParams = await params;
  const { path } = resolvedParams;
  const pathString = Array.isArray(path) ? path.join("/") : path;
  const targetUrl = buildTargetUrl(pathString || "");

  const headers = {};
  let body;

  if (method !== "GET") {
    headers["Content-Type"] = request.headers.get("content-type") || "application/json";
    body = await request.text();
  }

  let response;
  try {
    response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });
  } catch (err) {
    // Network/DNS error — return JSON with helpful guidance for production.
    console.error('Proxy fetch error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to reach backend host',
        details: err?.message || String(err),
        hint:
          'Check server DNS and outbound network access. Set BATIK_AI_STUDIO_API_BASE to a reachable backend URL.',
      },
      { status: 502 }
    );
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.startsWith("image/")) {
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": contentType || "application/json",
    },
  });
}

export async function GET(request, context) {
  return proxyRequest(request, context.params, "GET");
}

export async function POST(request, context) {
  return proxyRequest(request, context.params, "POST");
}
