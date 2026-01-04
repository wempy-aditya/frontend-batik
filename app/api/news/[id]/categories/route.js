export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Assigning categories to news with ID:", id, "Categories:", body);

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/news/${id}/categories`, {
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
      return Response.json({ message: data.message || "Failed to assign categories to news" }, { status: response.status });
    }

    console.log("Categories assigned to news successfully");
    return Response.json(data);
  } catch (error) {
    console.error("Assign categories error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
