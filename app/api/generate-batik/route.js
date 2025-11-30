export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    const response = await fetch('https://batik.umm.ac.id/batik_product/devt2i/generate/v2/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Check content type to determine how to handle response
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      // Handle JSON response
      const data = await response.json();
      console.log('JSON response:', data);
      return Response.json(data);
    } else if (contentType && (contentType.includes('image/') || contentType.includes('application/octet-stream'))) {
      // Handle binary image response
      const buffer = await response.arrayBuffer();
      console.log('Received binary data, size:', buffer.byteLength);
      
      // Convert to base64
      const base64 = Buffer.from(buffer).toString('base64');
      
      // Determine image format from content-type or default to jpeg
      let mimeType = 'image/jpeg';
      if (contentType.includes('image/png')) {
        mimeType = 'image/png';
      } else if (contentType.includes('image/gif')) {
        mimeType = 'image/gif';
      } else if (contentType.includes('image/webp')) {
        mimeType = 'image/webp';
      }
      
      return Response.json({
        success: true,
        image: base64,
        mimeType: mimeType,
        message: 'Image generated successfully'
      });
    } else {
      // Try to handle as text/other
      const text = await response.text();
      console.log('Text response:', text);
      
      // Try to parse as JSON if possible
      try {
        const data = JSON.parse(text);
        return Response.json(data);
      } catch (parseError) {
        return Response.json({
          error: 'Unable to parse response',
          contentType: contentType,
          response: text.substring(0, 200)
        }, { status: 500 });
      }
    }
    
  } catch (error) {
    console.error('Error in proxy:', error);
    return Response.json(
      { 
        error: 'Failed to generate image', 
        details: error.message,
        timestamp: new Date().toISOString()
      }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}