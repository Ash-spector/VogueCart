import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import ProductGrid from '../components/ProductGrid';
import { Spinner } from '../components/Loader';
import { getProduct, getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { COLOR_HEX } from '../utils/colors';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setActiveImage(0);
    setSize('');
    setColor('');
    setQuantity(1);
    window.scrollTo({ top: 0 });

    getProduct(id)
      .then((p) => {
        setProduct(p);
        return getProducts({ category: p.category, limit: 5 }).then((r) =>
          setSimilar(r.products.filter((x) => x._id !== p._id).slice(0, 4))
        );
      })
      .catch((err) => setError(err.response?.status === 404 ? 'Product not found' : err.userMessage))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading product..." />;

  if (error || !product) {
    return (
      <div className="page-container py-24 text-center">
        <h1 className="text-xl font-semibold">{error || 'Product not found'}</h1>
        <Link to="/shop" className="btn-primary mt-6">Back to Shop</Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const maxQty = Math.min(product.stock, 10);
  const hasDiscount = product.discountPercent > 0;

  // returns true when the required options are chosen
  const validateSelection = () => {
    if (product.sizes.length > 0 && !size) {
      toast.error('Please select a size');
      return false;
    }
    if (product.colors.length > 0 && !color) {
      toast.error('Please select a color');
      return false;
    }
    return true;
  };

  const handleAdd = async (buyNow = false) => {
    if (!validateSelection()) return;
    setBusy(true);
    const ok = await addToCart({ productId: product._id, quantity, size, color });
    setBusy(false);
    if (ok && buyNow) navigate('/checkout');
  };

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-neutral-500">
        <Link to="/" className="hover:text-black">Home</Link> /{' '}
        <Link to={`/shop?category=${product.category}`} className="capitalize hover:text-black">
          {product.category}
        </Link>{' '}
        / <span className="text-neutral-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {product.images.length > 1 && (
            <div className="flex gap-3 sm:flex-col">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded border transition-colors ${
                    i === activeImage ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 self-start overflow-hidden rounded-md bg-neutral-100">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-neutral-500">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={product.rating} size={16} />
            <span className="text-sm text-neutral-500">({product.numReviews} reviews)</span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-base text-neutral-400 line-through">{formatPrice(product.price)}</span>
                <span className="text-sm font-medium text-sale">{product.discountPercent}% OFF</span>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-neutral-600">{product.description}</p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">
                Color{color && <span className="font-normal text-neutral-500">: {color}</span>}
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    title={c}
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border transition-all ${
                      color === c ? 'ring-2 ring-black ring-offset-2' : 'border-neutral-300'
                    }`}
                    style={{ backgroundColor: COLOR_HEX[c] || '#d4d4d4' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-11 rounded-md border px-3 py-2 text-sm transition-colors ${
                      size === s ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + stock */}
          <div className="mt-6 flex items-center gap-5">
            <div>
              <p className="mb-2 text-sm font-medium">Quantity</p>
              <div className="inline-flex items-center rounded-md border border-neutral-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  className="p-2.5 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty || outOfStock}
                  className="p-2.5 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <p className="mt-6 text-sm">
              {outOfStock ? (
                <span className="font-medium text-red-600">Out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="font-medium text-amber-600">Only {product.stock} left</span>
              ) : (
                <span className="font-medium text-sale">● In Stock</span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button onClick={() => handleAdd(false)} disabled={outOfStock || busy} className="btn-primary py-3">
              Add to Cart
            </button>
            <button onClick={() => handleAdd(true)} disabled={outOfStock || busy} className="btn-outline py-3">
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-600">
            <div className="flex flex-col items-center gap-1.5">
              <Truck size={20} /> Free shipping above ₹999
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RotateCcw size={20} /> Easy 7-day returns
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck size={20} /> Secure payment
            </div>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-xl font-semibold">Similar Products</h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}