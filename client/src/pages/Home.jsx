import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../services/productService';
import HeroSlider from '../components/HeroSlider';

const img = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const categories = [
  { label: 'Men', to: '/shop?category=men', image: img('photo-1521572163474-6864f9cf17ab', 700) },
  { label: 'Women', to: '/shop?category=women', image: img('photo-1572804013309-59a88b7e92f1', 700) },
  { label: 'Shoes', to: '/shop?category=shoes', image: img('photo-1549298916-b41d501d3772', 700) },
  { label: 'Accessories', to: '/shop?category=accessories', image: img('photo-1548036328-c9fa89d128fa', 700) },
];

const perks = [
  { icon: Truck, title: 'Free Shipping', text: 'On orders above ₹999' },
  { icon: RotateCcw, title: 'Easy Returns', text: '7-day return policy' },
  { icon: ShieldCheck, title: 'Secure Payment', text: 'Cash on delivery available' },
  { icon: Headphones, title: 'Friendly Support', text: 'We are here to help' },
];

function SectionHeader({ title, subtitle, to }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="group flex shrink-0 items-center gap-1 text-sm font-medium text-neutral-700 hover:text-black">
          View All <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
  const [email, setEmail] = useState('');

  useEffect(() => {
    Promise.all([getProducts({ sort: 'rating', limit: 4 }), getProducts({ sort: 'newest', limit: 4 })])
      .then(([f, n]) => {
        setFeatured(f.products);
        setArrivals(n.products);
      })
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, []);

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Please enter a valid email');
    toast.success('Thanks for subscribing!');
    setEmail('');
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroSlider />
      </section>

      {/* <section className="relative overflow-hidden bg-neutral-900 sm:h-[640px]">
        <img src={img('photo-1441984904996-e0b6ba687e04', 1600)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="page-container absolute inset-0 flex flex-col justify-center text-white">
          <div className="animate-fade-up max-w-xl">
            <p className="text-xs font-medium tracking-[0.3em] text-white/80 sm:text-sm">NEW SEASON COLLECTION</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] sm:text-7xl">
              Define
              <br />
              Your Style.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/85 sm:text-base">
              Discover the latest fashion trends, curated for every wardrobe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop?category=men" className="rounded-md bg-white px-7 py-3 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98]">
                SHOP MEN
              </Link>
              <Link to="/shop?category=women" className="rounded-md border border-white px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black active:scale-[0.98]">
                SHOP WOMEN
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* Perks */}
      <section className="border-b border-neutral-200 bg-cream">
        <div className="page-container grid grid-cols-2 gap-6 py-6 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <Icon size={22} strokeWidth={1.5} className="shrink-0" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-neutral-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="page-container mt-16">
        <SectionHeader title="Shop by Category" subtitle="Find your fit, your way" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.label} to={c.to} className="group relative overflow-hidden rounded-lg bg-neutral-100">
              <img src={c.image} alt={c.label} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="font-display text-lg font-medium sm:text-xl">{c.label}</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {error && (
        <p className="page-container mt-10 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error} Please try again in a moment.
        </p>
      )}

      {/* Featured */}
      <section className="page-container mt-20">
        <SectionHeader title="Featured Products" subtitle="Our top-rated picks" to="/shop?sort=rating" />
        <ProductGrid products={featured} loading={loading} />
      </section>

      {/* Sale banner */}
      <section className="page-container mt-20">
        <div className="relative overflow-hidden rounded-lg bg-neutral-900">
          <img src={img('photo-1441984904996-e0b6ba687e04', 1600)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative px-6 py-16 text-white sm:px-14 sm:py-24">
            <p className="text-xs tracking-[0.3em] text-white/80 sm:text-sm">UP TO 40% OFF</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">Season Sale</h2>
            <p className="mt-3 max-w-md text-sm text-white/80">Refresh your wardrobe with our biggest markdowns of the year.</p>
            <Link to="/shop?sale=true" className="mt-8 inline-block rounded-md bg-white px-7 py-3 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98]">
              SHOP SALE
            </Link>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="page-container mt-20">
        <SectionHeader title="New Arrivals" subtitle="Fresh styles, just landed" to="/shop?sort=newest" />
        <ProductGrid products={arrivals} loading={loading} />
      </section>

      {/* Newsletter */}
      <section className="mt-20 bg-cream">
        <div className="page-container py-16 text-center">
          <h2 className="section-title">Join the VogueCart list</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">Get early access to new drops and exclusive offers.</p>
          <form onSubmit={subscribe} noValidate className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
            />
            <button type="submit" className="btn-primary px-8 py-3">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}