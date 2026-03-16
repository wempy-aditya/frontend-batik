import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000";

    // Build API URL with all supported filters
    const params = new URLSearchParams();

    // Pagination
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "12";
    params.append("offset", offset);
    params.append("limit", limit);

    // Search
    const search = searchParams.get("search");
    if (search) {
      params.append("search", search);
    }

    // Category filter
    const categoryId = searchParams.get("category_id");
    if (categoryId) {
      params.append("category_id", categoryId);
    }

    // Featured filter
    const isFeatured = searchParams.get("is_featured");
    if (isFeatured === "true") {
      params.append("is_featured", "true");
    }

    // Sort
    const sortBy = searchParams.get("sort_by") || "latest";
    params.append("sort_by", sortBy);

    const url = `${apiBaseUrl}/api/v1/public/projects/?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }
      return NextResponse.json(
        {
          error: "Failed to fetch public projects",
          detail: errorBody,
          backend_status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching public projects:", error);
    return NextResponse.json(
      {
        error: "Error fetching public projects",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
