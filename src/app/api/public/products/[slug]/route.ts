import { NextResponse } from 'next/server';
import { products, defaultReviews } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Include the dummy reviews for this product
  // Since our dummy data has productId='all', we'll just mock it as if they below to this product
  const productWithDetails = {
    ...product,
    reviews: defaultReviews,
  };

  return NextResponse.json(productWithDetails);
}
