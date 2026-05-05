import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import FilterSort from '@/components/FilterSort';
import ProductGrid from '@/components/ProductGrid';
import SettingsHydrator from '@/components/SettingsHydrator';
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
// Disable caching (no-store) to ensure immediate data updates when Admin changes data.
// This resolves the issue where hard refreshes still showed stale data.
async function getInitData(): Promise<InitData> {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (!adminApiUrl) return { banners: [], categories: [], settings: null };

  try {
    const [bannersRes, categoriesRes, settingsRes] = await Promise.all([
      fetch(`${adminApiUrl}/api/public/banners`, { cache: 'no-store' }),
      fetch(`${adminApiUrl}/api/public/categories`, { cache: 'no-store' }),
      fetch(`${adminApiUrl}/api/public/settings`, { cache: 'no-store' }),
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
  const { banners, categories, settings } = await getInitData();

  return (
    <div className="pb-24 relative bg-[#F8F9FA]">
      {/* Prime Zustand store dari SSR — eliminasi duplicate /api/public/settings fetch dari Navbar */}
      {settings && <SettingsHydrator settings={settings} />}

      {/* LAYER BAWAH: Tertahan saat scroll (Sticky Canvas) */}
      <div className="sticky top-[52px] z-0">
        <Banner initialBanners={banners} />
        <CategoryGrid initialCategories={categories} />
      </div>

      {/* LAYER ATAS: Foreground Sheet */}
      <div className="relative z-10 bg-white rounded-t-[30px] -mt-8 shadow-[0_-12px_40px_rgba(0,0,0,0.08)] min-h-screen">
        {/* Indikator Handle yang sedikit lebih halus warnanya */}
        <div className="w-full flex justify-center pt-3 pb-2">
          <div className="w-10 h-1.5 bg-gray-200/80 rounded-full"></div>
        </div>

        {/* Filter & Grid */}
        <FilterSort />
        <ProductGrid initialCategories={categories} />
      </div>
    </div>
  );
}
