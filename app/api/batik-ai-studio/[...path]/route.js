import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const API_ROOT =
  "https://batik-studio.wempyaw.com";

const DEFAULT_TIMEOUT_MS = 20000;
const MAX_RETRIES = 2;

function shouldRetryStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(url, options, retries, timeoutMs) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);

      if (!shouldRetryStatus(response.status) || attempt === retries) {
        return response;
      }

      const backoff = Math.min(1000 * (attempt + 1), 3000);
      await wait(backoff);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      const backoff = Math.min(1000 * (attempt + 1), 3000);
      await wait(backoff);
    }
  }

  throw new Error("Retry attempts exhausted");
}

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
  const requestId = typeof randomUUID === "function"
    ? randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  console.log("Batik AI Studio proxy request", {
    id: requestId,
    method,
    path: pathString || "/",
    targetUrl,
  });

  const headers = {};
  let body;

  if (method !== "GET") {
    headers["Content-Type"] = request.headers.get("content-type") || "application/json";
    try {
      body = await request.text();
    } catch (error) {
      console.error("Batik AI Studio proxy read body error", {
        id: requestId,
        error: error?.message || String(error),
      });
      return NextResponse.json(
        {
          error: "Failed to read request body",
          details: error?.message || String(error),
        },
        { status: 400 }
      );
    }
  }

  let response;
  try {
    response = await fetchWithRetry(
      targetUrl,
      { method, headers, body },
      MAX_RETRIES,
      DEFAULT_TIMEOUT_MS
    );
  } catch (error) {
    console.error("Batik AI Studio proxy error:", {
      id: requestId,
      error: error?.message || String(error),
    });
    return NextResponse.json(
      {
        error: "Failed to reach backend",
        details: error?.message || String(error),
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

  if (!response.ok) {
    console.error("Batik AI Studio backend error", {
      id: requestId,
      status: response.status,
      url: targetUrl,
      contentType,
      body: text?.slice(0, 2000) || "",
    });
  }
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
