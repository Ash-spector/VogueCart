import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { getMyOrders } from '../services/orderService';
import StatusBadge from '../components/StatusBadge';
import { Spinner } from '../components/Loader';
import { formatPrice, formatDate } from '../utils/format';

const TABS = ['All', 'Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('All');

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your orders..." />;

  const visible = tab === 'All' ? orders : orders.filter((o) => o.orderStatus === tab);

  return (
    <div className="page-container py-8">
      <h1 className="text-xl font-semibold sm:text-2xl">My Orders</h1>

      {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      {orders.length === 0 && !error ? (
        <div className="py-20 text-center">
          <Package size={40} className="mx-auto text-neutral-300" />
          <p className="mt-4 text-lg font-medium">No orders yet</p>
          <Link to="/shop" className="btn-primary mt-6">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-md border px-4 py-1.5 text-sm transition-colors ${
                  tab === t ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {visible.length === 0 && (
              <p className="py-12 text-center text-sm text-neutral-500">No {tab.toLowerCase()} orders.</p>
            )}
            {visible.map((o) => (
              <div key={o._id} className="flex flex-wrap items-center gap-4 rounded-md border border-neutral-200 p-4">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 3).map((i, idx) => (
                    <img key={idx} src={i.image} alt="" className="h-14 w-12 rounded border-2 border-white object-cover" />
                  ))}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">Order #{o.orderNumber}</p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} items
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{formatPrice(o.totalAmount)}</p>
                  <StatusBadge status={o.orderStatus} />
                </div>
                <Link to={`/orders/${o._id}`} className="btn-outline px-4 py-2">
                  View Order
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}