import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public`;

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/datasets`);

    if (!response.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dataset categories:", error);
    return NextResponse.json([], { status: 200 });
  }
}
