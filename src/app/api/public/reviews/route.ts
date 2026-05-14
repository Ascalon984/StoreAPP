import { NextResponse } from 'next/server';

import { defaultReviews } from '@/lib/data';

// [DISABLED] Admin API Connection - Using mock data for local development
// export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';
  // const url = new URL(request.url);
  // 
  // try {
  //   const res = await fetch(`${adminApiUrl}/api/public/reviews${url.search}`, {
  //     cache: 'no-store'
  //   });
  //   if (!res.ok) {
  //     console.warn('Admin API reviews returned status:', res.status);
  //     // Return empty array instead of error, so frontend doesn't break
  //     return NextResponse.json({ reviews: [] });
  //   }
  //   const data = await res.json();
  //   return NextResponse.json(data);
  // } catch (error) {
  //   console.error('Proxy error fetching reviews:', error);
  //   // Return empty array on error instead of 500, prevents frontend crash
  //   return NextResponse.json({ reviews: [] });
  // }
  
  // [LOCAL DEVELOPMENT] Returning mock reviews for local development
  console.log('[LOCAL DEV] Fetching reviews - API disabled, returning mock data');
  return NextResponse.json({ reviews: defaultReviews });
}

export async function POST(request: Request) {
  // const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';
  // try {
  //   const body = await request.json();
  //   const res = await fetch(`${adminApiUrl}/api/public/reviews`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(body),
  //   });
  //   
  //   if (!res.ok) {
  //     const errorData = await res.json().catch(() => ({}));
  //     return NextResponse.json(
  //       { success: false, error: errorData.error || 'Failed to submit review' },
  //       { status: res.status }
  //     );
  //   }
  //   
  //   const data = await res.json();
  //   return NextResponse.json(data);
  // } catch (error) {
  //   console.error('Proxy error submitting review:', error);
  //   return NextResponse.json(
  //     { success: false, error: 'Terjadi kesalahan proxy saat mengirim ulasan' },
  //     { status: 500 }
  //   );
  // }
  
  // [LOCAL DEVELOPMENT] Mock response for local development
  try {
    const body = await request.json();
    console.log('[LOCAL DEV] Review submitted (not persisted):', body);
    
    return NextResponse.json({
      success: true,
      message: 'Review diterima (mode development - tidak tersimpan)',
      data: { id: Date.now().toString(), ...body }
    });
  } catch (error) {
    console.error('Error processing review request:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses ulasan' },
      { status: 500 }
    );
  }
}
