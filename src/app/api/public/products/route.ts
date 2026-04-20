import { NextResponse } from 'next/server';
import { products } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter');
  const category = searchParams.get('category');

  let filteredProducts = [...products];

  // Apply category filter
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  // Apply sorting/filter
  if (filter) {
    switch (filter) {
      case 'populer':
        filteredProducts.sort((a, b) => b.sold - a.sold);
        break;
      case 'terbaru':
        // Mock newest by using the id conceptually or reverse order
        filteredProducts.reverse();
        break;
      case 'hemat':
        filteredProducts.sort((a, b) => {
          const discountA = (a.originalPrice ? a.originalPrice - a.price : 0);
          const discountB = (b.originalPrice ? b.originalPrice - b.price : 0);
          return discountB - discountA;
        });
        break;
      case 'terjangkau':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
    }
  }

  return NextResponse.json(filteredProducts);
}
