import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

export async function GET(request, context) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    const { id } = params;

    console.log("Fetching dataset with ID:", id);

    // Fetch by UUID only
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`);

    console.log("API Response status:", response.status);

    if (!response.ok) {
      console.error("Dataset not found in API");
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const data = await response.json();
    console.log("Dataset fetched successfully:", data.name);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dataset detail:", error);
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }
}
