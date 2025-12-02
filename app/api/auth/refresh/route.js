export async function POST(request) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return Response.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Forward request to external API
    const response = await fetch('https://spmb1.wempyaw.com/api/v1/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { message: data.message || 'Failed to refresh token' },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error('Refresh token error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}