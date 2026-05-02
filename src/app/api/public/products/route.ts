import { NextResponse } from 'next/server';

// ISR: cache product listings for 30 seconds per unique URL (category+filter combo)
export const revalidate = 30;

export async function GET(request: Request) {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';
  const url = new URL(request.url);

  // Strip cache-busting `t` param before forwarding
  url.searchParams.delete('t');

  try {
    const res = await fetch(`${adminApiUrl}/api/public/products${url.search}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error('Failed to fetch products from Admin API');
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
