import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import FilterSort from '@/components/FilterSort';
import ProductGrid from '@/components/ProductGrid';
import SettingsHydrator from '@/components/SettingsHydrator';
import ScrollToBottomSheet from '@/components/ScrollToBottomSheet';
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
    <div className="min-h-screen bg-gray-50/80 pb-24">
      {settings && <SettingsHydrator settings={settings} />}
      <ScrollToBottomSheet />

      {/* LAYER BAWAH: Sticky Canvas */}
      {/* Diubah ke top-[72px] agar langsung sticky sejak awal. 
          Ini mencegah banner bergerak naik/tertarik sebelum header menyusut. */}
      <div className="sticky top-[72px] z-0">

        {/* BACKGROUND N-CURVE CONTAINER */}
        <div className="absolute top-[-18px] left-0 w-full h-[210px] z-[-1]">
          <svg
            className="w-full h-full antialiased"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >

            {/* LAYER 1: Emerald Utama */}
            <path
              d="M0 0 H100 V84 Q50 64 0 84 Z"
              fill="#065F46"
            />

            {/* LAYER 2: Shape N Amber */}
            <path
              d="M0 83.5 Q50 63 100 83.5 V93.5 Q50 75.5 0 93.5 Z"
              fill="#B45309"
            />

          </svg>
        </div>

        {/* Konten dinaikkan agar merapat dengan header (menghapus mt-1) */}
        <div>
          <Banner initialBanners={banners} />
          <CategoryGrid initialCategories={categories} />
        </div>
      </div>

      {/* LAYER ATAS: Bottomsheet */}
      <div id="bottom-sheet" className="relative z-10 bg-white rounded-t-[28px] mt-6 shadow-layer-xl min-h-screen pb-24">
        <div className="sticky top-[52px] z-10 bg-white rounded-t-[28px] pt-2 pb-1.5 shadow-[0_1px_4px_rgba(15,23,42,0.025)]">
          {/* Handle Indicator */}
          <div className="w-full flex justify-center pb-1">
            <div className="w-14 h-1 bg-gray-200/80 rounded-full" />
          </div>
          <FilterSort />
        </div>
        <ProductGrid initialCategories={categories} />
      </div>
    </div>
  );
}
