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
    <div className="relative bg-[#F8F9FA]">
      {settings && <SettingsHydrator settings={settings} />}
      <ScrollToBottomSheet />

      {/* LAYER BAWAH: Sticky Canvas */}
      {/* Diubah ke top-[72px] agar langsung sticky sejak awal. 
          Ini mencegah banner bergerak naik/tertarik sebelum header menyusut. */}
      <div className="sticky top-[72px] z-0">

        {/* BACKGROUND N-CURVE CONTAINER */}
        <div className="absolute top-[-25px] left-0 w-full h-[170px] z-[-1]">
          {/* LAYER 1: Background Emerald Utama */}
          <div className="relative w-full h-full bg-[#065F46]">

            {/* LAYER 2: Shape N Amber */}
            <svg
              className="absolute top-full left-0 w-full h-[38px] text-[#D97706] antialiased"
              viewBox="0 0 100 35"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              {/* Q50 0 menarik puncak lengkungan ke tengah atas secara sempurna */}
              <path d="M0 0 H100 V35 Q50 0 0 35 Z" />
            </svg>

            {/* Penutup gap untuk anti-aliasing browser */}
            <div className="absolute -bottom-[0.5px] left-0 w-full h-[1px] bg-[#065F46]" />
          </div>
        </div>

        {/* Konten dinaikkan agar merapat dengan header (menghapus mt-1) */}
        <div>
          <Banner initialBanners={banners} />
          <CategoryGrid initialCategories={categories} />
        </div>
      </div>

      {/* LAYER ATAS: Bottomsheet */}
      <div id="bottom-sheet" className="relative z-10 bg-white rounded-t-[28px] mt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.06),0_-1px_0_rgba(0,0,0,0.02)] min-h-screen pb-24">

        <div className="sticky top-[52px] z-30 bg-white rounded-t-[28px] pt-2 pb-1.5 shadow-[0_4px_15px_-10px_rgba(0,0,0,0.05)] border-b border-gray-50/50">
          {/* Handle Indicator */}
          <div className="w-full flex justify-center pb-1.5">
            <div className="w-14 h-1 bg-gray-200/60 rounded-full" />
          </div>

          <FilterSort />
        </div>
        <ProductGrid initialCategories={categories} />
      </div>
    </div>
  );
}
