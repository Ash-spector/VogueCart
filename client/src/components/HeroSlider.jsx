import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const u = (id, w = 1800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Edit this list to change the slides. Paste any Unsplash photo ID or a full URL as `image`.
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1605289355680-75fb41239154?q=80&w=1800&auto=format&fit=crop',
    eyebrow: 'NEW SEASON COLLECTION',
    title: ['Define', 'Your Style.'],
    text: 'Discover the latest fashion trends, curated for every wardrobe.',
    cta1: { label: 'SHOP MEN', to: '/shop?category=men' },
    cta2: { label: 'SHOP WOMEN', to: '/shop?category=women' },
  },
  {
    image: u('photo-1483985988355-763728e1935b'),
    eyebrow: 'WOMEN',
    title: ['Effortless', 'Elegance.'],
    text: 'Dresses, blazers and everyday essentials for every occasion.',
    cta1: { label: 'SHOP WOMEN', to: '/shop?category=women' },
  },
  {
    image: u('photo-1441984904996-e0b6ba687e04'),
    eyebrow: 'UP TO 40% OFF',
    title: ['Season', 'Sale.'],
    text: 'Refresh your wardrobe with our biggest markdowns of the year.',
    cta1: { label: 'SHOP SALE', to: '/shop?sale=true' },
  },
  {
    image: u('photo-1549298916-b41d501d3772'),
    eyebrow: 'FOOTWEAR',
    title: ['Step Into', 'Style.'],
    text: 'Sneakers and boots that go with everything.',
    cta1: { label: 'SHOP SHOES', to: '/shop?category=shoes' },
  },
];

const INTERVAL = 5000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const go = (i) => setIndex((i + slides.length) % slides.length);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearTimeout(t); // resets on every manual change too
  }, [index, paused]);

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <section
      className="relative h-[520px] overflow-hidden bg-neutral-900 sm:h-[725px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.title.join(' ')}
            className={`absolute inset-0 transition-opacity duration-1000 ${active ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'}`}
            aria-hidden={!active}
          >
            <img
              src={s.image}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`h-full w-full object-cover transition-transform duration-[5500ms] ease-out ${active ? 'scale-105' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

            <div className="page-container absolute inset-0 flex flex-col justify-center text-white">
              {/* key restarts the fade-up animation each time the slide becomes active */}
              <div key={active ? 'on' : 'off'} className={`max-w-xl ${active ? 'animate-fade-up' : ''}`}>
                <p className="text-xs font-medium tracking-[0.3em] text-white/80 sm:text-sm">{s.eyebrow}</p>
                <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] sm:text-7xl">
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </h1>
                <p className="mt-4 max-w-sm text-sm text-white/85 sm:text-base">{s.text}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={s.cta1.to}
                    tabIndex={active ? 0 : -1}
                    className="rounded-md bg-white px-7 py-3 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
                  >
                    {s.cta1.label}
                  </Link>
                  {s.cta2 && (
                    <Link
                      to={s.cta2.to}
                      tabIndex={active ? 0 : -1}
                      className="rounded-md border border-white px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black active:scale-[0.98]"
                    >
                      {s.cta2.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Arrows */}
      <button
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-black shadow transition hover:bg-white sm:block"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-black shadow transition hover:bg-white sm:block"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </section>
  );
}