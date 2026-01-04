import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "6";

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/projects/featured?limit=${limit}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    return NextResponse.json([], { status: 200 });
  }
}
