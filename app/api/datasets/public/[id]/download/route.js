import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    const response = await fetch(`${API_BASE_URL}/api/v1/public/datasets/${id}/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to increment download count");
      return NextResponse.json({ error: "Failed to increment download count" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error incrementing download count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
