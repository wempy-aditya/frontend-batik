import { NextResponse } from "next/server";

// const API_ROOT = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
const API_ROOT = 'https://batik-studio.wempyaw.com';

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

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

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
