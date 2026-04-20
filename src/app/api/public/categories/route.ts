import { NextResponse } from 'next/server';
import { categories } from '@/lib/data';

export async function GET() {
  // Filter out the "all" category as it's meant to be frontend-only
  const realCategories = categories.filter((c) => c.id !== 'all');
  return NextResponse.json(realCategories);
}
