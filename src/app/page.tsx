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
    <div className="relative bg-[#F8F9FA]">
      {settings && <SettingsHydrator settings={settings} />}

      {/* LAYER BAWAH: Sticky Canvas */}
      {/* Diubah ke top-[72px] agar langsung sticky sejak awal. 
          Ini mencegah banner bergerak naik/tertarik sebelum header menyusut. */}
      <div className="sticky top-[72px] z-0">

        {/* LAYER BAWAH: Sticky Canvas */}
        <div className="sticky top-[72px] z-0">

          {/* BACKGROUND N-CURVE */}
          {/* Gunakan left-[-1%] dan w-[102%] untuk memastikan warna emerald menabrak pinggiran layar tanpa celah */}
          <div className="absolute top-[-25px] left-[-1%] w-[102%] h-[170px] bg-emerald-700 z-[-1]">
            <svg
              className="absolute top-full left-0 w-full h-[35px] text-emerald-700 scale-x-[1.05] antialiased"
              viewBox="0 0 100 35"
              preserveAspectRatio="none"
              fill="currentColor"
              xmlns="http://w3.org"
            >
              <path d="M0 0 H100 V35 Q50 0 0 35 Z" />
            </svg>
          </div>

          {/* Area Konten Utama */}
          <div className="relative">
            <Banner initialBanners={banners} />
            <CategoryGrid initialCategories={categories} />
          </div>
        </div>

        {/* Konten dinaikkan agar merapat dengan header (menghapus mt-1) */}
        <div>
          <Banner initialBanners={banners} />
          <CategoryGrid initialCategories={categories} />
        </div>
      </div>

      {/* LAYER ATAS: Bottomsheet */}
      <div className="relative z-10 bg-white rounded-t-[28px] mt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.06),0_-1px_0_rgba(0,0,0,0.02)] min-h-screen pb-24">

        {/* Handle Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200/60 rounded-full" />
        </div>

        <FilterSort />
        <ProductGrid initialCategories={categories} />
      </div>
    </div>
  );
}
