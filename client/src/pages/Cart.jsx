import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Loader';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="page-container py-24 text-center">
        <ShoppingBag size={40} className="mx-auto text-neutral-300" />
        <h1 className="mt-4 text-xl font-semibold">Your cart is waiting</h1>
        <p className="mt-1 text-sm text-neutral-500">Login to see the items in your cart.</p>
        <Link to="/login" state={{ from: { pathname: '/cart' } }} className="btn-primary mt-6">
          Login
        </Link>
      </div>
    );
  }

  if (loading) return <Spinner label="Loading your cart..." />;

  if (cart.items.length === 0) {
    return (
      <div className="page-container py-24 text-center">
        <ShoppingBag size={40} className="mx-auto text-neutral-300" />
        <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-neutral-500">Looks like you haven&apos;t added anything yet.</p>
        <Link to="/shop" className="btn-primary mt-6">Continue Shopping</Link>
      </div>
    );
  }

  const remainingForFree = cart.freeShippingThreshold - cart.subtotal;

  return (
    <div className="page-container py-8">
      <h1 className="text-xl font-semibold sm:text-2xl">
        Shopping Cart <span className="text-sm font-normal text-neutral-500">({cart.itemCount} items)</span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="hidden border-b border-neutral-200 pb-3 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:grid sm:grid-cols-12">
            <span className="col-span-6">Product</span>
            <span className="col-span-2">Price</span>
            <span className="col-span-2">Quantity</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          {cart.items.map((item) => (
            <div key={item._id} className="grid grid-cols-12 items-center gap-y-3 border-b border-neutral-100 py-5">
              <div className="col-span-12 flex gap-4 sm:col-span-6">
                <Link to={`/product/${item.product._id}`} className="h-24 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link to={`/product/${item.product._id}`} className="block truncate text-sm font-medium hover:underline">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-neutral-500">{item.product.brand}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="col-span-4 text-sm sm:col-span-2">{formatPrice(item.product.finalPrice)}</div>

              <div className="col-span-5 sm:col-span-2">
                <div className="inline-flex items-center rounded-md border border-neutral-300">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-2 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-2 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="col-span-3 flex items-center justify-end gap-3 sm:col-span-2">
                <span className="text-sm font-medium">{formatPrice(item.lineTotal)}</span>
                <button onClick={() => removeItem(item._id)} aria-label="Remove item" className="text-neutral-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}

          <Link to="/shop" className="mt-6 inline-block text-sm text-neutral-600 hover:text-black">
            ← Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-md border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-base font-semibold">Order Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd>{cart.shipping === 0 ? <span className="text-sale">Free</span> : formatPrice(cart.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(cart.total)}</dd>
            </div>
          </dl>

          {remainingForFree > 0 && (
            <p className="mt-4 text-xs text-neutral-500">
              Add {formatPrice(remainingForFree)} more for free shipping.
            </p>
          )}

          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full py-3">
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}