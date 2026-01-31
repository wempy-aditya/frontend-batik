// Utility function to fetch with timeout
async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - API took too long to respond');
    }
    throw error;
  }
}

// Utility function for retry logic
async function fetchWithRetry(url, options, maxRetries = 3, timeout = 30000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${maxRetries} - Fetching:`, url);
      const response = await fetchWithTimeout(url, options, timeout);
      
      // If we get a response, return it (even if it's an error status)
      // Don't retry on 4xx errors (client errors)
      if (response.status < 500) {
        return response;
      }
      
      // For 5xx errors, log and retry
      console.warn(`Attempt ${i + 1} failed with status ${response.status}`);
      lastError = new Error(`Server error: ${response.status}`);
      
      // Don't wait after the last attempt
      if (i < maxRetries - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 5000); // Exponential backoff, max 5s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} error:`, error.message);
      lastError = error;
      
      // Don't retry on client-side errors
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        throw error;
      }
      
      // Wait before retry (except on last attempt)
      if (i < maxRetries - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 5000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    console.log('Timestamp:', new Date().toISOString());
    
    // Use retry logic with timeout
    const response = await fetchWithRetry(
      'https://service-t2i.wempyaw.com/batik_product/devt2i/generate/v2/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      },
      3, // 3 retries
      30000 // 30 second timeout
    );

    const elapsed = Date.now() - startTime;
    console.log('Response status:', response.status);
    console.log('Response time:', elapsed + 'ms');
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
    const elapsed = Date.now() - startTime;
    console.error('Error in proxy:', error);
    console.error('Total elapsed time:', elapsed + 'ms');
    console.error('Error stack:', error.stack);
    
    // Determine error type for better user feedback
    let errorMessage = 'Failed to generate image';
    let errorType = 'unknown';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout - The AI service is taking too long to respond. Please try again.';
      errorType = 'timeout';
    } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to AI service. The service may be down.';
      errorType = 'connection';
    } else if (error.message.includes('500') || error.message.includes('Server error')) {
      errorMessage = 'AI service is experiencing issues. Please try again in a moment.';
      errorType = 'server_error';
    }
    
    return Response.json(
      { 
        error: errorMessage,
        errorType: errorType,
        details: error.message,
        timestamp: new Date().toISOString(),
        elapsedTime: elapsed + 'ms'
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