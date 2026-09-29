import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus } from '../services/adminService';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner } from '../components/Loader';
import { formatPrice, formatDate } from '../utils/format';

const TABS = ['All', 'Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const STATUSES = TABS.slice(1);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null); // { order, status } waiting for cancel confirmation
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllOrders(tab)
      .then(setOrders)
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, [tab]);

  const change = async (order, status) => {
    setBusy(true);
    try {
      const updated = await updateOrderStatus(order._id, status);
      setOrders((list) =>
        list.map((o) =>
          o._id === order._id ? { ...o, orderStatus: updated.orderStatus, paymentStatus: updated.paymentStatus } : o
        )
      );
      toast.success(`Order #${order.orderNumber} marked ${status}`);
      setPending(null);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  const onSelect = (order, status) => {
    if (status === order.orderStatus) return;
    if (status === 'Cancelled') setPending({ order, status });
    else change(order, status);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Orders</h1>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-md border px-4 py-1.5 text-sm transition-colors ${
              tab === t ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white hover:border-black'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <Spinner label="Loading orders..." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-neutral-200 bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-500">No orders found</td></tr>
              )}
              {orders.map((o) => {
                const locked = ['Delivered', 'Cancelled'].includes(o.orderStatus);
                return (
                  <tr key={o._id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/orders/${o._id}`} className="font-medium hover:underline">#{o.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.user?.name || 'Deleted user'}</p>
                      <p className="text-xs text-neutral-500">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="px-4 py-3">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <p>{o.paymentMethod}</p>
                      <p className="text-xs text-neutral-500">{o.paymentStatus}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.orderStatus} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={o.orderStatus}
                        disabled={locked || busy}
                        onChange={(e) => onSelect(o, e.target.value)}
                        aria-label={`Update status of order ${o.orderNumber}`}
                        className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        title="Cancel this order?"
        message="The items will be returned to stock and the order can't be changed afterwards."
        confirmLabel="Cancel order"
        busy={busy}
        onConfirm={() => change(pending.order, 'Cancelled')}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}