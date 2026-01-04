import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

export async function GET(request, context) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    const { id } = params;

    console.log("Fetching publication with ID:", id);

    // Fetch by UUID only
    const response = await fetch(`${API_BASE_URL}/publications/${id}`);

    console.log("API Response status:", response.status);

    if (!response.ok) {
      console.error("Publication not found in API");
      return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }

    const data = await response.json();
    console.log("Publication fetched successfully:", data.title);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching publication detail:", error);
    return NextResponse.json({ error: "Publication not found" }, { status: 404 });
  }
}
