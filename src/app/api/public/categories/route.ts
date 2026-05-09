import { NextResponse } from 'next/server';
import { categories } from '@/lib/data';

// [DISABLED] Admin API Connection - Using mock data for local development
// export const revalidate = 0;

export async function GET() {
  // const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

  // try {
  //   const res = await fetch(`${adminApiUrl}/api/public/categories`, {
  //     cache: 'no-store',
  //   });
  //   if (!res.ok) throw new Error('Failed to fetch categories from Admin API');
  //   const data = await res.json();
  //   return NextResponse.json(data, {
  //     headers: { 'Cache-Control': 'no-store, max-age=0' },
  //   });
  // } catch (error) {
  //   console.error('Proxy error:', error);
  //   return NextResponse.json([], { status: 200 });
  // }
  
  // [LOCAL DEVELOPMENT] Returning mock data from data.ts
  return NextResponse.json(categories, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
