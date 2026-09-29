import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/productService';

const img = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const categories = [
  { label: 'Men', to: '/shop?category=men', image: img('photo-1521572163474-6864f9cf17ab', 600) },
  { label: 'Women', to: '/shop?category=women', image: img('photo-1572804013309-59a88b7e92f1', 600) },
  { label: 'Shoes', to: '/shop?category=shoes', image: img('photo-1549298916-b41d501d3772', 600) },
  { label: 'Accessories', to: '/shop?category=accessories', image: img('photo-1548036328-c9fa89d128fa', 600) },
];

function SectionHeader({ title, to }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
      {to && (
        <Link to={to} className="flex items-center gap-1 text-sm text-neutral-600 hover:text-black">
          View All <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProducts({ sort: 'rating', limit: 4 }), getProducts({ sort: 'newest', limit: 4 })])
      .then(([f, n]) => {
        setFeatured(f.products);
        setArrivals(n.products);
      })
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <img
          src={img('photo-1483985988355-763728e1935b', 1600)}
          alt="New season fashion"
          className="h-[420px] w-full object-cover sm:h-[520px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="page-container absolute inset-0 flex flex-col justify-center text-white">
          <p className="text-xs font-medium tracking-[0.25em] sm:text-sm">NEW SEASON COLLECTION</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
            Define
            <br />
            Your Style.
          </h1>
          <p className="mt-3 text-sm text-white/85 sm:text-base">Discover the latest fashion trends.</p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/shop?category=men"
              className="rounded-md bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              SHOP MEN
            </Link>
            <Link
              to="/shop?category=women"
              className="rounded-md border border-white px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
            >
              SHOP WOMEN
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container mt-14">
        <SectionHeader title="Shop by Category" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.label} to={c.to} className="group">
              <div className="overflow-hidden rounded-md bg-neutral-100">
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-center text-sm font-medium">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {error && (
        <p className="page-container mt-10 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error} Make sure the backend is running.
        </p>
      )}

      {/* Featured */}
      <section className="page-container mt-14">
        <SectionHeader title="Featured Products" to="/shop" />
        <ProductGrid products={featured} loading={loading} />
      </section>

      {/* Sale banner */}
      <section className="page-container mt-14">
        <div className="relative overflow-hidden rounded-md bg-neutral-900">
          <img
            src={img('photo-1441984904996-e0b6ba687e04', 1400)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="relative px-6 py-14 text-white sm:px-12 sm:py-20">
            <p className="text-xs tracking-[0.25em] sm:text-sm">UP TO 40% OFF</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-5xl">Season Sale</h2>
            <Link
              to="/shop?sale=true"
              className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              SHOP SALE
            </Link>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="page-container mt-14">
        <SectionHeader title="New Arrivals" to="/shop?sort=newest" />
        <ProductGrid products={arrivals} loading={loading} />
      </section>
    </>
  );
}