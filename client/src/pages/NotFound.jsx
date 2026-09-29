import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-container py-24 text-center">
      <p className="text-5xl font-bold tracking-widest text-neutral-300">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-neutral-500">The page you are looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  );
}