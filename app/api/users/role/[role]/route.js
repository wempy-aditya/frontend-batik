import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request, { params }) {
  try {
    const { role } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const items_per_page = searchParams.get("items_per_page") || "10";

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/users/role/${role}?page=${page}&items_per_page=${items_per_page}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: `Backend error: ${errorData}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Users by role fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch users by role" }, { status: 500 });
  }
}
