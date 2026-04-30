import Banner from '@/components/Banner';
import CategoryGrid from '@/components/CategoryGrid';
import FilterSort from '@/components/FilterSort';
import ProductGrid from '@/components/ProductGrid';

export default function Home() {
  return (
    <div className="pb-24">
      <Banner />
      <CategoryGrid />
      <FilterSort />
      <ProductGrid />
    </div>
  );
}
