export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Login request received:", { username: body.username });

    // Try different approaches for the API call
    let response;

    // First try: application/x-www-form-urlencoded
    try {
      const formData = new URLSearchParams();
      formData.append("username", body.username);
      formData.append("password", body.password);

      console.log("Trying form-urlencoded format...");
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData,
      });

      console.log("Form-urlencoded response status:", response.status);

      if (response.status !== 422) {
        // This approach worked (or at least didn't give 422)
        const responseText = await response.text();
        console.log("Form-urlencoded response:", responseText);

        if (response.ok) {
          const data = JSON.parse(responseText);
          return Response.json(data, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          });
        } else {
          return Response.json(
            {
              message: response.status === 401 ? "Invalid username or password" : "Login failed. Please try again.",
            },
            {
              status: response.status,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            }
          );
        }
      }
    } catch (formError) {
      console.log("Form-urlencoded approach failed:", formError.message);
    }

    // Second try: multipart/form-data
    try {
      const formData = new FormData();
      formData.append("username", body.username);
      formData.append("password", body.password);

      console.log("Trying multipart/form-data format...");
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      console.log("Multipart response status:", response.status);

      if (response.status !== 422) {
        const responseText = await response.text();
        console.log("Multipart response:", responseText);

        if (response.ok) {
          const data = JSON.parse(responseText);
          return Response.json(data, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          });
        } else {
          return Response.json(
            {
              message: response.status === 401 ? "Invalid username or password" : "Login failed. Please try again.",
            },
            {
              status: response.status,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            }
          );
        }
      }
    } catch (multipartError) {
      console.log("Multipart approach failed:", multipartError.message);
    }

    // Third try: Original JSON approach (fallback)
    console.log("Trying JSON format (original)...");
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
      }),
    });

    console.log("JSON response status:", response.status);

    const responseText = await response.text();
    console.log("JSON response:", responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      return Response.json(data, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } else {
      return Response.json(
        {
          message: response.status === 401 ? "Invalid username or password" : "Login failed. Please try again.",
          details: responseText,
        },
        {
          status: response.status,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }
  } catch (error) {
    console.error("Login proxy error:", error);
    return Response.json(
      {
        message: "Network error. Please try again.",
        error: error.message,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
