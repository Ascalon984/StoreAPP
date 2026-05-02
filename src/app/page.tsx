import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import FilterSort from '@/components/FilterSort';
import ProductGrid from '@/components/ProductGrid';
import { Banner as BannerType, Category } from '@/lib/types';

interface Settings {
  waNumber: string;
  storeNameFirst: string;
  storeNameLast: string;
}

interface InitData {
  banners: BannerType[];
  categories: Category[];
  settings: Settings | null;
}

// Fetch banners, categories, settings in parallel directly from Admin API
// Uses Next.js ISR — result cached on the server, re-validated in background
async function getInitData(): Promise<InitData> {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (!adminApiUrl) return { banners: [], categories: [], settings: null };

  try {
    const [bannersRes, categoriesRes, settingsRes] = await Promise.all([
      fetch(`${adminApiUrl}/api/public/banners`, { next: { revalidate: 60 } }),
      fetch(`${adminApiUrl}/api/public/categories`, { next: { revalidate: 60 } }),
      fetch(`${adminApiUrl}/api/public/settings`, { next: { revalidate: 300 } }),
    ]);

    const [banners, categories, settings] = await Promise.all([
      bannersRes.ok ? bannersRes.json() : [],
      categoriesRes.ok ? categoriesRes.json() : [],
      settingsRes.ok ? settingsRes.json() : null,
    ]);

    return {
      banners: Array.isArray(banners) ? banners : [],
      categories: Array.isArray(categories) ? categories : [],
      settings: settings ?? null,
    };
  } catch {
    return { banners: [], categories: [], settings: null };
  }
}

export default async function Home() {
  const { banners, categories } = await getInitData();

  return (
    <div className="pb-24">
      <Banner initialBanners={banners} />
      <CategoryGrid initialCategories={categories} />
      <FilterSort />
      <ProductGrid initialCategories={categories} />
    </div>
  );
}
