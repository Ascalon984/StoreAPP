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
      <div className="sticky top-[72px] z-0">
        <div className="absolute top-[-24px] left-0 w-full h-[210px] z-[-1]">
          <svg
            className="w-full h-full antialiased"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="dotsLargeHome" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.7" fill="white" fillOpacity="0.12" />
              </pattern>
              <pattern id="dotsSmallHome" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.35" fill="white" fillOpacity="0.06" />
              </pattern>
              <linearGradient id="fadeBottomHome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="85%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask id="maskFadeHome">
                <rect x="0" y="0" width="100" height="100" fill="url(#fadeBottomHome)" />
              </mask>
            </defs>

            <path d="M0 0 H100 V84 Q50 64 0 84 Z" fill="#048750" />
            {/* ✅ Menerapkan pola titik-titik dengan mask fading */}
            <path d="M0 0 H100 V84 Q50 64 0 84 Z" fill="url(#dotsLargeHome)" mask="url(#maskFadeHome)" />
            <path d="M0 25 H100 V84 Q50 64 0 84 Z" fill="url(#dotsSmallHome)" mask="url(#maskFadeHome)" />
            <path d="M0 83.5 Q50 63 100 83.5 V93.5 Q50 75.5 0 93.5 Z" fill="#D89B2B" />
          </svg>
        </div>

        <div>
          <Banner initialBanners={banners} />
          <CategoryGrid initialCategories={categories} />
        </div>
      </div>

      {/* LAYER ATAS: Bottomsheet */}
      <div
        id="bottom-sheet"
        className="
          relative z-10
          bg-white rounded-t-[28px]
          mt-6 shadow-layer-xl
          min-h-screen pb-24
          overflow-clip
        "
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-14 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* FilterSort — sticky bekerja karena overflow-clip */}
        <FilterSort />

        {/* ProductGrid */}
        <ProductGrid initialCategories={categories} />
      </div>
    </div>
  );
}