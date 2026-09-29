import { Link } from 'react-router-dom';

const service = ['Contact Us', 'Shipping', 'Returns', 'FAQ'];
const company = ['About Us', 'Careers', 'Privacy Policy', 'Terms & Conditions'];

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.9l-5.4-7.06L3.9 22H.64l8.03-9.18L.5 2h7.07l4.88 6.45L18.244 2zm-1.2 18h1.86L6.05 3.9H4.05L17.044 20z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-50">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="text-lg font-bold tracking-widest">VOGUECART</Link>
          <p className="mt-3 max-w-xs text-sm text-neutral-500">Your fashion destination.</p>
        </div>

        <FooterColumn title="Customer Service" items={service} />
        <FooterColumn title="Company" items={company} />

        <div>
          <h4 className="mb-4 text-sm font-semibold">Follow Us</h4>
          <div className="flex items-center gap-4 text-neutral-600">
            <a href="#" aria-label="Instagram" className="hover:text-black"><InstagramIcon /></a>
            <a href="#" aria-label="Facebook" className="hover:text-black"><FacebookIcon /></a>
            <a href="#" aria-label="X (Twitter)" className="hover:text-black"><XIcon /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-5 text-center text-xs text-neutral-500">
        © 2026 VogueCart. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold">{title}</h4>
      <ul className="space-y-2.5 text-sm text-neutral-500">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="transition-colors hover:text-black">{i}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}