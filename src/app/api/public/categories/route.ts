import { NextResponse } from 'next/server';

// ISR: cache categories for 60 seconds
export const revalidate = 60;

export async function GET() {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${adminApiUrl}/api/public/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('Failed to fetch categories from Admin API');
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
