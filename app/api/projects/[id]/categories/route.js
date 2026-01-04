import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

export async function POST(request, { params }) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/projects/${id}/categories`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Project category assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
