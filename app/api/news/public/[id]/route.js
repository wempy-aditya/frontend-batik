import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

export async function GET(request, context) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    const { id } = params;

    console.log("Fetching news with ID:", id);

    // Fetch by UUID only
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      console.error("News not found in API");
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    const data = await response.json();
    console.log("News fetched successfully:", data.title);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching news detail:", error);
    return NextResponse.json({ error: "News not found" }, { status: 404 });
  }
}
