import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function DELETE(request, { params }) {
  try {
    const { username } = await params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/user/${username}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: `Backend error: ${errorData}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
