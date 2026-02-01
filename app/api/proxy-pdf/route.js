// Multiple fallback URLs for Google Drive
const DRIVE_URLS = [
  (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
  (id) => `https://drive.google.com/uc?export=download&id=${id}`,
  (id) => `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=AIzaSyDummyKeyForFallback`, // Will fail but try anyway
];

async function fetchWithTimeout(url, options, timeout = 20000) {
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
    
    // Specific error handling for production debugging
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Google Drive took too long to respond');
    }
    
    // Handle common Node.js fetch errors
    if (error.message === 'fetch failed') {
      throw new Error('Network error: Cannot connect to Google Drive (DNS/SSL/Connection issue)');
    }
    
    if (error.code === 'ENOTFOUND') {
      throw new Error('DNS lookup failed for Google Drive');
    }
    
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      throw new Error('Connection to Google Drive was reset/refused');
    }
    
    throw error;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');
  
  if (!fileId) {
    return new Response(JSON.stringify({ error: 'File ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let lastError = null;
  const startTime = Date.now();

  // Try multiple URLs with fallback AND retry each URL
  for (let urlIndex = 0; urlIndex < 2; urlIndex++) {
    const driveUrl = DRIVE_URLS[urlIndex](fileId);
    
    // Retry each URL up to 2 times (total 3 attempts per URL)
    for (let retry = 0; retry < 3; retry++) {
      try {
        const attemptNum = urlIndex * 3 + retry + 1;
        console.log(`[PDF Proxy] Attempt ${attemptNum}/6: URL ${urlIndex + 1}, Retry ${retry + 1}/3`);
        console.log(`[PDF Proxy] Fetching:`, driveUrl.substring(0, 80) + '...');
        
        const response = await fetchWithTimeout(driveUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/pdf,*/*',
            'Connection': 'keep-alive', // Reuse connections
          },
          redirect: 'follow',
        }, 20000); // 20 second timeout

        const elapsed = Date.now() - startTime;
        console.log(`[PDF Proxy] Response in ${elapsed}ms - Status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details');
          console.error(`[PDF Proxy] HTTP Error ${response.status}:`, errorText.substring(0, 200));
          
          lastError = new Error(`Google Drive returned ${response.status}: ${response.statusText}`);
          
          // Don't retry on 4xx errors (client errors - likely wrong file ID or permissions)
          if (response.status >= 400 && response.status < 500) {
            console.log(`[PDF Proxy] Client error detected, skipping retries for this URL`);
            break; // Move to next URL
          }
          
          // Retry on 5xx errors
          if (retry < 2) {
            const waitTime = 1000 * (retry + 1); // 1s, 2s
            console.log(`[PDF Proxy] Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          break; // Move to next URL after all retries
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.warn(`[PDF Proxy] Received HTML instead of PDF, trying next URL...`);
          lastError = new Error('Received HTML instead of PDF');
          break; // Move to next URL
        }

        // Success! Clone response untuk bisa dibaca headernya
        const clonedResponse = response.clone();
        const contentLength = response.headers.get('content-length');
        const totalElapsed = Date.now() - startTime;
        
        console.log('✅ [PDF Proxy] SUCCESS:', {
          urlIndex: urlIndex + 1,
          retryCount: retry,
          fileId,
          contentType,
          contentLength,
          status: response.status,
          totalTime: totalElapsed + 'ms'
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
        const elapsed = Date.now() - startTime;
        console.error(`[PDF Proxy] Attempt failed (${elapsed}ms):`, error.message);
        console.error(`[PDF Proxy] Error type:`, error.name, '- Code:', error.code || 'N/A');
        
        lastError = error;
        
        // Retry on network errors
        if (retry < 2) {
          const waitTime = 1000 * (retry + 1); // 1s, 2s
          console.log(`[PDF Proxy] Network error, retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        console.log(`[PDF Proxy] All retries exhausted for URL ${urlIndex + 1}, trying next URL...`);
        break; // Move to next URL
      }
    }
  }

  // All attempts failed
  const totalElapsed = Date.now() - startTime;
  console.error('❌ [PDF Proxy] ALL ATTEMPTS FAILED:', {
    fileId,
    totalURLs: 2,
    retriesPerURL: 3,
    totalAttempts: 6,
    totalTime: totalElapsed + 'ms',
    lastErrorMessage: lastError?.message,
    lastErrorType: lastError?.name,
    lastErrorCode: lastError?.code || 'N/A'
  });
  
  // Provide helpful error message based on error type
  let userMessage = lastError?.message || 'Failed to fetch PDF from Google Drive';
  let troubleshooting = 'Kemungkinan penyebab: ';
  
  if (lastError?.message?.includes('Network error') || lastError?.message === 'fetch failed') {
    troubleshooting += '1) Server tidak bisa connect ke Google Drive (firewall/DNS issue), 2) SSL certificate error, 3) Network instability';
  } else if (lastError?.message?.includes('timeout')) {
    troubleshooting += '1) Google Drive lambat, 2) File terlalu besar, 3) Network lambat';
  } else if (lastError?.message?.includes('HTML')) {
    troubleshooting += '1) File tidak public (harus "Anyone with link"), 2) File ID salah';
  } else {
    troubleshooting += '1) File tidak public, 2) File ID salah, 3) Google Drive rate limit, 4) Server network issue';
  }
  
  return new Response(JSON.stringify({ 
    error: userMessage,
    troubleshooting: troubleshooting,
    fileId: fileId,
    timestamp: new Date().toISOString(),
    debugInfo: {
      totalAttempts: 6,
      elapsedTime: totalElapsed + 'ms',
      errorType: lastError?.name,
      errorCode: lastError?.code || 'N/A'
    }
  }), {
    status: 500,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
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
