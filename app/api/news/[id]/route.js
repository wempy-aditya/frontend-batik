export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    console.log("Getting news by ID:", id);

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/${id}`, {
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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Updating news with ID:", id, "Data:", body);

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/${id}`, {
      method: "PUT",
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
      return Response.json({ message: data.message || "Failed to update news" }, { status: response.status });
    }

    console.log("News updated successfully");
    return Response.json(data);
  } catch (error) {
    console.error("Update news error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    console.log("Deleting news with ID:", id);

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log("External API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("External API error:", errorText);
      return Response.json({ message: "Failed to delete news from external API" }, { status: response.status });
    }

    const data = await response.json();
    console.log("News deleted successfully");
    return Response.json(data);
  } catch (error) {
    console.error("Delete news error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
