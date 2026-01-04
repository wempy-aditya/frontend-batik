export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    console.log("Getting news with auth header:", authHeader);

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "20";

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/?offset=${offset}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log("External API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("External API error:", errorText);
      return Response.json({ message: "Failed to get news from external API" }, { status: response.status });
    }

    const data = await response.json();
    console.log("External API success, news data received");
    return Response.json(data);
  } catch (error) {
    console.error("Get news error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Creating news with data:", body);

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("External API response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      console.log("External API error:", data);
      return Response.json({ message: data.message || "Failed to create news" }, { status: response.status });
    }

    console.log("News created successfully");
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Create news error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
