import Banner from "@/components/Banner";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryBottomSheet from "@/components/CategoryBottomSheet";
import ProductGrid from "@/components/ProductGrid";
import SettingsHydrator from "@/components/SettingsHydrator";
import { Banner as BannerType, Category } from "@/lib/types";

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
      fetch(`${adminApiUrl}/api/public/banners`, { cache: "no-store" }),
      fetch(`${adminApiUrl}/api/public/categories`, { cache: "no-store" }),
      fetch(`${adminApiUrl}/api/public/settings`, { cache: "no-store" }),
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
      <CategoryBottomSheet allCategories={categories} />

      <div className="bg-white relative z-0">
        <Banner initialBanners={banners} />
        <CategoryGrid initialCategories={categories} />
      </div>

      {/* Product Area */}
      <div
        id="product-area"
        className="
    relative z-10
    flex flex-col
    pt-1.5
    bg-gray-50/[0.55]
    rounded-t-[24px]
    -mt-1
  "
      >
        {/* Scrollable container for products */}
        <div className="pb-24">
          <ProductGrid initialCategories={categories} />
        </div>
      </div>
    </div>
  );
}
