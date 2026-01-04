export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    console.log("Received auth header:", authHeader);

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      console.log("No valid bearer token found");
      return Response.json({ message: "Authorization token is required" }, { status: 401 });
    }

    // Forward request to external API with proper Bearer format
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me/`, {
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
      return Response.json({ message: "Failed to get user info from external API" }, { status: response.status });
    }

    const data = await response.json();
    console.log("External API success, user data received");
    return Response.json(data);
  } catch (error) {
    console.error("Get user info error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
