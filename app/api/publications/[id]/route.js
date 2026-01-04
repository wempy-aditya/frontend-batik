import { NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

export async function GET(request, { params }) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    console.log("GET: Request params received:", resolvedParams);
    const { id } = resolvedParams;
    console.log("GET: Extracted ID:", id, "Type:", typeof id);

    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/publications/${id}`, {
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
    console.error("Publication fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    console.log("PUT: Request params received:", resolvedParams);
    const { id } = resolvedParams;
    console.log("PUT: Extracted ID:", id, "Type:", typeof id);

    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const body = await request.json();
    console.log("PUT: Raw request body:", body);

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

    console.log("PUT: Sanitized data:", sanitizedData);

    const response = await fetch(`${API_BASE_URL}/publications/${id}`, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PUT: Backend error:", errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Publication update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    console.log("DELETE: Request params received:", resolvedParams);
    const { id } = resolvedParams;
    console.log("DELETE: Extracted ID:", id, "Type:", typeof id, "Length:", id ? id.length : "N/A");

    const token = request.headers.get("authorization");

    if (!token) {
      console.error("DELETE: No authorization token provided");
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    console.log("DELETE: Attempting to delete publication with ID:", id);
    console.log("DELETE: Using token:", token.substring(0, 20) + "...");

    if (!id || id === "undefined") {
      console.error("DELETE: Invalid ID received:", id);
      return NextResponse.json({ error: "Invalid publication ID" }, { status: 400 });
    }

    const url = `${API_BASE_URL}/publications/${id}`;
    console.log("DELETE: Constructed URL:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    console.log("DELETE: External API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DELETE: External API error:", response.status, errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    console.log("DELETE: Success, returning data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("DELETE: Publication delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
