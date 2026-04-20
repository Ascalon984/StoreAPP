import { NextResponse } from 'next/server';
import { banners } from '@/lib/data';

export async function GET() {
  return NextResponse.json(banners);
}
