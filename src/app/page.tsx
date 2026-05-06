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
      {/* top-[52px] disesuaikan dengan tinggi Navbar kamu */}
      <div className="sticky top-[52px] z-0 pt-2">

        {/* BACKGROUND N-CURVE */}
        <div className="absolute top-0 left-0 w-full h-[160px] bg-emerald-700 z-[-1]">
          {/* 
            Optimasi SVG: 
            - viewBox disamakan h-[30] agar tidak stretch aneh.
            - Menambahkan scale-105 untuk memastikan tidak ada celah putih di pinggir layar.
          */}
          <svg
            className="absolute top-full left-0 w-full h-[30px] text-emerald-700 scale-[1.02]"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            {/* Q50 0 berarti titik puncak lengkungan ditarik ke koordinat 0 (paling atas) */}
            <path d="M0 0 L100 0 L100 30 Q50 0 0 30 Z" />
          </svg>
        </div>

        {/* Beri sedikit margin agar teks 'Spesial Buat Kamu' tidak menempel ke header */}
        <div className="mt-1">
          <Banner initialBanners={banners} />
          <CategoryGrid initialCategories={categories} />
        </div>
      </div>

      {/* LAYER ATAS: Bottomsheet */}
      {/* 
        Tips: mt-4 sudah bagus, tapi jika ingin banner terlihat lebih menyatu saat scroll, 
        kamu bisa kurangi mt-nya sedikit atau gunakan mt-[-10px] jika ingin efek overlap.
      */}
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
