import { NextResponse } from 'next/server';

// [DISABLED] Admin API Connection - Using mock data for local development
// export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';
  // const reviewId = params.id;

  // try {
  //   const body = await request.json();
  //   const { type } = body; // 'like' or 'dislike'

  //   if (!type || !['like', 'dislike'].includes(type)) {
  //     return NextResponse.json(
  //       { success: false, error: 'Invalid vote type. Must be "like" or "dislike".' },
  //       { status: 400 }
  //     );
  //   }

  //   // Call admin API to update vote
  //   const res = await fetch(
  //     `${adminApiUrl}/api/public/reviews/${reviewId}/vote`,
  //     {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ type }),
  //     }
  //   );

  //   if (!res.ok) {
  //     const errorData = await res.json().catch(() => ({}));
  //     return NextResponse.json(
  //       { success: false, error: errorData.error || 'Failed to update vote' },
  //       { status: res.status }
  //     );
  //   }

  //   const data = await res.json();
  //   return NextResponse.json({ success: true, data });
  // } catch (error) {
  //   console.error('Proxy error updating vote:', error);
  //   return NextResponse.json(
  //     { success: false, error: 'Terjadi kesalahan proxy saat mengupdate vote' },
  //     { status: 500 }
  //   );
  // }
  
  // [LOCAL DEVELOPMENT] Mock response for local development
  try {
    const body = await request.json();
    const { type } = body; // 'like' or 'dislike'

    if (!type || !['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type. Must be "like" or "dislike".' },
        { status: 400 }
      );
    }

    console.log('[LOCAL DEV] Review vote received (not persisted):', { reviewId: params.id, type });
    return NextResponse.json({ success: true, data: { id: params.id, type, votes: 0 } });
  } catch (error) {
    console.error('Error processing vote request:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses vote' },
      { status: 500 }
    );
  }
}
