import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const items_per_page = searchParams.get("items_per_page") || "12";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/projects/category/${categoryId}?page=${page}&items_per_page=${items_per_page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch projects by category");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching projects by category:", error);
    return NextResponse.json({ data: [], total: 0, page: 1, size: 12, pages: 0 }, { status: 200 });
  }
}
