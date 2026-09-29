import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import StarRating from './StarRating';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product }) {
  const hasDiscount = product.discountPercent > 0;

  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-md bg-neutral-100">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {/* Wishlist is a future feature, so this is visual only */}
        <button
          type="button"
          aria-label="Wishlist (coming soon)"
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-neutral-700 shadow-sm"
        >
          <Heart size={16} />
        </button>
        {product.stock === 0 && (
          <span className="absolute left-2 top-2 rounded bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <Link to={`/product/${product._id}`} className="truncate text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <p className="text-xs text-neutral-500">{product.brand}</p>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold">{formatPrice(product.finalPrice)}</span>
          {hasDiscount && (
            <>
              <span className="text-xs text-neutral-400 line-through">{formatPrice(product.price)}</span>
              <span className="text-xs font-medium text-sale">{product.discountPercent}% off</span>
            </>
          )}
        </div>

        <div className="mt-1">
          <StarRating rating={product.rating} />
        </div>

        {/* Size/colour must be chosen first, so this opens the product page.
            We wire real add-to-cart in Step 9. */}
        <Link to={`/product/${product._id}`} className="btn-primary mt-3 w-full">
          Add to Cart
        </Link>
      </div>
    </div>
  );
}