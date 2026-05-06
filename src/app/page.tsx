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
      {/* Prime Zustand store dari SSR — eliminasi duplicate /api/public/settings fetch dari Navbar */}
      {settings && <SettingsHydrator settings={settings} />}

      {/* LAYER BAWAH: Tertahan saat scroll (Sticky Canvas) */}
      {/* Tambahkan pt-2 agar banner menabrak area hijau dengan overlap yang presisi */}
      <div className="sticky top-[52px] z-0 pt-2">
        
        {/* BACKGROUND N-CURVE (HEADER EXTENSION) */}
        {/* Dipindah ke dalam layer sticky agar tetap fixed saat discroll.
            Base height 180px + curve 35px = 215px. Ini akan menutupi sekitar 80% dari total
            ketinggian banner (menyisakan 20% area bawah banner menjuntai keluar dari lengkungan). 
        */}
        <div className="absolute top-0 left-0 w-full h-[180px] bg-emerald-700 z-[-1]">
          <svg 
            className="absolute top-full left-0 w-full h-[35px] text-emerald-700" 
            viewBox="0 0 100 35" 
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0 0 L100 0 L100 35 Q50 0 0 35 Z" />
          </svg>
        </div>

        <Banner initialBanners={banners} />
        <CategoryGrid initialCategories={categories} />
      </div>

      {/* LAYER ATAS: Bottomsheet yang meluncur naik (Foreground Sheet) */}
      {/* Shadow dipoles: satu lapis halus untuk depth, satu lapis tipis untuk border top agar tajam */}
      <div className="relative z-10 bg-white rounded-t-[28px] mt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04),0_-1px_0_rgba(0,0,0,0.05)] min-h-screen pb-24">
        {/* Sheet Handle Indicator - Lebih Thin & Compact */}
        <div className="w-full flex justify-center pt-2.5 pb-0.5">
          {/* Ukuran h diubah dari 1.5 ke 1 (4px) untuk kesan lebih thin */}
          <div className="w-10 h-1 bg-gray-200/50 rounded-full" />
        </div>

        <FilterSort />
        <ProductGrid initialCategories={categories} />
      </div>
    </div>
  );
}
