import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch(
      'https://spmb1.wempyaw.com/api/v1/public/categories/projects',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching project categories:', error);
    return NextResponse.json([], { status: 200 });
  }
}
