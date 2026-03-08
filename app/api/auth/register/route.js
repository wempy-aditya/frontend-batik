export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: body.name,
          email: body.email,
          username: body.username,
          password: body.password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return Response.json(data, { status: 201 });
    }

    // Map error responses
    const status = response.status;
    const detail = data?.detail || data?.message || "Registration failed";

    return Response.json({ message: detail }, { status });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
