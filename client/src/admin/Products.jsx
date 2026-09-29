import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts } from '../services/productService';
import { deleteProduct } from '../services/adminService';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner } from '../components/Loader';
import { formatPrice } from '../utils/format';

function stockStatus(stock) {
  if (stock === 0) return { label: 'Out of stock', cls: 'bg-red-50 text-red-700' };
  if (stock <= 5) return { label: 'Low stock', cls: 'bg-amber-50 text-amber-700' };
  return { label: 'In stock', cls: 'bg-green-50 text-green-700' };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getProducts({ limit: 100, sort: 'newest' })
      .then((r) => setProducts(r.products))
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(toDelete._id);
      setProducts((list) => list.filter((p) => p._id !== toDelete._id));
      toast.success('Product deleted');
      setToDelete(null);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner label="Loading products..." />;

  const visible = products.filter((p) =>
    `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus size={16} className="mr-1.5" /> Add Product
        </Link>
      </div>

      <div className="relative mt-6 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-md border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
        />
      </div>

      {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">No products found</td></tr>
            )}
            {visible.map((p) => {
              const s = stockStatus(p.stock);
              return (
                <tr key={p._id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <img src={p.images[0]} alt="" className="h-12 w-10 rounded object-cover" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-neutral-500">{p.brand}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.finalPrice)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/edit/${p._id}`} aria-label="Edit" className="rounded border border-green-200 bg-green-50 p-2 text-green-700 hover:bg-green-100">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => setToDelete(p)} aria-label="Delete" className="rounded border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        message={`"${toDelete?.name}" will be permanently removed. Existing orders keep their own copy of the details.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}