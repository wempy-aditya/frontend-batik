import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

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

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/projects?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ data: [], total: 0, offset: 0, limit: 12, has_more: false }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching public projects:", error);
    return NextResponse.json({ data: [], total: 0, offset: 0, limit: 12, has_more: false }, { status: 200 });
  }
}
