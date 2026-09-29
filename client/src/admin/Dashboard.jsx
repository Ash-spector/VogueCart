import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../services/adminService';
import StatusBadge from '../components/StatusBadge';
import { Spinner } from '../components/Loader';
import { formatPrice, formatDate } from '../utils/format';

/* ---------- small inline icons (no extra dependency) ---------- */
const Icon = ({ children, className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const icons = {
  revenue: (
    <Icon>
      <path d="M6 4h12M6 9h12M9 4c5 0 6 5 0 5l7 11" />
    </Icon>
  ),
  orders: (
    <Icon>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </Icon>
  ),
  products: (
    <Icon>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 12v9M4 7.5l8 4.5 8-4.5" />
    </Icon>
  ),
  users: (
    <Icon>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </Icon>
  ),
  arrow: (
    <Icon className="h-3.5 w-3.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  ),
};

/* colour for each order status in the proportion bar */
const STATUS_COLORS = {
  placed: 'bg-neutral-400',
  confirmed: 'bg-blue-500',
  shipped: 'bg-amber-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || '?';

/* ---------- building blocks ---------- */
function StatCard({ label, value, icon, hint }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
        {icon}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
      {hint && <p className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function RevenueCard({ value, orders }) {
  const avg = orders > 0 ? formatPrice(Math.round(value / orders)) : '—';
  return (
    <div className="relative overflow-hidden rounded-xl bg-neutral-900 p-5 text-white sm:col-span-2 lg:col-span-1">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-rose-500/20 blur-2xl" />
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
          {icons.revenue}
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight">{formatPrice(value)}</p>
        <p className="mt-1 text-sm text-neutral-400">Total revenue</p>
        <p className="mt-3 border-t border-white/10 pt-3 text-xs text-neutral-400">
          Average order value {avg}
        </p>
      </div>
    </div>
  );
}

function Card({ title, subtitle, link, linkLabel = 'View all', children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-neutral-200 bg-white ${className}`}>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
        </div>
        {link && (
          <Link
            to={link}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900"
          >
            {linkLabel}
            {icons.arrow}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/* ---------- page ---------- */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats().then(setStats).catch((err) => setError(err.userMessage));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>;
  if (!stats) return <Spinner label="Loading dashboard..." />;

  const statusEntries = Object.entries(stats.statusSummary);
  const statusTotal = statusEntries.reduce((sum, [, c]) => sum + c, 0);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Here is how your store is doing today.</p>
        </div>
        <p className="text-sm text-neutral-500">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevenueCard value={stats.totalRevenue} orders={stats.totalOrders} />
        <StatCard label="Total orders" value={stats.totalOrders} icon={icons.orders} />
        <StatCard label="Total products" value={stats.totalProducts} icon={icons.products} />
        <StatCard label="Total users" value={stats.totalUsers} icon={icons.users} />
      </div>

      {/* Order status */}
      <Card
        title="Order status"
        subtitle={statusTotal === 0 ? 'No orders to track yet' : `${statusTotal} orders in total`}
        link="/admin/orders"
        linkLabel="Manage orders"
      >
        <div className="px-5 pb-5">
          {/* proportion bar */}
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
            {statusTotal > 0 &&
              statusEntries.map(([status, count]) =>
                count > 0 ? (
                  <div
                    key={status}
                    className={STATUS_COLORS[status.toLowerCase()] || 'bg-neutral-300'}
                    style={{ width: `${(count / statusTotal) * 100}%` }}
                    title={`${status}: ${count}`}
                  />
                ) : null
              )}
          </div>

          {/* legend */}
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xl font-semibold text-neutral-900">{count}</p>
                <div className="mt-1.5">
                  <StatusBadge status={status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <Card title="Recent orders" subtitle="Latest activity from your customers" link="/admin/orders" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-y border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-sm font-medium text-neutral-700">No orders yet</p>
                      <p className="mt-1 text-xs text-neutral-500">New orders will appear here as customers check out.</p>
                    </td>
                  </tr>
                )}
                {stats.recentOrders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/orders/${o._id}`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
                          {getInitials(o.user?.name)}
                        </span>
                        <span className="text-neutral-700">{o.user?.name || 'Deleted user'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-neutral-900">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.orderStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent products */}
        <Card title="Recent products" subtitle="Newly added to the catalogue" link="/admin/products">
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {stats.recentProducts.map((p) => {
              const lowStock = p.stock <= 10;
              return (
                <li key={p._id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50">
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="h-14 w-11 shrink-0 rounded-md bg-neutral-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{p.name}</p>
                    <p className={`mt-0.5 text-xs ${lowStock ? 'font-medium text-amber-600' : 'text-neutral-500'}`}>
                      {lowStock ? `Low stock: ${p.stock} left` : `${p.stock} in stock`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{formatPrice(p.finalPrice)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}