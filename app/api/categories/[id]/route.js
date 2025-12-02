export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    console.log('Getting category by ID:', id);
    
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return Response.json(
        { message: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Forward request to external API
    const response = await fetch(`https://spmb1.wempyaw.com/api/v1/categories/project/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('External API error:', errorText);
      return Response.json(
        { message: 'Failed to get category from external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('External API success, category data received');
    return Response.json(data);
  } catch (error) {
    console.error('Get category error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return Response.json(
        { message: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Updating category with ID:', id, 'Data:', body);

    // Forward request to external API
    const response = await fetch(`https://spmb1.wempyaw.com/api/v1/categories/project/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('External API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.log('External API error:', data);
      return Response.json(
        { message: data.message || 'Failed to update category' },
        { status: response.status }
      );
    }

    console.log('Category updated successfully');
    return Response.json(data);
  } catch (error) {
    console.error('Update category error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return Response.json(
        { message: 'Authorization token is required' },
        { status: 401 }
      );
    }

    console.log('Deleting category with ID:', id);

    // Forward request to external API
    const response = await fetch(`https://spmb1.wempyaw.com/api/v1/categories/project/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('External API error:', errorText);
      return Response.json(
        { message: 'Failed to delete category from external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Category deleted successfully');
    return Response.json(data);
  } catch (error) {
    console.error('Delete category error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}