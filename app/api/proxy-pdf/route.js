export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');
  
  if (!fileId) {
    return new Response(JSON.stringify({ error: 'File ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Gunakan URL yang lebih stabil untuk production
    const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
    
    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      // Log detail error untuk debugging
      const errorText = await response.text().catch(() => 'No error details');
      console.error('Google Drive Error:', {
        status: response.status,
        statusText: response.statusText,
        fileId,
        errorText: errorText.substring(0, 200)
      });
      
      throw new Error(`Google Drive returned ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Received HTML instead of PDF. File mungkin tidak public atau ID salah.');
    }

    // Clone response untuk bisa dibaca headernya
    const clonedResponse = response.clone();
    const contentLength = response.headers.get('content-length');
    
    console.log('PDF Proxy Success:', {
      fileId,
      contentType,
      contentLength,
      status: response.status
    });

    // Forward response dengan CORS headers
    return new Response(clonedResponse.body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType || 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
        ...(contentLength && { 'Content-Length': contentLength }),
      },
    });
  } catch (error) {
    console.error('Proxy PDF Error:', {
      message: error.message,
      fileId,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Pastikan: 1) File Google Drive public (Anyone with link), 2) File ID benar, 3) File adalah PDF',
      fileId: fileId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
