import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const items_per_page = searchParams.get('items_per_page') || '12';
    const search = searchParams.get('search') || '';
    
    let url = `https://spmb1.wempyaw.com/api/v1/public/projects?page=${page}&items_per_page=${items_per_page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, size: 12, pages: 0 }, { status: 200 });
  }
}
