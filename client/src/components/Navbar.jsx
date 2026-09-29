import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, LogOut, Package, UserCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Men', to: '/shop?category=men' },
  { label: 'Women', to: '/shop?category=women' },
  { label: 'New Arrivals', to: '/shop?sort=newest' },
  { label: 'Sale', to: '/shop?sale=true', sale: true },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef(null);

  // Close everything when the page changes
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close the user menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkClass = (sale) =>
    `text-sm transition-colors duration-200 ${sale ? 'text-red-600 hover:text-red-700' : 'text-neutral-600 hover:text-black'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link to="/" className="text-lg font-bold tracking-widest">
            VOGUECART
          </Link>
        </div>

        {/* Centre: desktop links */}
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className={linkClass(l.sale)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: icons */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen((s) => !s)} aria-label="Search">
            <Search size={20} />
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((m) => !m)}
                className="flex items-center gap-1.5"
                aria-label="Account menu"
              >
                <User size={20} />
                <span className="hidden text-sm sm:inline">{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                  <p className="truncate px-4 py-2 text-xs text-neutral-500">{user.email}</p>
                  <MenuLink to="/profile" icon={UserCircle}>My Profile</MenuLink>
                  <MenuLink to="/orders" icon={Package}>My Orders</MenuLink>
                  {isAdmin && <MenuLink to="/admin" icon={LayoutDashboard}>Admin Panel</MenuLink>}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden text-sm text-neutral-700 hover:text-black sm:inline">
              Login / Register
            </Link>
          )}
          {!user && (
            <Link to="/login" className="sm:hidden" aria-label="Login">
              <User size={20} />
            </Link>
          )}

          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-neutral-100 bg-white">
          <form onSubmit={handleSearch} className="page-container flex items-center gap-3 py-3">
            <Search size={18} className="text-neutral-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm outline-none"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="text-lg font-bold tracking-widest">VOGUECART</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={`rounded-md px-3 py-3 text-base ${l.sale ? 'text-red-600' : 'text-neutral-800'} hover:bg-neutral-50`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {!user && (
            <Link to="/login" className="btn-primary mt-8 w-full">
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
      <Icon size={16} /> {children}
    </Link>
  );
}
