import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { framework } = await params;
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:8000";

    const page = searchParams.get("page") || "1";
    const itemsPerPage = searchParams.get("items_per_page") || "12";

    const query = new URLSearchParams({
      page,
      items_per_page: itemsPerPage,
    });

    const url = `${apiBaseUrl}/api/v1/public/ai-models/framework/${encodeURIComponent(framework)}?${query.toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        {
          error: "Failed to fetch AI models by framework",
          detail: errorBody,
          backend_status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching AI models by framework", detail: error.message },
      { status: 500 }
    );
  }
}
