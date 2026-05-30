import CategoryProductPage from "@/components/CategoryProductPage";
import { Category } from "@/lib/types";


async function getCategories(): Promise<Category[]> {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  if (!adminApiUrl) return [];
  try {
    const res = await fetch(`${adminApiUrl}/api/public/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function CategoryPage({
  params,
}: {
  params: any;
}) {
  const { slug } = await params;
  const categories = await getCategories();

  return (
    <CategoryProductPage
      categorySlug={slug}
      initialCategories={categories}
    />
  );
}
