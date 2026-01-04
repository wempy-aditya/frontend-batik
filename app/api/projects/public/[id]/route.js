import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Try to fetch by ID first (if UUID format)
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/projects/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // If failed and id is not UUID, try slug
    if (!response.ok) {
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/projects/slug/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
    }

    if (!response.ok) {
      throw new Error("Project not found");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching project detail:", error);
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}
