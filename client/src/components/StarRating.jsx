import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 14, showValue = true }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? 'fill-star text-star' : 'text-neutral-300'}
          />
        ))}
      </div>
      {showValue && <span className="text-xs text-neutral-500">{Number(rating).toFixed(1)}</span>}
    </div>
  );
}