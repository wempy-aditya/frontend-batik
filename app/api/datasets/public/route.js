import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://spmb1.wempyaw.com/api/v1/public';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const items_per_page = searchParams.get('items_per_page') || '12';
    const search = searchParams.get('search') || '';

    let url = `${API_BASE_URL}/datasets?page=${page}&items_per_page=${items_per_page}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ data: [], total: 0, page: 1, size: 0, pages: 0 }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching public datasets:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, size: 0, pages: 0 }, { status: 200 });
  }
}
