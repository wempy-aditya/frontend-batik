import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    console.log("Auth header received:", authHeader);
    console.log("Fetching datasets from:", `${BACKEND_URL}/api/v1/datasets/`);

    // Create headers object conditionally
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "NextJS-API",
    };

    // Only add Authorization if token is present
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    console.log("Making fetch request...");
    const response = await fetch(`${BACKEND_URL}/api/v1/datasets/`, {
      method: "GET",
      headers: headers,
      cache: "no-cache",
    });
    console.log("Fetch completed, got response");

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error("Backend error:", errorData);

      return NextResponse.json({ message: "Failed to fetch datasets", error: errorData }, { status: response.status });
    }

    const data = await response.json();
    console.log("Datasets fetched successfully, count:", data.data?.length || 0);

    // Create response with CORS headers
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("Error fetching datasets:", error.message);
    console.error("Full error:", error);

    return NextResponse.json({ message: "Failed to fetch datasets", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/datasets/`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ message: "Failed to create dataset", error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating dataset:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
