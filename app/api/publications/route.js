import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

export async function GET(request) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "20";

    const response = await fetch(`${API_BASE_URL}/publications/?offset=${offset}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Publications fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const body = await request.json();
    console.log("POST: Raw request body:", body);

    // Sanitize data
    const sanitizedData = {
      title: body.title?.trim() || "",
      slug: body.slug?.trim() || "",
      abstract: body.abstract?.trim() || "",
      authors: body.authors?.filter((a) => a && a.trim()) || [],
      journal_name: body.journal_name?.trim() || "",
      access_level: body.access_level || "public",
      status: body.status || "draft",
    };

    // Add year (required field)
    if (body.year !== undefined && body.year !== null) {
      sanitizedData.year = body.year;
    }

    // Add optional fields only if they have values
    if (body.venue && body.venue.trim()) {
      sanitizedData.venue = body.venue.trim();
    }
    if (body.citations !== undefined && body.citations >= 0) {
      sanitizedData.citations = body.citations;
    }
    if (body.impact && body.impact.trim()) {
      sanitizedData.impact = body.impact.trim();
    }
    if (body.volume && body.volume.trim()) {
      sanitizedData.volume = body.volume.trim();
    }
    if (body.issue && body.issue.trim()) {
      sanitizedData.issue = body.issue.trim();
    }
    if (body.pages && body.pages.trim()) {
      sanitizedData.pages = body.pages.trim();
    }
    if (body.publisher && body.publisher.trim()) {
      sanitizedData.publisher = body.publisher.trim();
    }
    if (body.doi && body.doi.trim()) {
      sanitizedData.doi = body.doi.trim();
    }
    if (body.pdf_url && body.pdf_url.trim()) {
      sanitizedData.pdf_url = body.pdf_url.trim();
    }
    if (body.graphical_abstract_url && body.graphical_abstract_url.trim()) {
      sanitizedData.graphical_abstract_url = body.graphical_abstract_url.trim();
    }
    if (body.methodology && body.methodology.trim()) {
      sanitizedData.methodology = body.methodology.trim();
    }
    if (body.results && body.results.trim()) {
      sanitizedData.results = body.results.trim();
    }
    if (body.conclusions && body.conclusions.trim()) {
      sanitizedData.conclusions = body.conclusions.trim();
    }
    if (body.keywords && body.keywords.length > 0) {
      // Remove duplicates and empty strings
      sanitizedData.keywords = [...new Set(body.keywords.filter((k) => k && k.trim()))];
    }

    console.log("POST: Sanitized data:", sanitizedData);

    const response = await fetch(`${API_BASE_URL}/publications/`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("POST: Backend error:", errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Publications create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
