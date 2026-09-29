import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { getProducts, getFilterOptions } from '../services/productService';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Accessories', value: 'accessories' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['6', '7', '8', '9', '10', '11'];
const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Brown', hex: '#8b5a2b' },
];
const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Rating', value: 'rating' },
];
const MAX_PRICE = 10000;
const LIMIT = 12;

// helpers for comma-separated URL params
const toList = (v) => (v ? v.split(',').filter(Boolean) : []);
const toggle = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ products: [], total: 0, pages: 1 });
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const category = params.get('category') || '';
const sizeOptions = category === 'shoes' ? SHOE_SIZES : SIZES;
const search = params.get('search') || '';
  const sort = params.get('sort') || 'newest';
  const sale = params.get('sale') === 'true';
  const page = parseInt(params.get('page')) || 1;
  const maxPrice = parseInt(params.get('maxPrice')) || MAX_PRICE;
  const sizes = toList(params.get('size'));
  const colors = toList(params.get('color'));
  const selectedBrands = toList(params.get('brand'));

  // local slider value so we only hit the API when the user lets go
  const [priceDraft, setPriceDraft] = useState(maxPrice);
  useEffect(() => setPriceDraft(maxPrice), [maxPrice]);

  const setParam = useCallback(
    (updates) => {
      const next = new URLSearchParams(params);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) next.delete(k);
        else next.set(k, Array.isArray(v) ? v.join(',') : v);
      });
      if (!('page' in updates)) next.delete('page'); // any filter change goes back to page 1
      setParams(next);
    },
    [params, setParams]
  );

  useEffect(() => {
    getFilterOptions().then((r) => setBrands(r.brands)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts({
      search,
      category,
      sort,
      sale: sale ? 'true' : undefined,
      brand: selectedBrands.join(',') || undefined,
      size: sizes.join(',') || undefined,
      color: colors.join(',') || undefined,
      maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
      page,
      limit: LIMIT,
    })
      .then(setData)
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const hasFilters = category || search || sale || sizes.length || colors.length || selectedBrands.length || maxPrice < MAX_PRICE;

  const filterPanel = (
    <div className="space-y-8">
      <Block title="Category">
        {CATEGORIES.map((c) => (
          <label key={c.label} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="category"
              checked={category === c.value}
              onChange={() => setParam({ category: c.value })}
              className="accent-black"
            />
            {c.label}
          </label>
        ))}
      </Block>

      <Block title="Price Range">
        <input
          type="range"
          min="0"
          max={MAX_PRICE}
          step="500"
          value={priceDraft}
          onChange={(e) => setPriceDraft(Number(e.target.value))}
          onMouseUp={() => setParam({ maxPrice: priceDraft < MAX_PRICE ? priceDraft : '' })}
          onTouchEnd={() => setParam({ maxPrice: priceDraft < MAX_PRICE ? priceDraft : '' })}
          onKeyUp={() => setParam({ maxPrice: priceDraft < MAX_PRICE ? priceDraft : '' })}
          className="w-full accent-black"
        />
        <p className="text-xs text-neutral-500">₹0 - ₹{priceDraft.toLocaleString('en-IN')}</p>
      </Block>

      <Block title="Size">
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <button
              key={s}
              onClick={() => setParam({ size: toggle(sizes, s) })}
              className={`min-w-9 rounded border px-2 py-1.5 text-xs transition-colors ${
                sizes.includes(s) ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Block>

      <Block title="Color">
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              title={c.name}
              aria-label={c.name}
              onClick={() => setParam({ color: toggle(colors, c.name) })}
              className={`h-6 w-6 rounded-full border transition-all ${
                colors.includes(c.name) ? 'ring-2 ring-black ring-offset-2' : 'border-neutral-300'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </Block>

      {brands.length > 0 && (
        <Block title="Brand">
          {brands.map((b) => (
            <label key={b.name} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.name)}
                onChange={() => setParam({ brand: toggle(selectedBrands, b.name) })}
                className="accent-black"
              />
              {b.name} <span className="text-xs text-neutral-400">({b.count})</span>
            </label>
          ))}
        </Block>
      )}

      {hasFilters && (
        <button onClick={() => setParams({})} className="btn-outline w-full">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="page-container py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {sale ? 'Sale' : category ? CATEGORIES.find((c) => c.value === category)?.label : 'Shop'}
          </h1>
          <p className="text-sm text-neutral-500">
            {search ? `Results for "${search}" · ` : ''}
            {loading ? 'Loading...' : `${data.total} products`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setDrawerOpen(true)} className="btn-outline lg:hidden">
            <SlidersHorizontal size={16} className="mr-2" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setParam({ sort: e.target.value === 'newest' ? '' : e.target.value })}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort by: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">{filterPanel}</aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {error && <p className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</p>}

          {!loading && !error && data.products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-neutral-500">Try changing or clearing your filters.</p>
              <button onClick={() => setParams({})} className="btn-primary mt-6">
                Clear filters
              </button>
            </div>
          ) : (
            <ProductGrid products={data.products} loading={loading} skeletons={8} />
          )}

          {/* Pagination */}
          {data.pages > 1 && !loading && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <PageBtn disabled={page === 1} onClick={() => setParam({ page: page - 1 })} label="Previous page">
                <ChevronLeft size={16} />
              </PageBtn>
              {Array.from({ length: data.pages }).map((_, i) => (
                <PageBtn key={i} active={page === i + 1} onClick={() => setParam({ page: i + 1 })}>
                  {i + 1}
                </PageBtn>
              ))}
              <PageBtn disabled={page === data.pages} onClick={() => setParam({ page: page + 1 })} label="Next page">
                <ChevronRight size={16} />
              </PageBtn>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 transition-transform duration-300 ${
            drawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close filters">
              <X size={22} />
            </button>
          </div>
          {filterPanel}
          <button onClick={() => setDrawerOpen(false)} className="btn-primary mt-8 w-full">
            Show {data.total} products
          </button>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-9 min-w-9 items-center justify-center rounded border px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
      }`}
    >
      {children}
    </button>
  );
}