import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spmb1.wempyaw.com';

export async function POST(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    const response = await fetch(`${API_BASE_URL}/api/v1/public/datasets/${id}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to increment view count');
      return NextResponse.json({ error: 'Failed to increment view count' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
