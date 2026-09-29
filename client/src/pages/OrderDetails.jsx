import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Check, CheckCircle2 } from 'lucide-react';
import { getOrder } from '../services/orderService';
import StatusBadge from '../components/StatusBadge';
import { Spinner } from '../components/Loader';
import { formatPrice } from '../utils/format';

const STEPS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading order..." />;

  if (error || !order) {
    return (
      <div className="page-container py-24 text-center">
        <h1 className="text-xl font-semibold">{error || 'Order not found'}</h1>
        <Link to="/orders" className="btn-primary mt-6">Back to My Orders</Link>
      </div>
    );
  }

  const cancelled = order.orderStatus === 'Cancelled';
  const currentStep = STEPS.indexOf(order.orderStatus);
  const a = order.shippingAddress;
  const placedAt = new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="page-container py-8">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link to="/orders" className="text-blue-600 hover:underline">My Orders</Link> / Order #{order.orderNumber}
      </nav>

      {location.state?.justPlaced && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={20} /> Thank you! Your order has been placed.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Order #{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">{placedAt}</p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Progress tracker */}
      <div className="mt-8 rounded-md border border-neutral-200 p-6">
        {cancelled ? (
          <p className="text-sm font-medium text-red-600">This order was cancelled.</p>
        ) : (
          <ol className="flex items-start">
            {STEPS.map((s, i) => {
              const done = i <= currentStep;
              return (
                <li key={s} className="relative flex flex-1 flex-col items-center text-center">
                  {i > 0 && (
                    <span
                      className={`absolute right-1/2 top-3.5 h-0.5 w-full ${i <= currentStep ? 'bg-green-600' : 'bg-neutral-200'}`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white ${
                      done ? 'border-green-600 bg-green-600 text-white' : 'border-neutral-300'
                    }`}
                  >
                    {done && <Check size={14} />}
                  </span>
                  <span className={`mt-2 text-xs ${done ? 'font-medium text-neutral-900' : 'text-neutral-400'}`}>{s}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Order Items</h2>
          <div className="divide-y divide-neutral-100 rounded-md border border-neutral-200">
            {order.items.map((i, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4">
                <Link to={`/product/${i.product}`} className="h-20 w-16 shrink-0 overflow-hidden rounded bg-neutral-100">
                  <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{i.name}</p>
                  <p className="text-xs text-neutral-500">
                    {[i.size && `Size: ${i.size}`, i.color && `Color: ${i.color}`].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-xs text-neutral-500">Qty {i.quantity} × {formatPrice(i.price)}</p>
                </div>
                <span className="text-sm font-medium">{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Address + summary */}
        <aside className="space-y-8">
          <div>
            <h2 className="mb-3 text-base font-semibold">Shipping Address</h2>
            <address className="text-sm not-italic leading-relaxed text-neutral-600">
              <span className="font-medium text-neutral-900">{a.fullName}</span>
              <br />
              {a.address}
              <br />
              {a.city}, {a.state} - {a.pincode}
              <br />
              Phone: {a.phone}
            </address>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold">Payment</h2>
            <p className="text-sm text-neutral-600">
              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod} · {order.paymentStatus}
            </p>
          </div>

          <dl className="space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd>{formatPrice(order.itemsPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd>{order.shippingPrice === 0 ? <span className="text-sale">Free</span> : formatPrice(order.shippingPrice)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalAmount)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}