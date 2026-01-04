export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "project"; // default to project for backward compatibility
    const authHeader = request.headers.get("authorization");

    console.log("Getting categories with type:", type, "auth header:", authHeader);

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    // Validate type parameter
    const validTypes = ["project", "dataset", "publication", "news", "model", "gallery"];
    if (!validTypes.includes(type)) {
      return Response.json({ message: `Invalid category type. Valid types are: ${validTypes.join(", ")}` }, { status: 400 });
    }

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${type}/`, {
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
      return Response.json({ message: "Failed to get categories from external API" }, { status: response.status });
    }

    const data = await response.json();
    console.log("External API success, categories data received");
    return Response.json(data);
  } catch (error) {
    console.error("Get categories error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "project"; // default to project for backward compatibility
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    // Validate type parameter
    const validTypes = ["project", "dataset", "publication", "news", "model", "gallery"];
    if (!validTypes.includes(type)) {
      return Response.json({ message: `Invalid category type. Valid types are: ${validTypes.join(", ")}` }, { status: 400 });
    }

    const body = await request.json();
    console.log("Creating category with type:", type, "data:", body);

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${type}/`, {
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
      return Response.json({ message: data.message || "Failed to create category" }, { status: response.status });
    }

    console.log("Category created successfully");
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
