import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "12";
    const search = searchParams.get("search") || "";

    let url = `${API_BASE_URL}/news?offset=${offset}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

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
    console.error("Error fetching public news:", error);
    return NextResponse.json({ data: [], total: 0, offset: 0, limit: 12, has_more: false }, { status: 200 });
  }
}
