import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_RVGAN_API_URL || 'http://localhost:5000';

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const { path } = resolvedParams;
    const pathString = Array.isArray(path) ? path.join('/') : path;
    const url = `${BACKEND_URL}/api/${pathString}`;
    
    console.log('GET Proxy:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    
    // If it's an image, return as blob
    if (contentType && contentType.startsWith('image/')) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    
    // Otherwise return JSON
    const data = await response.json();
    
    // Fix gallery images array
    if (data.success && data.images && Array.isArray(data.images)) {
      data.images = data.images.map(img => ({
        ...img,
        image_url: img.image_url?.replace(/^\/api\//, '/'),
        download_url: img.download_url?.replace(/^\/api\//, '/'),
      }));
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const { path } = resolvedParams;
    const pathString = Array.isArray(path) ? path.join('/') : path;
    const url = `${BACKEND_URL}/api/${pathString}`;
    
    console.log('POST Proxy:', url);
    
    const body = await request.json();
    
    console.log('POST Body:', body);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    
    // If it's JSON, return JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Fix image URLs by removing /api prefix if present
      if (data.success && data.image_url) {
        data.image_url = data.image_url.replace(/^\/api\//, '/');
      }
      if (data.success && data.download_url) {
        data.download_url = data.download_url.replace(/^\/api\//, '/');
      }
      
      // Fix gallery images array
      if (data.success && data.images && Array.isArray(data.images)) {
        data.images = data.images.map(img => ({
          ...img,
          image_url: img.image_url?.replace(/^\/api\//, '/'),
          download_url: img.download_url?.replace(/^\/api\//, '/'),
        }));
      }
      
      return NextResponse.json(data, { status: response.status });
    }
    
    // If it's an image or other binary data
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
