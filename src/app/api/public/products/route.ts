import { NextResponse } from 'next/server';
import { products, mockHighlightProducts } from '@/lib/data';

// [DISABLED] Admin API Connection - Using mock data for local development
// export const revalidate = 0;

export async function GET(request: Request) {
  // const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';
  // const url = new URL(request.url);

  // // Strip cache-busting `t` param before forwarding
  // url.searchParams.delete('t');

  // try {
  //   const res = await fetch(`${adminApiUrl}/api/public/products${url.search}`, {
  //     cache: 'no-store',
  //   });
  //   if (!res.ok) throw new Error('Failed to fetch products from Admin API');
  //   const data = await res.json();
  //   return NextResponse.json(data, {
  //     headers: { 'Cache-Control': 'no-store, max-age=0' },
  //   });
  // } catch (error) {
  //   console.error('Proxy error:', error);
  //   return NextResponse.json([], { status: 200 });
  // }
  
  // [LOCAL DEVELOPMENT] Returning mock data from data.ts
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'all';
  
  const allProducts = [...products, ...mockHighlightProducts];
  
  const filtered = category === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === category);
  
  return NextResponse.json(filtered, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
