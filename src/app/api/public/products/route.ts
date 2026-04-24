import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';
  const url = new URL(request.url);
  
  try {
    const res = await fetch(`${adminApiUrl}/api/public/products${url.search}`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products from Admin API');
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Server proxy error' }, { status: 500 });
  }
}
