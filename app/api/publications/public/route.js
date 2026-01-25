import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query params sesuai dokumentasi API
    const params = new URLSearchParams();

    // Pagination - support both old (page/items_per_page) and new (offset/limit)
    const offset = searchParams.get("offset");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const items_per_page = searchParams.get("items_per_page");

    if (offset !== null) {
      params.append("offset", offset);
    } else if (page !== null) {
      params.append("page", page);
    }

    if (limit !== null) {
      params.append("limit", limit);
    } else if (items_per_page !== null) {
      params.append("items_per_page", items_per_page);
    }

    // Search filter
    const search = searchParams.get("search");
    if (search) {
      params.append("search", search);
    }

    // Year filter
    const year = searchParams.get("year");
    if (year) {
      params.append("year", year);
    }

    // Year before filter (for "older" publications)
    const year_before = searchParams.get("year_before");
    if (year_before) {
      params.append("year_before", year_before);
    }

    // Category filter
    const category_id = searchParams.get("category_id");
    if (category_id) {
      params.append("category_id", category_id);
    }

    // Author filter
    const author = searchParams.get("author");
    if (author) {
      params.append("author", author);
    }

    // Featured filter
    const is_featured = searchParams.get("is_featured");
    if (is_featured) {
      params.append("is_featured", is_featured);
    }

    // Sort filter
    const sort_by = searchParams.get("sort_by");
    if (sort_by) {
      params.append("sort_by", sort_by);
    }

    const url = `${API_BASE_URL}/publications?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { data: [], total: 0, page: 1, size: 0, pages: 0 },
        { status: 200 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching public publications:", error);
    return NextResponse.json(
      { data: [], total: 0, page: 1, size: 0, pages: 0 },
      { status: 200 },
    );
  }
}
