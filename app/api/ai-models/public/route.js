import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000";

    const params = new URLSearchParams();

    const page = searchParams.get("page") || "1";
    const itemsPerPage = searchParams.get("items_per_page") || "12";
    const search = searchParams.get("search");

    params.append("page", page);
    params.append("items_per_page", itemsPerPage);
    if (search) params.append("search", search);

    const url = `${apiBaseUrl}/api/v1/public/ai-models/?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        {
          error: "Failed to fetch public AI models",
          detail: errorBody,
          backend_status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching public AI models", detail: error.message },
      { status: 500 }
    );
  }
}
