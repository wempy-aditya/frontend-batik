import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const items_per_page = searchParams.get("items_per_page") || "12";

    const response = await fetch(`${API_BASE_URL}/datasets/category/${categoryId}?page=${page}&items_per_page=${items_per_page}`);

    if (!response.ok) {
      return NextResponse.json({ data: [], total: 0, page: 1, size: 0, pages: 0 }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching datasets by category:", error);
    return NextResponse.json({ data: [], total: 0, page: 1, size: 0, pages: 0 }, { status: 200 });
  }
}
