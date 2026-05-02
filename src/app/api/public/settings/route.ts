import { NextResponse } from 'next/server';

// ISR: cache settings for 5 minutes (settings rarely change)
export const revalidate = 300;

export async function GET() {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${adminApiUrl}/api/public/settings`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('Failed to fetch settings from Admin API');
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { waNumber: '6281234567890', storeNameFirst: 'Palugada', storeNameLast: 'Store' },
      { status: 200 }
    );
  }
}
