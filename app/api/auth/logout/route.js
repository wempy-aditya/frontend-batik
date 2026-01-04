export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    console.log("Logout request received with auth:", authHeader ? "Yes" : "No");

    if (!authHeader) {
      return Response.json(
        { message: "No authorization token provided" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/logout`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    console.log("Logout API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Logout error response:", errorText);
      return Response.json(
        {
          message: "Logout request failed but session will be cleared locally",
        },
        {
          status: response.status,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    const data = await response.json();
    console.log("Logout successful");

    return Response.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("Logout proxy error:", error);
    return Response.json(
      {
        message: "Logged out successfully (local session cleared)",
        note: "Network error occurred but local logout completed",
      },
      {
        status: 200, // Return success for local logout
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
