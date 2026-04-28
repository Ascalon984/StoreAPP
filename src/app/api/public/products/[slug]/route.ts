import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${adminApiUrl}/api/public/products/${params.slug}`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Product not found in Admin API' }, { status: res.status });
    }
    const data = await res.json();
    
    // Jangan gunakan reviews dari product endpoint
    // Reviews akan di-fetch terpisah per produk dari /api/public/reviews
    // untuk memastikan hanya reviews untuk produk ini yang ditampilkan
    const { reviews: _ignoredReviews, ...productData } = data;
    
    return NextResponse.json(productData);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Server proxy error' }, { status: 500 });
  }
}

