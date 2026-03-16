import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000";
    const limit = searchParams.get("limit") || "5";

    const response = await fetch(`${apiBaseUrl}/api/v1/public/news/featured?limit=${limit}`, {
      headers: {
        Accept: "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ data: [], total: 0 }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching featured news:", error);
    return NextResponse.json({ data: [], total: 0 }, { status: 200 });
  }
}
