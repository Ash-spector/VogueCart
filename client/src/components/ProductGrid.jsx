import ProductCard from './ProductCard';
import { ProductSkeleton } from './Loader';

export default function ProductGrid({ products = [], loading = false, skeletons = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => <ProductSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}