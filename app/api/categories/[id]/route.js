export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "project";
    const authHeader = request.headers.get("authorization");

    console.log("Getting category by ID:", id, "type:", type);

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    // Validate type parameter
    const validTypes = ["project", "dataset", "publication", "news", "model", "gallery"];
    if (!validTypes.includes(type)) {
      return Response.json({ message: `Invalid category type. Valid types are: ${validTypes.join(", ")}` }, { status: 400 });
    }

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${type}/${id}`, {
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
      return Response.json({ message: "Failed to get category from external API" }, { status: response.status });
    }

    const data = await response.json();
    console.log("External API success, category data received");
    return Response.json(data);
  } catch (error) {
    console.error("Get category error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "project";
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
    console.log("Updating category with ID:", id, "type:", type, "Data:", body);

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${type}/${id}`, {
      method: "PATCH",
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
      return Response.json({ message: data.message || "Failed to update category" }, { status: response.status });
    }

    console.log("Category updated successfully");
    return Response.json(data);
  } catch (error) {
    console.error("Update category error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "project";
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    // Validate type parameter
    const validTypes = ["project", "dataset", "publication", "news", "model", "gallery"];
    if (!validTypes.includes(type)) {
      return Response.json({ message: `Invalid category type. Valid types are: ${validTypes.join(", ")}` }, { status: 400 });
    }

    console.log("Deleting category with ID:", id, "type:", type);

    // Forward request to external API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${type}/${id}`, {
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
      return Response.json({ message: "Failed to delete category from external API" }, { status: response.status });
    }

    const data = await response.json();
    console.log("Category deleted successfully");
    return Response.json(data);
  } catch (error) {
    console.error("Delete category error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
