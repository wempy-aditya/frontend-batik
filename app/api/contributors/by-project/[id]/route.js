import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

    const response = await fetch(`${API_BASE_URL}/api/v1/contributors/project/${id}/contributors`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching project contributors:", error);
    return NextResponse.json({ detail: "Failed to fetch project contributors" }, { status: 500 });
  }
}
