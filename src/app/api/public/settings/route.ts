import { NextResponse } from 'next/server';

// Disable caching for settings to allow instant updates from Admin
export const revalidate = 0;

export async function GET() {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${adminApiUrl}/api/public/settings`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch settings from Admin API');
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { waNumber: '6281234567890', storeNameFirst: 'Palugada', storeNameLast: 'Store' },
      { status: 200 }
    );
  }
}
