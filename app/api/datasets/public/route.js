import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

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

    // Format filter
    const format = searchParams.get("format");
    if (format) {
      params.append("format", format);
    }

    // License filter
    const license = searchParams.get("license");
    if (license) {
      params.append("license", license);
    }

    // Version filter
    const version = searchParams.get("version");
    if (version) {
      params.append("version", version);
    }

    // Featured filter
    const isFeatured = searchParams.get("is_featured");
    if (isFeatured === "true") {
      params.append("is_featured", "true");
    }

    // Sort
    const sortBy = searchParams.get("sort_by") || "latest";
    params.append("sort_by", sortBy);

    const url = `${API_BASE_URL}/datasets?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ data: [], total: 0, offset: 0, limit: 12, has_more: false }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching public datasets:", error);
    return NextResponse.json({ data: [], total: 0, offset: 0, limit: 12, has_more: false }, { status: 200 });
  }
}
